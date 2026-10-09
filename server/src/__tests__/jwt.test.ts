import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import {
  signToken,
  verifyToken,
  getAuthCookieOptions,
  getClearCookieOptions,
  AUTH_COOKIE_NAME,
  type TokenPayload,
} from '../utils/jwt.js';

describe('JWT Utility (jwt.ts)', () => {
  const samplePayload: TokenPayload = {
    userId: '65f1a2b3c4d5e6f7a8b9c0d1',
    role: 'student',
  };

  describe('signToken', () => {
    it('should generate a valid non-empty JWT string', () => {
      const token = signToken(samplePayload);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // Header.Payload.Signature
    });

    it('should embed userId and role within the token payload', () => {
      const token = signToken(samplePayload);
      const decoded = jwt.decode(token) as TokenPayload & { iat: number; exp: number };
      expect(decoded.userId).toBe(samplePayload.userId);
      expect(decoded.role).toBe(samplePayload.role);
      expect(decoded.exp).toBeDefined();
    });
  });

  describe('verifyToken', () => {
    it('should successfully verify and decode a valid token', () => {
      const token = signToken(samplePayload);
      const verified = verifyToken(token);
      expect(verified.userId).toBe(samplePayload.userId);
      expect(verified.role).toBe(samplePayload.role);
    });

    it('should throw an error when token signature is tampered with', () => {
      const token = signToken(samplePayload);
      const tamperedToken = token.slice(0, -5) + 'abcde';
      expect(() => verifyToken(tamperedToken)).toThrow();
    });

    it('should throw an error when an invalid string is provided', () => {
      expect(() => verifyToken('not.a.valid.jwt.string')).toThrow();
    });

    it('should throw an error when token is expired', () => {
      const secret = process.env.JWT_SECRET || 'test_super_secret_jwt_key_for_vitest_2026';
      // Sign a token that is already expired
      const expiredToken = jwt.sign(samplePayload, secret, { expiresIn: -10 });
      expect(() => verifyToken(expiredToken)).toThrow();
    });
  });

  describe('Cookie Configuration Helpers', () => {
    it('should expose AUTH_COOKIE_NAME as "access_token"', () => {
      expect(AUTH_COOKIE_NAME).toBe('access_token');
    });

    it('should provide secure cookie options for development/test environment', () => {
      process.env.NODE_ENV = 'test';
      const options = getAuthCookieOptions();
      expect(options.httpOnly).toBe(true);
      expect(options.secure).toBe(false);
      expect(options.sameSite).toBe('lax');
      expect(options.path).toBe('/');
      expect(options.maxAge).toBe(7 * 24 * 60 * 60 * 1000);
    });

    it('should provide secure cookie options for production environment', () => {
      const prevEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      const options = getAuthCookieOptions();
      expect(options.httpOnly).toBe(true);
      expect(options.secure).toBe(true);
      expect(options.sameSite).toBe('none');
      expect(options.path).toBe('/');
      process.env.NODE_ENV = prevEnv;
    });

    it('should provide valid options for clearing auth cookie upon logout', () => {
      const clearOptions = getClearCookieOptions();
      expect(clearOptions.httpOnly).toBe(true);
      expect(clearOptions.path).toBe('/');
    });
  });
});
