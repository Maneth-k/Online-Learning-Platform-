import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp } from './helpers.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

describe('Instructor Routes (instructorRoutes.ts HTTP Integration)', () => {
  const app = createTestApp();

  const instructor1Id = '65f1a2b3c4d5e6f7a8b9c0d1';
  const instructor2Id = '65f1a2b3c4d5e6f7a8b9c0d2';
  const course1Id = '65f1a2b3c4d5e6f7a8b9c0e1';

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================
  // GET /api/instructors (List & Filter)
  // ==========================================
  describe('GET /api/instructors', () => {
    it('1. Retrieves list of instructors successfully with pagination', async () => {
      const mockInstructors = [
        {
          _id: { toString: () => instructor1Id },
          username: 'dr_soren_vance',
          role: 'instructor',
          createdAt: new Date(),
        },
      ];

      vi.spyOn(User, 'find').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockInstructors),
      } as any);

      vi.spyOn(User, 'countDocuments').mockResolvedValue(1);

      vi.spyOn(Course, 'find').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([
          {
            _id: { toString: () => course1Id },
            title: 'AI & Full-Stack Systems Architecture',
            category: 'Engineering',
            description: 'Advanced full stack systems',
            instructor: { toString: () => instructor1Id },
          },
        ]),
      } as any);

      vi.spyOn(Enrollment, 'find').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([
          {
            course: { toString: () => course1Id },
          },
        ]),
      } as any);

      const res = await request(app).get('/api/instructors');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Instructors retrieved successfully');
      expect(Array.isArray(res.body.data.instructors)).toBe(true);
      expect(res.body.data.instructors.length).toBe(1);
      expect(res.body.data.instructors[0].username).toBe('dr_soren_vance');
      expect(res.body.data.instructors[0].coursesCount).toBe(1);
      expect(res.body.data.instructors[0].categories).toContain('Engineering');
      expect(res.body.data.instructors[0].totalStudents).toBe(1);
      expect(res.body.data.pagination).toEqual({
        page: 1,
        limit: 12,
        totalInstructors: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      });
    });

    it('2. Filters instructors by search query string', async () => {
      vi.spyOn(Course, 'find').mockReturnValue({
        distinct: vi.fn().mockResolvedValue([instructor1Id]),
        select: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      vi.spyOn(User, 'find').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            _id: { toString: () => instructor1Id },
            username: 'elena_rostova',
            role: 'instructor',
          },
        ]),
      } as any);

      vi.spyOn(User, 'countDocuments').mockResolvedValue(1);
      vi.spyOn(Enrollment, 'find').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      const res = await request(app).get('/api/instructors?q=elena');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.instructors[0].username).toBe('elena_rostova');
    });

    it('3. Filters instructors by category', async () => {
      vi.spyOn(Course, 'find').mockReturnValue({
        distinct: vi.fn().mockResolvedValue([instructor2Id]),
        select: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      vi.spyOn(User, 'find').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            _id: { toString: () => instructor2Id },
            username: 'aris_thorne',
            role: 'instructor',
          },
        ]),
      } as any);

      vi.spyOn(User, 'countDocuments').mockResolvedValue(1);
      vi.spyOn(Enrollment, 'find').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([]),
      } as any);

      const res = await request(app).get('/api/instructors?category=Data%20%26%20ML');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.instructors[0].username).toBe('aris_thorne');
    });

    it('4. Handles server error gracefully (500)', async () => {
      vi.spyOn(User, 'find').mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const res = await request(app).get('/api/instructors');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Failed to retrieve instructors');
    });
  });

  // ==========================================
  // GET /api/instructors/:id
  // ==========================================
  describe('GET /api/instructors/:id', () => {
    it('5. Returns 400 Bad Request for invalid instructor ID', async () => {
      const res = await request(app).get('/api/instructors/invalid-id-format');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid instructor id format/i);
    });

    it('6. Returns 404 Not Found when instructor does not exist', async () => {
      vi.spyOn(User, 'findOne').mockReturnValue({
        select: vi.fn().mockResolvedValue(null),
      } as any);

      const res = await request(app).get(`/api/instructors/${instructor1Id}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/instructor not found/i);
    });

    it('7. Returns instructor details with courses and stats', async () => {
      vi.spyOn(User, 'findOne').mockReturnValue({
        select: vi.fn().mockResolvedValue({
          _id: { toString: () => instructor1Id },
          username: 'kavita_sharma',
          role: 'instructor',
          createdAt: new Date(),
        }),
      } as any);

      vi.spyOn(Course, 'find').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([
          {
            _id: { toString: () => course1Id },
            title: 'Cloud DevOps',
            category: 'Infrastructure',
            description: 'DevOps practices',
            instructor: instructor1Id,
          },
        ]),
      } as any);

      vi.spyOn(Enrollment, 'countDocuments').mockResolvedValue(42);

      const res = await request(app).get(`/api/instructors/${instructor1Id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.instructor.username).toBe('kavita_sharma');
      expect(res.body.data.instructor.coursesCount).toBe(1);
      expect(res.body.data.instructor.totalStudents).toBe(42);
      expect(res.body.data.instructor.courses[0].title).toBe('Cloud DevOps');
    });

    it('8. Handles server error on get by ID (500)', async () => {
      vi.spyOn(User, 'findOne').mockImplementation(() => {
        throw new Error('Database crash');
      });

      const res = await request(app).get(`/api/instructors/${instructor1Id}`);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Failed to retrieve instructor details');
    });
  });
});
