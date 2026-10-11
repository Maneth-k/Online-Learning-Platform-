import type { Request, Response } from 'express';
import { Types, type QueryFilter } from 'mongoose';
import User, { type IUserDocument } from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import type { ActionResult } from '../types/actionResult.js';

export interface InstructorFilters {
  q?: string;
  category?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalInstructors: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface InstructorCourseSummary {
  _id: string;
  title: string;
  category: string;
  description: string;
}

export interface InstructorItem {
  _id: string;
  username: string;
  role: 'instructor';
  createdAt?: Date;
  coursesCount: number;
  categories: string[];
  courses: InstructorCourseSummary[];
  totalStudents: number;
}

export interface InstructorResponseData {
  instructor?: InstructorItem | null;
  instructors?: InstructorItem[];
  pagination?: PaginationMeta;
}

/**
 * Escape special characters in string for safe regular expression use.
 */
function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

/**
 * List all instructors with optional search and category filters.
 * Public endpoint.
 * GET /api/instructors
 */
export const getInstructors = async (
  req: Request,
  res: Response<ActionResult<InstructorResponseData>>
): Promise<void> => {
  try {
    const pageQuery = parseInt(req.query.page as string, 10);
    const limitQuery = parseInt(req.query.limit as string, 10);
    const offsetQuery = parseInt(req.query.offset as string, 10);

    const limit = !isNaN(limitQuery) && limitQuery > 0 ? Math.min(limitQuery, 50) : 12;
    const page = !isNaN(pageQuery) && pageQuery > 0 ? pageQuery : 1;
    const offset = !isNaN(offsetQuery) && offsetQuery >= 0 ? offsetQuery : (page - 1) * limit;

    const rawSearch =
      typeof req.query.q === 'string'
        ? req.query.q
        : typeof req.query.search === 'string'
        ? req.query.search
        : undefined;

    const rawCategory = typeof req.query.category === 'string' ? req.query.category.trim() : undefined;

    const userConditions: QueryFilter<IUserDocument>[] = [
      { role: 'instructor' } as QueryFilter<IUserDocument>,
    ];

    if (rawSearch && rawSearch.trim().length > 0) {
      const pattern = escapeRegex(rawSearch.trim());
      // Also search if any course title matches the search query
      const matchingCourseInstructorIds = await Course.find({
        $or: [
          { title: { $regex: pattern, $options: 'i' } },
          { description: { $regex: pattern, $options: 'i' } },
          { category: { $regex: pattern, $options: 'i' } },
        ],
      }).distinct('instructor');

      userConditions.push({
        $or: [
          { username: { $regex: pattern, $options: 'i' } },
          { _id: { $in: matchingCourseInstructorIds } },
        ],
      } as QueryFilter<IUserDocument>);
    }

    if (rawCategory && rawCategory.toLowerCase() !== 'all') {
      const categoryPattern = escapeRegex(rawCategory);
      const instructorIdsWithCategory = await Course.find({
        category: { $regex: categoryPattern, $options: 'i' },
      }).distinct('instructor');

      userConditions.push({
        _id: { $in: instructorIdsWithCategory },
      } as QueryFilter<IUserDocument>);
    }

    const where: QueryFilter<IUserDocument> =
      userConditions.length === 1
        ? userConditions[0]
        : { $and: userConditions };

    const [instructorsDocs, totalInstructors] = await Promise.all([
      User.find(where)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit),
      User.countDocuments(where),
    ]);

    const instructorIds = instructorsDocs.map((u) => u._id);

    // Fetch all courses belonging to these instructors
    const courses = await Course.find({ instructor: { $in: instructorIds } })
      .select('_id title category description instructor')
      .lean();

    const courseIds = courses.map((c) => c._id);

    // Fetch non-dropped enrollments for student count
    const enrollments = await Enrollment.find({
      course: { $in: courseIds },
      status: { $ne: 'dropped' },
    })
      .select('course')
      .lean();

    // Map course ID to student count
    const enrollmentCountsByCourseId = new Map<string, number>();
    for (const enr of enrollments) {
      const cId = enr.course.toString();
      enrollmentCountsByCourseId.set(cId, (enrollmentCountsByCourseId.get(cId) || 0) + 1);
    }

    // Group courses by instructor
    const coursesByInstructorId = new Map<string, typeof courses>();
    for (const c of courses) {
      const instId = c.instructor.toString();
      if (!coursesByInstructorId.has(instId)) {
        coursesByInstructorId.set(instId, []);
      }
      coursesByInstructorId.get(instId)!.push(c);
    }

    const instructorItems: InstructorItem[] = instructorsDocs.map((inst) => {
      const instId = inst._id.toString();
      const instCourses = coursesByInstructorId.get(instId) || [];
      const distinctCategories = Array.from(new Set(instCourses.map((c) => c.category)));

      let totalStudents = 0;
      for (const c of instCourses) {
        totalStudents += enrollmentCountsByCourseId.get(c._id.toString()) || 0;
      }

      return {
        _id: instId,
        username: inst.username,
        role: 'instructor' as const,
        createdAt: inst.createdAt,
        coursesCount: instCourses.length,
        categories: distinctCategories,
        courses: instCourses.map((c) => ({
          _id: c._id.toString(),
          title: c.title,
          category: c.category,
          description: c.description,
        })),
        totalStudents,
      };
    });

    const totalPages = Math.ceil(totalInstructors / limit);

    res.status(200).json({
      success: true,
      message: 'Instructors retrieved successfully',
      data: {
        instructors: instructorItems,
        pagination: {
          page,
          limit,
          totalInstructors,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get instructors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve instructors',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get instructor by ID with their courses and metrics.
 * Public endpoint.
 * GET /api/instructors/:id
 */
export const getInstructorById = async (
  req: Request,
  res: Response<ActionResult<InstructorResponseData>>
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || !Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid instructor ID format',
      });
      return;
    }

    const instructor = await User.findOne({ _id: id, role: 'instructor' }).select('-password');

    if (!instructor) {
      res.status(404).json({
        success: false,
        message: 'Instructor not found',
      });
      return;
    }

    const courses = await Course.find({ instructor: instructor._id })
      .select('_id title category description instructor')
      .lean();

    const courseIds = courses.map((c) => c._id);

    const totalStudents = await Enrollment.countDocuments({
      course: { $in: courseIds },
      status: { $ne: 'dropped' },
    });

    const distinctCategories = Array.from(new Set(courses.map((c) => c.category)));

    const item: InstructorItem = {
      _id: instructor._id.toString(),
      username: instructor.username,
      role: 'instructor',
      createdAt: instructor.createdAt,
      coursesCount: courses.length,
      categories: distinctCategories,
      courses: courses.map((c) => ({
        _id: c._id.toString(),
        title: c.title,
        category: c.category,
        description: c.description,
      })),
      totalStudents,
    };

    res.status(200).json({
      success: true,
      message: 'Instructor details retrieved successfully',
      data: {
        instructor: item,
      },
    });
  } catch (error) {
    console.error('Get instructor by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve instructor details',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
