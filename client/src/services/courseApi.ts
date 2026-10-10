import type { ActionResult } from '../types/auth.js';
import type { Course, CreateCourseInput } from '../types/course.js';

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
 * Fetch all courses.
 */
export async function fetchCourses(): Promise<Course[]> {
  const response = await fetch(API_BASE, {
    method: 'GET',
    credentials: 'include',
  });

  const result: ActionResult<{ courses: Course[] }> = await response.json();

  if (!response.ok || !result.success || !result.data?.courses) {
    throw new Error(result.message || 'Failed to fetch courses');
  }

  return result.data.courses;
}
