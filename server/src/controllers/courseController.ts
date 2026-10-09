import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Course, type ICourseDocument } from '../models/Course.js';
import type { ActionResult } from '../types/actionResult.js';

interface CourseResponseData {
  course?: ICourseDocument | null;
  courses?: ICourseDocument[];
}

/**
 * Create a new course.
 * Restricted to authenticated instructors.
 * POST /api/courses
 */
export const createCourse = async (
  req: Request,
  res: Response<ActionResult<CourseResponseData>>
): Promise<void> => {
  try {
    const { title, description, content } = req.body;

    // Field presence and type checks
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Course title is required and cannot be empty',
      });
      return;
    }

    if (title.trim().length > 200) {
      res.status(400).json({
        success: false,
        message: 'Course title cannot exceed 200 characters',
      });
      return;
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Course description is required and cannot be empty',
      });
      return;
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Course content is required and cannot be empty',
      });
      return;
    }

    // Security: instructor is always derived from authenticated token, ignoring req.body
    const newCourse = await Course.create({
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      instructor: req.user!.userId,
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: {
        course: newCourse,
      },
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * List all courses.
 * Public endpoint.
 * GET /api/courses
 */
export const getCourses = async (
  _req: Request,
  res: Response<ActionResult<CourseResponseData>>
): Promise<void> => {
  try {
    const courses = await Course.find()
      .populate('instructor', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Courses retrieved successfully',
      data: {
        courses,
      },
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve courses',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get a single course by ID.
 * Public endpoint.
 * GET /api/courses/:id
 */
export const getCourseById = async (
  req: Request,
  res: Response<ActionResult<CourseResponseData>>
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || !Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid course ID format',
      });
      return;
    }

    const course = await Course.findById(id).populate('instructor', 'username');

    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        course,
      },
    });
  } catch (error) {
    console.error('Get course by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve course',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update a course.
 * Restricted to the instructor who created the course.
 * PUT /api/courses/:id
 */
export const updateCourse = async (
  req: Request,
  res: Response<ActionResult<CourseResponseData>>
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || !Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid course ID format',
      });
      return;
    }

    const course = await Course.findById(id);

    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found',
      });
      return;
    }

    // Ownership check: instructor must match the token's userId
    if (course.instructor.toString() !== req.user!.userId) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to update this course',
      });
      return;
    }

    const { title, description, content } = req.body;

    // Check if at least one updatable field is provided
    if (title === undefined && description === undefined && content === undefined) {
      res.status(400).json({
        success: false,
        message: 'At least one field (title, description, content) is required for update',
      });
      return;
    }

    // Validate fields if provided
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Title cannot be empty',
        });
        return;
      }
      if (title.trim().length > 200) {
        res.status(400).json({
          success: false,
          message: 'Course title cannot exceed 200 characters',
        });
        return;
      }
      course.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== 'string' || description.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Description cannot be empty',
        });
        return;
      }
      course.description = description.trim();
    }

    if (content !== undefined) {
      if (typeof content !== 'string' || content.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Content cannot be empty',
        });
        return;
      }
      course.content = content.trim();
    }

    const updatedCourse = await course.save();

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: {
        course: updatedCourse,
      },
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Delete a course.
 * Restricted to the instructor who created the course.
 * DELETE /api/courses/:id
 */
export const deleteCourse = async (
  req: Request,
  res: Response<ActionResult>
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || !Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid course ID format',
      });
      return;
    }

    const course = await Course.findById(id);

    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found',
      });
      return;
    }

    // Ownership check: instructor must match the token's userId
    if (course.instructor.toString() !== req.user!.userId) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to delete this course',
      });
      return;
    }

    await Course.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
