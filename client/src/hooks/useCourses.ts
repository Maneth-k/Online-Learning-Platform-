import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createCourse, fetchCourses } from '../services/courseApi.js';
import type { CreateCourseInput, Course } from '../types/course.js';

export const COURSES_QUERY_KEY = ['courses'] as const;

export function useCourses() {
  return useQuery<Course[]>({
    queryKey: COURSES_QUERY_KEY,
    queryFn: fetchCourses,
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
