export type UserRole = 'student' | 'instructor';

export interface User {
  id: string;
  email: string;
  username?: string;
  role: UserRole;
  createdAt?: string;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface LoginInput {
  email?: string;
  username?: string;
  password: string;
}

export interface RegisterInput {
  email?: string;
  username?: string;
  password: string;
  role?: UserRole;
}
