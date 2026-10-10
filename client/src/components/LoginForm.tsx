import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLogin, useRegisterStudent } from '../hooks/useAuth.js';
import {
  loginSchema,
  registerStudentSchema,
  type LoginFormData,
  type RegisterStudentFormData,
} from '../schemas/authSchemas.js';

interface FormToggleProps {
  onToggleMode: () => void;
}

function LoginView({ onToggleMode }: FormToggleProps) {
  const loginMutation = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const isPending = isSubmitting || loginMutation.isPending;

  return (
    <div style={{ margin: '20px', maxWidth: '360px' }}>
      <h2>Login</h2>

      {loginMutation.error && (
        <p style={{ color: 'red' }}>
          {loginMutation.error instanceof Error
            ? loginMutation.error.message
            : 'Login failed'}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="username" style={{ display: 'block' }}>
            Username:
          </label>
          <input
            id="username"
            type="text"
            {...register('username')}
            autoComplete="username"
            style={{ width: '100%', padding: '6px' }}
          />
          {errors.username && (
            <span style={{ color: 'red', fontSize: '13px' }}>
              {errors.username.message}
            </span>
          )}
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="password" style={{ display: 'block' }}>
            Password:
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            autoComplete="current-password"
            style={{ width: '100%', padding: '6px' }}
          />
          {errors.password && (
            <span style={{ color: 'red', fontSize: '13px' }}>
              {errors.password.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          {isPending ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <div style={{ marginTop: '16px' }}>
        <button
          type="button"
          onClick={onToggleMode}
          style={{
            background: 'none',
            border: 'none',
            color: 'blue',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          {"Don't have an account? Register as a student"}
        </button>
      </div>
    </div>
  );
}

function RegisterView({ onToggleMode }: FormToggleProps) {
  const registerMutation = useRegisterStudent();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterStudentFormData>({
    resolver: zodResolver(registerStudentSchema),
  });

  const onSubmit = (data: RegisterStudentFormData) => {
    registerMutation.mutate(data);
  };

  const isPending = isSubmitting || registerMutation.isPending;

  return (
    <div style={{ margin: '20px', maxWidth: '360px' }}>
      <h2>Register (Students Only)</h2>

      {registerMutation.error && (
        <p style={{ color: 'red' }}>
          {registerMutation.error instanceof Error
            ? registerMutation.error.message
            : 'Registration failed'}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="reg-username" style={{ display: 'block' }}>
            Username:
          </label>
          <input
            id="reg-username"
            type="text"
            {...register('username')}
            autoComplete="username"
            style={{ width: '100%', padding: '6px' }}
          />
          {errors.username && (
            <span style={{ color: 'red', fontSize: '13px' }}>
              {errors.username.message}
            </span>
          )}
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="reg-password" style={{ display: 'block' }}>
            Password:
          </label>
          <input
            id="reg-password"
            type="password"
            {...register('password')}
            autoComplete="new-password"
            style={{ width: '100%', padding: '6px' }}
          />
          {errors.password && (
            <span style={{ color: 'red', fontSize: '13px' }}>
              {errors.password.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          {isPending ? 'Registering...' : 'Register as Student'}
        </button>
      </form>

      <div style={{ marginTop: '16px' }}>
        <button
          type="button"
          onClick={onToggleMode}
          style={{
            background: 'none',
            border: 'none',
            color: 'blue',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          Already have an account? Log in
        </button>
      </div>
    </div>
  );
}

export function LoginForm() {
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);

  return isRegisterMode ? (
    <RegisterView onToggleMode={() => setIsRegisterMode(false)} />
  ) : (
    <LoginView onToggleMode={() => setIsRegisterMode(true)} />
  );
}
