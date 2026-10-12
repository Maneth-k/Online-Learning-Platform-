import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  enrollInCourse,
  checkCourseEnrollment,
  fetchMyEnrollments,
  unenrollCourse,
  fetchCourseStudents,
  updateEnrollmentStatusApi,
} from '../services/enrollmentApi.js';
import type {
  Enrollment,
  CheckEnrollmentResponse,
  CourseStudentsResponse,
  EnrollmentStatus,
} from '../types/enrollment.js';

export const ENROLLMENTS_KEY = ['my-enrollments'] as const;

export function useCheckEnrollment(courseId: string | undefined, enabled: boolean = true) {
  return useQuery<CheckEnrollmentResponse>({
    queryKey: ['enrollment-check', courseId],
    queryFn: () => checkCourseEnrollment(courseId!),
    enabled: Boolean(courseId && enabled),
  });
}

export function useMyEnrollments(enabled: boolean = true) {
  return useQuery<Enrollment[]>({
    queryKey: ENROLLMENTS_KEY,
    queryFn: fetchMyEnrollments,
    enabled,
  });
}

export function useEnrollCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => enrollInCourse(courseId),
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: ['enrollment-check', courseId] });
      queryClient.invalidateQueries({ queryKey: ENROLLMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useUnenrollCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (enrollmentId: string) => unenrollCourse(enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment-check'] });
      queryClient.invalidateQueries({ queryKey: ENROLLMENTS_KEY });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useCourseStudents(
  courseId: string | undefined,
  options?: { page?: number; limit?: number; status?: string },
  enabled: boolean = true
) {
  return useQuery<CourseStudentsResponse>({
    queryKey: ['course-students', courseId, options] as const,
    queryFn: () => fetchCourseStudents(courseId!, options),
    enabled: Boolean(courseId && enabled),
  });
}

export function useUpdateEnrollmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ enrollmentId, status }: { enrollmentId: string; status: EnrollmentStatus }) =>
      updateEnrollmentStatusApi(enrollmentId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-students'] });
      queryClient.invalidateQueries({ queryKey: ENROLLMENTS_KEY });
    },
  });
}
