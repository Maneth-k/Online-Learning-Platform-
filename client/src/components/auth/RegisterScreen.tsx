import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRegister } from '../../hooks/useAuth.js';
import type { User, UserRole } from '../../types/auth.js';
import './RegisterScreen.css';

interface RegisterScreenProps {
  onSwitchToLogin?: () => void;
  onBackToHome?: () => void;
  initialRole?: UserRole;
  onSuccess?: (user: User) => void;
}

export function RegisterScreen({
  onSwitchToLogin,
  onBackToHome: _onBackToHome,
  initialRole = 'student',
  onSuccess,
}: RegisterScreenProps = {}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryRole = searchParams.get('role');
  const effectiveInitialRole = (queryRole === 'instructor' || initialRole === 'instructor') ? 'instructor' : 'student';

  const [selectedRole, setSelectedRole] = useState<UserRole>(effectiveInitialRole);

  useEffect(() => {
    if (queryRole === 'instructor') {
      setSelectedRole('instructor');
    } else if (initialRole) {
      setSelectedRole(initialRole);
    }
  }, [initialRole, queryRole]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const registerMutation = useRegister();

  const handleLoginSwitch = () => {
    if (onSwitchToLogin) {
      onSwitchToLogin();
    } else {
      navigate('/login');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    registerMutation.mutate(
      {
        email: cleanEmail,
        password,
        role: selectedRole,
      },
      {
        onSuccess: (user) => {
          setSuccessToast(
            selectedRole === 'instructor'
              ? `Welcome Professor ${user.email}! Your instructor studio is ready.`
              : `Welcome ${user.email}! Your learning track is activated.`
          );
          setTimeout(() => {
            if (onSuccess) {
              onSuccess(user);
            } else {
              navigate('/dashboard');
            }
          }, 1000);
        },
        onError: (err) => {
          setErrorMsg(err instanceof Error ? err.message : 'Registration failed');
        },
      }
    );
  };

  return (
    <div className="register-page-wrapper">
      {/* Main Container */}
      <main className="register-main-container">
        <div className="register-card-split">
          {/* Left Column: Register Form */}
          <div className="register-form-panel">
            {/* Centered Form Body */}
            <div className="register-form-center">
              {/* Avatar Icon */}
              <div className="auth-avatar-circle" style={{ alignSelf: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                  {selectedRole === 'instructor' ? 'psychology' : 'person_add'}
                </span>
              </div>

              <h1 className="auth-title">
                {selectedRole === 'instructor' ? 'Join as an Instructor' : 'Create your account'}
              </h1>
              <p className="auth-subtitle">
                {selectedRole === 'instructor'
                  ? 'Author world-class curriculum and mentor global scholars.'
                  : 'Start learning with adaptive AI guidance today.'}
              </p>

              {/* Role Selector (Scholar vs Instructor) */}
              <div className="role-selector-container">
                <div className="role-selector-label">I want to join Mentora as:</div>
                <div className="role-selector-grid">
                  <button
                    type="button"
                    className={`role-card-btn ${selectedRole === 'student' ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedRole('student');
                      setErrorMsg(null);
                    }}
                  >
                    <div className="role-card-header">
                      <span className="material-symbols-outlined role-icon">school</span>
                      <span className="role-badge">Scholar</span>
                    </div>
                    <div className="role-card-title">Student</div>
                    <p className="role-card-desc">Study verified tracks &amp; get AI guidance</p>
                  </button>

                  <button
                    type="button"
                    className={`role-card-btn ${selectedRole === 'instructor' ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedRole('instructor');
                      setErrorMsg(null);
                    }}
                  >
                    <div className="role-card-header">
                      <span className="material-symbols-outlined role-icon">psychology</span>
                      <span className="role-badge">Faculty</span>
                    </div>
                    <div className="role-card-title">Instructor</div>
                    <p className="role-card-desc">Create courses &amp; mentor active cohorts</p>
                  </button>
                </div>
              </div>

              {/* Error Alert Box */}
              {errorMsg && (
                <div className="auth-error-alert" role="alert">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    error
                  </span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Success Toast */}
              {successToast && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    color: '#065f46',
                    fontSize: '0.85rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 600,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    check_circle
                  </span>
                  <span>{successToast}</span>
                </div>
              )}

              {/* Registration Form */}
              <form className="auth-credentials-form" onSubmit={handleSubmit} noValidate>
                {/* Email */}
                <div className="form-field-group">
                  <label className="form-label" htmlFor="reg-email">
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
                      id="reg-email"
                      type="email"
                      required
                      placeholder="name@example.com"
                      className="form-input-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password - Clean text box */}
                <div className="form-field-group">
                  <label className="form-label" htmlFor="reg-password">
                    Password
                  </label>
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
                      placeholder="••••••••••••"
                      className="form-input-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Already have an account link - Placed above Submit Button */}
                <div
                  className="auth-switch-link-group"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    margin: '0.65rem 0',
                  }}
                >
                  <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                    Already have an account?
                  </span>
                  <button
                    type="button"
                    onClick={handleLoginSwitch}
                    style={{
                      fontWeight: 600,
                      color: 'var(--primary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '2px',
                      cursor: 'pointer',
                      background: 'transparent',
                      border: 'none',
                      fontSize: '0.85rem',
                      padding: 0,
                    }}
                  >
                    <span>Log in</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      arrow_forward
                    </span>
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="btn-auth-submit"
                  disabled={registerMutation.isPending}
                >
                  <span>
                    {registerMutation.isPending
                      ? 'Creating Account...'
                      : selectedRole === 'instructor'
                      ? 'Register as Instructor'
                      : 'Register as Student'}
                  </span>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    arrow_forward
                  </span>
                </button>
              </form>

              {/* Mobile Guarantee Strip */}
              <div className="mobile-guarantee-strip">
                <div className="guarantee-item">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '15px', color: 'var(--secondary)' }}
                  >
                    shield_person
                  </span>
                  <span>Encrypted Data</span>
                </div>
                <div className="guarantee-divider" />
                <div className="guarantee-item">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '15px', color: 'var(--secondary)' }}
                  >
                    cancel
                  </span>
                  <span>Cancel Anytime</span>
                </div>
                <div className="guarantee-divider" />
                <div className="guarantee-item">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '15px', color: 'var(--secondary)' }}
                  >
                    workspace_premium
                  </span>
                  <span>Verified Credits</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
