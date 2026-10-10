import { useState, useEffect } from 'react';
import './Navbar.css';

interface NavbarProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  currentUser?: { username: string; role: string } | null;
  onLogout?: () => void;
  onOpenDashboard?: () => void;
}

export function Navbar({ onOpenAuth, currentUser, onLogout, onOpenDashboard }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`mentora-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-left">
          <a href="#" className="navbar-brand" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <img src="/logo.png" alt="Mentora Logo" className="brand-logo-img" />
            <span className="brand-name">Mentora</span>
          </a>

          <nav className="navbar-nav-links" aria-label="Main Navigation">
            <a
              href="#courses"
              className="nav-link"
              onClick={(e) => { e.preventDefault(); scrollToSection('featured-courses'); }}
            >
              Courses
            </a>
            <a
              href="#how-it-works"
              className="nav-link"
              onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}
            >
              How It Works
            </a>
            <a
              href="#ai-pedagogy"
              className="nav-link"
              onClick={(e) => { e.preventDefault(); scrollToSection('ai-pedagogy'); }}
            >
              AI Pedagogy
            </a>
            <a
              href="#synthesis"
              className="nav-link"
              onClick={(e) => { e.preventDefault(); scrollToSection('hero-synthesis'); }}
            >
              AI Roadmap
            </a>
          </nav>
        </div>

        <div className="navbar-actions">
          {currentUser ? (
            <div className="user-profile-badge">
              <div className="user-avatar-mini" title={currentUser.username}>
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="user-info-text">{currentUser.username}</span>
                <span className="user-role-tag">{currentUser.role}</span>
              </div>
              {onOpenDashboard && (
                <button
                  type="button"
                  className="btn-signin"
                  onClick={onOpenDashboard}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                >
                  Dashboard
                </button>
              )}
              {onLogout && (
                <button
                  type="button"
                  className="btn-logout-nav"
                  onClick={onLogout}
                  title="Sign out"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                </button>
              )}
            </div>
          ) : (
            <>
              <button
                type="button"
                className="btn-signin"
                onClick={() => onOpenAuth('login')}
              >
                Sign In
              </button>
              <button
                type="button"
                className="btn-get-started"
                onClick={() => onOpenAuth('register')}
              >
                <span>Get Started</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
              </button>
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
          <a
            href="#courses"
            className="mobile-nav-link"
            onClick={(e) => { e.preventDefault(); scrollToSection('featured-courses'); }}
          >
            Courses
          </a>
          <a
            href="#how-it-works"
            className="mobile-nav-link"
            onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }}
          >
            How It Works
          </a>
          <a
            href="#ai-pedagogy"
            className="mobile-nav-link"
            onClick={(e) => { e.preventDefault(); scrollToSection('ai-pedagogy'); }}
          >
            AI Pedagogy
          </a>
          <a
            href="#synthesis"
            className="mobile-nav-link"
            onClick={(e) => { e.preventDefault(); scrollToSection('hero-synthesis'); }}
          >
            AI Roadmap
          </a>

          {!currentUser && (
            <div className="mobile-actions">
              <button
                type="button"
                className="btn-signin"
                style={{ textAlign: 'center', width: '100%' }}
                onClick={() => { setMobileMenuOpen(false); onOpenAuth('login'); }}
              >
                Sign In
              </button>
              <button
                type="button"
                className="btn-get-started"
                style={{ justifyContent: 'center', width: '100%' }}
                onClick={() => { setMobileMenuOpen(false); onOpenAuth('register'); }}
              >
                Get Started Free
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
