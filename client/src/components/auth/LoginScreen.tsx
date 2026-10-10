import { useState, type FormEvent } from 'react';
import './LoginScreen.css';

interface LoginScreenProps {
  onSwitchToRegister?: () => void;
  onBackToHome?: () => void;
}

export function LoginScreen({
  onSwitchToRegister,
  onBackToHome,
}: LoginScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [uiSubmitted, setUiSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setUiSubmitted(true);
    setTimeout(() => setUiSubmitted(false), 3000);
  };

  return (
    <div className="auth-page-wrapper">
      {/* Header */}
      <header className="auth-header">
        <div className="auth-header-container">
          <a
            href="#"
            className="auth-brand"
            onClick={(e) => {
              e.preventDefault();
              onBackToHome?.();
            }}
          >
            <img src="/logo.png" alt="Mentora" className="auth-brand-logo" />
            <div>
              <span className="auth-brand-title">Mentora</span>
              <span className="auth-brand-subtitle">AI Academy</span>
            </div>
          </a>

          <div className="auth-header-nav">
            <button
              type="button"
              className="auth-header-link"
              title="Select Language"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                language
              </span>
              <span>EN</span>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                expand_more
              </span>
            </button>
            <a href="#" className="auth-header-link" onClick={(e) => e.preventDefault()}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                help_outline
              </span>
              <span>Support</span>
            </a>
            <div className="auth-header-divider" />
            <button
              type="button"
              className="auth-header-link"
              onClick={onBackToHome}
              style={{ fontWeight: 600, color: 'var(--primary)' }}
            >
              <span>Back to home</span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="auth-main-container">
        <div className="auth-card-split">
          {/* Left Panel: Form */}
          <div className="auth-form-panel">
            <div className="auth-panel-top-row">
              <div className="auth-panel-brand-glyph">
                <div className="glyph-box">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    school
                  </span>
                </div>
                <span className="glyph-brand-name">Mentora</span>
              </div>
              <div className="auth-switch-prompt">
                <span>Don&apos;t have an account?</span>
                <button
                  type="button"
                  className="btn-auth-switch"
                  onClick={onSwitchToRegister}
                >
                  Sign up
                </button>
              </div>
            </div>

            {/* Form Center */}
            <div className="auth-form-center">
              {/* Mobile Hero Banner */}
              <div className="auth-mobile-banner">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA10h4Vk0prkTLjOsyUTuCxrTNm6RQdlY9YH-F_QUXi1ycSKpATmb3HAvPIMP0CqCG3p9HF0ok1viEyHrJPynAoiNY5d_BJghCqu3xONTzMe_4dOLvxCAD8W37G_CDSN8r7l3pnpomqEfMhfHF-Ndkjtn5TOHw4lkXkm9R0VrQ-lrhQUeEzZ5rnD0i0lhSeQl5pEO5e1xEyTEddXvY0z2LYeWPA6dMSyPzGimFpTr2KO4NUhsFmsdV2HQevQ7eHKC77"
                  alt="Mentora Learner at Desk"
                  className="auth-mobile-banner-img"
                />
                <div className="auth-mobile-banner-overlay" />
                <div className="auth-mobile-banner-pill">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '15px', color: 'var(--secondary)' }}
                  >
                    auto_awesome
                  </span>
                  <span>Mentora AI Learning</span>
                </div>
                <div className="auth-mobile-banner-footer">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="pulse-dot-green" />
                    <span>Personalized Study Session Ready</span>
                  </div>
                  <span>v2.4</span>
                </div>
              </div>

              {/* Avatar Icon */}
              <div className="auth-avatar-circle">
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                  person
                </span>
              </div>

              <h1 className="auth-title">Welcome back!</h1>
              <p className="auth-subtitle">
                Sign in to continue your learning journey with Mentora.
              </p>

              {/* Social Login Options */}
              <div className="oauth-buttons-list">
                <button type="button" className="btn-oauth">
                  <svg className="oauth-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Login with Google</span>
                </button>

                <button type="button" className="btn-oauth">
                  <svg
                    className="oauth-icon-svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.65-.79 1.09-1.89.97-2.99-.93.04-2.07.62-2.73 1.4-.58.67-1.09 1.77-.95 2.85 1.04.08 2.06-.47 2.71-1.26z" />
                  </svg>
                  <span>Login with Apple</span>
                </button>
              </div>

              {/* Divider */}
              <div className="auth-divider-line">
                <span className="line" />
                <span className="text">Or continue with</span>
                <span className="line" />
              </div>

              {/* Credentials Form */}
              <form className="auth-credentials-form" onSubmit={handleSubmit}>
                <div className="form-field-group">
                  <label className="form-label" htmlFor="login-email">
                    Email address
                  </label>
                  <div className="form-input-container">
                    <span
                      className="material-symbols-outlined input-leading-icon"
                      style={{ fontSize: '18px' }}
                    >
                      alternate_email
                    </span>
                    <input
                      id="login-email"
                      type="email"
                      required
                      placeholder="name@example.com"
                      className="form-input-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-field-group">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <label className="form-label" htmlFor="login-password">
                      Password
                    </label>
                    <button
                      type="button"
                      className="btn-forgot-password"
                      onClick={() => alert('Password reset link will be sent to your email.')}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="form-input-container">
                    <span
                      className="material-symbols-outlined input-leading-icon"
                      style={{ fontSize: '18px' }}
                    >
                      lock
                    </span>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      className="form-input-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-toggle-eye"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="form-row-options">
                  <label className="checkbox-label-row">
                    <input
                      type="checkbox"
                      className="checkbox-control"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Stay signed in for 30 days</span>
                  </label>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--tertiary-accent)',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                      verified_user
                    </span>
                    Encrypted
                  </span>
                </div>

                <button type="submit" className="btn-auth-submit">
                  <span>Sign in to Mentora</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    arrow_forward
                  </span>
                </button>
              </form>

              {uiSubmitted && (
                <div
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    background: '#f0fdf4',
                    color: '#0d9488',
                    fontSize: '0.85rem',
                    textAlign: 'center',
                  }}
                >
                  Authenticating UI demonstration...
                </div>
              )}

              <p className="auth-disclaimer-text">
                By continuing, you acknowledge Mentora&apos;s{' '}
                <a href="#">Terms of Service</a> &amp; <a href="#">Privacy Policy</a>.
              </p>
            </div>

            {/* Bottom Row */}
            <div className="auth-panel-bottom-row">
              <span>© 2026 Mentora AI</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  public
                </span>
                <span>ENG</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Showcase (Desktop) */}
          <div className="auth-showcase-panel">
            <div className="showcase-glow-ring1" />
            <div className="showcase-glow-ring2" />

            <div className="showcase-header">
              <div className="showcase-pill-badge">
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                  psychology
                </span>
                <span>Intelligent Personalized Pedagogy</span>
              </div>
              <h2 className="showcase-title">
                Accelerate your intellect with continuous AI mentorship
              </h2>
              <p className="showcase-subtitle">
                Personalized curricula, real-time conceptual critiques, and 24/7 intelligent tutoring designed for modern scholars.
              </p>
            </div>

            <div className="showcase-visual-box">
              <div className="showcase-visual-card">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA10h4Vk0prkTLjOsyUTuCxrTNm6RQdlY9YH-F_QUXi1ycSKpATmb3HAvPIMP0CqCG3p9HF0ok1viEyHrJPynAoiNY5d_BJghCqu3xONTzMe_4dOLvxCAD8W37G_CDSN8r7l3pnpomqEfMhfHF-Ndkjtn5TOHw4lkXkm9R0VrQ-lrhQUeEzZ5rnD0i0lhSeQl5pEO5e1xEyTEddXvY0z2LYeWPA6dMSyPzGimFpTr2KO4NUhsFmsdV2HQevQ7eHKC77"
                  alt="Scholar engaged in study"
                  className="showcase-card-img"
                />
                <div className="floating-pill-left">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '18px', color: 'var(--secondary)' }}
                  >
                    local_fire_department
                  </span>
                  <span>Study Streak: 14 Days</span>
                </div>
                <div className="floating-pill-right">
                  <span className="pulse-dot-green" />
                  <span>AI Mentor Ready</span>
                </div>
              </div>
            </div>

            <div className="showcase-metrics-row">
              <div className="showcase-stat-box">
                <div className="stat-header" style={{ color: 'var(--primary)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    verified
                  </span>
                  <span>98.4%</span>
                </div>
                <p className="stat-desc">Concept mastery rate across universities</p>
              </div>

              <div className="showcase-stat-box">
                <div className="stat-header" style={{ color: 'var(--secondary)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    schedule
                  </span>
                  <span>&lt; 30s</span>
                </div>
                <p className="stat-desc">Instant Socratic feedback turnarounds</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="auth-page-footer">
        <div className="auth-footer-content">
          <p>© 2025 Mentora AI, Inc. Intellectual Serenity for Lifelong Scholars.</p>
          <div className="auth-footer-links">
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Academic Integrity</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
