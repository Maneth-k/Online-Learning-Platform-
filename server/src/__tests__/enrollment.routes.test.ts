import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp } from './helpers.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { signToken, AUTH_COOKIE_NAME } from '../utils/jwt.js';

describe('Enrollment Routes (enrollmentRoutes.ts HTTP Integration)', () => {
  const app = createTestApp();

  const instructorId = '65f1a2b3c4d5e6f7a8b9c0d1';
  const otherInstructorId = '65f1a2b3c4d5e6f7a8b9c0d2';
  const studentId = '65f1a2b3c4d5e6f7a8b9c0d3';
  const otherStudentId = '65f1a2b3c4d5e6f7a8b9c0d4';
  const validCourseId = '65f1a2b3c4d5e6f7a8b9c0e1';
  const validEnrollmentId = '65f1a2b3c4d5e6f7a8b9c0f1';

  let instructorToken: string;
  let otherInstructorToken: string;
  let studentToken: string;
  let otherStudentToken: string;

  beforeEach(() => {
    vi.restoreAllMocks();
    instructorToken = signToken({ userId: instructorId, role: 'instructor' });
    otherInstructorToken = signToken({ userId: otherInstructorId, role: 'instructor' });
    studentToken = signToken({ userId: studentId, role: 'student' });
    otherStudentToken = signToken({ userId: otherStudentId, role: 'student' });
  });

  // ==========================================
  // POST /api/enrollments (Enroll in course)
  // ==========================================
  describe('POST /api/enrollments', () => {
    it('1. Student enrolls in valid course -> 201 Created', async () => {
      const mockCourse = {
        _id: validCourseId,
        title: 'Mastering TypeScript',
      };
      const mockEnrollment = {
        _id: validEnrollmentId,
        student: studentId,
        course: validCourseId,
        status: 'enrolled',
        enrollmentDate: new Date(),
      };

      vi.spyOn(Course, 'findById').mockResolvedValue(mockCourse as any);
      vi.spyOn(Enrollment, 'create').mockResolvedValue(mockEnrollment as any);
      vi.spyOn(Enrollment, 'findById').mockReturnValue({
        populate: vi.fn().mockReturnValue({
          populate: vi.fn().mockResolvedValue(mockEnrollment),
        }),
      } as any);

      const res = await request(app)
        .post('/api/enrollments')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${studentToken}`])
        .send({ courseId: validCourseId });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Successfully enrolled in course');
      expect(res.body.data.enrollment._id).toBe(validEnrollmentId);
    });

    it('2. Student enrolls twice in same course -> 409 Conflict', async () => {
      const mockCourse = {
        _id: validCourseId,
        title: 'Mastering TypeScript',
      };

      vi.spyOn(Course, 'findById').mockResolvedValue(mockCourse as any);
      const duplicateError: any = new Error('E11000 duplicate key error collection: enrollments index: student_1_course_1 dup key');
      duplicateError.code = 11000;
      duplicateError.name = 'MongoServerError';
      vi.spyOn(Enrollment, 'create').mockRejectedValue(duplicateError);

      const res = await request(app)
        .post('/api/enrollments')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${studentToken}`])
        .send({ courseId: validCourseId });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already enrolled/i);
    });

    it('3. Instructor tries to enroll -> 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/enrollments')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${instructorToken}`])
        .send({ courseId: validCourseId });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('4. Enroll in non-existent course -> 404 Not Found', async () => {
      vi.spyOn(Course, 'findById').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/enrollments')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${studentToken}`])
        .send({ courseId: validCourseId });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/course not found/i);
    });

    it('5. Enroll with malformed courseId -> 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/enrollments')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${studentToken}`])
        .send({ courseId: 'invalid-id' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/valid course id is required/i);
    });

    it('6. Unauthenticated enrollment attempt -> 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/enrollments')
        .send({ courseId: validCourseId });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // GET /api/enrollments/me (Student's enrollments)
  // ==========================================
  describe('GET /api/enrollments/me', () => {
    it('7. Student retrieves their enrollments -> 200 OK', async () => {
      const mockEnrollments = [
        {
          _id: validEnrollmentId,
          course: { title: 'TypeScript Mastery', description: 'Advanced TS' },
          status: 'enrolled',
          enrollmentDate: new Date(),
        },
      ];

      vi.spyOn(Enrollment, 'find').mockReturnValue({
        populate: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            skip: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue(mockEnrollments),
            }),
          }),
        }),
      } as any);

      vi.spyOn(Enrollment, 'countDocuments').mockResolvedValue(1);

      const res = await request(app)
        .get('/api/enrollments/me')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${studentToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.enrollments).toHaveLength(1);
      expect(res.body.data.pagination.totalEnrollments).toBe(1);
    });

    it('8. Student filters by status -> 200 OK', async () => {
      vi.spyOn(Enrollment, 'find').mockReturnValue({
        populate: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            skip: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as any);

      vi.spyOn(Enrollment, 'countDocuments').mockResolvedValue(0);

      const res = await request(app)
        .get('/api/enrollments/me?status=completed')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${studentToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('9. Invalid status filter -> 400 Bad Request', async () => {
      const res = await request(app)
        .get('/api/enrollments/me?status=unknown_status')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${studentToken}`]);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid status filter/i);
    });

    it('10. Instructor tries to access student me route -> 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/enrollments/me')
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${instructorToken}`]);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // GET /api/enrollments/course/:courseId (Course student list)
  // ==========================================
  describe('GET /api/enrollments/course/:courseId', () => {
    it('11. Instructor views enrolled students in own course -> 200 OK', async () => {
      const mockCourse = {
        _id: validCourseId,
        title: 'Mastering TypeScript',
        instructor: { toString: () => instructorId },
      };

      const mockEnrollments = [
        {
          _id: validEnrollmentId,
          student: { username: 'student1', role: 'student' },
          status: 'enrolled',
        },
      ];

      vi.spyOn(Course, 'findById').mockResolvedValue(mockCourse as any);
      vi.spyOn(Enrollment, 'find').mockReturnValue({
        populate: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            skip: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue(mockEnrollments),
            }),
          }),
        }),
      } as any);
      vi.spyOn(Enrollment, 'countDocuments').mockResolvedValue(1);

      const res = await request(app)
        .get(`/api/enrollments/course/${validCourseId}`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${instructorToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.enrollments).toHaveLength(1);
      expect(res.body.data.course.title).toBe('Mastering TypeScript');
    });

    it('12. Instructor checks non-existent course -> 404 Not Found', async () => {
      vi.spyOn(Course, 'findById').mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/enrollments/course/${validCourseId}`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${instructorToken}`]);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/course not found/i);
    });

    it('13. Different instructor checks another instructor course -> 403 Forbidden', async () => {
      const mockCourse = {
        _id: validCourseId,
        title: 'Mastering TypeScript',
        instructor: { toString: () => instructorId },
      };

      vi.spyOn(Course, 'findById').mockResolvedValue(mockCourse as any);

      const res = await request(app)
        .get(`/api/enrollments/course/${validCourseId}`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${otherInstructorToken}`]);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/do not have permission/i);
    });

    it('14. Student attempts to access instructor course endpoint -> 403 Forbidden', async () => {
      const res = await request(app)
        .get(`/api/enrollments/course/${validCourseId}`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${studentToken}`]);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // PATCH /api/enrollments/:id/status (Status transition)
  // ==========================================
  describe('PATCH /api/enrollments/:id/status', () => {
    it('15. Student drops own enrollment -> 200 OK', async () => {
      const mockEnrollment = {
        _id: validEnrollmentId,
        student: { toString: () => studentId },
        course: { instructor: instructorId },
        status: 'enrolled',
        save: vi.fn().mockImplementation(function (this: any) {
          return Promise.resolve(this);
        }),
      };

      vi.spyOn(Enrollment, 'findById').mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockEnrollment),
      } as any);

      const res = await request(app)
        .patch(`/api/enrollments/${validEnrollmentId}/status`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${studentToken}`])
        .send({ status: 'dropped' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.enrollment.status).toBe('dropped');
      expect(mockEnrollment.save).toHaveBeenCalled();
    });

    it('16. Student tries to mark course completed -> 403 Forbidden', async () => {
      const mockEnrollment = {
        _id: validEnrollmentId,
        student: { toString: () => studentId },
        course: { instructor: instructorId },
        status: 'enrolled',
      };

      vi.spyOn(Enrollment, 'findById').mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockEnrollment),
      } as any);

      const res = await request(app)
        .patch(`/api/enrollments/${validEnrollmentId}/status`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${studentToken}`])
        .send({ status: 'completed' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/only change their enrollment status to dropped/i);
    });

    it('17. Instructor marks student completed -> 200 OK (completedAt set)', async () => {
      const mockEnrollment = {
        _id: validEnrollmentId,
        student: { toString: () => studentId },
        course: { instructor: { toString: () => instructorId } },
        status: 'enrolled',
        completedAt: null,
        save: vi.fn().mockImplementation(function (this: any) {
          return Promise.resolve(this);
        }),
      };

      vi.spyOn(Enrollment, 'findById').mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockEnrollment),
      } as any);

      const res = await request(app)
        .patch(`/api/enrollments/${validEnrollmentId}/status`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${instructorToken}`])
        .send({ status: 'completed' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.enrollment.status).toBe('completed');
      expect(res.body.data.enrollment.completedAt).not.toBeNull();
    });

    it('18. Instructor tries to update status for another instructors course -> 403 Forbidden', async () => {
      const mockEnrollment = {
        _id: validEnrollmentId,
        student: { toString: () => studentId },
        course: { instructor: { toString: () => otherInstructorId } },
        status: 'enrolled',
      };

      vi.spyOn(Enrollment, 'findById').mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockEnrollment),
      } as any);

      const res = await request(app)
        .patch(`/api/enrollments/${validEnrollmentId}/status`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${instructorToken}`])
        .send({ status: 'completed' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/do not have permission/i);
    });
  });

  // ==========================================
  // DELETE /api/enrollments/:id (Unenroll)
  // ==========================================
  describe('DELETE /api/enrollments/:id', () => {
    it('19. Student unenrolls successfully -> 200 OK', async () => {
      const mockEnrollment = {
        _id: validEnrollmentId,
        student: { toString: () => studentId },
        status: 'enrolled',
      };

      vi.spyOn(Enrollment, 'findById').mockResolvedValue(mockEnrollment as any);
      const deleteSpy = vi.spyOn(Enrollment, 'findByIdAndDelete').mockResolvedValue(mockEnrollment as any);

      const res = await request(app)
        .delete(`/api/enrollments/${validEnrollmentId}`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${studentToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/unenrolled successfully/i);
      expect(deleteSpy).toHaveBeenCalledWith(validEnrollmentId);
    });

    it('20. Student cannot delete completed enrollment -> 400 Bad Request', async () => {
      const mockEnrollment = {
        _id: validEnrollmentId,
        student: { toString: () => studentId },
        status: 'completed',
      };

      vi.spyOn(Enrollment, 'findById').mockResolvedValue(mockEnrollment as any);

      const res = await request(app)
        .delete(`/api/enrollments/${validEnrollmentId}`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${studentToken}`]);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/cannot delete a completed enrollment/i);
    });

    it('21. Student cannot delete another students enrollment -> 403 Forbidden', async () => {
      const mockEnrollment = {
        _id: validEnrollmentId,
        student: { toString: () => otherStudentId },
        status: 'enrolled',
      };

      vi.spyOn(Enrollment, 'findById').mockResolvedValue(mockEnrollment as any);

      const res = await request(app)
        .delete(`/api/enrollments/${validEnrollmentId}`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${studentToken}`]);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/can only unenroll yourself/i);
    });
  });

  // ==========================================
  // GET /api/enrollments/check/:courseId
  // ==========================================
  describe('GET /api/enrollments/check/:courseId', () => {
    it('22. Checks enrollment and returns true if active -> 200 OK', async () => {
      const mockEnrollment = {
        _id: validEnrollmentId,
        student: studentId,
        course: validCourseId,
        status: 'enrolled',
      };

      vi.spyOn(Enrollment, 'findOne').mockResolvedValue(mockEnrollment as any);

      const res = await request(app)
        .get(`/api/enrollments/check/${validCourseId}`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${studentToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isEnrolled).toBe(true);
    });

    it('23. Checks enrollment and returns false if dropped -> 200 OK', async () => {
      const mockEnrollment = {
        _id: validEnrollmentId,
        student: studentId,
        course: validCourseId,
        status: 'dropped',
      };

      vi.spyOn(Enrollment, 'findOne').mockResolvedValue(mockEnrollment as any);

      const res = await request(app)
        .get(`/api/enrollments/check/${validCourseId}`)
        .set('Cookie', [`${AUTH_COOKIE_NAME}=${studentToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isEnrolled).toBe(false);
    });
  });
});
