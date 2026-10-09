import type { ActionResult, LoginInput, RegisterInput, User } from '../types/auth.js';

const API_BASE = '/api/auth';

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
    body: JSON.stringify(input),
  });

  const result: ActionResult<{ user: User }> = await response.json();

  if (!response.ok || !result.success || !result.data?.user) {
    throw new Error(result.message || 'Login failed');
  }

  return result.data.user;
}

/**
 * Register a new Student.
 * NOTE: Frontend strictly registers students (role: 'student').
 */
export async function registerStudent(input: RegisterInput): Promise<User> {
  const response = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      username: input.username,
      password: input.password,
      role: 'student',
    }),
  });

  const result: ActionResult<{ user: User }> = await response.json();

  if (!response.ok || !result.success || !result.data?.user) {
    throw new Error(result.message || 'Registration failed');
  }

  return result.data.user;
}

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
