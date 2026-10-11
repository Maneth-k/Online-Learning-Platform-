import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp, extractCookie } from './helpers.js';
import User from '../models/User.js';
import { signToken, AUTH_COOKIE_NAME } from '../utils/jwt.js';

describe('Auth Routes (authRoutes.ts HTTP Integration)', () => {
  const app = createTestApp();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new student, set HTTP-only auth cookie, and return safe user data', async () => {
      const mockCreatedUser = {
        _id: '65f1a2b3c4d5e6f7a8b9c0d1',
        username: 'new_student',
        role: 'student',
        createdAt: new Date(),
      };

      vi.spyOn(User, 'findOne').mockResolvedValue(null as any);
      vi.spyOn(User, 'create').mockResolvedValue(mockCreatedUser as any);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'new_student',
          password: 'Password123!',
          role: 'student',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.username).toBe('new_student');
      expect(res.body.data.user.role).toBe('student');
      expect(res.body.data.user.password).toBeUndefined();

      // Verify Set-Cookie header
      const cookie = extractCookie(res, AUTH_COOKIE_NAME);
      expect(cookie).toBeDefined();
      expect(cookie).toContain(`${AUTH_COOKIE_NAME}=`);

      const setCookieHeader = res.headers['set-cookie'];
      const rawCookie = Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader;
      expect(rawCookie).toContain('HttpOnly');
    });

    it('should assign instructor role when explicitly requested', async () => {
      const mockCreatedInstructor = {
        _id: '65f1a2b3c4d5e6f7a8b9c0d2',
        username: 'prof_smith',
        role: 'instructor',
        createdAt: new Date(),
      };

      vi.spyOn(User, 'findOne').mockResolvedValue(null as any);
      vi.spyOn(User, 'create').mockResolvedValue(mockCreatedInstructor as any);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'prof_smith',
          password: 'Password123!',
          role: 'instructor',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('instructor');
    });

    it('should default role to student if unknown or omitted', async () => {
      const mockCreatedUser = {
        _id: '65f1a2b3c4d5e6f7a8b9c0d3',
        username: 'regular_user',
        role: 'student',
        createdAt: new Date(),
      };

      vi.spyOn(User, 'findOne').mockResolvedValue(null as any);
      vi.spyOn(User, 'create').mockResolvedValue(mockCreatedUser as any);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'regular_user',
          password: 'Password123!',
          role: 'other_unknown_role',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('student');
    });

    it('should return 409 Conflict if username is already taken', async () => {
      vi.spyOn(User, 'findOne').mockResolvedValue({
        _id: 'existing_id',
        username: 'already_taken',
      } as any);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'already_taken',
          password: 'Password123!',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Username is already taken');
    });

    it('should return 400 if username is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          password: 'Password123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Username is required');
    });

    it('should return 400 if username is shorter than 3 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'ab',
          password: 'Password123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('at least 3 characters');
    });

    it('should return 400 if password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'valid_user',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Password is required');
    });

    it('should return 400 if password is shorter than 6 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'valid_user',
          password: '123',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('at least 6 characters');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate user with valid credentials and return auth cookie', async () => {
      const mockUser = {
        _id: '65f1a2b3c4d5e6f7a8b9c0d1',
        username: 'existing_student',
        role: 'student',
        createdAt: new Date(),
        comparePassword: vi.fn().mockResolvedValue(true),
      };

      vi.spyOn(User, 'findOne').mockResolvedValue(mockUser as any);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'existing_student',
          password: 'CorrectPassword123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.username).toBe('existing_student');

      const cookie = extractCookie(res, AUTH_COOKIE_NAME);
      expect(cookie).toBeDefined();
    });

    it('should return 401 when username is not found', async () => {
      vi.spyOn(User, 'findOne').mockResolvedValue(null as any);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent_user',
          password: 'Password123!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid username or password');
    });

    it('should return 401 when password does not match', async () => {
      const mockUser = {
        _id: '65f1a2b3c4d5e6f7a8b9c0d1',
        username: 'existing_student',
        comparePassword: vi.fn().mockResolvedValue(false),
      };

      vi.spyOn(User, 'findOne').mockResolvedValue(mockUser as any);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'existing_student',
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid username or password');
    });

    it('should return 400 when username or password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'someone',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Username and password are required');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear the authentication cookie and return 200', async () => {
      const res = await request(app)
        .post('/api/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Logged out successfully');

      const setCookie = res.headers['set-cookie'];
      expect(setCookie).toBeDefined();
      const rawCookie = Array.isArray(setCookie) ? setCookie[0] : setCookie;
      expect(rawCookie).toContain(`${AUTH_COOKIE_NAME}=;`);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user profile when valid cookie is provided', async () => {
      const userId = '65f1a2b3c4d5e6f7a8b9c0d1';
      const token = signToken({ userId, role: 'student' });

      const mockUser = {
        _id: userId,
        username: 'my_account',
        role: 'student',
        createdAt: new Date(),
      };

      vi.spyOn(User, 'findById').mockResolvedValue(mockUser as any);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', `${AUTH_COOKIE_NAME}=${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.username).toBe('my_account');
      expect(res.body.data.user.role).toBe('student');
    });

    it('should return 401 when unauthenticated (no cookie or header)', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 if authenticated user is no longer in database', async () => {
      const userId = '65f1a2b3c4d5e6f7a8b9c0d9';
      const token = signToken({ userId, role: 'student' });

      vi.spyOn(User, 'findById').mockResolvedValue(null as any);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', `${AUTH_COOKIE_NAME}=${token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
    });
  });
});
