import { describe, it, expect, vi, beforeEach } from 'vitest';
import OpenAI from 'openai';
import { Types } from 'mongoose';
import Course from '../models/Course.js';
import AIUsage from '../models/AIUsage.js';
import {
  sanitizePrompt,
  findCandidates,
  consumeBudget,
  getBudgetUsage,
  getRecommendations,
} from '../services/recommendationService.js';
import { AppError } from '../utils/AppError.js';

describe('Recommendation Service - Steps 1 through 6', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const makeMockCourse = (id: string, title: string, desc: string = 'Desc') => ({
    _id: new Types.ObjectId(id),
    title,
    description: desc,
    category: 'Engineering',
    content: 'Content',
    instructor: { username: 'test_instructor' },
    createdAt: new Date(),
  });

  // ==========================================
  // Step 1: sanitizePrompt
  // ==========================================
  describe('Step 1: sanitizePrompt', () => {
    it('accepts a valid clean prompt', () => {
      const input = 'I want to become a software engineer';
      const output = sanitizePrompt(input);
      expect(output).toBe('I want to become a software engineer');
    });

    it('collapses multiple spaces, tabs, and newlines', () => {
      const input = '   I want   to   learn \n\n  AI and  \t\t TypeScript   ';
      const output = sanitizePrompt(input);
      expect(output).toBe('I want to learn AI and TypeScript');
    });

    it('throws AppError 400 for non-string inputs (e.g. NoSQL injection object)', () => {
      const injectionPayload = { $ne: null };
      expect(() => sanitizePrompt(injectionPayload)).toThrow(AppError);

      try {
        sanitizePrompt(injectionPayload);
      } catch (err: any) {
        expect(err.statusCode).toBe(400);
        expect(err.message).toBe('Prompt must be text');
      }
    });

    it('throws AppError 400 for null, undefined, or numbers', () => {
      expect(() => sanitizePrompt(null)).toThrow('Prompt must be text');
      expect(() => sanitizePrompt(undefined)).toThrow('Prompt must be text');
      expect(() => sanitizePrompt(12345)).toThrow('Prompt must be text');
    });

    it('throws AppError 400 if prompt is shorter than 3 characters', () => {
      expect(() => sanitizePrompt('ab')).toThrow('Prompt must be 3-300 characters');
      expect(() => sanitizePrompt('   a   ')).toThrow('Prompt must be 3-300 characters');
      expect(() => sanitizePrompt('')).toThrow('Prompt must be 3-300 characters');
    });

    it('throws AppError 400 if prompt exceeds 300 characters', () => {
      const longText = 'a'.repeat(301);
      expect(() => sanitizePrompt(longText)).toThrow('Prompt must be 3-300 characters');
    });

    it('accepts exact length boundaries: 3 characters and 300 characters', () => {
      const minLength = 'abc';
      expect(sanitizePrompt(minLength)).toBe('abc');

      const maxLength = 'a'.repeat(300);
      expect(sanitizePrompt(maxLength)).toBe(maxLength);
    });
  });

  // ==========================================
  // Step 2: findCandidates
  // ==========================================
  describe('Step 2: findCandidates', () => {
    it('returns candidates matching text search when >= 5 results exist', async () => {
      const mockCourses = [
        makeMockCourse('65f1a2b3c4d5e6f7a8b9c001', 'Full-stack Systems'),
        makeMockCourse('65f1a2b3c4d5e6f7a8b9c002', 'Full-stack TypeScript'),
        makeMockCourse('65f1a2b3c4d5e6f7a8b9c003', 'Full-stack React'),
        makeMockCourse('65f1a2b3c4d5e6f7a8b9c004', 'Full-stack Node.js'),
        makeMockCourse('65f1a2b3c4d5e6f7a8b9c005', 'Full-stack Cloud'),
      ];

      const chainable = {
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockCourses),
      };
      vi.spyOn(Course, 'find').mockReturnValue(chainable as any);

      const candidates = await findCandidates('full-stack software engineer', []);

      expect(candidates).toHaveLength(5);
      expect(candidates[0].title).toBe('Full-stack Systems');
      expect(Course.find).toHaveBeenCalledTimes(1);
    });

    it('tops up with newest courses when text search finds fewer than 5 candidates', async () => {
      const textMatch = [
        makeMockCourse('65f1a2b3c4d5e6f7a8b9c001', 'AI Systems Architecture'),
      ];

      const extraCourses = [
        makeMockCourse('65f1a2b3c4d5e6f7a8b9c002', 'Cloud DevOps & Kubernetes'),
        makeMockCourse('65f1a2b3c4d5e6f7a8b9c003', 'Database Design with MongoDB'),
        makeMockCourse('65f1a2b3c4d5e6f7a8b9c004', 'Modern Product Management'),
        makeMockCourse('65f1a2b3c4d5e6f7a8b9c005', 'Advanced TypeScript'),
      ];

      let callCount = 0;
      vi.spyOn(Course, 'find').mockImplementation(() => {
        callCount++;
        const results = callCount === 1 ? textMatch : extraCourses;
        return {
          populate: vi.fn().mockReturnThis(),
          sort: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          lean: vi.fn().mockResolvedValue(results),
        } as any;
      });

      const candidates = await findCandidates('Machine learning', []);

      expect(candidates).toHaveLength(5);
      expect(candidates[0].title).toBe('AI Systems Architecture');
      expect(candidates[1].title).toBe('Cloud DevOps & Kubernetes');
      expect(Course.find).toHaveBeenCalledTimes(2);
    });

    it('deduplicates courses by _id when merging text matches and top-up courses', async () => {
      const course1 = makeMockCourse('65f1a2b3c4d5e6f7a8b9c001', 'Course One');
      const course2 = makeMockCourse('65f1a2b3c4d5e6f7a8b9c002', 'Course Two');

      const textMatches = [course1];
      const extraCourses = [course1, course2];

      let callCount = 0;
      vi.spyOn(Course, 'find').mockImplementation(() => {
        callCount++;
        const results = callCount === 1 ? textMatches : extraCourses;
        return {
          populate: vi.fn().mockReturnThis(),
          sort: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          lean: vi.fn().mockResolvedValue(results),
        } as any;
      });

      const candidates = await findCandidates('software', []);

      expect(candidates).toHaveLength(2);
      expect(candidates.map((c) => c._id.toString())).toEqual([
        course1._id.toString(),
        course2._id.toString(),
      ]);
    });

    it('skips courses the student is already enrolled in ($nin filter)', async () => {
      const enrolledId = '65f1a2b3c4d5e6f7a8b9c099';
      let capturedFilter: any = null;

      vi.spyOn(Course, 'find').mockImplementation((filter: any) => {
        capturedFilter = filter;
        return {
          populate: vi.fn().mockReturnThis(),
          sort: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          lean: vi.fn().mockResolvedValue([]),
        } as any;
      });

      await findCandidates('engineering', [enrolledId]);

      expect(capturedFilter).toBeDefined();
      expect(capturedFilter._id).toBeDefined();
      expect(capturedFilter._id.$nin).toBeDefined();
      expect(capturedFilter._id.$nin[0].toString()).toBe(enrolledId);
    });

    it('returns empty array when no courses match and no extra courses are in database', async () => {
      vi.spyOn(Course, 'find').mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      const candidates = await findCandidates('rocket science', []);
      expect(candidates).toEqual([]);
    });

    it('falls back to top-up when text index throws an error', async () => {
      const extraCourse = makeMockCourse('65f1a2b3c4d5e6f7a8b9c010', 'Fallback Course');

      let callCount = 0;
      vi.spyOn(Course, 'find').mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          throw new Error('text index required for $text query');
        }
        return {
          populate: vi.fn().mockReturnThis(),
          sort: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          lean: vi.fn().mockResolvedValue([extraCourse]),
        } as any;
      });

      const candidates = await findCandidates('any prompt', []);
      expect(candidates).toHaveLength(1);
      expect(candidates[0].title).toBe('Fallback Course');
    });
  });

  // ==========================================
  // Step 3: Request counter
  // ==========================================
  describe('Step 3: Request Counter & Budget Protection', () => {
    it('allows call and returns true when count is under limit (e.g. 5/200)', async () => {
      vi.spyOn(AIUsage, 'updateOne').mockResolvedValue({} as any);
      vi.spyOn(AIUsage, 'findOneAndUpdate').mockResolvedValue({
        key: 'global',
        count: 6,
        limit: 200,
      } as any);

      const allowed = await consumeBudget(200);
      expect(allowed).toBe(true);
      expect(AIUsage.findOneAndUpdate).toHaveBeenCalledWith(
        { key: 'global', count: { $lt: 200 } },
        expect.objectContaining({ $inc: { count: 1 } }),
        { returnDocument: 'after' }
      );
    });

    it('blocks call and returns false when count reaches or exceeds limit', async () => {
      vi.spyOn(AIUsage, 'updateOne').mockResolvedValue({} as any);
      vi.spyOn(AIUsage, 'findOneAndUpdate').mockResolvedValue(null);

      const allowed = await consumeBudget(200);
      expect(allowed).toBe(false);
    });

    it('retrieves budget usage details correctly', async () => {
      vi.spyOn(AIUsage, 'findOne').mockResolvedValue({
        key: 'global',
        count: 42,
        limit: 200,
      } as any);

      const usage = await getBudgetUsage('global');
      expect(usage.count).toBe(42);
      expect(usage.limit).toBe(200);
      expect(usage.remaining).toBe(158);
    });
  });

  // ==========================================
  // Steps 4, 5, 6: Ask Model, Check Answer & Fallback
  // ==========================================
  describe('Steps 4, 5, 6: AI Model Call, Checking Answers & Graceful Fallback', () => {
    const candidateCourses = [
      makeMockCourse('65f1a2b3c4d5e6f7a8b9c001', 'Full-Stack Architecture', 'Learn React 19 and Node'),
      makeMockCourse('65f1a2b3c4d5e6f7a8b9c002', 'Machine Learning Foundations', 'Deep learning and math'),
      makeMockCourse('65f1a2b3c4d5e6f7a8b9c003', 'Cloud DevOps & Kubernetes', 'Containers and clusters'),
    ];

    beforeEach(() => {
      // Ensure test environment variables are set
      process.env.OPENAI_MODEL = 'gpt-3.5-turbo';
      process.env.OPENAI_API_KEY = 'test_key';

      // Mock Course.find to return our candidate courses
      vi.spyOn(Course, 'find').mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(candidateCourses),
      } as any);

      // Mock AIUsage default state
      vi.spyOn(AIUsage, 'updateOne').mockResolvedValue({} as any);
      vi.spyOn(AIUsage, 'findOne').mockResolvedValue({
        key: 'global',
        count: 10,
        limit: 200,
      } as any);
    });

    it('1. Empty catalog: returns source: "empty", budget not consumed, client not called', async () => {
      vi.spyOn(Course, 'find').mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      const budgetSpy = vi.spyOn(AIUsage, 'findOneAndUpdate');
      const mockCreate = vi.fn();
      const mockClient: any = { chat: { completions: { create: mockCreate } } };

      const result = await getRecommendations('Niche topic', [], mockClient);

      expect(result.source).toBe('empty');
      expect(result.courses).toEqual([]);
      expect(result.summary).toContain('No courses available');
      expect(budgetSpy).not.toHaveBeenCalled();
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('2. Missing key or model: returns config_error, budget not consumed, client not called', async () => {
      const originalModel = process.env.OPENAI_MODEL;
      const originalKey = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_MODEL;
      delete process.env.OPENAI_API_KEY;

      const budgetSpy = vi.spyOn(AIUsage, 'findOneAndUpdate');
      const mockCreate = vi.fn();
      const mockClient: any = { chat: { completions: { create: mockCreate } } };

      // Pass undefined customClient to trigger API key check
      const result = await getRecommendations('Data science', [], undefined);

      expect(result.source).toBe('fallback');
      expect(result.meta?.fallbackReason).toBe('config_error');
      expect(budgetSpy).not.toHaveBeenCalled();
      expect(mockCreate).not.toHaveBeenCalled();

      process.env.OPENAI_MODEL = originalModel;
      process.env.OPENAI_API_KEY = originalKey;
    });

    it('3. Budget exhausted: returns budget_exhausted fallback and client is never called', async () => {
      vi.spyOn(AIUsage, 'findOneAndUpdate').mockResolvedValue(null);

      const mockCreate = vi.fn();
      const mockClient: any = { chat: { completions: { create: mockCreate } } };

      const result = await getRecommendations('Learn backend development', [], mockClient);

      expect(result.source).toBe('fallback');
      expect(result.meta?.fallbackReason).toBe('budget_exhausted');
      expect(result.courses).toHaveLength(3);
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('4. Model returns invalid JSON, {}, or a truncated response: returns fallback invalid_output', async () => {
      vi.spyOn(AIUsage, 'findOneAndUpdate').mockResolvedValue({
        key: 'global',
        count: 15,
        limit: 200,
      } as any);

      // 4a. Malformed JSON
      const mockCreateBadJson = vi.fn().mockResolvedValue({
        choices: [{ message: { content: 'not valid JSON {{' } }],
      });
      let result = await getRecommendations('AI engineer', [], { chat: { completions: { create: mockCreateBadJson } } } as any);
      expect(result.source).toBe('fallback');
      expect(result.meta?.fallbackReason).toBe('invalid_output');
      expect(mockCreateBadJson).toHaveBeenCalledTimes(1);

      // 4b. Empty object {}
      const mockCreateEmptyObj = vi.fn().mockResolvedValue({
        choices: [{ message: { content: '{}' } }],
      });
      result = await getRecommendations('AI engineer', [], { chat: { completions: { create: mockCreateEmptyObj } } } as any);
      expect(result.source).toBe('fallback');
      expect(result.meta?.fallbackReason).toBe('invalid_output');
      expect(mockCreateEmptyObj).toHaveBeenCalledTimes(1);

      // 4c. Truncated response (finish_reason === 'length')
      const mockCreateTruncated = vi.fn().mockResolvedValue({
        choices: [{ message: { content: '{"summary": "incomplete"' }, finish_reason: 'length' }],
      });
      result = await getRecommendations('AI engineer', [], { chat: { completions: { create: mockCreateTruncated } } } as any);
      expect(result.source).toBe('fallback');
      expect(result.meta?.fallbackReason).toBe('invalid_output');
      expect(mockCreateTruncated).toHaveBeenCalledTimes(1);
    });

    it('5. Model returns only ref: 99 falls back to invalid_output; Model returns [] returns source: "ai" with empty list', async () => {
      vi.spyOn(AIUsage, 'findOneAndUpdate').mockResolvedValue({
        key: 'global',
        count: 16,
        limit: 200,
      } as any);

      // 5a. All invalid refs
      const mockCreateInvalidRefs = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Some summary',
                recommendations: [{ ref: 99, reason: 'Course does not exist' }],
              }),
            },
          },
        ],
      });
      let result = await getRecommendations('DevOps', [], { chat: { completions: { create: mockCreateInvalidRefs } } } as any);
      expect(result.source).toBe('fallback');
      expect(result.meta?.fallbackReason).toBe('invalid_output');

      // 5b. Valid empty list ("nothing fits")
      const mockCreateEmptyArray = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Nothing in our catalog fits this goal.',
                recommendations: [],
              }),
            },
          },
        ],
      });
      result = await getRecommendations('DevOps', [], { chat: { completions: { create: mockCreateEmptyArray } } } as any);
      expect(result.source).toBe('ai');
      expect(result.courses).toEqual([]);
      expect(result.summary).toBe('Nothing in our catalog fits this goal.');
    });

    it('6. Model returns 20 items with duplicates: result is capped at 5 and deduped', async () => {
      const twentyCandidates = Array.from({ length: 10 }, (_, i) =>
        makeMockCourse(`65f1a2b3c4d5e6f7a8b9c00${i}`, `Course ${i + 1}`)
      );
      vi.spyOn(Course, 'find').mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(twentyCandidates),
      } as any);

      vi.spyOn(AIUsage, 'findOneAndUpdate').mockResolvedValue({
        key: 'global',
        count: 17,
        limit: 200,
      } as any);

      // Provide many recommendations with duplicates and beyond 5
      const mockRecs = [
        { ref: 1, reason: 'First' },
        { ref: 1, reason: 'Duplicate' },
        { ref: 2, reason: 'Second' },
        { ref: 3, reason: 'Third' },
        { ref: 4, reason: 'Fourth' },
        { ref: 5, reason: 'Fifth' },
        { ref: 6, reason: 'Sixth (should be ignored)' },
      ];

      const mockCreate = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Curated list',
                recommendations: mockRecs,
              }),
            },
          },
        ],
      });

      const result = await getRecommendations('Engineering', [], { chat: { completions: { create: mockCreate } } } as any);
      expect(result.source).toBe('ai');
      expect(result.courses).toHaveLength(5);
      const refs = result.courses.map((c) => c.title);
      expect(new Set(refs).size).toBe(5);
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it('7. Fake client throws timeout, 401, and 429: classifies reasons into timeout, auth_error, rate_limited', async () => {
      vi.spyOn(AIUsage, 'findOneAndUpdate').mockResolvedValue({
        key: 'global',
        count: 18,
        limit: 200,
      } as any);

      // 7a. Timeout error
      const mockTimeout = vi.fn().mockRejectedValue(new OpenAI.APIConnectionTimeoutError({ message: 'Request timed out' }));
      let result = await getRecommendations('Testing timeout', [], { chat: { completions: { create: mockTimeout } } } as any);
      expect(result.source).toBe('fallback');
      expect(result.meta?.fallbackReason).toBe('timeout');

      // 7b. Auth error (401)
      const mockAuth = vi.fn().mockRejectedValue(new OpenAI.AuthenticationError(401, { error: 'invalid_key' }, 'Unauthorized', new Headers()));
      result = await getRecommendations('Testing auth', [], { chat: { completions: { create: mockAuth } } } as any);
      expect(result.source).toBe('fallback');
      expect(result.meta?.fallbackReason).toBe('auth_error');

      // 7c. Rate limit error (429)
      const mockRate = vi.fn().mockRejectedValue(new OpenAI.RateLimitError(429, { error: 'rate_limit' }, 'Too many requests', new Headers()));
      result = await getRecommendations('Testing rate limit', [], { chat: { completions: { create: mockRate } } } as any);
      expect(result.source).toBe('fallback');
      expect(result.meta?.fallbackReason).toBe('rate_limited');
    });

    it('8. A course with a missing description does not crash', async () => {
      const courseWithNoDesc = [
        makeMockCourse('65f1a2b3c4d5e6f7a8b9c001', 'No Description Course', undefined as any),
      ];
      vi.spyOn(Course, 'find').mockReturnValue({
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(courseWithNoDesc),
      } as any);

      vi.spyOn(AIUsage, 'findOneAndUpdate').mockResolvedValue({
        key: 'global',
        count: 19,
        limit: 200,
      } as any);

      const mockCreate = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Summary for course',
                recommendations: [{ ref: 1, reason: 'Valid reason' }],
              }),
            },
          },
        ],
      });

      const result = await getRecommendations('Learn stuff', [], { chat: { completions: { create: mockCreate } } } as any);
      expect(result.source).toBe('ai');
      expect(result.courses).toHaveLength(1);
      expect(result.courses[0].title).toBe('No Description Course');
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it('9. Successfully attaches real model reasons and leaves undefined reasons un-fabricated', async () => {
      vi.spyOn(AIUsage, 'findOneAndUpdate').mockResolvedValue({
        key: 'global',
        count: 20,
        limit: 200,
      } as any);

      const mockCreate = vi.fn().mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Curated pathway',
                recommendations: [
                  { ref: 1, reason: 'Great for React 19' },
                  { ref: 2 }, // No reason provided by model
                ],
              }),
            },
          },
        ],
      });

      const result = await getRecommendations('Cloud', [], { chat: { completions: { create: mockCreate } } } as any);
      expect(result.source).toBe('ai');
      expect(result.courses[0].reason).toBe('Great for React 19');
      expect(result.courses[1].reason).toBeUndefined(); // Must NOT fabricate a default reason
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });
  });
});
