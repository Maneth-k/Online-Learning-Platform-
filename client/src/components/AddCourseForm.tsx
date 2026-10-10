import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateCourse } from '../hooks/useCourses.js';
import {
  createCourseSchema,
  type CreateCourseFormData,
} from '../schemas/courseSchemas.js';
import type { Course } from '../types/course.js';

export interface AddCourseFormProps {
  onSuccess?: (course: Course) => void;
  onCancel?: () => void;
}

export function AddCourseForm({ onSuccess, onCancel }: AddCourseFormProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const createCourseMutation = useCreateCourse();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateCourseFormData>({
    resolver: zodResolver(createCourseSchema),
  });

  const onSubmit = (data: CreateCourseFormData) => {
    setSuccessMessage(null);
    createCourseMutation.mutate(data, {
      onSuccess: (newCourse) => {
        setSuccessMessage('Course created successfully!');
        reset();
        onSuccess?.(newCourse);
      },
    });
  };

  const isPending = isSubmitting || createCourseMutation.isPending;

  return (
    <div style={{ margin: '20px', maxWidth: '480px' }}>
      <h2>Add Course</h2>

      {createCourseMutation.error && (
        <p style={{ color: 'red', marginTop: '8px', marginBottom: '8px' }}>
          {createCourseMutation.error instanceof Error
            ? createCourseMutation.error.message
            : 'Failed to create course'}
        </p>
      )}

      {successMessage && (
        <p style={{ color: 'green', marginTop: '8px', marginBottom: '8px' }}>
          {successMessage}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="course-title" style={{ display: 'block', marginBottom: '4px' }}>
            Course Title:
          </label>
          <input
            id="course-title"
            type="text"
            placeholder="e.g. Full-Stack Web Development"
            {...register('title')}
            style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
          />
          {errors.title && (
            <span style={{ color: 'red', fontSize: '13px', display: 'block', marginTop: '4px' }}>
              {errors.title.message}
            </span>
          )}
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="course-description" style={{ display: 'block', marginBottom: '4px' }}>
            Course Description:
          </label>
          <textarea
            id="course-description"
            rows={3}
            placeholder="Brief description of the course content"
            {...register('description')}
            style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
          />
          {errors.description && (
            <span style={{ color: 'red', fontSize: '13px', display: 'block', marginTop: '4px' }}>
              {errors.description.message}
            </span>
          )}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="course-content" style={{ display: 'block', marginBottom: '4px' }}>
            Course Content:
          </label>
          <textarea
            id="course-content"
            rows={5}
            placeholder="Detailed course curriculum and materials"
            {...register('content')}
            style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }}
          />
          {errors.content && (
            <span style={{ color: 'red', fontSize: '13px', display: 'block', marginTop: '4px' }}>
              {errors.content.message}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="submit"
            disabled={isPending}
            style={{ padding: '8px 16px', cursor: 'pointer' }}
          >
            {isPending ? 'Creating Course...' : 'Create Course'}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              style={{ padding: '8px 16px', cursor: 'pointer' }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export const CreateCourseForm = AddCourseForm;
export default AddCourseForm;
