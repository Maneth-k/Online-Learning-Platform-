import { Router } from 'express';
import {
  getInstructors,
  getInstructorById,
} from '../controllers/instructorController.js';

const router = Router();

// Public routes for listing and viewing instructors
router.get('/', getInstructors);
router.get('/:id', getInstructorById);

export default router;
