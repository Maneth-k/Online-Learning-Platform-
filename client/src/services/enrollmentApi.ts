import type { ActionResult } from '../types/auth.js';
import type { Enrollment, CheckEnrollmentResponse } from '../types/enrollment.js';
import { API_ROOT } from './apiConfig.js';

const API_BASE = `${API_ROOT}/api/enrollments`;

/**
 * Enroll student in a course.
 * Restricted to authenticated students.
 * POST /api/enrollments
 */
export async function enrollInCourse(courseId: string): Promise<Enrollment> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ courseId }),
  });

  const result: ActionResult<{ enrollment: Enrollment }> = await response.json();

  if (!response.ok || !result.success || !result.data?.enrollment) {
    throw new Error(result.message || 'Failed to enroll in course');
  }

  return result.data.enrollment;
}

/**
 * Check if the currently authenticated user is enrolled in a specific course.
 * GET /api/enrollments/check/:courseId
 */
export async function checkCourseEnrollment(courseId: string): Promise<CheckEnrollmentResponse> {
  const response = await fetch(`${API_BASE}/check/${courseId}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    return { isEnrolled: false, enrollment: null };
  }

  const result: ActionResult<CheckEnrollmentResponse> = await response.json();

  if (!result.success || !result.data) {
    return { isEnrolled: false, enrollment: null };
  }

  return result.data;
}

/**
 * Get current student's enrolled courses.
 * Restricted to authenticated students.
 * GET /api/enrollments/me
 */
export async function fetchMyEnrollments(): Promise<Enrollment[]> {
  const response = await fetch(`${API_BASE}/me`, {
    method: 'GET',
    credentials: 'include',
  });

  const result: ActionResult<{ enrollments: Enrollment[] }> = await response.json();

  if (!response.ok || !result.success || !result.data?.enrollments) {
    throw new Error(result.message || 'Failed to fetch enrollments');
  }

  return result.data.enrollments;
}

/**
 * Unenroll from a course.
 * DELETE /api/enrollments/:id
 */
export async function unenrollCourse(enrollmentId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${enrollmentId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  const result: ActionResult = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to unenroll from course');
  }
}
