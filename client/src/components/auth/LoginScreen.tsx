import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLogin } from '../../hooks/useAuth.js';
import type { User } from '../../types/auth.js';
import './LoginScreen.css';

interface LoginScreenProps {
  onSwitchToRegister?: () => void;
  onBackToHome?: () => void;
  onSuccess?: (user: User) => void;
}

export function LoginScreen({
  onSwitchToRegister,
  onBackToHome: _onBackToHome,
  onSuccess,
}: LoginScreenProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const returnUrl = searchParams.get('returnUrl') || (location.state as any)?.from || '/dashboard';

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loginMutation = useLogin();

  const handleRegisterSwitch = () => {
    if (onSwitchToRegister) {
      onSwitchToRegister();
    } else {
      navigate('/register');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Email address is required');
      return;
    }
    if (!password) {
      setErrorMsg('Password is required');
      return;
    }

    loginMutation.mutate(
      { email: cleanEmail, password },
      {
        onSuccess: (user) => {
          if (onSuccess) {
            onSuccess(user);
          } else {
            navigate(returnUrl, { replace: true });
          }
        },
        onError: (err) => {
          setErrorMsg(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
        },
      }
    );
  };

  return (
    <div className="auth-page-wrapper">
      {/* Main Container */}
      <main className="auth-main-container">
        <div className="auth-card-split">
          {/* Form Panel */}
          <div className="auth-form-panel">
            <div className="auth-form-center">
              {/* Avatar Icon */}
              <div className="auth-avatar-circle" style={{ alignSelf: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                  person
                </span>
              </div>

              <h1 className="auth-title">Welcome back!</h1>
              <p className="auth-subtitle">
                Sign in to continue your learning journey with Mentora.
              </p>

              {/* Error Alert Box */}
              {errorMsg && (
                <div className="auth-error-alert" role="alert">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    error
                  </span>
                  <span>{errorMsg}</span>
                </div>
              )}

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
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="form-field-group">
                  <label className="form-label" htmlFor="login-password">
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
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      className="form-input-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
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

                {/* Switch Link above Submit Button - Pattern identical to Register */}
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
                    Don&apos;t have an account?
                  </span>
                  <button
                    type="button"
                    onClick={handleRegisterSwitch}
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
                    <span>Sign up</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      arrow_forward
                    </span>
                  </button>
                </div>

                <button
                  type="submit"
                  className="btn-auth-submit"
                  disabled={loginMutation.isPending}
                >
                  <span>{loginMutation.isPending ? 'Signing in...' : 'Sign in to Mentora'}</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    arrow_forward
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
