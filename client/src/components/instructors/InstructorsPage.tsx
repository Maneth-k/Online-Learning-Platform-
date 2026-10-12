import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useInstructors } from '../../hooks/useInstructors.js';
import type { Instructor } from '../../types/instructor.js';
import { Footer } from '../landing/Footer.js';
import './InstructorsPage.css';

interface InstructorsPageProps {
  currentUser?: { username: string; role: string } | null;
  onBackToHome?: () => void;
  onOpenDashboard?: () => void;
  onNavigateToAuth?: (mode?: 'login' | 'register') => void;
  onLogout?: () => void;
}

export function InstructorsPage({
  currentUser: _currentUser,
  onBackToHome: _onBackToHome,
  onOpenDashboard: _onOpenDashboard,
  onNavigateToAuth: _onNavigateToAuth,
  onLogout: _onLogout,
}: InstructorsPageProps = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Fetch instructors using TanStack Query
  const { data, isLoading, isError } = useInstructors({
    q: searchQuery,
    category: activeCategory,
  });

  const categories = ['All', 'Engineering', 'Product', 'Data & ML', 'Infrastructure'];
  const instructors = data?.instructors || [];

  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveCategory('All');
  };

  return (
    <div className="instructors-page-root">
      {/* Hero Header */}
      <section className="instructors-hero-section">
        <h1 className="instructors-title">Instructors</h1>
        <p className="instructors-description">
          Browse mentors and the courses they teach across departments.
        </p>

        {/* Search & Filter Toolbar */}
        <div className="instructors-filter-toolbar">
          <div className="toolbar-search-row">
            <div className="search-input-wrapper">
              <span className="material-symbols-outlined search-input-icon">search</span>
              <input
                type="text"
                className="instructor-search-input"
                placeholder="Search instructors by name or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    close
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="toolbar-categories-row">
            <div className="courses-filter-tabs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`filter-tab-btn ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat === 'All' ? 'All Tracks' : cat}
                </button>
              ))}
            </div>

            <div className="results-count-pill">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                groups
              </span>
              <span>
                {isLoading ? 'Loading...' : `${instructors.length} Instructors`}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid View */}
      <main className="instructors-main-container">
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--secondary)' }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '36px', animation: 'spin 1.2s linear infinite' }}
            >
              progress_activity
            </span>
            <p style={{ marginTop: '0.75rem', fontWeight: 600 }}>Loading instructors...</p>
          </div>
        )}

        {isError && (
          <div className="instructors-empty-state">
            <span className="material-symbols-outlined empty-state-icon">error_outline</span>
            <h3 className="empty-state-title">Unable to load instructors</h3>
            <p className="empty-state-text">
              There was an issue retrieving the catalog. Please try refreshing.
            </p>
            <button
              type="button"
              className="btn-reset-filters"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !isError && instructors.length === 0 && (
          <div className="instructors-empty-state">
            <span className="material-symbols-outlined empty-state-icon">person_search</span>
            <h3 className="empty-state-title">No instructors match your criteria</h3>
            <p className="empty-state-text">
              We couldn't find any instructors matching "{searchQuery || activeCategory}". Try
              clearing your filters or selecting a different track.
            </p>
            <button
              type="button"
              className="btn-reset-filters"
              onClick={handleClearFilters}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                filter_alt_off
              </span>
              <span>Reset Filters</span>
            </button>
          </div>
        )}

        {!isLoading && !isError && instructors.length > 0 && (
          <div className="instructors-grid">
            {instructors.map((instructor: Instructor) => (
              <article key={instructor._id} className="instructor-card">
                <div className="instructor-card-header">
                  <h2 className="instructor-name">{instructor.name || instructor.email || instructor.username}</h2>
                  <span className="instructor-course-count">
                    {instructor.courses.length} {instructor.courses.length === 1 ? 'course' : 'courses'}
                  </span>
                </div>

                <div className="instructor-courses-body">
                  <h3 className="instructor-courses-label">Courses:</h3>
                  {instructor.courses.length === 0 ? (
                    <p className="instructor-no-courses">No courses published yet.</p>
                  ) : (
                    <div className="instructor-courses-list">
                      {instructor.courses.map((course) => (
                        <Link
                          key={course._id}
                          to={`/courses/${course._id}`}
                          className="instructor-course-item"
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          <span className="course-item-title">{course.title}</span>
                          {course.category && (
                            <span className="course-item-tag">{course.category}</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer onOpenAuth={_onNavigateToAuth} />
    </div>
  );
}

export default InstructorsPage;
