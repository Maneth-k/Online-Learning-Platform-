import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/useAuth.js';
import { HeroSection } from './HeroSection';
import { MetricsStrip } from './MetricsStrip';
import { FeaturedCourses } from './FeaturedCourses';
import { HowItWorks } from './HowItWorks';
import { Footer } from './Footer';
import './LandingPage.css';

interface LandingPageProps {
  currentUser?: { username: string; role: string } | null;
  onLogout?: () => void;
  onOpenDashboard?: () => void;
  onNavigateToAuth?: (mode: 'login' | 'register') => void;
  onOpenCreateCourse?: () => void;
  onOpenInstructors?: () => void;
  onOpenCourses?: () => void;
}

export function LandingPage({
  currentUser: propUser,
  onNavigateToAuth,
  onOpenCourses,
}: LandingPageProps = {}) {
  const { data: hookUser } = useCurrentUser();
  const currentUser = propUser !== undefined ? propUser : hookUser;
  const navigate = useNavigate();

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
    } else {
      navigate(`/${mode}`);
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
    if (onOpenCourses) {
      onOpenCourses();
    } else {
      navigate('/courses');
    }
  };

  const handleGetRecommendations = () => {
    navigate('/recommendations');
  };


  return (
    <div className="landing-page-root">
      <main className="landing-main-content">
        <HeroSection
          onBrowseCourses={handleBrowseCourses}
          onGetRecommendations={handleGetRecommendations}
          onOpenAuth={(mode) => handleOpenAuth(mode)}
        />

        <MetricsStrip />

        <FeaturedCourses onEnroll={handleEnrollCourse} />

        <HowItWorks />
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

export default LandingPage;
