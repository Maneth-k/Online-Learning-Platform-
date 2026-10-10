import { useState, type FormEvent } from 'react';
import './RegisterScreen.css';

interface RegisterScreenProps {
  onSwitchToLogin?: () => void;
  onBackToHome?: () => void;
}

export function RegisterScreen({
  onSwitchToLogin,
  onBackToHome,
}: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Curiosity2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState('Software Eng');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [uiSubmitted, setUiSubmitted] = useState(false);

  const tracks = ['Software Eng', 'AI & Data', 'Product Lead'];

  // Password strength calculations for UI feedback
  const hasMinLength = password.length >= 8;
  const hasSymbolOrNumber = /[0-9!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);

  const strengthCount = (hasMinLength ? 1 : 0) + (hasSymbolOrNumber ? 1 : 0) + (hasMixedCase ? 1 : 0) + (password.length >= 12 ? 1 : 0);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setUiSubmitted(true);
    setTimeout(() => setUiSubmitted(false), 3000);
  };

  return (
    <div className="register-page-wrapper">
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
      <main className="register-main-container">
        <div className="register-card-split">
          {/* Left Column: Register Form */}
          <div className="register-form-panel">
            {/* Top row */}
            <div className="auth-panel-top-row">
              <div className="auth-panel-brand-glyph">
                <div className="glyph-box">
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    school
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="glyph-brand-name">Mentora</span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: 'var(--secondary)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Academy
                  </span>
                </div>
              </div>

              <div className="auth-switch-prompt">
                <span>Already have an account?</span>
                <button
                  type="button"
                  className="btn-auth-switch"
                  onClick={onSwitchToLogin}
                >
                  Sign in
                </button>
              </div>
            </div>

            {/* Form Center */}
            <div className="register-form-center">
              {/* Mobile Cohort Bar */}
              <div className="mobile-cohort-bar">
                <div className="cohort-tag">
                  <span className="cohort-pulse-dot" />
                  <span>Cohort 24 open</span>
                </div>
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  style={{
                    color: 'var(--secondary)',
                    fontWeight: 600,
                    fontSize: '0.825rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <span>Log in</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    arrow_forward
                  </span>
                </button>
              </div>

              {/* Mobile Hero Banner */}
              <div className="auth-mobile-banner">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA10h4Vk0prkTLjOsyUTuCxrTNm6RQdlY9YH-F_QUXi1ycSKpATmb3HAvPIMP0CqCG3p9HF0ok1viEyHrJPynAoiNY5d_BJghCqu3xONTzMe_4dOLvxCAD8W37G_CDSN8r7l3pnpomqEfMhfHF-Ndkjtn5TOHw4lkXkm9R0VrQ-lrhQUeEzZ5rnD0i0lhSeQl5pEO5e1xEyTEddXvY0z2LYeWPA6dMSyPzGimFpTr2KO4NUhsFmsdV2HQevQ7eHKC77"
                  alt="Mentora Scholar studying"
                  className="auth-mobile-banner-img"
                />
                <div className="auth-mobile-banner-overlay" />
                <div className="auth-mobile-banner-pill">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '15px', color: 'var(--secondary)' }}
                  >
                    verified
                  </span>
                  <span>Join 45k+ Scholars</span>
                </div>
                <div className="auth-mobile-banner-footer">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '15px', color: 'var(--secondary-container)' }}
                    >
                      auto_awesome
                    </span>
                    <span>Master concepts 3.4x faster</span>
                  </div>
                  <span>AI-Guided</span>
                </div>
              </div>

              {/* Avatar Icon */}
              <div className="auth-avatar-circle" style={{ alignSelf: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                  person_add
                </span>
              </div>

              <h1 className="auth-title">Create your account</h1>
              <p className="auth-subtitle">
                Start learning with adaptive AI guidance today.
              </p>

              {/* Social Options */}
              <div className="oauth-buttons-list">
                <button type="button" className="btn-oauth">
                  <svg className="oauth-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.25 21.36 7.34 24 12 24z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Sign up with Google</span>
                </button>

                <button type="button" className="btn-oauth">
                  <svg
                    className="oauth-icon-svg"
                    viewBox="0 0 170 170"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.32-6.53-9.88-11.53-20.93-15.01-33.15-3.48-12.22-5.22-23.77-5.22-34.65 0-14.36 3.64-26.35 10.92-35.97 7.28-9.62 16.51-14.54 27.69-14.76 4.8 0 10.15 1.26 16.05 3.78 5.91 2.52 9.87 3.84 11.89 3.97 1.55-.13 5.75-1.5 12.6-4.11 6.86-2.61 12.44-3.8 16.74-3.57 12.35.65 22.38 5.17 30.1 13.56-10.74 6.53-15.99 15.44-15.77 26.74.22 8.91 3.69 16.42 10.42 22.51 6.74 6.09 14.65 9.53 23.74 10.33-2.06 6.3-4.57 12.83-7.53 19.59zM119.22 31.84c0-7.39 2.67-14.32 8.02-20.78 5.35-6.47 11.96-10.46 19.82-11.97-.22 1.3-.43 2.61-.65 3.91-.87 7.18-3.79 13.88-8.77 20.09-4.99 6.2-11.28 10.18-18.89 11.93.11-1.08.47-2.15.47-3.18z" />
                  </svg>
                  <span>Sign up with Apple</span>
                </button>
              </div>

              {/* Divider */}
              <div className="auth-divider-line">
                <span className="line" />
                <span className="text">Or</span>
                <span className="line" />
              </div>

              {/* Registration Form */}
              <form className="auth-credentials-form" onSubmit={handleSubmit}>
                {/* Full Name */}
                <div className="form-field-group">
                  <label className="form-label" htmlFor="reg-name">
                    Full Name
                  </label>
                  <div className="form-input-container">
                    <span
                      className="material-symbols-outlined input-leading-icon"
                      style={{ fontSize: '18px' }}
                    >
                      person
                    </span>
                    <input
                      id="reg-name"
                      type="text"
                      required
                      placeholder="e.g. Eleanor Vance"
                      className="form-input-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="form-field-group">
                  <label className="form-label" htmlFor="reg-email">
                    Email Address
                  </label>
                  <div className="form-input-container">
                    <span
                      className="material-symbols-outlined input-leading-icon"
                      style={{ fontSize: '18px' }}
                    >
                      mail
                    </span>
                    <input
                      id="reg-email"
                      type="email"
                      required
                      placeholder="eleanor@university.edu"
                      className="form-input-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password with Strength Indicators */}
                <div className="form-field-group">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <label className="form-label" htmlFor="reg-password">
                      Create Password
                    </label>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: strengthCount >= 3 ? 'var(--secondary)' : 'var(--outline)',
                      }}
                    >
                      {strengthCount >= 3 ? 'Strong' : strengthCount === 2 ? 'Medium' : 'Weak'}
                    </span>
                  </div>
                  <div className="form-input-container">
                    <span
                      className="material-symbols-outlined input-leading-icon"
                      style={{ fontSize: '18px' }}
                    >
                      lock
                    </span>
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Min 8 characters"
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

                  {/* 4-Step Bar */}
                  <div className="password-strength-bar-group">
                    <div className={`strength-step ${strengthCount >= 1 ? 'filled' : ''}`} />
                    <div className={`strength-step ${strengthCount >= 2 ? 'filled' : ''}`} />
                    <div className={`strength-step ${strengthCount >= 3 ? 'filled' : ''}`} />
                    <div className={`strength-step ${strengthCount >= 4 ? 'filled' : ''}`} />
                  </div>

                  {/* Checkmarks */}
                  <div className="password-rules-row">
                    <span className={`rule-check-item ${hasMinLength ? 'valid' : ''}`}>
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: '14px',
                          color: hasMinLength ? 'var(--secondary)' : 'var(--outline)',
                        }}
                      >
                        check_circle
                      </span>
                      8+ chars
                    </span>
                    <span className={`rule-check-item ${hasSymbolOrNumber ? 'valid' : ''}`}>
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: '14px',
                          color: hasSymbolOrNumber ? 'var(--secondary)' : 'var(--outline)',
                        }}
                      >
                        check_circle
                      </span>
                      1 symbol/number
                    </span>
                    <span className={`rule-check-item ${hasMixedCase ? 'valid' : ''}`}>
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: '14px',
                          color: hasMixedCase ? 'var(--secondary)' : 'var(--outline)',
                        }}
                      >
                        check_circle
                      </span>
                      Case mixed
                    </span>
                  </div>
                </div>

                {/* Primary Learning Track Selection */}
                <div className="form-field-group">
                  <label className="form-label">Primary Learning Track</label>
                  <div className="track-chips-grid">
                    {tracks.map((track) => (
                      <button
                        key={track}
                        type="button"
                        className={`track-chip-btn ${selectedTrack === track ? 'active' : ''}`}
                        onClick={() => setSelectedTrack(track)}
                      >
                        {track}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Consent */}
                <label className="checkbox-label-row" style={{ marginTop: '0.25rem' }}>
                  <input
                    type="checkbox"
                    className="checkbox-control"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    required
                  />
                  <span style={{ fontSize: '0.78rem', lineHeight: '1.4' }}>
                    I agree to the <a href="#" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Terms of Service</a> and acknowledge the <a href="#" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Privacy Policy</a>.
                  </span>
                </label>

                {/* Submit */}
                <button type="submit" className="btn-auth-submit">
                  <span>Create Free Account</span>
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
                  Account creation UI demonstration active!
                </div>
              )}

              {/* Mobile Guarantee Strip */}
              <div className="mobile-guarantee-strip">
                <div className="guarantee-item">
                  <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--secondary)' }}>
                    shield_person
                  </span>
                  <span>Encrypted Data</span>
                </div>
                <div className="guarantee-divider" />
                <div className="guarantee-item">
                  <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--secondary)' }}>
                    speed
                  </span>
                  <span>Adaptive Pace</span>
                </div>
                <div className="guarantee-divider" />
                <div className="guarantee-item">
                  <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--secondary)' }}>
                    workspace_premium
                  </span>
                  <span>Verified Credits</span>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="auth-panel-bottom-row">
              <span>© 2026 Mentora Academy</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  language
                </span>
                <span>English (US)</span>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Showcase (Desktop) */}
          <div className="register-showcase-panel">
            <div className="showcase-glow-ring1" />
            <div className="showcase-glow-ring2" />

            <div className="showcase-header">
              <div className="showcase-pill-badge">
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                  psychology_alt
                </span>
                <span>Cognitive Pacing Engine</span>
              </div>
              <h2 className="showcase-title">
                Master complex skills 2.4x faster.
              </h2>
              <p className="showcase-subtitle">
                A quiet sanctuary for focused deep work. Mentora tracks comprehension fatigue and recalculates curricula in real time.
              </p>
            </div>

            <div className="showcase-visual-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="showcase-visual-card" style={{ width: '100%' }}>
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA10h4Vk0prkTLjOsyUTuCxrTNm6RQdlY9YH-F_QUXi1ycSKpATmb3HAvPIMP0CqCG3p9HF0ok1viEyHrJPynAoiNY5d_BJghCqu3xONTzMe_4dOLvxCAD8W37G_CDSN8r7l3pnpomqEfMhfHF-Ndkjtn5TOHw4lkXkm9R0VrQ-lrhQUeEzZ5rnD0i0lhSeQl5pEO5e1xEyTEddXvY0z2LYeWPA6dMSyPzGimFpTr2KO4NUhsFmsdV2HQevQ7eHKC77"
                  alt="Diligent Scholar Studying"
                  className="showcase-card-img"
                  style={{ height: '300px' }}
                />
              </div>

              {/* Micro Floating Card 1 */}
              <div className="floating-tutor-card">
                <div className="tutor-bolt-icon">
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    bolt
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--on-surface)' }}>
                    Real-time Socratic Tutor
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                    Syntax &amp; reasoning validation in 280ms
                  </div>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--secondary)' }}>
                  check_circle
                </span>
              </div>

              {/* Micro Floating Card 2 */}
              <div className="floating-social-proof-card">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="avatar-stack-group">
                    <div className="avatar-stack-circle" style={{ background: '#1e3a8a', color: '#fff' }}>MK</div>
                    <div className="avatar-stack-circle" style={{ background: '#006398', color: '#fff' }}>AR</div>
                    <div className="avatar-stack-circle" style={{ background: '#004942', color: '#fff' }}>SL</div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface)' }}>
                    45,000+ Active Scholars
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary)' }}>
                  99.4% Completion
                </span>
              </div>
            </div>

            {/* Bottom Quote */}
            <div className="showcase-quote-box">
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--secondary)' }}>
                format_quote
              </span>
              <p className="showcase-quote-text">
                &quot;Mentora replaced endless video scrubbing with deliberate, calm intellectual clarity.&quot;
              </p>
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
