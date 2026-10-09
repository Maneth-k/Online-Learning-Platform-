import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp } from './helpers.js';
import Course from '../models/Course.js';
import { signToken, AUTH_COOKIE_NAME } from '../utils/jwt.js';

describe('Course Routes (courseRoutes.ts HTTP Integration)', () => {
  const app = createTestApp();

  const instructorId = '65f1a2b3c4d5e6f7a8b9c0d1';
  const otherInstructorId = '65f1a2b3c4d5e6f7a8b9c0d2';
  const studentId = '65f1a2b3c4d5e6f7a8b9c0d3';
  const validCourseId = '65f1a2b3c4d5e6f7a8b9c0e1';

  let instructorToken: string;
  let otherInstructorToken: string;
  let studentToken: string;

  beforeEach(() => {
    vi.restoreAllMocks();
    instructorToken = signToken({ userId: instructorId, role: 'instructor' });
    otherInstructorToken = signToken({ userId: otherInstructorId, role: 'instructor' });
    studentToken = signToken({ userId: studentId, role: 'student' });
  });

  // ==========================================
  // POST /api/courses (Create)
  // ==========================================
  describe('POST /api/courses', () => {
    it('1. Instructor creates a valid course', async () => {
      const mockCreatedCourse = {
        _id: validCourseId,
        title: 'TypeScript Mastery',
        description: 'Advanced TypeScript programming',
        content: 'Course modules and exercises',
        instructor: instructorId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(Course, 'create').mockResolvedValue(mockCreatedCourse as any);

      const res = await request(app)
        .post('/api/courses')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${instructorToken}`])
        .send({
          title: 'TypeScript Mastery',
          description: 'Advanced TypeScript programming',
          content: 'Course modules and exercises',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Course created successfully');
      expect(res.body.data.course.title).toBe('TypeScript Mastery');
      expect(res.body.data.course.instructor).toBe(instructorId);
    });

    it('2. Missing title -> 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${instructorToken}`])
        .send({
          description: 'Valid description',
          content: 'Valid content',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/title is required/i);
    });

    it('3. Title exceeds 200 characters -> 400 Bad Request', async () => {
      const longTitle = 'a'.repeat(201);

      const res = await request(app)
        .post('/api/courses')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${instructorToken}`])
        .send({
          title: longTitle,
          description: 'Valid description',
          content: 'Valid content',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/cannot exceed 200 characters/i);
    });

    it('4. Missing description -> 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${instructorToken}`])
        .send({
          title: 'Valid title',
          content: 'Valid content',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/description is required/i);
    });

    it('5. Missing content -> 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${instructorToken}`])
        .send({
          title: 'Valid title',
          description: 'Valid description',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/content is required/i);
    });

    it('6. Student attempts to create -> 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${studentToken}`])
        .send({
          title: 'Student Attempt Course',
          description: 'Trying to create',
          content: 'Some content',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/forbidden/i);
    });

    it('7. Unauthenticated attempt -> 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/courses')
        .send({
          title: 'Unauthenticated Course',
          description: 'No auth',
          content: 'Some content',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/authentication required/i);
    });

    it('8. Client sends instructor in body -> ignored, token userId used', async () => {
      const mockCreatedCourse = {
        _id: validCourseId,
        title: 'Secure Course',
        description: 'Secure description',
        content: 'Secure content',
        instructor: instructorId,
      };

      const createSpy = vi.spyOn(Course, 'create').mockResolvedValue(mockCreatedCourse as any);

      const res = await request(app)
        .post('/api/courses')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${instructorToken}`])
        .send({
          title: 'Secure Course',
          description: 'Secure description',
          content: 'Secure content',
          instructor: 'malicious_instructor_id',
        });

      expect(res.status).toBe(201);
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          instructor: instructorId,
        })
      );
    });
  });

  // ==========================================
  // GET /api/courses (List)
  // ==========================================
  describe('GET /api/courses', () => {
    it('9. Returns all courses', async () => {
      const mockCourses = [
        {
          _id: validCourseId,
          title: 'Course 1',
          description: 'Description 1',
          content: 'Content 1',
          instructor: { _id: instructorId, username: 'prof_john' },
        },
      ];

      const mockQuery = {
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockResolvedValue(mockCourses),
      };
      vi.spyOn(Course, 'find').mockReturnValue(mockQuery as any);

      const res = await request(app).get('/api/courses');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.courses).toHaveLength(1);
      expect(res.body.data.courses[0].title).toBe('Course 1');
    });

    it('10. Returns empty array if no courses exist', async () => {
      const mockQuery = {
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockResolvedValue([]),
      };
      vi.spyOn(Course, 'find').mockReturnValue(mockQuery as any);

      const res = await request(app).get('/api/courses');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.courses).toEqual([]);
    });

    it('11. Works without authentication (public access)', async () => {
      const mockQuery = {
        populate: vi.fn().mockReturnThis(),
        sort: vi.fn().mockResolvedValue([]),
      };
      vi.spyOn(Course, 'find').mockReturnValue(mockQuery as any);

      const res = await request(app).get('/api/courses');
      expect(res.status).toBe(200);
    });
  });

  // ==========================================
  // GET /api/courses/:id (Detail)
  // ==========================================
  describe('GET /api/courses/:id', () => {
    it('12. Returns course by valid ID', async () => {
      const mockCourse = {
        _id: validCourseId,
        title: 'Single Course',
        description: 'Single description',
        content: 'Single content',
        instructor: { _id: instructorId, username: 'prof_john' },
      };

      const mockQuery = {
        populate: vi.fn().mockResolvedValue(mockCourse),
      };
      vi.spyOn(Course, 'findById').mockReturnValue(mockQuery as any);

      const res = await request(app).get(`/api/courses/${validCourseId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.course.title).toBe('Single Course');
    });

    it('13. Course ID does not exist -> 404 Not Found', async () => {
      const mockQuery = {
        populate: vi.fn().mockResolvedValue(null),
      };
      vi.spyOn(Course, 'findById').mockReturnValue(mockQuery as any);

      const res = await request(app).get(`/api/courses/${validCourseId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not found/i);
    });

    it('14. Malformed ObjectId -> 400 Bad Request', async () => {
      const res = await request(app).get('/api/courses/not-a-valid-id');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid course id format/i);
    });

    it('15. Works without authentication (public access)', async () => {
      const mockQuery = {
        populate: vi.fn().mockResolvedValue({ _id: validCourseId, title: 'Public Course' }),
      };
      vi.spyOn(Course, 'findById').mockReturnValue(mockQuery as any);

      const res = await request(app).get(`/api/courses/${validCourseId}`);
      expect(res.status).toBe(200);
    });
  });

  // ==========================================
  // PUT /api/courses/:id (Update)
  // ==========================================
  describe('PUT /api/courses/:id', () => {
    it('16. Owner updates own course successfully', async () => {
      const existingCourse = {
        _id: validCourseId,
        title: 'Old Title',
        description: 'Old Description',
        content: 'Old Content',
        instructor: { toString: () => instructorId },
        save: vi.fn().mockResolvedValue({
          _id: validCourseId,
          title: 'New Title',
          description: 'New Description',
          content: 'New Content',
          instructor: instructorId,
        }),
      };

      vi.spyOn(Course, 'findById').mockResolvedValue(existingCourse as any);

      const res = await request(app)
        .put(`/api/courses/${validCourseId}`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${instructorToken}`])
        .send({
          title: 'New Title',
          description: 'New Description',
          content: 'New Content',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Course updated successfully');
      expect(existingCourse.title).toBe('New Title');
      expect(existingCourse.description).toBe('New Description');
      expect(existingCourse.content).toBe('New Content');
    });

    it('17. Partial update (only title updated)', async () => {
      const existingCourse = {
        _id: validCourseId,
        title: 'Old Title',
        description: 'Unchanged Description',
        content: 'Unchanged Content',
        instructor: { toString: () => instructorId },
        save: vi.fn().mockResolvedValue({
          _id: validCourseId,
          title: 'Only Title Changed',
          description: 'Unchanged Description',
          content: 'Unchanged Content',
          instructor: instructorId,
        }),
      };

      vi.spyOn(Course, 'findById').mockResolvedValue(existingCourse as any);

      const res = await request(app)
        .put(`/api/courses/${validCourseId}`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${instructorToken}`])
        .send({
          title: 'Only Title Changed',
        });

      expect(res.status).toBe(200);
      expect(existingCourse.title).toBe('Only Title Changed');
      expect(existingCourse.description).toBe('Unchanged Description');
    });

    it('18. Course not found -> 404', async () => {
      vi.spyOn(Course, 'findById').mockResolvedValue(null);

      const res = await request(app)
        .put(`/api/courses/${validCourseId}`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${instructorToken}`])
        .send({
          title: 'New Title',
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not found/i);
    });

    it('19. Malformed ObjectId -> 400', async () => {
      const res = await request(app)
        .put('/api/courses/invalid-id')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${instructorToken}`])
        .send({
          title: 'New Title',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid course id format/i);
    });

    it('20. Different instructor attempts update -> 403 Forbidden (ownership)', async () => {
      const existingCourse = {
        _id: validCourseId,
        title: 'Instructor 1 Course',
        instructor: { toString: () => instructorId },
      };

      vi.spyOn(Course, 'findById').mockResolvedValue(existingCourse as any);

      const res = await request(app)
        .put(`/api/courses/${validCourseId}`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${otherInstructorToken}`])
        .send({
          title: 'Hijack Attempt',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/do not have permission/i);
    });

    it('21. Student attempts update -> 403 Forbidden (role)', async () => {
      const res = await request(app)
        .put(`/api/courses/${validCourseId}`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${studentToken}`])
        .send({
          title: 'Student Update Attempt',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/forbidden/i);
    });

    it('22. Unauthenticated attempt -> 401 Unauthorized', async () => {
      const res = await request(app)
        .put(`/api/courses/${validCourseId}`)
        .send({
          title: 'Unauth Update',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/authentication required/i);
    });

    it('23. Title exceeds 200 characters on update -> 400 Bad Request', async () => {
      const existingCourse = {
        _id: validCourseId,
        title: 'Original Title',
        instructor: { toString: () => instructorId },
      };

      vi.spyOn(Course, 'findById').mockResolvedValue(existingCourse as any);

      const res = await request(app)
        .put(`/api/courses/${validCourseId}`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${instructorToken}`])
        .send({
          title: 'a'.repeat(201),
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/cannot exceed 200 characters/i);
    });

    it('24. Empty body -> 400 Bad Request', async () => {
      const existingCourse = {
        _id: validCourseId,
        title: 'Original Title',
        instructor: { toString: () => instructorId },
      };

      vi.spyOn(Course, 'findById').mockResolvedValue(existingCourse as any);

      const res = await request(app)
        .put(`/api/courses/${validCourseId}`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${instructorToken}`])
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/at least one field/i);
    });

    it('25. Client tries to change instructor -> ignored, ownership retained', async () => {
      const existingCourse = {
        _id: validCourseId,
        title: 'Original Title',
        description: 'Original Description',
        content: 'Original Content',
        instructor: { toString: () => instructorId },
        save: vi.fn().mockImplementation(function (this: any) {
          return Promise.resolve(this);
        }),
      };

      vi.spyOn(Course, 'findById').mockResolvedValue(existingCourse as any);

      const res = await request(app)
        .put(`/api/courses/${validCourseId}`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${instructorToken}`])
        .send({
          title: 'Updated Title',
          instructor: 'new_rogue_instructor',
        });

      expect(res.status).toBe(200);
      expect(existingCourse.instructor.toString()).toBe(instructorId);
    });
  });

  // ==========================================
  // DELETE /api/courses/:id (Delete)
  // ==========================================
  describe('DELETE /api/courses/:id', () => {
    it('26. Owner deletes own course successfully', async () => {
      const existingCourse = {
        _id: validCourseId,
        instructor: { toString: () => instructorId },
      };

      vi.spyOn(Course, 'findById').mockResolvedValue(existingCourse as any);
      const deleteSpy = vi.spyOn(Course, 'findByIdAndDelete').mockResolvedValue(existingCourse as any);

      const res = await request(app)
        .delete(`/api/courses/${validCourseId}`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${instructorToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Course deleted successfully');
      expect(deleteSpy).toHaveBeenCalledWith(validCourseId);
    });

    it('27. Course not found -> 404', async () => {
      vi.spyOn(Course, 'findById').mockResolvedValue(null);

      const res = await request(app)
        .delete(`/api/courses/${validCourseId}`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${instructorToken}`]);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not found/i);
    });

    it('28. Malformed ObjectId -> 400', async () => {
      const res = await request(app)
        .delete('/api/courses/not-valid-id')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${instructorToken}`]);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid course id format/i);
    });

    it('29. Different instructor attempts delete -> 403 Forbidden (ownership)', async () => {
      const existingCourse = {
        _id: validCourseId,
        instructor: { toString: () => instructorId },
      };

      vi.spyOn(Course, 'findById').mockResolvedValue(existingCourse as any);

      const res = await request(app)
        .delete(`/api/courses/${validCourseId}`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${otherInstructorToken}`]);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/do not have permission/i);
    });

    it('30. Student attempts delete -> 403 Forbidden (role)', async () => {
      const res = await request(app)
        .delete(`/api/courses/${validCourseId}`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${studentToken}`]);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/forbidden/i);
    });

    it('31. Unauthenticated attempt -> 401 Unauthorized', async () => {
      const res = await request(app).delete(`/api/courses/${validCourseId}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/authentication required/i);
    });
  });
});
