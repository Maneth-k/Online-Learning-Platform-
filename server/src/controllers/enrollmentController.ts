import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Enrollment, type IEnrollmentDocument, type EnrollmentStatus } from '../models/Enrollment.js';
import { Course } from '../models/Course.js';
import type { ActionResult } from '../types/actionResult.js';

export interface PaginationMeta {
  page: number;
  limit: number;
  totalEnrollments: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface EnrollmentResponseData {
  enrollment?: IEnrollmentDocument | null;
  enrollments?: IEnrollmentDocument[];
  pagination?: PaginationMeta;
  isEnrolled?: boolean;
  course?: {
    id: Types.ObjectId | string;
    title: string;
  };
}

const VALID_STATUSES: EnrollmentStatus[] = ['enrolled', 'completed', 'dropped'];

/**
 * Enroll a student in a course.
 * Restricted to authenticated students.
 * POST /api/enrollments
 */
export const enrollStudent = async (
  req: Request,
  res: Response<ActionResult<EnrollmentResponseData>>
): Promise<void> => {
  try {
    // Role check: block instructors
    if (req.user?.role !== 'student') {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Instructors cannot enroll in courses',
      });
      return;
    }

    const courseId = req.body.courseId || req.body.course;

    // Validate course ID format
    if (!courseId || typeof courseId !== 'string' || !Types.ObjectId.isValid(courseId.trim())) {
      res.status(400).json({
        success: false,
        message: 'Valid course ID is required',
      });
      return;
    }

    const cleanCourseId = courseId.trim();

