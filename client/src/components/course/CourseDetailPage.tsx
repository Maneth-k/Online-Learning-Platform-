import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCourse } from '../../hooks/useCourses.js';
import { useCurrentUser } from '../../hooks/useAuth.js';
import { useCheckEnrollment, useEnrollCourse } from '../../hooks/useEnrollment.js';
import { Footer } from '../landing/Footer.js';
import type { Course } from '../../types/course.js';
import './CourseDetailPage.css';

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user } = useCurrentUser();
  const { data: course, isLoading, isError, error } = useCourse(id);

  const isStudent = user?.role === 'student';
  const isInstructor = user?.role === 'instructor';

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
          <Link to="/courses" className="btn-back-to-courses">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              arrow_back
            </span>
            <span>Back to Courses</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="course-detail-page-wrapper">
      <main className="course-detail-main">
        <div className="course-detail-container">
          {/* Breadcrumb Navigation */}
          <nav className="course-detail-breadcrumb" aria-label="Breadcrumb">
            <Link to="/courses" className="breadcrumb-nav-link">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                arrow_back
              </span>
              <span>All Courses</span>
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

          {/* Enrollment Action Box (At the end of content) */}
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
                        ? `Active scholar status since ${new Date(existingEnrollment.enrollmentDate).toLocaleDateString()}`
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
                ) : isInstructor ? (
                  <div className="enroll-instructor-notice">
                    <span className="instructor-notice-pill">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                        info
                      </span>
                      <span>Instructors cannot enroll in courses</span>
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
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default CourseDetailPage;
