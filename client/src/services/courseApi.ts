import type { ActionResult } from '../types/auth.js';
import type { Course, CreateCourseInput, CourseQueryFilters } from '../types/course.js';

const API_BASE = '/api/courses';

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

