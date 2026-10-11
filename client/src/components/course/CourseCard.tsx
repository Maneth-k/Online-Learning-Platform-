import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useAuth.js';
import { useEnrollCourse, useCheckEnrollment } from '../../hooks/useEnrollment.js';
import type { Course } from '../../types/course.js';
import './CourseCard.css';

interface CourseCardProps {
  course: Course;
  reasoningSlot?: React.ReactNode;
  rankBadge?: string;
  showEnroll?: boolean;
  onEnrollSuccess?: (courseTitle: string) => void;
  onEnrollError?: (message: string) => void;
}

export function CourseCard({
  course,
  reasoningSlot,
  rankBadge,
  showEnroll = true,
  onEnrollSuccess,
  onEnrollError,
}: CourseCardProps) {
  const { data: user } = useCurrentUser();
  const navigate = useNavigate();
  const enrollMutation = useEnrollCourse();
  const [localEnrolled, setLocalEnrolled] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isStudent = user?.role === 'student';
  const { data: enrollmentStatus } = useCheckEnrollment(course._id, Boolean(isStudent));

  const isEnrolled = localEnrolled || Boolean(enrollmentStatus?.isEnrolled);

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

  return (
    <div className="mentora-course-card">
      <div className="card-top-row">
        <span className="course-card-category-badge">{course.category || 'General'}</span>
        {rankBadge && <span className="course-card-rank-badge">{rankBadge}</span>}
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

        {showEnroll && (
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
    </div>
  );
}

export default CourseCard;
