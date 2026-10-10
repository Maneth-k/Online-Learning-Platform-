import { useState } from 'react';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { MetricsStrip } from './MetricsStrip';
import { FeaturedCourses } from './FeaturedCourses';
import { HowItWorks } from './HowItWorks';
import { AiDemoSection } from './AiDemoSection';
import { Footer } from './Footer';
import './LandingPage.css';

interface LandingPageProps {
  currentUser?: { username: string; role: string } | null;
  onLogout?: () => void;
  onOpenDashboard?: () => void;
  onNavigateToAuth?: (mode: 'login' | 'register') => void;
}

export function LandingPage({
  currentUser,
  onLogout,
  onOpenDashboard,
  onNavigateToAuth,
}: LandingPageProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    if (onNavigateToAuth) {
      onNavigateToAuth(mode);
    }
  };

  const handleEnrollCourse = (course: { title: string }) => {
    if (!currentUser) {
      showToast(`Please sign in to enroll in "${course.title}". Opening sign-in...`);
      setTimeout(() => handleOpenAuth('login'), 600);
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
        onOpenAuth={(mode) => handleOpenAuth(mode === 'register' ? 'register' : 'login')}
        currentUser={currentUser}
        onLogout={onLogout}
        onOpenDashboard={onOpenDashboard}
      />

      <main className="landing-main-content">
        <HeroSection
          onBrowseCourses={handleBrowseCourses}
          onGetRecommendations={handleGetRecommendations}
          onOpenAuth={(mode) => handleOpenAuth(mode)}
        />

        <MetricsStrip />

        <FeaturedCourses onEnroll={handleEnrollCourse} />

        <HowItWorks />

        <AiDemoSection
          onStartFree={() => (currentUser ? onOpenDashboard?.() : handleOpenAuth('register'))}
          onExplorePedagogy={handleExplorePedagogy}
        />
      </main>

      <Footer onOpenAuth={(mode) => handleOpenAuth(mode === 'register' ? 'register' : 'login')} />

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
