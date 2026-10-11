import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { Types } from 'mongoose';
import { createTestApp } from './helpers.js';
import Course from '../models/Course.js';
import AIUsage from '../models/AIUsage.js';
import Enrollment from '../models/Enrollment.js';
import { signToken, AUTH_COOKIE_NAME } from '../utils/jwt.js';

describe('Recommendation Routes (POST /api/courses/recommendations)', () => {
  const app = createTestApp();
  const studentId = '65f1a2b3c4d5e6f7a8b9c0d3';
  let studentToken: string;

  const mockCourses = [
    {
      _id: new Types.ObjectId('65f1a2b3c4d5e6f7a8b9c001'),
      title: 'AI & Systems Architecture',
      description: 'Distributed microservices and AI orchestration',
      category: 'Engineering',
      instructor: { username: 'dr_soren' },
      createdAt: new Date(),
    },
    {
      _id: new Types.ObjectId('65f1a2b3c4d5e6f7a8b9c002'),
      title: 'Advanced TypeScript Scale',
      description: 'Master advanced TypeScript compiler and patterns',
      category: 'Engineering',
      instructor: { username: 'dr_soren' },
      createdAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    studentToken = signToken({ userId: studentId, role: 'student' });

    vi.spyOn(AIUsage, 'updateOne').mockResolvedValue({} as any);
    vi.spyOn(AIUsage, 'findOneAndUpdate').mockResolvedValue({
      key: 'global',
      count: 11,
      limit: 200,
    } as any);
    vi.spyOn(AIUsage, 'findOne').mockResolvedValue({
      key: 'global',
      count: 10,
      limit: 200,
    } as any);
  });

  it('1. Returns 400 Bad Request if prompt is missing or not a string', async () => {
    const res = await request(app)
      .post('/api/courses/recommendations')
      .send({ prompt: { $ne: null } });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Prompt must be text');
  });

  it('2. Returns 400 Bad Request if prompt is shorter than 3 characters', async () => {
    const res = await request(app)
      .post('/api/courses/recommendations')
      .send({ prompt: 'hi' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Prompt must be 3-300 characters');
  });

  it('3. Successfully generates course recommendations (fallback when OpenAI key not configured in test)', async () => {
    vi.spyOn(Course, 'find').mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(mockCourses),
    } as any);

    const res = await request(app)
      .post('/api/courses/recommendations')
      .send({ prompt: 'I want to become a software engineer' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.courses).toHaveLength(2);
    expect(res.body.data.courses[0].title).toBe('AI & Systems Architecture');
  });

  it('4. Excludes active enrollments when user is authenticated with student session', async () => {
    const enrolledCourseId = new Types.ObjectId('65f1a2b3c4d5e6f7a8b9c001');

    vi.spyOn(Enrollment, 'find').mockReturnValue({
      select: vi.fn().mockResolvedValue([{ course: enrolledCourseId }]),
    } as any);

    let capturedCourseFilter: any = null;
    vi.spyOn(Course, 'find').mockImplementation((filter: any) => {
      capturedCourseFilter = filter;
      return {
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue([mockCourses[1]]),
      } as any;
    });

    const res = await request(app)
      .post('/api/courses/recommendations')
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${studentToken}`])
      .send({ prompt: 'Learn modern programming' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(capturedCourseFilter).toBeDefined();
    expect(capturedCourseFilter._id?.$nin).toBeDefined();
    expect(capturedCourseFilter._id.$nin[0].toString()).toBe(enrolledCourseId.toString());
  });

  it('5. GET /api/courses/recommendations/usage retrieves current request counter', async () => {
    vi.spyOn(AIUsage, 'findOne').mockResolvedValue({
      key: 'global',
      count: 35,
      limit: 200,
    } as any);

    const res = await request(app).get('/api/courses/recommendations/usage');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.count).toBe(35);
    expect(res.body.data.limit).toBe(200);
    expect(res.body.data.remaining).toBe(165);
  });
});
