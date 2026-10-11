export type UserRole = 'student' | 'instructor';

export interface User {
  id: string;
  username: string;
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
  username: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  password: string;
  role?: UserRole;
}
