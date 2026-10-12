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

export interface EnrolledStudentInfo {
  _id: string;
  email?: string;
  username?: string;
  role: string;
  createdAt?: string;
}

export interface CourseEnrollmentItem {
  _id: string;
  student: EnrolledStudentInfo | string;
  course: string;
  status: EnrollmentStatus;
  enrollmentDate: string;
  completionDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseStudentsPagination {
  page: number;
  limit: number;
  totalEnrollments: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CourseStudentsResponse {
  enrollments: CourseEnrollmentItem[];
  course?: {
    id: string;
    title: string;
  };
  pagination: CourseStudentsPagination;
}