    // Check course existence
    const course = await Course.findById(cleanCourseId);
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found',
      });
      return;
    }

    // Create enrollment record
    const enrollment = await Enrollment.create({
      student: new Types.ObjectId(req.user.userId),
      course: new Types.ObjectId(cleanCourseId),
      status: 'enrolled',
      enrollmentDate: new Date(),
    });

    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate('course', 'title description category')
      .populate('student', 'username');

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: {
        enrollment: populatedEnrollment || enrollment,
      },
    });
  } catch (error: any) {
    // Handle duplicate key error (MongoDB code 11000 / E11000)
    if (
      error?.code === 11000 ||
      error?.name === 'MongoServerError' && error?.code === 11000 ||
      (typeof error?.message === 'string' && error.message.includes('E11000'))
    ) {
      res.status(409).json({
        success: false,
        message: 'You are already enrolled in this course',
      });
      return;
    }

    console.error('Enroll student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in course',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get current student's enrollments with pagination and optional status filter.
 * Restricted to authenticated students.
 * GET /api/enrollments/me
 */
export const getMyEnrollments = async (
  req: Request,
  res: Response<ActionResult<EnrollmentResponseData>>
): Promise<void> => {
  try {
    if (req.user?.role !== 'student') {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Access restricted to students',
      });
      return;
    }

    const pageQuery = parseInt(req.query.page as string, 10);
    const limitQuery = parseInt(req.query.limit as string, 10);
    const offsetQuery = parseInt(req.query.offset as string, 10);

    const limit = !isNaN(limitQuery) && limitQuery > 0 ? Math.min(limitQuery, 50) : 10;
    const page = !isNaN(pageQuery) && pageQuery > 0 ? pageQuery : 1;
    const offset = !isNaN(offsetQuery) && offsetQuery >= 0 ? offsetQuery : (page - 1) * limit;

    const statusQuery = typeof req.query.status === 'string' ? req.query.status.trim() : undefined;
    if (statusQuery && !VALID_STATUSES.includes(statusQuery as EnrollmentStatus)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status filter. Must be enrolled, completed, or dropped',
      });
      return;
    }

    const filter: Record<string, unknown> = {
      student: new Types.ObjectId(req.user.userId),
    };

    if (statusQuery) {
      filter.status = statusQuery;
    }

    const [enrollments, totalEnrollments] = await Promise.all([
      Enrollment.find(filter)
        .populate({
          path: 'course',
          select: 'title description category instructor',
          populate: {
            path: 'instructor',
            select: 'username',
          },
        })
        .sort({ enrollmentDate: -1 })
        .skip(offset)
        .limit(limit),
      Enrollment.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalEnrollments / limit);

    res.status(200).json({
      success: true,
      message: 'Enrollments retrieved successfully',
      data: {
        enrollments,
        pagination: {
          page,
          limit,
          totalEnrollments,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get my enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve enrollments',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get all students enrolled in a specific course.
 * Restricted to the course instructor.
 * GET /api/enrollments/course/:courseId
 */
export const getCourseStudents = async (
  req: Request,
  res: Response<ActionResult<EnrollmentResponseData>>
): Promise<void> => {
  try {
    const { courseId } = req.params;

    if (!courseId || typeof courseId !== 'string' || !Types.ObjectId.isValid(courseId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid course ID format',
      });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found',
      });
      return;
    }

    // Instructor ownership check
    if (course.instructor.toString() !== req.user!.userId) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view enrollments for this course',
      });
      return;
    }

    const pageQuery = parseInt(req.query.page as string, 10);
    const limitQuery = parseInt(req.query.limit as string, 10);
    const offsetQuery = parseInt(req.query.offset as string, 10);

    const limit = !isNaN(limitQuery) && limitQuery > 0 ? Math.min(limitQuery, 50) : 10;
    const page = !isNaN(pageQuery) && pageQuery > 0 ? pageQuery : 1;
    const offset = !isNaN(offsetQuery) && offsetQuery >= 0 ? offsetQuery : (page - 1) * limit;

    const statusQuery = typeof req.query.status === 'string' ? req.query.status.trim() : undefined;
    if (statusQuery && !VALID_STATUSES.includes(statusQuery as EnrollmentStatus)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status filter. Must be enrolled, completed, or dropped',
      });
      return;
    }

    const filter: Record<string, unknown> = {
      course: new Types.ObjectId(courseId),
    };

    if (statusQuery) {
      filter.status = statusQuery;
    }

    const [enrollments, totalEnrollments] = await Promise.all([
      Enrollment.find(filter)
        .populate('student', 'username role createdAt')
        .sort({ enrollmentDate: -1 })
        .skip(offset)
        .limit(limit),
      Enrollment.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalEnrollments / limit);

    res.status(200).json({
      success: true,
      message: 'Course enrollments retrieved successfully',
      data: {
        enrollments,
        course: {
          id: course._id,
          title: course.title,
        },
        pagination: {
          page,
          limit,
          totalEnrollments,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get course students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve course enrollments',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update enrollment status (e.g., student drops, instructor marks completed).
 * PATCH /api/enrollments/:id/status
 */
export const updateEnrollmentStatus = async (
  req: Request,
  res: Response<ActionResult<EnrollmentResponseData>>
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || !Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid enrollment ID format',
      });
      return;
    }

    const { status } = req.body;

    if (!status || typeof status !== 'string' || !VALID_STATUSES.includes(status as EnrollmentStatus)) {
      res.status(400).json({
        success: false,
        message: 'Invalid or missing status. Must be enrolled, completed, or dropped',
      });
      return;
    }

    const enrollment = await Enrollment.findById(id).populate('course');
    if (!enrollment) {
      res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
      return;
    }

    const userRole = req.user!.role;
    const userId = req.user!.userId;

    if (userRole === 'student') {
      // Student ownership check
      if (enrollment.student.toString() !== userId) {
        res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have permission to update this enrollment',
        });
        return;
      }

      // Students can only drop courses
      if (status !== 'dropped') {
        res.status(403).json({
          success: false,
          message: 'Forbidden: Students can only change their enrollment status to dropped',
        });
        return;
      }
    } else if (userRole === 'instructor') {
      // Instructor must own the course
      const course = enrollment.course as any;
      const courseInstructor = course?.instructor?.toString ? course.instructor.toString() : course?.instructor;

      if (courseInstructor !== userId) {
        res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have permission to update enrollments for this course',
        });
        return;
      }
    } else {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Role not authorized to update enrollment status',
      });
      return;
    }

    enrollment.status = status as EnrollmentStatus;
    if (status === 'completed') {
      enrollment.completedAt = new Date();
    } else {
      enrollment.completedAt = null;
    }

    const updatedEnrollment = await enrollment.save();

    res.status(200).json({
      success: true,
      message: 'Enrollment status updated successfully',
      data: {
        enrollment: updatedEnrollment,
      },
    });
  } catch (error) {
    console.error('Update enrollment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update enrollment status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Unenroll a student from a course (hard-delete enrollment record).
 * Restricted to the enrolled student, provided it is not already completed.
 * DELETE /api/enrollments/:id
 */
export const unenroll = async (
  req: Request,
  res: Response<ActionResult>
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || !Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid enrollment ID format',
      });
      return;
    }

    const enrollment = await Enrollment.findById(id);
    if (!enrollment) {
      res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
      return;
    }

    // Ownership check: student must match token userId
    if (enrollment.student.toString() !== req.user!.userId) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You can only unenroll yourself',
      });
      return;
    }

    // Prevent deleting completed records
    if (enrollment.status === 'completed') {
      res.status(400).json({
        success: false,
        message: 'Cannot delete a completed enrollment. Completed course records must be preserved.',
      });
      return;
    }

    await Enrollment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Unenrolled successfully',
    });
  } catch (error) {
    console.error('Unenroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unenroll from course',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Check if the currently authenticated user is enrolled in a specific course.
 * GET /api/enrollments/check/:courseId
 */
export const checkEnrollment = async (
  req: Request,
  res: Response<ActionResult<EnrollmentResponseData>>
): Promise<void> => {
  try {
    const { courseId } = req.params;

    if (!courseId || typeof courseId !== 'string' || !Types.ObjectId.isValid(courseId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid course ID format',
      });
      return;
    }

    const enrollment = await Enrollment.findOne({
      student: new Types.ObjectId(req.user!.userId),
      course: new Types.ObjectId(courseId),
    });

    const isEnrolled = !!enrollment && enrollment.status !== 'dropped';

    res.status(200).json({
      success: true,
      data: {
        isEnrolled,
        enrollment,
      },
    });
  } catch (error) {
    console.error('Check enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check enrollment status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
