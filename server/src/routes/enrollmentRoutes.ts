import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import {
  enrollStudent,
  getMyEnrollments,
  getCourseStudents,
  updateEnrollmentStatus,
  unenroll,
  checkEnrollment,
} from '../controllers/enrollmentController.js';

const router = Router();

// Student-only routes
router.post('/', authenticate, authorizeRoles('student'), enrollStudent);
router.get('/me', authenticate, authorizeRoles('student'), getMyEnrollments);
router.delete('/:id', authenticate, authorizeRoles('student'), unenroll);

// Instructor-only routes
router.get('/course/:courseId', authenticate, authorizeRoles('instructor'), getCourseStudents);

// Authenticated routes (students & instructors with granular permission checks)
router.patch('/:id/status', authenticate, updateEnrollmentStatus);
router.get('/check/:courseId', authenticate, checkEnrollment);

export default router;
