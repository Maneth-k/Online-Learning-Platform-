import { useState } from 'react';
import './FeaturedCourses.css';

interface Course {
  id: string;
  title: string;
  category: string;
  instructor: string;
  rating: number;
  modules: number;
  scholars: string;
  level: string;
  image: string;
}

interface FeaturedCoursesProps {
  onEnroll?: (course: Course) => void;
}

export function FeaturedCourses({ onEnroll }: FeaturedCoursesProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});

  const courses: Course[] = [
    {
      id: 'c1',
      title: 'AI & Full-Stack Systems Architecture',
      category: 'Engineering',
      instructor: 'Dr. Soren Vance',
      rating: 4.9,
      modules: 12,
      scholars: '14.2k',
      level: 'Advanced',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClCtpV6VLeTsDaweBDZtTsEROKo9ViiOQvXlWaHJktvBeFLg_a_TZkmP-Uxh6qX_gERS2Trk3HaAZY1N155G72Lw_AfDBES3MNDz_kSrTUFw0yxOrXO72dTfXGHd8t1OyDjbYMmWskFxJ1j6pG0zpGGCK4ygrA3cdR2MPbrRR6Nknf1SbobH3m1TumTAqFPZ8t_kud8a5LMmmzEw_1xmzvzBh2ofI5ZrJ9KrurgQ7VL8w-InJxAL0',
    },
    {
      id: 'c2',
      title: 'Modern Product Management & AI Strategy',
      category: 'Product',
      instructor: 'Elena Rostova',
      rating: 4.8,
      modules: 8,
      scholars: '9.8k',
      level: 'Intermediate',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVIImTv2-6velJ1gW1aUqbrUe-hIpNXUeJpXYJNB6lTqZrdAhm7DNT3lDB8OvZxL_gLnJjDW21uwImtqQkgTiPH64v7NkRyPWN7gTpVsnkUsYT7EiubVGuqDLCGAka9JkEGBkrdpERzvUjMKyjB7h08nTaLszAu_vNexDvhiullXHPL2311dZinD34uSY37Jb7B-pfQEI4osxzEPGRMH-JJDP151ZbVGoR5NaNydRgsVxFRJkd3U0',
    },
    {
      id: 'c3',
      title: 'Applied Machine Learning & Neural Networks',
      category: 'Data & ML',
      instructor: 'Prof. Aris Thorne',
      rating: 4.9,
      modules: 16,
      scholars: '21.5k',
      level: 'Comprehensive',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDR3eI9-ebmxdCQmsBbRgMvGm3BupFaKgrwlGvKupq9U2tvBCgblp9BcN-U9FO8-jOrPYZ2JGz4oo3pM4N6Ih2TVHuJfnZUGQ_PHQ9NZrR8FWFaIC5scRRUcrzMjuvvWsJZ_oVXsVYcVbrdHnzWX6NozcCEYfqFLHgPgIVWbNX_RiQPlfiocVG0Q5ZsVkpq-AILoFGJyqxdnuqrbo8asq7v1b0YZ2ZxR8gSabd32RNQOPA1OZgjiQA',
    },
    {
      id: 'c4',
      title: 'NextGen Cloud Engineering & DevOps',
      category: 'Infrastructure',
      instructor: 'Kavita Sharma',
      rating: 4.7,
      modules: 10,
      scholars: '11.1k',
      level: 'Professional',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARuOmJm7lUBqkrGTMRIrlKrEYqMNCVtPWlPw9qRy0TZWQjgKWA9x7FEM4_agm4R2PGaJdzB9p0KDVl0GSg3L6HkIXhuEHGZDKvphvFx6SSWZ5916lUWVjD_S9fqUSMNGbz16UG1ZVVBcyJQ75-1f38hqZBclrVHJVyxhAQXpJz2S_REJb2ZcHl0Xtcp48I0tmtB2YGYhNYqO6GoL9uBjr3F8VIcCXLcE30r-DRM4rdqRpd6XT-VUw',
    },
  ];

  const categories = ['All', 'Engineering', 'Product', 'Data & ML', 'Infrastructure'];

  const filteredCourses = activeCategory === 'All'
    ? courses
    : courses.filter((c) => c.category === activeCategory);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section className="featured-courses-section" id="featured-courses">
      <div className="courses-header-row">
        <div>
          <div className="courses-subtag">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              layers
            </span>
            <span>Verified Tracks</span>
          </div>
          <h2 className="courses-title">Featured Courses</h2>
          <p className="courses-description">
            Curated paths evaluated and refined continuously by AI mentors.
          </p>
        </div>
        <div>
          <a
            href="#courses"
            className="courses-explore-link"
            onClick={(e) => {
              e.preventDefault();
              setActiveCategory('All');
            }}
          >
            <span>Explore All 84 Paths</span>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              arrow_forward
            </span>
          </a>
        </div>
      </div>

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

      <div className="courses-cards-grid">
        {filteredCourses.map((course) => {
          const isBookmarked = !!bookmarkedIds[course.id];
          return (
            <div key={course.id} className="course-card">
              <div className="course-thumbnail-box">
                <img
                  src={course.image}
                  alt={course.title}
                  className="course-thumb-img"
                  loading="lazy"
                />
                <span className="course-category-badge">{course.category}</span>
                <button
                  type="button"
                  className={`course-bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
                  onClick={() => toggleBookmark(course.id)}
                  aria-label="Bookmark course"
                  title={isBookmarked ? 'Remove bookmark' : 'Bookmark track'}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: '18px',
                      fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    bookmark
                  </span>
                </button>
              </div>

              <div className="course-card-content">
                <div className="course-instructor-row">
                  <span className="material-symbols-outlined instructor-icon">
                    verified_user
                  </span>
                  <span>{course.instructor}</span>
                </div>

                <h3 className="course-card-title">{course.title}</h3>

                <div className="course-meta-row">
                  <div className="rating-badge">
                    <span className="material-symbols-outlined star-icon">star</span>
                    <span>{course.rating}</span>
                  </div>
                  <span>•</span>
                  <span>{course.modules} Modules</span>
                  <span>•</span>
                  <span>{course.scholars} Scholars</span>
                </div>
              </div>

              <div className="course-card-footer">
                <span className="course-level-badge">{course.level}</span>
                <button
                  type="button"
                  className="btn-enroll-card"
                  onClick={() => onEnroll?.(course)}
                >
                  <span>Enroll Track</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
