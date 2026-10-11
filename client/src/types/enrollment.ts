import type { Course } from './course.js';

export type EnrollmentStatus = 'enrolled' | 'completed' | 'dropped';

export interface Enrollment {
  _id: string;
  student: string | { _id: string; username: string };
  course: string | Course;
  status: EnrollmentStatus;
  enrollmentDate: string;
  completionDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CheckEnrollmentResponse {
  isEnrolled: boolean;
  enrollment?: Enrollment | null;
}
