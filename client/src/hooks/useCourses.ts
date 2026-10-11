import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createCourse, fetchCourses, fetchCourseById } from '../services/courseApi.js';
import type { CreateCourseInput, Course, CourseQueryFilters } from '../types/course.js';

export const COURSES_QUERY_KEY = ['courses'] as const;

export function useCourses(filters?: CourseQueryFilters) {
  return useQuery<Course[]>({
    queryKey: ['courses', filters] as const,
    queryFn: () => fetchCourses(filters),
  });
}

export function useCourse(id: string | undefined) {
  return useQuery<Course>({
    queryKey: ['course', id],
    queryFn: () => fetchCourseById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCourseInput) => createCourse(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY });
    },
  });
}

