import jwt, { type SignOptions } from 'jsonwebtoken';
import type { CookieOptions } from 'express';
import type { UserRole } from '../models/User.js';

export interface TokenPayload {
  userId: string;
  role: UserRole;
}

export const AUTH_COOKIE_NAME = 'access_token';

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is missing in production');
    }
    return 'default_jwt_secret_dev_key';
  }
  return secret;
};

/**
 * Signs a JWT with the user's ID and role.
 */
export const signToken = (payload: TokenPayload): string => {
  const secret = getJwtSecret();
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

  return jwt.sign(payload, secret, {
    expiresIn,
  });
};

/**
 * Verifies a JWT and returns the decoded payload.
 */
export const verifyToken = (token: string): TokenPayload => {
  const secret = getJwtSecret();
  return jwt.verify(token, secret) as TokenPayload;
};

/**
 * Cookie configuration for authentication cookie.
 * - httpOnly: Prevents client-side scripts from reading the cookie (protects against XSS).
 * - secure: Set to true in production so cookie is only transmitted over HTTPS.
 * - sameSite: 'lax' for local development across localhost ports, 'none' for production cross-origin APIs.
 */
export const getAuthCookieOptions = (): CookieOptions => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
  };
};

/**
 * Cookie options for clearing the auth cookie upon logout.
 */
export const getClearCookieOptions = (): CookieOptions => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };
};
