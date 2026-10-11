import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  enrollInCourse,
  checkCourseEnrollment,
  fetchMyEnrollments,
  unenrollCourse,
} from '../services/enrollmentApi.js';
import type { Enrollment, CheckEnrollmentResponse } from '../types/enrollment.js';

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
    },
  });
}
