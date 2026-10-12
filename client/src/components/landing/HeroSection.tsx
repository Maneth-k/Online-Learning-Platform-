import './HeroSection.css';

interface HeroSectionProps {
  onBrowseCourses?: () => void;
  onGetRecommendations?: () => void;
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

export function HeroSection({
  onBrowseCourses,
  onGetRecommendations,
}: HeroSectionProps) {
  return (
    <div className="hero-section-wrapper">
      <div className="hero-ambient-glow" />

      <div className="hero-container">
        {/* Title */}
        <h1 className="hero-title">
          Learn the skills you need,{' '}
          <span className="hero-title-highlight">
            guided by AI
            <svg
              className="hero-curve-svg"
              preserveAspectRatio="none"
              viewBox="0 0 240 10"
              aria-hidden="true"
            >
              <path
                d="M0,5 Q60,1 120,5 T240,5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="4"
              />
            </svg>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle">
          Adaptive curricula synchronized to your career objectives. Experience intelligent,
          real-time mentorship that recalibrates syllabus pacing to your exact cognitive speed.
        </p>

        {/* Action Buttons */}
        <div className="hero-cta-group">
          <button
            type="button"
            className="btn-hero-primary"
            onClick={onBrowseCourses}
          >
            <span>Browse Courses</span>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              arrow_forward
            </span>
          </button>
          <button
            type="button"
            className="btn-hero-secondary"
            onClick={onGetRecommendations}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--secondary)' }}>
              psychology
            </span>
            <span>Get AI Recommendations</span>
          </button>
        </div>
      </div>
    </div>
  );
}

