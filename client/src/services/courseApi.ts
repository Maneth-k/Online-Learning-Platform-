import type { ActionResult } from '../types/auth.js';
import type { Course, CreateCourseInput, CourseQueryFilters } from '../types/course.js';
import { API_ROOT } from './apiConfig.js';

const API_BASE = `${API_ROOT}/api/courses`;

/**
 * Create a new course (Instructor only).
 */
export async function createCourse(input: CreateCourseInput): Promise<Course> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  const result: ActionResult<{ course: Course }> = await response.json();

  if (!response.ok || !result.success || !result.data?.course) {
    throw new Error(result.message || 'Failed to create course');
  }

  return result.data.course;
}

/**
 * Fetch courses with optional query filters (q, category, page, limit).
 * Aligns with server GET /api/courses
 */
export async function fetchCourses(filters?: CourseQueryFilters): Promise<Course[]> {
  const searchParams = new URLSearchParams();

  if (filters?.q && filters.q.trim()) {
    searchParams.set('q', filters.q.trim());
  }

  if (filters?.category && filters.category.trim() && filters.category !== 'All') {
    searchParams.set('category', filters.category.trim());
  }

  if (filters?.page) {
    searchParams.set('page', String(filters.page));
  }

  if (filters?.limit) {
    searchParams.set('limit', String(filters.limit));
  }

  const queryString = searchParams.toString();
  const url = queryString ? `${API_BASE}?${queryString}` : API_BASE;

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  });

  const result: ActionResult<{ courses: Course[] }> = await response.json();

  if (!response.ok || !result.success || !result.data?.courses) {
    throw new Error(result.message || 'Failed to fetch courses');
  }

  return result.data.courses;
}

/**
 * Fetch a single course by its ID.
 * GET /api/courses/:id
 */
export async function fetchCourseById(id: string): Promise<Course> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'GET',
    credentials: 'include',
  });

  const result: ActionResult<{ course: Course }> = await response.json();

  if (!response.ok || !result.success || !result.data?.course) {
    throw new Error(result.message || 'Course not found');
  }

  return result.data.course;
}

export type RecommendationSource = 'ai' | 'fallback' | 'empty';
export type FallbackReason = 'budget_exhausted' | 'openai_error' | 'timeout' | 'other';

export interface RecommendedCourse extends Course {
  reason?: string;
}

export interface RecommendationResponseData {
  source: RecommendationSource;
  summary: string;
  courses: RecommendedCourse[];
  fallbackReason?: FallbackReason;
  meta?: {
    fallbackReason?: FallbackReason;
  };
  requestCount?: number;
  remainingBudget?: number;
}

export interface AIUsageStatus {
  count: number;
  limit: number;
  remaining: number;
}

export class RecommendationApiError extends Error {
  status?: number;
  retryAfter?: number;
  isNetworkError?: boolean;

  constructor(message: string, status?: number, retryAfter?: number, isNetworkError?: boolean) {
    super(message);
    this.name = 'RecommendationApiError';
    this.status = status;
    this.retryAfter = retryAfter;
    this.isNetworkError = isNetworkError;
  }
}

/**
 * Request AI course recommendations based on student preferences or career prompt.
 * POST /api/courses/recommendations
 */
export async function fetchCourseRecommendations(
  prompt: string,
  signal?: AbortSignal
): Promise<RecommendationResponseData> {
  let response: Response;
  try {
    // 20-second client timeout ensures client does not abort prematurely while server is computing within 15s
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), 20000);

    const onExternalAbort = () => timeoutController.abort();
    if (signal) signal.addEventListener('abort', onExternalAbort);

    response = await fetch(`${API_BASE}/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ prompt }),
      signal: timeoutController.signal,
    }).finally(() => {
      clearTimeout(timeoutId);
      if (signal) signal.removeEventListener('abort', onExternalAbort);
    });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new RecommendationApiError(
        'Request timed out. Please check your connection and try again.',
        undefined,
        undefined,
        true
      );
    }
    throw new RecommendationApiError(
      'Network error. Please check your internet connection.',
      undefined,
      undefined,
      true
    );
  }

  const result: ActionResult<RecommendationResponseData> = await response.json().catch(() => ({
    success: false,
    message: 'Invalid server response',
  }));

  if (!response.ok) {
    if (response.status === 429) {
      const retryHeader = response.headers.get('Retry-After');
      const retryAfter = retryHeader ? parseInt(retryHeader, 10) : 60;
      throw new RecommendationApiError(
        result.message || 'Too many requests. Please wait before trying again.',
        429,
        retryAfter
      );
    }
    if (response.status === 401) {
      throw new RecommendationApiError('Please log in to use the AI advisor.', 401);
    }
    if (response.status === 403) {
      throw new RecommendationApiError('AI advisor is for students', 403);
    }
    if (response.status === 400) {
      throw new RecommendationApiError(result.message || 'Prompt must be 3-300 characters', 400);
    }
    throw new RecommendationApiError(result.message || 'Failed to fetch course recommendations', response.status);
  }

  if (!result.success || !result.data) {
    throw new RecommendationApiError(result.message || 'Failed to fetch course recommendations');
  }

  return result.data;
}

/**
 * Fetch current AI budget usage counter.
 * GET /api/courses/recommendations/usage
 */
export async function fetchAIUsageStatus(): Promise<AIUsageStatus> {
  const response = await fetch(`${API_BASE}/recommendations/usage`, {
    method: 'GET',
    credentials: 'include',
  });

  const result: ActionResult<AIUsageStatus> = await response.json();

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || 'Failed to fetch AI usage status');
  }

  return result.data;
}


