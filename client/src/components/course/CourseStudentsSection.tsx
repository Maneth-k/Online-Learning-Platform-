import { useState } from 'react';
import { useCourseStudents, useUpdateEnrollmentStatus } from '../../hooks/useEnrollment.js';
import type { CourseEnrollmentItem, EnrollmentStatus } from '../../types/enrollment.js';
import './CourseStudentsSection.css';

export interface CourseStudentsSectionProps {
  courseId: string;
  courseTitle?: string;
}

export function CourseStudentsSection({ courseId, courseTitle }: CourseStudentsSectionProps) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'enrolled' | 'completed' | 'dropped'>('all');
  const [statusUpdateMessage, setStatusUpdateMessage] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useCourseStudents(courseId, {
    page,
    limit: 10,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const updateStatusMutation = useUpdateEnrollmentStatus();

  const enrollments = data?.enrollments || [];
  const pagination = data?.pagination;
  const totalEnrollments = pagination?.totalEnrollments ?? enrollments.length;

  const getStudentName = (student: CourseEnrollmentItem['student']) => {
    if (typeof student === 'object' && student !== null) {
      return student.username || 'Student';
    }
    return typeof student === 'string' && student.trim() ? student : 'Student';
  };

  const handleStatusChange = (enrollmentId: string, newStatus: EnrollmentStatus) => {
    setStatusUpdateMessage(null);
    updateStatusMutation.mutate(
      { enrollmentId, status: newStatus },
      {
        onSuccess: () => {
          setStatusUpdateMessage('Enrollment status updated successfully.');
          setTimeout(() => setStatusUpdateMessage(null), 3000);
        },
        onError: (err: any) => {
          setStatusUpdateMessage(err?.message || 'Failed to update status');
          setTimeout(() => setStatusUpdateMessage(null), 4000);
        },
      }
    );
  };

  return (
    <section className="course-students-section" aria-labelledby="enrolled-students-heading">
      <div className="course-students-header">
        <div className="students-header-left">
          <div className="students-title-icon-wrap">
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
              group
            </span>
          </div>
          <div>
            <h2 id="enrolled-students-heading" className="students-section-title">
              Enrolled Students
            </h2>
            <p className="students-section-subtitle">
              {courseTitle ? `Students actively enrolled in ${courseTitle}` : 'Students currently enrolled in this program'}
            </p>
          </div>
        </div>

        <div className="students-count-badge">
          <span className="count-number">{totalEnrollments}</span>
          <span className="count-label">{totalEnrollments === 1 ? 'Student' : 'Students'}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="students-filter-toolbar">
        <div className="filter-pills-group" role="tablist">
          {(['all', 'enrolled', 'completed', 'dropped'] as const).map((filterKey) => (
            <button
              key={filterKey}
              type="button"
              role="tab"
              aria-selected={statusFilter === filterKey}
              className={`filter-pill-btn ${statusFilter === filterKey ? 'active' : ''}`}
              onClick={() => {
                setStatusFilter(filterKey);
                setPage(1);
              }}
            >
              {filterKey === 'all' && 'All Students'}
              {filterKey === 'enrolled' && 'Active'}
              {filterKey === 'completed' && 'Completed'}
              {filterKey === 'dropped' && 'Dropped'}
            </button>
          ))}
        </div>
      </div>

      {statusUpdateMessage && (
        <div className="students-status-toast" role="status">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            info
          </span>
          <span>{statusUpdateMessage}</span>
        </div>
      )}

      {/* Content States */}
      {isLoading ? (
        <div className="students-state-box loading">
          <span className="material-symbols-outlined spinner-icon">
            progress_activity
          </span>
          <p>Loading enrolled students...</p>
        </div>
      ) : isError ? (
        <div className="students-state-box error">
          <span className="material-symbols-outlined error-icon">
            error_outline
          </span>
          <p>
            {error instanceof Error && error.message.includes('Forbidden')
              ? 'Enrollment records are only accessible to the course instructor.'
              : error instanceof Error ? error.message : 'Unable to load enrollments'}
          </p>
        </div>
      ) : enrollments.length === 0 ? (
        <div className="students-state-box empty">
          <div className="empty-avatar-circle">
            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
              person_search
            </span>
          </div>
          <h3>No students found</h3>
          <p>
            {statusFilter === 'all'
              ? 'No students have enrolled in this course offering yet.'
              : `No students with status "${statusFilter}".`}
          </p>
        </div>
      ) : (
        <div className="students-table-container">
          <table className="students-roster-table">
            <thead>
              <tr>
                <th scope="col">Student</th>
                <th scope="col">Enrolled Date</th>
                <th scope="col">Status</th>
                <th scope="col" style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((item) => {
                const studentName = getStudentName(item.student);
                const initial = studentName.charAt(0).toUpperCase();

                return (
                  <tr key={item._id} className="student-roster-row">
                    {/* Student Identity */}
                    <td>
                      <div className="scholar-identity-cell">
                        <div className="scholar-avatar-circle" aria-hidden="true">
                          {initial}
                        </div>
                        <div className="scholar-info">
                          <span className="scholar-username">{studentName}</span>
                          <span className="scholar-role-tag">Student</span>
                        </div>
                      </div>
                    </td>

                    {/* Enrollment Date */}
                    <td>
                      <div className="scholar-date-cell">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#64748b' }}>
                          calendar_today
                        </span>
                        <span>
                          {item.enrollmentDate
                            ? new Date(item.enrollmentDate).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'N/A'}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td>
                      <span className={`roster-status-badge ${item.status}`}>
                        <span className="status-dot" aria-hidden="true" />
                        <span style={{ textTransform: 'capitalize' }}>{item.status}</span>
                      </span>
                    </td>

                    {/* Action Selector */}
                    <td style={{ textAlign: 'right' }}>
                      <div className="roster-action-wrap">
                        <select
                          className="roster-status-select"
                          value={item.status}
                          aria-label={`Update status for ${studentName}`}
                          disabled={updateStatusMutation.isPending}
                          onChange={(e) =>
                            handleStatusChange(item._id, e.target.value as EnrollmentStatus)
                          }
                        >
                          <option value="enrolled">Active (Enrolled)</option>
                          <option value="completed">Completed</option>
                          <option value="dropped">Dropped</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="students-pagination-bar">
              <span className="pagination-info">
                Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong>
              </span>
              <div className="pagination-buttons-group">
                <button
                  type="button"
                  className="btn-pagination"
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    chevron_left
                  </span>
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  className="btn-pagination"
                  disabled={!pagination.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Next page"
                >
                  <span>Next</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default CourseStudentsSection;
