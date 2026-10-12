import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useCurrentUser, useLogout } from '../../hooks/useAuth.js';
import { useCourses, useDeleteCourse } from '../../hooks/useCourses.js';
import { useMyEnrollments } from '../../hooks/useEnrollment.js';
import { CourseCardMenu } from '../course/CourseCardMenu.js';
import { ConfirmDeleteModal } from '../course/ConfirmDeleteModal.js';
import { CourseStudentsModal } from '../course/CourseStudentsModal.js';
import type { Course } from '../../types/course.js';
import './DashboardPage.css';

export function DashboardPage() {
  const { data: user, isLoading: isAuthLoading } = useCurrentUser();
  const logoutMutation = useLogout();
  const { data: allCourses = [], isLoading: isCoursesLoading } = useCourses();
  const deleteMutation = useDeleteCourse();
  const navigate = useNavigate();

  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState<Course | null>(null);

  const isStudent = user?.role === 'student';
  const { data: myEnrollments = [], isLoading: isEnrollmentsLoading } = useMyEnrollments(Boolean(isStudent));

  const handleDeleteCourse = (courseId: string) => {
    setDeleteError(null);
    deleteMutation.mutate(courseId, {
      onSuccess: () => {
        setCourseToDelete(null);
      },
      onError: (err: any) => {
        setDeleteError(err?.message || 'Failed to delete course');
        setCourseToDelete(null);
      },
    });
  };

  if (isAuthLoading) {
    return (
      <div className="dashboard-loading-container">
        <span className="material-symbols-outlined dashboard-spinner">
          progress_activity
        </span>
        <p>Loading Mentora session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userId = user.id || (user as any)._id;
  const instructorCourses = (allCourses || []).filter((c) => {
    if (typeof c.instructor === 'object' && c.instructor !== null) {
      const instId = c.instructor._id || (c.instructor as any).id;
      return Boolean(userId && instId && String(instId) === String(userId));
    }
    return typeof c.instructor === 'string' && Boolean(userId && String(c.instructor) === String(userId));
  });

  return (
    <div className="dashboard-page-root">
      <main className="dashboard-container">
        <div className="dashboard-header-row">
          <div>
            <h1 className="dashboard-welcome-title">
              Welcome, {user.email || user.username}!
            </h1>
            <p className="dashboard-role-badge">
              Role: <strong className="role-highlight">{user.role}</strong>
            </p>
          </div>
          <button
            type="button"
            className="dashboard-signout-btn"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>

        {user.role === 'instructor' && (
          <section className="dashboard-instructor-section">
            <div className="instructor-section-toolbar">
              <div>
                <h2 className="instructor-section-title">
                  <span>Your Courses</span>
                  <span className="instructor-course-pill">
                    {instructorCourses.length}
                  </span>
                </h2>
                <p className="instructor-section-subtitle">
                  Manage curriculum and course offerings authored by you.
                </p>
              </div>

              <Link to="/create-course" className="btn-create-course-link">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  add_circle
                </span>
                <span>Create a Course</span>
              </Link>
            </div>

            {isCoursesLoading ? (
              <div className="dashboard-loading-box">
                <p>Loading your courses...</p>
              </div>
            ) : instructorCourses.length === 0 ? (
              <div className="dashboard-empty-courses-card">
                <div className="empty-courses-icon-circle">
                  <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                    auto_stories
                  </span>
                </div>
                <h3 className="empty-courses-title">No courses created yet</h3>
                <p className="empty-courses-text">
                  Share your knowledge with students worldwide. Create your first course to get started.
                </p>
                <Link to="/create-course" className="btn-create-course-link">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    add
                  </span>
                  <span>Create a Course</span>
                </Link>
              </div>
            ) : (
              <>
                {deleteError && (
                  <div className="dash-error-banner" role="alert">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      error
                    </span>
                    <span>{deleteError}</span>
                  </div>
                )}

                <div className="dashboard-courses-grid">
                  {instructorCourses.map((course) => (
                    <article key={course._id} className="dashboard-course-card">
                      <div>
                        <div className="dashboard-course-top">
                          <div className="dashboard-course-badges">
                            <span className="dashboard-course-cat">
                              {course.category || 'General'}
                            </span>
                            <span className="dashboard-course-status">
                              Active
                            </span>
                          </div>

                          <CourseCardMenu
                            courseId={course._id}
                            courseTitle={course.title}
                            onViewStudents={() => setSelectedCourseForStudents(course)}
                            editUrl={`/courses/${course._id}?edit=true`}
                            onDelete={() => setCourseToDelete(course)}
                          />
                        </div>

                        <h3 className="dashboard-course-title">
                          {course.title}
                        </h3>

                        <p className="dashboard-course-desc">
                          {course.description}
                        </p>
                      </div>

                      <div className="dashboard-course-footer">
                        <span className="course-footer-date">
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                            calendar_today
                          </span>
                          <span>
                            {course.createdAt
                              ? new Date(course.createdAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'Recent'}
                          </span>
                        </span>

                        <Link
                          to={`/courses/${course._id}`}
                          className="btn-card-view-link"
                        >
                          <span>View Syllabus</span>
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                            arrow_forward
                          </span>
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {user.role === 'student' && (
          <section className="dashboard-student-section">
            <div className="instructor-section-toolbar" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h2 className="instructor-section-title">
                  <span>Enrolled Courses</span>
                  <span className="instructor-course-pill">
                    {myEnrollments.length}
                  </span>
                </h2>
                <p className="instructor-section-subtitle">
                  Continue your curriculum and study active course content.
                </p>
              </div>

              <button
                type="button"
                className="btn-create-course-link"
                onClick={() => navigate('/courses')}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  school
                </span>
                <span>Explore Catalog</span>
              </button>
            </div>

            {isEnrollmentsLoading ? (
              <div className="dashboard-loading-box">
                <p>Loading your enrolled courses...</p>
              </div>
            ) : myEnrollments.length === 0 ? (
              <div className="dashboard-empty-courses-card">
                <div className="empty-courses-icon-circle">
                  <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                    menu_book
                  </span>
                </div>
                <h3 className="empty-courses-title">No courses enrolled yet</h3>
                <p className="empty-courses-text">
                  You are not currently enrolled in any courses. Browse the course directory to find curriculum and enroll.
                </p>
                <button
                  type="button"
                  className="btn-create-course-link"
                  onClick={() => navigate('/courses')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    explore
                  </span>
                  <span>Browse Courses</span>
                </button>
              </div>
            ) : (
              <div className="dashboard-courses-grid">
                {myEnrollments.map((enrollment) => {
                  const courseData = typeof enrollment.course === 'object' && enrollment.course !== null
                    ? enrollment.course
                    : null;
                  const courseId = courseData?._id || (typeof enrollment.course === 'string' ? enrollment.course : '');
                  const courseTitle = courseData?.title || 'Course';
                  const courseCategory = courseData?.category || 'General';
                  const courseDesc = courseData?.description || '';

                  return (
                    <article key={enrollment._id} className="dashboard-course-card">
                      <div>
                        <div className="dashboard-course-top">
                          <span className="dashboard-course-cat">
                            {courseCategory}
                          </span>
                          <span className="dashboard-course-status">
                            Enrolled
                          </span>
                        </div>

                        <h3 className="dashboard-course-title">
                          {courseTitle}
                        </h3>

                        {courseDesc && (
                          <p className="dashboard-course-desc">
                            {courseDesc}
                          </p>
                        )}
                      </div>

                      <div className="dashboard-course-footer">
                        <span className="course-footer-date">
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                            event_available
                          </span>
                          <span>
                            {enrollment.enrollmentDate
                              ? new Date(enrollment.enrollmentDate).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'Active'}
                          </span>
                        </span>

                        <Link
                          to={`/courses/${courseId}`}
                          className="btn-card-view-link"
                        >
                          <span>Open Content</span>
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                            arrow_forward
                          </span>
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>

      {selectedCourseForStudents && (
        <CourseStudentsModal
          course={selectedCourseForStudents}
          onClose={() => setSelectedCourseForStudents(null)}
        />
      )}

      {courseToDelete && (
        <ConfirmDeleteModal
          isOpen={Boolean(courseToDelete)}
          courseTitle={courseToDelete.title}
          isDeleting={deleteMutation.isPending}
          onConfirm={() => handleDeleteCourse(courseToDelete._id)}
          onCancel={() => setCourseToDelete(null)}
        />
      )}
    </div>
  );
}

export default DashboardPage;
