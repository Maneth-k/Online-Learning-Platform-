import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createCourse,
  fetchCourses,
  fetchCourseById,
  updateCourse,
  deleteCourse,
} from '../services/courseApi.js';
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

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateCourseInput> }) =>
      updateCourse(id, input),
    onSuccess: (updatedCourse) => {
      queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY });
      queryClient.setQueryData(['course', updatedCourse._id], updatedCourse);
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCourse(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY });
      queryClient.removeQueries({ queryKey: ['course', id] });
    },
  });
}

