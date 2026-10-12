import { useState, useEffect, type FormEvent } from 'react';
import { useCreateCourse, useUpdateCourse } from '../hooks/useCourses.js';
import { createCourseSchema } from '../schemas/courseSchemas.js';
import type { Course } from '../types/course.js';
import './course/CreateCourseScreen.css';

export interface CourseFormProps {
  course?: Course;
  onSuccess?: (course: Course) => void;
  onCancel?: () => void;
}

export type AddCourseFormProps = CourseFormProps;

export function AddCourseForm({ course, onSuccess, onCancel }: CourseFormProps) {
  const isEditing = Boolean(course);

  const [title, setTitle] = useState(course?.title || '');
  const [category, setCategory] = useState(course?.category || '');
  const [description, setDescription] = useState(course?.description || '');
  const [content, setContent] = useState(course?.content || '');

  useEffect(() => {
    if (course) {
      setTitle(course.title || '');
      setCategory(course.category || '');
      setDescription(course.description || '');
      setContent(course.content || '');
    }
  }, [course]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const createCourseMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();

  const isPending = createCourseMutation.isPending || updateCourseMutation.isPending;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parseResult = createCourseSchema.safeParse({
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      content: content.trim(),
    });

    if (!parseResult.success) {
      showToast(parseResult.error.issues[0]?.message || 'Please fill in all required fields');
      return;
    }

    if (isEditing && course?._id) {
      updateCourseMutation.mutate(
        { id: course._id, input: parseResult.data },
        {
          onSuccess: (updated) => {
            showToast('Course updated successfully!');
            onSuccess?.(updated);
          },
          onError: (err) => {
            showToast(err instanceof Error ? err.message : 'Failed to update course');
          },
        }
      );
    } else {
      createCourseMutation.mutate(parseResult.data, {
        onSuccess: (newCourse) => {
          showToast('Course module published successfully!');
          onSuccess?.(newCourse);
        },
        onError: (err) => {
          showToast(err instanceof Error ? err.message : 'Failed to publish course');
        },
      });
    }
  };

  return (
    <div className="course-studio-container" style={{ margin: '0 auto' }}>
      {/* Top Action Header */}
      <div className="studio-title-row">
        <div className="studio-title-group">
          <h1>{isEditing ? 'Edit Course Content' : 'Create Course Content'}</h1>
          <p>
            {isEditing
              ? 'Update the course syllabus and details below.'
              : 'Fill in the details below to publish your course content.'}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form className="course-studio-card" onSubmit={handleSubmit} noValidate>
        {/* Title */}
        <div className="form-field-group">
          <label htmlFor="lessonTitle-embedded" className="form-field-label">
            <span>Title</span>
            <span className="label-required-asterisk" title="Required">*</span>
          </label>
          <input
            id="lessonTitle-embedded"
            type="text"
            className="studio-input"
            placeholder="Enter lesson title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Category */}
        <div className="form-field-group">
          <label htmlFor="courseCategory-embedded" className="form-field-label">
            <span>Category</span>
            <span className="label-required-asterisk" title="Required">*</span>
          </label>
          <input
            id="courseCategory-embedded"
            type="text"
            className="studio-input"
            placeholder="Enter course category (e.g. Engineering, Design, Business)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div className="form-field-group">
          <label htmlFor="lessonDesc-embedded" className="form-field-label">
            <span>Description</span>
            <span className="label-required-asterisk" title="Required">*</span>
          </label>
          <textarea
            id="lessonDesc-embedded"
            className="studio-textarea-desc"
            rows={3}
            placeholder="Provide a brief overview of this course..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Content */}
        <div className="form-field-group">
          <label htmlFor="lessonContent-embedded" className="form-field-label">
            <span>Content</span>
            <span className="label-required-asterisk" title="Required">*</span>
          </label>
          <textarea
            id="lessonContent-embedded"
            className="studio-textarea-content"
            rows={10}
            placeholder="Enter course content..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        {/* Footer Actions */}
        <div className="form-card-footer">
          {onCancel && (
            <button
              type="button"
              className="btn-form-cancel"
              onClick={onCancel}
              disabled={isPending}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn-form-submit"
            disabled={isPending}
          >
            {isPending
              ? isEditing
                ? 'Updating...'
                : 'Publishing...'
              : isEditing
              ? 'Save Changes'
              : 'Publish Course'}
          </button>
        </div>
      </form>

      {/* Floating Toast */}
      {toastMessage && (
        <div className="studio-floating-toast" role="status">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '20px', color: '#6bd8cb' }}
          >
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export const CourseForm = AddCourseForm;
export const CreateCourseForm = AddCourseForm;
export default AddCourseForm;
