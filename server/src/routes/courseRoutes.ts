import { Router } from 'express';
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Instructor-only routes
router.post('/', authenticate, authorizeRoles('instructor'), createCourse);
router.put('/:id', authenticate, authorizeRoles('instructor'), updateCourse);
router.delete('/:id', authenticate, authorizeRoles('instructor'), deleteCourse);

export default router;
