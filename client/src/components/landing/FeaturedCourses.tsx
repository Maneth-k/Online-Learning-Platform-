import { Link } from 'react-router-dom';
import { useCourses } from '../../hooks/useCourses.js';
import type { Course } from '../../types/course.js';
import './FeaturedCourses.css';

interface FeaturedCoursesProps {
  onEnroll?: (course: Course) => void;
}

export function FeaturedCourses({ onEnroll }: FeaturedCoursesProps) {
  // Fetch latest 4 courses from the database
  const { data: courses, isLoading } = useCourses({ limit: 4 });

  const getInstructorName = (instructor: Course['instructor']) => {
    if (typeof instructor === 'object' && instructor !== null) {
      return instructor.username || 'Instructor';
    }
    return typeof instructor === 'string' && instructor.trim() ? instructor : 'Instructor';
  };

  return (
    <section className="featured-courses-section" id="featured-courses">
      <div className="courses-header-row">
        <div>
          <div className="courses-subtag">
            <span>Verified Tracks</span>
          </div>
          <h2 className="courses-title">Featured Courses</h2>
          <p className="courses-description">
            Explore the latest curriculum paths authored by industry practitioners.
          </p>
        </div>
        <div>
          <Link to="/courses" className="courses-explore-link">
            <span>Explore All Courses</span>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              arrow_forward
            </span>
          </Link>
        </div>
      </div>

      {isLoading && (
        <div className="courses-cards-grid">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="course-card skeleton-card">
              <div className="skeleton-bar" style={{ width: '40%', height: '18px', marginBottom: '1.25rem' }} />
              <div className="skeleton-bar" style={{ width: '85%', height: '22px', marginBottom: '0.6rem' }} />
              <div className="skeleton-bar" style={{ width: '60%', height: '22px', marginBottom: '1rem' }} />
              <div className="skeleton-bar" style={{ width: '100%', height: '14px', marginBottom: '0.4rem' }} />
              <div className="skeleton-bar" style={{ width: '80%', height: '14px', marginBottom: '1.5rem' }} />
              <div className="skeleton-bar" style={{ width: '45%', height: '24px', marginTop: 'auto' }} />
            </div>
          ))}
        </div>
      )}

      {!isLoading && courses && courses.length > 0 && (
        <div className="courses-cards-grid">
          {courses.slice(0, 4).map((course) => (
            <div key={course._id} className="course-card">
              <div className="course-card-top">
                <span className="course-category-badge">{course.category || 'General'}</span>
                <span className="course-instructor">
                  <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                    person
                  </span>
                  <span>By {getInstructorName(course.instructor)}</span>
                </span>
              </div>

              <h3 className="course-card-title">
                <Link to={`/courses/${course._id}`}>{course.title}</Link>
              </h3>

              <p className="course-card-desc">{course.description}</p>

              <div className="course-card-footer">
                <Link to={`/courses/${course._id}`} className="btn-course-details">
                  <span>View Syllabus</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    arrow_forward
                  </span>
                </Link>

                {onEnroll && (
                  <button
                    type="button"
                    className="btn-course-enroll"
                    onClick={() => onEnroll(course)}
                  >
                    <span>Enroll</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && (!courses || courses.length === 0) && (
        <div className="courses-empty-state">
          <span className="material-symbols-outlined empty-icon">school</span>
          <p>No courses published yet.</p>
          <Link to="/courses" className="courses-explore-link">
            <span>Browse Catalog</span>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              arrow_forward
            </span>
          </Link>
        </div>
      )}
    </section>
  );
}

