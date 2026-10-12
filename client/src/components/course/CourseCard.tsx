import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useAuth.js';
import { useEnrollCourse, useCheckEnrollment } from '../../hooks/useEnrollment.js';
import { useDeleteCourse } from '../../hooks/useCourses.js';
import { CourseCardMenu } from './CourseCardMenu.js';
import { ConfirmDeleteModal } from './ConfirmDeleteModal.js';
import { CourseStudentsModal } from './CourseStudentsModal.js';
import type { Course } from '../../types/course.js';
import './CourseCard.css';

interface CourseCardProps {
  course: Course;
  reasoningSlot?: React.ReactNode;
  rankBadge?: string;
  showEnroll?: boolean;
  showDelete?: boolean;
  onEnrollSuccess?: (courseTitle: string) => void;
  onEnrollError?: (message: string) => void;
  onDeleteSuccess?: (courseId: string) => void;
  onDeleteError?: (message: string) => void;
}

export function CourseCard({
  course,
  reasoningSlot,
  rankBadge,
  showEnroll = true,
  showDelete = true,
  onEnrollSuccess,
  onEnrollError,
  onDeleteSuccess,
  onDeleteError,
}: CourseCardProps) {
  const { data: user } = useCurrentUser();
  const navigate = useNavigate();
  const enrollMutation = useEnrollCourse();
  const deleteMutation = useDeleteCourse();

  const [localEnrolled, setLocalEnrolled] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);

  const isStudent = user?.role === 'student';
  const isInstructor = user?.role === 'instructor';
  const { data: enrollmentStatus } = useCheckEnrollment(course._id, Boolean(isStudent));

  const isEnrolled = localEnrolled || Boolean(enrollmentStatus?.isEnrolled);

  const userId = user?.id || (user as any)?._id;
  const courseInstructorId =
    typeof course.instructor === 'object' && course.instructor !== null
      ? (course.instructor as any)._id || (course.instructor as any).id
      : typeof course.instructor === 'string'
      ? course.instructor
      : undefined;

  const isOwner = Boolean(
    isInstructor &&
    user &&
    userId &&
    courseInstructorId &&
    String(userId) === String(courseInstructorId)
  );

  const getInstructorName = (instructor: Course['instructor']) => {
    if (typeof instructor === 'object' && instructor !== null) {
      return instructor.username || 'Instructor';
    }
    return typeof instructor === 'string' && instructor.trim() ? instructor : 'Instructor';
  };

  const handleEnrollClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setErrorMessage(null);

    if (!user) {
      navigate('/login?returnUrl=/recommendations');
      return;
    }

    if (!isStudent) {
      setErrorMessage('Enrollment is only available for students.');
      onEnrollError?.('Enrollment is only available for students.');
      return;
    }

    if (isEnrolled || enrollMutation.isPending) return;

    enrollMutation.mutate(course._id, {
      onSuccess: () => {
        setLocalEnrolled(true);
        onEnrollSuccess?.(course.title);
      },
      onError: (err: any) => {
        const msg = err?.message?.includes('404') || err?.message?.toLowerCase().includes('not found')
          ? 'This course was recently removed from the catalog.'
          : err?.message || 'Failed to enroll in course.';
        setErrorMessage(msg);
        onEnrollError?.(msg);
      },
    });
  };

  const handleDeleteCourse = () => {
    setErrorMessage(null);

    deleteMutation.mutate(course._id, {
      onSuccess: () => {
        setShowDeleteModal(false);
        onDeleteSuccess?.(course._id);
      },
      onError: (err: any) => {
        const msg =
          err?.message?.includes('403') || err?.message?.toLowerCase().includes('permission')
            ? 'Only the instructor who created this course can delete it.'
            : err?.message || 'Failed to delete course.';
        setErrorMessage(msg);
        setShowDeleteModal(false);
        onDeleteError?.(msg);
      },
    });
  };

  return (
    <div className="mentora-course-card">
      <div className="card-top-row">
        <div className="card-top-badges">
          <span className="course-card-category-badge">{course.category || 'General'}</span>
          {rankBadge && <span className="course-card-rank-badge">{rankBadge}</span>}
        </div>

        {isOwner && showDelete && (
          <CourseCardMenu
            courseId={course._id}
            courseTitle={course.title}
            onViewStudents={() => setShowStudentsModal(true)}
            editUrl={`/courses/${course._id}?edit=true`}
            onDelete={() => setShowDeleteModal(true)}
          />
        )}
      </div>

      <h3 className="course-card-title">
        <Link to={`/courses/${course._id}`}>{course.title}</Link>
      </h3>

      <div className="course-card-instructor">
        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
          person
        </span>
        <span>By {getInstructorName(course.instructor)}</span>
      </div>

      {/* Reasoning Slot - Rendered only when provided */}
      {reasoningSlot}

      <p className="course-card-description">{course.description}</p>

      {errorMessage && <div className="course-card-error-hint">{errorMessage}</div>}

      <div className="course-card-actions">
        <Link to={`/courses/${course._id}`} className="btn-view-details">
          <span>View Syllabus</span>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            arrow_forward
          </span>
        </Link>

        {showEnroll && !isOwner && !isInstructor && (
          <button
            type="button"
            className={`btn-card-enroll ${isEnrolled ? 'enrolled' : ''}`}
            onClick={handleEnrollClick}
            disabled={isEnrolled || enrollMutation.isPending}
          >
            {enrollMutation.isPending ? (
              <>
                <span className="card-btn-spinner" aria-hidden="true" />
                <span>Enrolling...</span>
              </>
            ) : isEnrolled ? (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  check_circle
                </span>
                <span>Enrolled</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  school
                </span>
                <span>Enroll Free</span>
              </>
            )}
          </button>
        )}
      </div>

      {showDeleteModal && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          courseTitle={course.title}
          isDeleting={deleteMutation.isPending}
          onConfirm={handleDeleteCourse}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {showStudentsModal && (
        <CourseStudentsModal
          course={course}
          onClose={() => setShowStudentsModal(false)}
        />
      )}
    </div>
  );
}

export default CourseCard;
