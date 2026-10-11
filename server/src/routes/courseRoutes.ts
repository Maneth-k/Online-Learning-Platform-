import { Router } from 'express';
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController.js';
import {
  getCourseRecommendationsHandler,
  getAIUsageStatusHandler,
} from '../controllers/recommendationController.js';
import { authenticate, authorizeRoles, optionalAuthenticate } from '../middleware/auth.js';

const router = Router();

// Recommendations endpoints (must be defined before /:id)
router.post('/recommendations', optionalAuthenticate, getCourseRecommendationsHandler);
router.get('/recommendations/usage', getAIUsageStatusHandler);

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Instructor-only routes
router.post('/', authenticate, authorizeRoles('instructor'), createCourse);
router.put('/:id', authenticate, authorizeRoles('instructor'), updateCourse);
router.delete('/:id', authenticate, authorizeRoles('instructor'), deleteCourse);

export default router;
