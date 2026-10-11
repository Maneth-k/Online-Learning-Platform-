import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Course title is required')
    .max(200, 'Course title cannot exceed 200 characters'),
  category: z
    .string()
    .trim()
    .min(1, 'Course category is required')
    .max(100, 'Course category cannot exceed 100 characters'),
  description: z
    .string()
    .trim()
    .min(1, 'Course description is required'),
  content: z
    .string()
    .trim()
    .min(1, 'Course content is required'),
});

export type CreateCourseFormData = z.infer<typeof createCourseSchema>;
