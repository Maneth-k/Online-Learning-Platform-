import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCurrentUser, useLogout } from '../../hooks/useAuth.js';
import './Navbar.css';

interface NavbarProps {
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  currentUser?: { email?: string; username?: string; role: string } | null;
  onLogout?: () => void;
  onOpenDashboard?: () => void;
  onOpenCreateCourse?: () => void;
  onOpenInstructors?: () => void;
  onOpenCourses?: () => void;
  onNavigateHome?: () => void;
}

export function Navbar({
  onOpenAuth,
  currentUser: propUser,
  onLogout,
  onOpenDashboard,
  onOpenCreateCourse: _onOpenCreateCourse,
  onOpenInstructors,
  onOpenCourses,
  onNavigateHome,
}: NavbarProps = {}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: hookUser } = useCurrentUser();
  const currentUser = propUser !== undefined ? propUser : hookUser;

  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBrandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleHowItWorksClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      const element = document.getElementById('how-it-works');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    navigate('/#how-it-works');
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      logoutMutation.mutate();
    }
  };

  return (
    <header className={`mentora-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-brand" onClick={handleBrandClick}>
            <img src="/logo.png" alt="Mentora Logo" className="brand-logo-img" />
            <span className="brand-name">Mentora</span>
          </Link>

          <nav className="navbar-nav-links" aria-label="Main Navigation">
            <Link
              to="/courses"
              className={`nav-link ${location.pathname === '/courses' ? 'active' : ''}`}
              onClick={(e) => {
                if (onOpenCourses) {
                  e.preventDefault();
                  onOpenCourses();
                }
              }}
            >
              Courses
            </Link>
            {currentUser?.role !== 'instructor' && (
              <Link
                to="/recommendations"
                className={`nav-link ${location.pathname === '/recommendations' ? 'active' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <span>AI Advisor</span>
               
              </Link>
            )}
            <Link
              to="/instructors"
              className={`nav-link ${location.pathname === '/instructors' ? 'active' : ''}`}
              onClick={(e) => {
                if (onOpenInstructors) {
                  e.preventDefault();
                  onOpenInstructors();
                }
              }}
            >
              Instructors
            </Link>
            <a
              href="/#how-it-works"
              className="nav-link"
              onClick={handleHowItWorksClick}
            >
              How It Works
            </a>
          </nav>
        </div>

        <div className="navbar-actions">
          {currentUser ? (
            <div className="user-profile-badge">
              <div
                className="user-avatar-mini"
                title={currentUser.email || currentUser.username || 'User'}
              >
                {(currentUser.email || currentUser.username || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="user-info-text">
                  {currentUser.email || currentUser.username}
                </span>
                <span className="user-role-tag">{currentUser.role}</span>
              </div>
              {onOpenDashboard ? (
                <button
                  type="button"
                  className="btn-signin"
                  onClick={onOpenDashboard}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                >
                  Dashboard
                </button>
              ) : (
                <Link
                  to="/dashboard"
                  className="btn-signin"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', textDecoration: 'none' }}
                >
                  Dashboard
                </Link>
              )}
              <button
                type="button"
                className="btn-logout-nav"
                onClick={handleLogoutClick}
                title="Sign out"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  logout
                </span>
              </button>
            </div>
          ) : (
            <>
              {onOpenAuth ? (
                <button
                  type="button"
                  className="btn-signin"
                  onClick={() => onOpenAuth('login')}
                >
                  Sign In
                </button>
              ) : (
                <Link
                  to="/login"
                  className="btn-signin"
                  style={{ textDecoration: 'none' }}
                >
                  Sign In
                </Link>
              )}

              {onOpenAuth ? (
                <button
                  type="button"
                  className="btn-get-started"
                  onClick={() => onOpenAuth('register')}
                >
                  <span>Get Started</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    arrow_forward
                  </span>
                </button>
              ) : (
                <Link
                  to="/register"
                  className="btn-get-started"
                  style={{ textDecoration: 'none' }}
                >
                  <span>Get Started</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    arrow_forward
                  </span>
                </Link>
              )}
            </>
          )}

          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu-dropdown">
          <Link
            to="/courses"
            className="mobile-nav-link"
            onClick={(e) => {
              setMobileMenuOpen(false);
              if (onOpenCourses) {
                e.preventDefault();
                onOpenCourses();
              }
            }}
          >
            Courses
          </Link>
          {currentUser?.role !== 'instructor' && (
            <Link
              to="/recommendations"
              className="mobile-nav-link"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>AI Advisor</span>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2563eb' }}>
                auto_awesome
              </span>
            </Link>
          )}
          <Link
            to="/instructors"
            className="mobile-nav-link"
            onClick={(e) => {
              setMobileMenuOpen(false);
              if (onOpenInstructors) {
                e.preventDefault();
                onOpenInstructors();
              }
            }}
          >
            Instructors
          </Link>
          <a
            href="/#how-it-works"
            className="mobile-nav-link"
            onClick={handleHowItWorksClick}
          >
            How It Works
          </a>

          {currentUser ? (
            <div className="mobile-actions">
              <Link
                to="/dashboard"
                className="btn-signin"
                style={{ textAlign: 'center', width: '100%', textDecoration: 'none' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                type="button"
                className="btn-signin"
                style={{
                  textAlign: 'center',
                  width: '100%',
                  border: '1px solid var(--outline-variant)',
                }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogoutClick();
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="mobile-actions">
              <Link
                to="/login"
                className="btn-signin"
                style={{ textAlign: 'center', width: '100%', textDecoration: 'none' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-get-started"
                style={{ justifyContent: 'center', width: '100%', textDecoration: 'none' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
