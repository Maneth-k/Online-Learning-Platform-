import type { ActionResult, LoginInput, RegisterInput, User } from '../types/auth.js';
import { API_ROOT } from './apiConfig.js';

const API_BASE = `${API_ROOT}/api/auth`;

/**
 * Fetch the currently authenticated user session via HTTP-only cookie.
 */
export async function fetchCurrentUser(): Promise<User | null> {
  const response = await fetch(`${API_BASE}/me`, {
    method: 'GET',
    credentials: 'include',
  });

  if (response.status === 401) {
    return null;
  }

  const result: ActionResult<{ user: User }> = await response.json();
  if (!response.ok || !result.success || !result.data?.user) {
    return null;
  }

  return result.data.user;
}

/**
 * Log in an existing user (Student or Instructor).
 */
export async function loginUser(input: LoginInput): Promise<User> {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      email: input.email || input.username,
      username: input.username || input.email,
      password: input.password,
    }),
  });

  const result: ActionResult<{ user: User }> = await response.json();

  if (!response.ok || !result.success || !result.data?.user) {
    throw new Error(result.message || 'Login failed');
  }

  return result.data.user;
}

/**
 * Register a new user (Student or Instructor).
 */
export async function registerUser(input: RegisterInput): Promise<User> {
  const response = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      email: input.email,
      username: input.username || input.email,
      password: input.password,
      role: input.role || 'student',
    }),
  });

  const result: ActionResult<{ user: User }> = await response.json();

  if (!response.ok || !result.success || !result.data?.user) {
    throw new Error(result.message || 'Registration failed');
  }

  return result.data.user;
}

/**
 * Backwards compatibility alias for student registration.
 */
export const registerStudent = registerUser;

/**
 * Log out user by clearing the server auth cookie.
 */
export async function logoutUser(): Promise<void> {
  const response = await fetch(`${API_BASE}/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const result: ActionResult = await response.json().catch(() => ({ success: false }));
    throw new Error(result.message || 'Logout failed');
  }
}
