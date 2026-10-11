import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCourses } from '../../hooks/useCourses.js';
import { CourseCard } from './CourseCard.js';
import { Footer } from '../landing/Footer.js';
import './CoursesPage.css';

interface CoursesPageProps {
  currentUser?: { username: string; role: string } | null;
  onBackToHome?: () => void;
  onOpenDashboard?: () => void;
  onNavigateToAuth?: (mode?: 'login' | 'register') => void;
  onOpenInstructors?: () => void;
  onLogout?: () => void;
}

export function CoursesPage({
  currentUser: _currentUser,
  onBackToHome: _onBackToHome,
  onOpenDashboard: _onOpenDashboard,
  onNavigateToAuth: _onNavigateToAuth,
  onOpenInstructors: _onOpenInstructors,
  onLogout: _onLogout,
}: CoursesPageProps = {}) {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Debounce search query to reduce unnecessary requests while typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Query backend with filters aligned with server GET /api/courses
  const { data: courses = [], isLoading, isError } = useCourses({
    q: searchQuery.trim() || undefined,
    category: selectedCategory !== 'All' ? selectedCategory.trim() : undefined,
    limit: 50,
  });

  // Query unfiltered courses once to derive all available categories
  const { data: allCourses = [] } = useCourses({ limit: 50 });

  const categories = useMemo(() => {
    const set = new Set<string>();
    allCourses.forEach((c) => {
      if (c.category && c.category.trim()) {
        set.add(c.category.trim());
      }
    });
    return Array.from(set).sort();
  }, [allCourses]);

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setSelectedCategory('All');
  };

  return (
    <div className="courses-page-wrapper">
      <main className="courses-page-main">
        <div className="courses-page-container">
          {/* Header */}
          <div className="courses-page-header">
            <div>
              <h1 className="courses-page-title">Courses</h1>
              <p className="courses-page-subtitle">
                Browse all available courses in the academy.
              </p>
            </div>
            <Link to="/recommendations" className="courses-ai-advisor-link">
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563eb' }}>
                auto_awesome
              </span>
              <span>Need guidance? Ask AI Advisor</span>
            </Link>
          </div>

          {/* Minimal Search & Filter Bar */}
          <div className="courses-filter-bar">
            <div className="courses-search-field">
              <span className="material-symbols-outlined search-icon">search</span>
              <input
                type="text"
                placeholder="Search by course name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchInput('')}
                  title="Clear search"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    close
                  </span>
                </button>
              )}
            </div>

            <div className="courses-category-field">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by Category"
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {(searchQuery.trim() || selectedCategory !== 'All') && (
              <button
                type="button"
                className="courses-reset-btn"
                onClick={handleClearFilters}
              >
                Reset
              </button>
            )}
          </div>

          {/* Results Summary */}
          <div className="courses-results-meta">
            <span>
              Showing <strong>{courses.length}</strong> {courses.length === 1 ? 'course' : 'courses'}
              {selectedCategory !== 'All' && ` in "${selectedCategory}"`}
              {searchQuery.trim() && ` matching "${searchQuery.trim()}"`}
            </span>
          </div>

          {/* Course List Content */}
          {isLoading ? (
            <div className="courses-state-box">
              <p>Loading courses...</p>
            </div>
          ) : isError ? (
            <div className="courses-state-box error">
              <p>Unable to load courses. Please try again later.</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="courses-state-box empty">
              <h3>No courses found</h3>
              <p>There are no courses matching your search or filter criteria.</p>
              {(searchQuery.trim() || selectedCategory !== 'All') && (
                <button
                  type="button"
                  className="courses-clear-btn"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="courses-grid">
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer onOpenAuth={(mode) => _onNavigateToAuth?.(mode)} />
    </div>
  );
}

export default CoursesPage;
