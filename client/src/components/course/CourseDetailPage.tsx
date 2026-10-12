import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCourse, useDeleteCourse } from '../../hooks/useCourses.js';
import { useCurrentUser } from '../../hooks/useAuth.js';
import { useCheckEnrollment, useEnrollCourse } from '../../hooks/useEnrollment.js';
import { AddCourseForm } from '../AddCourseForm.js';
import { CourseStudentsSection } from './CourseStudentsSection.js';
import { Footer } from '../landing/Footer.js';
import type { Course } from '../../types/course.js';
import './CourseDetailPage.css';

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { data: user } = useCurrentUser();
  const { data: course, isLoading, isError, error } = useCourse(id);

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const deleteMutation = useDeleteCourse();
  const isStudent = user?.role === 'student';
  const isInstructor = user?.role === 'instructor';

  const userId = user?.id || (user as any)?._id;
  const courseInstructorId =
    typeof course?.instructor === 'object' && course?.instructor !== null
      ? course.instructor._id || (course.instructor as any).id
      : typeof course?.instructor === 'string'
      ? course.instructor
      : undefined;

  const isOwner = Boolean(
    isInstructor &&
    user &&
    course &&
    userId &&
    courseInstructorId &&
    String(userId) === String(courseInstructorId)
  );

  useEffect(() => {
    if (searchParams.get('edit') === 'true' && isOwner) {
      setIsEditing(true);
    }
  }, [searchParams, isOwner]);

  const {
    data: enrollmentCheck,
    isLoading: isCheckingEnrollment,
  } = useCheckEnrollment(id, isStudent);

  const isEnrolled = Boolean(enrollmentCheck?.isEnrolled);
  const existingEnrollment = enrollmentCheck?.enrollment;

  const enrollMutation = useEnrollCourse();
  const [enrollSuccessMessage, setEnrollSuccessMessage] = useState<string | null>(null);

  const getInstructorName = (instructor: Course['instructor']) => {
    if (typeof instructor === 'object' && instructor !== null) {
      return instructor.username || 'Instructor';
    }
    return typeof instructor === 'string' && instructor.trim() ? instructor : 'Instructor';
  };

  const handleEnroll = () => {
    if (!id) return;
    setEnrollSuccessMessage(null);

    enrollMutation.mutate(id, {
      onSuccess: () => {
        setEnrollSuccessMessage('You have successfully enrolled in this course!');
      },
    });
  };

  const handleDeleteCourse = () => {
    if (!id) return;
    setActionError(null);

    deleteMutation.mutate(id, {
      onSuccess: () => {
        navigate(isInstructor ? '/dashboard' : '/courses');
      },
      onError: (err: any) => {
        const msg =
          err?.message?.includes('403') || err?.message?.toLowerCase().includes('permission')
            ? 'Only the instructor who created this course can delete it.'
            : err?.message || 'Failed to delete course';
        setActionError(msg);
        setShowDeleteConfirm(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="course-detail-page-wrapper">
        <div className="course-detail-loading-box">
          <span className="material-symbols-outlined loading-spinner-icon">
            progress_activity
          </span>
          <p>Loading course content...</p>
        </div>
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="course-detail-page-wrapper">
        <div className="course-detail-notfound-box">
          <span className="material-symbols-outlined notfound-icon">
            error_outline
          </span>
          <h2>Course Not Found</h2>
          <p>
            {error instanceof Error
              ? error.message
              : 'The requested course does not exist or may have been removed.'}
          </p>
          <Link
            to={isInstructor ? '/dashboard' : '/courses'}
            className="btn-back-to-courses"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              arrow_back
            </span>
            <span>{isInstructor ? 'Back to Dashboard' : 'Back to Courses'}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="course-detail-page-wrapper">
      <main className="course-detail-main">
        <div className="course-detail-container">
          {isEditing ? (
            <div className="course-detail-edit-wrapper">
              <nav className="course-detail-breadcrumb" aria-label="Breadcrumb">
                <button
                  type="button"
                  className="breadcrumb-back-button"
                  onClick={() => setIsEditing(false)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    arrow_back
                  </span>
                  <span>Back to Course View</span>
                </button>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-current-title">Editing: {course.title}</span>
              </nav>

              <AddCourseForm
                course={course}
                onSuccess={() => {
                  setIsEditing(false);
                }}
                onCancel={() => {
                  setIsEditing(false);
                }}
              />
            </div>
          ) : (
            <>
              {/* Breadcrumb Navigation */}
              <nav className="course-detail-breadcrumb" aria-label="Breadcrumb">
                <Link
                  to={isInstructor ? '/dashboard' : '/courses'}
                  className="breadcrumb-nav-link"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    arrow_back
                  </span>
                  <span>{isInstructor ? 'Instructor Dashboard' : 'All Courses'}</span>
                </Link>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-current-title">{course.title}</span>
              </nav>

              {/* Hero Header */}
              <header className="course-detail-header-card">
                <div className="course-header-meta-row">
                  <span className="course-detail-category-tag">
                    {course.category || 'General'}
                  </span>
                  {course.createdAt && (
                    <span className="course-detail-date">
                      <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                        calendar_today
                      </span>
                      <span>
                        {new Date(course.createdAt).toLocaleDateString(undefined, {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </span>
                  )}
                </div>

                <h1 className="course-detail-title">{course.title}</h1>

                <div className="course-detail-instructor-row">
                  <div className="instructor-mini-avatar">
                    {getInstructorName(course.instructor).charAt(0).toUpperCase()}
                  </div>
                  <div className="instructor-meta-text">
                    <span className="instructor-label">Instructor</span>
                    <span className="instructor-full-name">
                      {getInstructorName(course.instructor)}
                    </span>
                  </div>
                </div>

                <p className="course-detail-description">{course.description}</p>

                {/* Edit & Delete Action Buttons */}
                <div className="course-detail-actions-bar">
                  <button
                    type="button"
                    className="btn-detail-edit"
                    onClick={() => {
                      setActionError(null);
                      setIsEditing(true);
                    }}
                    aria-label="Edit Course"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      edit
                    </span>
                    <span>Edit Course</span>
                  </button>

                  {isOwner && (
                    <a href="#enrolled-students-section" className="btn-detail-students">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        group
                      </span>
                      <span>Enrolled Students</span>
                    </a>
                  )}

                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      className="btn-detail-delete"
                      onClick={() => {
                        setActionError(null);
                        setShowDeleteConfirm(true);
                      }}
                      aria-label="Delete Course"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        delete
                      </span>
                      <span>Delete Course</span>
                    </button>
                  ) : (
                    <div className="detail-delete-confirm-box">
                      <span className="delete-confirm-label">Confirm delete?</span>
                      <button
                        type="button"
                        className="btn-detail-confirm-delete"
                        onClick={handleDeleteCourse}
                        disabled={deleteMutation.isPending}
                        aria-label="Confirm delete this course"
                      >
                        {deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete'}
                      </button>
                      <button
                        type="button"
                        className="btn-detail-cancel-delete"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={deleteMutation.isPending}
                        aria-label="Cancel deletion"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {actionError && (
                  <div className="detail-action-error-alert" role="alert">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      error
                    </span>
                    <span>{actionError}</span>
                  </div>
                )}
              </header>

          {/* Course Content Body */}
          <section className="course-detail-content-section">
            <div className="content-section-header">
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--secondary)' }}>
                menu_book
              </span>
              <h2>Course Content</h2>
            </div>

            <div className="course-content-body-card">
              {course.content ? (
                <div className="course-content-text">
                  {course.content}
                </div>
              ) : (
                <p className="course-no-content-notice">
                  No written modules published for this course yet.
                </p>
              )}
            </div>
          </section>

              {/* Enrolled Students Roster (Course Instructor Owner Only) */}
              {isOwner && (
                <div id="enrolled-students-section">
                  <CourseStudentsSection courseId={course._id} courseTitle={course.title} />
                </div>
              )}

              {/* Enrollment Action Box (At the end of content for students & visitors) */}
              {!isInstructor && (
                <section className="course-enrollment-action-section">
                  <div className="enrollment-action-card">
                    <div className="enrollment-action-info">
                      <div className="enrollment-badge-icon-wrap">
                        <span className="material-symbols-outlined">
                          {isEnrolled ? 'check_circle' : 'school'}
                        </span>
                      </div>
                      <div>
                        <h3 className="enrollment-action-title">
                          {isEnrolled
                            ? 'You are enrolled in this course'
                            : 'Enrollment'}
                        </h3>
                        <p className="enrollment-action-subtitle">
                          {isEnrolled
                            ? existingEnrollment?.enrollmentDate
                              ? `Active student status since ${new Date(existingEnrollment.enrollmentDate).toLocaleDateString()}`
                              : 'You have full access to study this course material.'
                            : 'Enroll now to add this course to your curriculum track.'}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons & Status */}
                    <div className="enrollment-action-controls">
                      {enrollSuccessMessage && (
                        <div className="enroll-alert-banner success">
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            verified
                          </span>
                          <span>{enrollSuccessMessage}</span>
                        </div>
                      )}

                      {enrollMutation.isError && (
                        <div className="enroll-alert-banner error">
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            warning
                          </span>
                          <span>
                            {enrollMutation.error instanceof Error
                              ? enrollMutation.error.message
                              : 'Failed to enroll in course'}
                          </span>
                        </div>
                      )}

                      {!user ? (
                        <div className="enroll-auth-prompt">
                          <button
                            type="button"
                            className="btn-enroll-action primary"
                            onClick={() => navigate('/login')}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                              login
                            </span>
                            <span>Sign In to Enroll</span>
                          </button>
                          <span className="enroll-auth-hint">
                            Requires a free student account.
                          </span>
                        </div>
                      ) : isEnrolled ? (
                        <div className="enrolled-status-group">
                          <span className="enrolled-check-badge">
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                              check
                            </span>
                            <span>Enrolled</span>
                          </span>
                          <button
                            type="button"
                            className="btn-enroll-action secondary"
                            onClick={() => navigate('/dashboard')}
                          >
                            Go to Dashboard
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn-enroll-action primary"
                          onClick={handleEnroll}
                          disabled={enrollMutation.isPending || isCheckingEnrollment}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                            how_to_reg
                          </span>
                          <span>
                            {enrollMutation.isPending ? 'Enrolling...' : 'Enroll in Course'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
    </div>
  </main>

  <Footer />
</div>
  );
}

export default CourseDetailPage;
