import { Types } from 'mongoose';
import OpenAI from 'openai';
import Course, { type ICourse } from '../models/Course.js';
import AIUsage from '../models/AIUsage.js';
import { AppError } from '../utils/AppError.js';

export const MAX_RESULTS = 5;
export const AI_LIMIT = Number(process.env.AI_REQUEST_LIMIT ?? 200);

export type FallbackReason =
  | 'budget_exhausted'
  | 'config_error'
  | 'timeout'
  | 'auth_error'
  | 'rate_limited'
  | 'openai_error'
  | 'invalid_output'
  | 'internal';

export class InvalidOutputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidOutputError';
  }
}

export interface CandidateCourse extends Partial<ICourse> {
  _id: Types.ObjectId | string;
  title: string;
  description: string;
  category: string;
  score?: number;
}

export type RecommendationSource = 'ai' | 'fallback' | 'empty';

export interface PickedCourse extends CandidateCourse {
  reason?: string;
}

export interface RecommendationResult {
  source: RecommendationSource;
  summary: string;
  courses: PickedCourse[];
  meta?: {
    fallbackReason?: FallbackReason;
  };
}

export const oneLine = (s: unknown, max: number): string =>
  String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

let _client: OpenAI | null = null;
let _lastApiKey: string | undefined;

export const getClient = (): OpenAI => {
  const rawKey = process.env.OPENAI_API_KEY;
  const apiKey = rawKey ? rawKey.replace(/^["']|["']$/g, '').trim() : '';
  if (!_client || _lastApiKey !== apiKey) {
    _lastApiKey = apiKey;
    _client = new OpenAI({
      apiKey,
      baseURL: process.env.OPENAI_BASE_URL,
      maxRetries: 0,
      timeout: 15000,
    });
  }
  return _client;
};

/**
 * Step 1: Clean and validate user prompt input.
 * Protects against NoSQL injection objects and token waste from oversized inputs.
 */
export function sanitizePrompt(input: unknown): string {
  if (typeof input !== 'string') {
    throw new AppError('Prompt must be text', 400);
  }

  // Collapse multiple whitespaces/newlines/tabs into a single space and trim
  const clean = input.replace(/\s+/g, ' ').trim();

  if (clean.length < 3 || clean.length > 300) {
    throw new AppError('Prompt must be 3-300 characters', 400);
  }

  return clean;
}

/**
 * Step 2: Search platform database for candidate courses (zero API cost).
 * Neutralizes quotes and dashes, catches index errors, and dedupes _ids.
 */
export async function findCandidates(
  prompt: string,
  enrolledIds: (Types.ObjectId | string)[] = []
): Promise<CandidateCourse[]> {
  const validEnrolledIds = (enrolledIds || [])
    .filter((id) => Boolean(id) && Types.ObjectId.isValid(String(id)))
    .map((id) => (typeof id === 'string' ? new Types.ObjectId(id) : id));

  const baseFilter: Record<string, unknown> = {};
  if (validEnrolledIds.length > 0) {
    baseFilter._id = { $nin: validEnrolledIds };
  }

  // Neutralize quotes and negation operators in MongoDB text search queries
  const safeSearchText = prompt.replace(/["\-]/g, ' ').replace(/\s+/g, ' ').trim();

  let courses: CandidateCourse[] = [];

  try {
    if (safeSearchText) {
      courses = await Course.find(
        {
          ...baseFilter,
          $text: { $search: safeSearchText },
        },
        { score: { $meta: 'textScore' } }
      )
        .populate('instructor', 'username')
        .sort({ score: { $meta: 'textScore' } })
        .limit(25)
        .lean();
    }
  } catch (err) {
    console.warn(
      'Text search index query notice (falling back to top-up):',
      err instanceof Error ? err.message : err
    );
    courses = [];
  }

  // Top-up with newest courses if fewer than 5 candidates were found
  if (courses.length < 5) {
    const existingIdStrings = new Set(courses.map((c) => c._id.toString()));
    const allExcludedIds = [
      ...validEnrolledIds,
      ...courses.map((c) => (typeof c._id === 'string' ? new Types.ObjectId(c._id) : c._id)),
    ];

    const extraFilter: Record<string, unknown> = {};
    if (allExcludedIds.length > 0) {
      extraFilter._id = { $nin: allExcludedIds };
    }

    const extra = await Course.find(extraFilter)
      .populate('instructor', 'username')
      .sort({ createdAt: -1 })
      .limit(25)
      .lean();

    const uniqueExtra = extra.filter(
      (course) => !existingIdStrings.has(course._id.toString())
    );

    courses = [...courses, ...uniqueExtra].slice(0, 25);
  }

  return courses;
}

/**
 * Step 3: Atomic request counter (protects the request limit).
 */
export async function consumeBudget(maxLimit: number = AI_LIMIT): Promise<boolean> {
  await AIUsage.updateOne(
    { key: 'global' },
    { $setOnInsert: { count: 0, limit: maxLimit } },
    { upsert: true }
  ).catch(() => {});

  const doc = await AIUsage.findOneAndUpdate(
    { key: 'global', count: { $lt: maxLimit } },
    { $inc: { count: 1 }, $set: { lastUsedAt: new Date() } },
    { returnDocument: 'after' }
  );

  return doc !== null;
}

/**
 * Query current global AI request usage.
 */
export async function getBudgetUsage(
  key: string = 'global'
): Promise<{ count: number; limit: number; remaining: number }> {
  const doc = await AIUsage.findOne({ key });
  const count = doc ? doc.count : 0;
  const limit = doc?.limit || AI_LIMIT;
  return {
    count,
    limit,
    remaining: Math.max(0, limit - count),
  };
}

/**
 * Build chat messages for the OpenAI model.
 * Sanitizes delimiter breakout attempts and collapses multi-line descriptions.
 */
export function buildMessages(prompt: string, courses: CandidateCourse[]) {
  const list = courses
    .map((c, i) => `${i + 1}. ${oneLine(c.title, 100)}: ${oneLine(c.description, 200)}`)
    .join('\n');

  return [
    {
      role: 'system' as const,
      content: `You are a course advisor. Recommend up to ${MAX_RESULTS} courses ONLY from the list.
If nothing fits, return an empty recommendations array.
Reply in JSON: {"summary": "...", "recommendations": [{"ref": 1, "reason": "..."}]}`,
    },
    {
      role: 'user' as const,
      content: `Student goal: """${prompt.replace(/"""/g, ' ')}"""\n\nCourses:\n${list}`,
    },
  ];
}

/**
 * Parse and validate model JSON output.
 * Checks types, integer range, deduplicates refs, caps at MAX_RESULTS,
 * and detects all-invalid refs vs valid empty list.
 */
export function parseModelOutput(
  raw: string,
  max: number
): { picks: { ref: number; reason?: string }[]; summary: string } {
  let data: any;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new InvalidOutputError('not valid JSON');
  }

  if (!data || !Array.isArray(data.recommendations)) {
    throw new InvalidOutputError('unexpected shape');
  }

  const seen = new Set<number>();
  const picks: { ref: number; reason?: string }[] = [];

  for (const r of data.recommendations) {
    const ref = Number(r?.ref);
    if (!Number.isInteger(ref) || ref < 1 || ref > max || seen.has(ref)) continue;
    seen.add(ref);
    picks.push({
      ref,
      reason: typeof r?.reason === 'string' && r.reason.trim() ? oneLine(r.reason, 200) : undefined,
    });
    if (picks.length === MAX_RESULTS) break;
  }

  // An empty list is a valid "nothing fits". Items that were ALL invalid is a failure.
  if (data.recommendations.length > 0 && picks.length === 0) {
    throw new InvalidOutputError('no valid refs');
  }

  return {
    picks,
    summary: typeof data.summary === 'string' ? oneLine(data.summary, 400) : '',
  };
}

/**
 * Classify errors into standard FallbackReason codes using SDK error classes.
 */
export function classifyError(err: unknown): FallbackReason {
  if (err instanceof InvalidOutputError) return 'invalid_output';
  if (err instanceof OpenAI.APIConnectionTimeoutError) return 'timeout';
  if (err instanceof OpenAI.AuthenticationError) return 'auth_error';
  if (err instanceof OpenAI.RateLimitError) return 'rate_limited';
  if (err instanceof OpenAI.APIError) return 'openai_error';
  if (
    err instanceof Error &&
    (err.name === 'APIConnectionTimeoutError' || err.message.toLowerCase().includes('timed out'))
  ) {
    return 'timeout';
  }
  return 'internal';
}

/**
 * Combined recommendation pipeline:
 * 1. Clean and validate prompt
 * 2. Search database candidates (zero API cost)
 * 3. Validate local environment and build prompt (zero API cost)
 * 4. Atomically consume request budget right before API call
 * 5. Call OpenAI model with structured output
 * 6. Validate output and return AI curations or graceful fallback
 */
export async function getRecommendations(
  rawPrompt: unknown,
  enrolledIds: (Types.ObjectId | string)[] = [],
  customClient?: OpenAI
): Promise<RecommendationResult> {
  const prompt = sanitizePrompt(rawPrompt); // 400 propagates on purpose
  const courses = await findCandidates(prompt, enrolledIds);

  if (courses.length === 0) {
    return {
      source: 'empty',
      summary: 'No courses available to recommend right now.',
      courses: [],
    };
  }

  const fallback = (reason: FallbackReason): RecommendationResult => ({
    source: 'fallback',
    summary: 'Here are courses that match your search.',
    courses: courses.slice(0, MAX_RESULTS),
    meta: { fallbackReason: reason },
  });

  const rawModel = process.env.OPENAI_MODEL?.trim();
  const rawKey = process.env.OPENAI_API_KEY;
  const apiKey = rawKey ? rawKey.replace(/^["']|["']$/g, '').trim() : '';
  const model = rawModel || 'gpt-3.5-turbo';

  if (!customClient && !apiKey) {
    console.error('[ai] OPENAI_API_KEY is not configured');
    return fallback('config_error');
  }

  const messages = buildMessages(prompt, courses);

  // 2. Spend one request (atomic). Exhaustion is a normal outcome, not an exception
  const allowed = await consumeBudget(AI_LIMIT);
  if (!allowed) {
    console.warn('[ai] fallback: budget_exhausted');
    return fallback('budget_exhausted');
  }

  // 3. The single API call
  try {
    const res = await (customClient ?? getClient()).chat.completions.create({
      model,
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 500,
    });

    const choice = res.choices[0];
    if (!choice?.message?.content || choice.finish_reason === 'length') {
      throw new InvalidOutputError('empty or truncated response');
    }

    const { picks, summary } = parseModelOutput(choice.message.content, courses.length);
    return {
      source: 'ai',
      summary: summary || 'Here are course recommendations aligned with your goals.',
      courses: picks.map((p) => ({ ...courses[p.ref - 1], reason: p.reason })),
    };
  } catch (err) {
    const reason = classifyError(err);
    if (reason === 'internal') {
      console.error('[ai] unexpected error', err);
    } else {
      console.warn(`[ai] fallback: ${reason}`);
    }
    return fallback(reason);
  }
}

// Backward-compatible alias
export const getCourseRecommendations = getRecommendations;
