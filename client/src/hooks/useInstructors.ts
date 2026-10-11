import { useQuery } from '@tanstack/react-query';
import { fetchInstructors, fetchInstructorById } from '../services/instructorApi.js';
import type { InstructorFilters, Instructor, InstructorPagination } from '../types/instructor.js';

export const INSTRUCTORS_QUERY_KEY = ['instructors'] as const;

export function useInstructors(filters: InstructorFilters = {}) {
  return useQuery<{ instructors: Instructor[]; pagination?: InstructorPagination }>({
    queryKey: [...INSTRUCTORS_QUERY_KEY, filters],
    queryFn: () => fetchInstructors(filters),
    staleTime: 60 * 1000,
  });
}

export function useInstructor(id: string) {
  return useQuery<Instructor>({
    queryKey: [...INSTRUCTORS_QUERY_KEY, 'detail', id],
    queryFn: () => fetchInstructorById(id),
    enabled: Boolean(id),
  });
}
