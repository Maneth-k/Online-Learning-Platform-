import { describe, it, expect, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { signToken, AUTH_COOKIE_NAME, type TokenPayload } from '../utils/jwt.js';

describe('Auth Middleware (auth.ts)', () => {
  const createMockReqRes = (overrides?: Partial<Request>) => {
    const req = {
      cookies: {},
      headers: {},
      ...overrides,
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const next = vi.fn() as NextFunction;

    return { req, res, next };
  };

  const samplePayload: TokenPayload = {
    userId: '65f1a2b3c4d5e6f7a8b9c0d1',
    role: 'student',
  };

  describe('authenticate middleware', () => {
    it('should authenticate successfully with a valid cookie', () => {
      const validToken = signToken(samplePayload);
      const { req, res, next } = createMockReqRes({
        cookies: {
          [AUTH_COOKIE_NAME]: validToken,
        },
      });

      authenticate(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.user).toBeDefined();
      expect(req.user?.userId).toBe(samplePayload.userId);
      expect(req.user?.role).toBe(samplePayload.role);
    });

    it('should authenticate successfully with Authorization Bearer header as fallback', () => {
      const validToken = signToken(samplePayload);
      const { req, res, next } = createMockReqRes({
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      });

      authenticate(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.user?.userId).toBe(samplePayload.userId);
    });

    it('should return 401 when no cookie and no Authorization header are provided', () => {
      const { req, res, next } = createMockReqRes();

      authenticate(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Authentication required'),
        })
      );
    });

    it('should return 401 when an invalid/tampered token is provided', () => {
      const { req, res, next } = createMockReqRes({
        cookies: {
          [AUTH_COOKIE_NAME]: 'invalid.token.signature',
        },
      });

      authenticate(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Invalid or expired authentication session'),
        })
      );
    });

    it('should prioritize cookie over header if both are present', () => {
      const cookiePayload: TokenPayload = { userId: 'cookie_user_1', role: 'student' };
      const headerPayload: TokenPayload = { userId: 'header_user_2', role: 'instructor' };

      const cookieToken = signToken(cookiePayload);
      const headerToken = signToken(headerPayload);

      const { req, res, next } = createMockReqRes({
        cookies: {
          [AUTH_COOKIE_NAME]: cookieToken,
        },
        headers: {
          authorization: `Bearer ${headerToken}`,
        },
      });

      authenticate(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.user?.userId).toBe(cookiePayload.userId);
    });
  });

  describe('authorizeRoles middleware', () => {
    it('should allow access if user possesses the required role', () => {
      const { req, res, next } = createMockReqRes();
      req.user = { userId: 'user_123', role: 'instructor' };

      const guard = authorizeRoles('instructor');
      guard(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow access if user has one of several allowed roles', () => {
      const { req, res, next } = createMockReqRes();
      req.user = { userId: 'user_123', role: 'student' };

      const guard = authorizeRoles('student', 'instructor');
      guard(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should return 403 Forbidden if user lacks required role', () => {
      const { req, res, next } = createMockReqRes();
      req.user = { userId: 'student_123', role: 'student' };

      const guard = authorizeRoles('instructor');
      guard(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Forbidden: Access requires'),
        })
      );
    });

    it('should return 401 if req.user is missing when checking roles', () => {
      const { req, res, next } = createMockReqRes();
      // req.user is undefined

      const guard = authorizeRoles('instructor');
      guard(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
