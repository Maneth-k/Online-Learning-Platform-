import { useState } from 'react';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { MetricsStrip } from './MetricsStrip';
import { FeaturedCourses } from './FeaturedCourses';
import { HowItWorks } from './HowItWorks';
import { AiDemoSection } from './AiDemoSection';
import { Footer } from './Footer';
import { LoginForm } from '../LoginForm';
import './LandingPage.css';

interface LandingPageProps {
  currentUser?: { username: string; role: string } | null;
  onLogout?: () => void;
  onOpenDashboard?: () => void;
}

export function LandingPage({
  currentUser,
  onLogout,
  onOpenDashboard,
}: LandingPageProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  const handleOpenAuth = () => {
    setAuthModalOpen(true);
  };

  const handleEnrollCourse = (course: { title: string }) => {
    if (!currentUser) {
      showToast(`Please sign in to enroll in "${course.title}". Opening sign-in...`);
      setTimeout(() => setAuthModalOpen(true), 600);
    } else {
      showToast(`Successfully enrolled in "${course.title}"! Welcome to the cohort.`);
    }
  };

  const handleBrowseCourses = () => {
    const el = document.getElementById('featured-courses');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGetRecommendations = () => {
    const el = document.getElementById('hero-synthesis');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      const input = document.querySelector<HTMLInputElement>('.ai-prompt-input');
      if (input) input.focus();
    }
  };

  const handleExplorePedagogy = () => {
    const el = document.getElementById('ai-pedagogy');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-page-root">
      <Navbar
        onOpenAuth={handleOpenAuth}
        currentUser={currentUser}
        onLogout={onLogout}
        onOpenDashboard={onOpenDashboard}
      />

      <main className="landing-main-content">
        <HeroSection
          onBrowseCourses={handleBrowseCourses}
          onGetRecommendations={handleGetRecommendations}
          onOpenAuth={handleOpenAuth}
        />

        <MetricsStrip />

        <FeaturedCourses onEnroll={handleEnrollCourse} />

        <HowItWorks />

        <AiDemoSection
          onStartFree={() => (currentUser ? onOpenDashboard?.() : handleOpenAuth())}
          onExplorePedagogy={handleExplorePedagogy}
        />
      </main>

      <Footer onOpenAuth={handleOpenAuth} />

      {/* Auth Modal */}
      {authModalOpen && !currentUser && (
        <div
          className="auth-modal-backdrop"
          onClick={() => setAuthModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="auth-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="auth-modal-header">
              <div className="auth-modal-brand">
                <img src="/logo.png" alt="Mentora" className="auth-modal-logo" />
                <span className="auth-modal-brand-title">Mentora Account</span>
              </div>
              <button
                type="button"
                className="auth-modal-close-btn"
                onClick={() => setAuthModalOpen(false)}
                aria-label="Close authentication modal"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  close
                </span>
              </button>
            </div>

            <div className="auth-modal-body">
              <LoginForm />
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {toastMessage && (
        <div className="course-toast-container">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '22px', color: 'var(--secondary)' }}
          >
            info
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
