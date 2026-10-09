import { useState, type FormEvent } from 'react';
import { useLogin, useRegisterStudent } from '../hooks/useAuth.js';

export function LoginForm() {
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const loginMutation = useLogin();
  const registerMutation = useRegisterStudent();

  const activeMutation = isRegisterMode ? registerMutation : loginMutation;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isRegisterMode) {
      registerMutation.mutate({ username, password });
    } else {
      loginMutation.mutate({ username, password });
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    loginMutation.reset();
    registerMutation.reset();
  };

  return (
    <div style={{ margin: '20px', maxWidth: '360px' }}>
      <h2>{isRegisterMode ? 'Register (Students Only)' : 'Login'}</h2>

      {activeMutation.error && (
        <p style={{ color: 'red' }}>
          {activeMutation.error instanceof Error
            ? activeMutation.error.message
            : 'Authentication failed'}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="username" style={{ display: 'block' }}>
            Username:
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            style={{ width: '100%', padding: '6px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="password" style={{ display: 'block' }}>
            Password:
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
            style={{ width: '100%', padding: '6px' }}
          />
        </div>

        <button
          type="submit"
          disabled={activeMutation.isPending}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          {activeMutation.isPending
            ? 'Submitting...'
            : isRegisterMode
            ? 'Register as Student'
            : 'Log In'}
        </button>
      </form>

      <div style={{ marginTop: '16px' }}>
        <button
          type="button"
          onClick={toggleMode}
          style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
        >
          {isRegisterMode
            ? 'Already have an account? Log in'
            : "Don't have an account? Register as a student"}
        </button>
      </div>
    </div>
  );
}
