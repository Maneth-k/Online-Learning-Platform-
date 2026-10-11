import type { Request, Response } from 'express';
import {
  getRecommendations,
  getBudgetUsage,
  type RecommendationResult,
} from '../services/recommendationService.js';
import Enrollment from '../models/Enrollment.js';
import type { ActionResult } from '../types/actionResult.js';

/**
 * Handle AI course recommendation requests.
 * Public or Authenticated (if authenticated, excludes already enrolled courses).
 * POST /api/courses/recommendations
 */
export const getCourseRecommendationsHandler = async (
  req: Request,
  res: Response<ActionResult<RecommendationResult>>
): Promise<void> => {
  try {
    const { prompt } = req.body;

    let enrolledIds: string[] = [];

    // If request has an authenticated student, lookup active enrollments to exclude them
    if (req.user?.userId) {
      const enrollments = await Enrollment.find({
        student: req.user.userId,
        status: { $in: ['enrolled', 'completed'] },
      }).select('course');

      enrolledIds = enrollments.map((e) => e.course.toString());
    }

    const result = await getRecommendations(prompt, enrolledIds);

    res.status(200).json({
      success: true,
      message:
        result.source === 'ai'
          ? 'Personalized course recommendations generated successfully'
          : result.source === 'empty'
          ? 'No courses available to recommend'
          : 'Catalog recommendations retrieved',
      data: result,
    });
  } catch (error: any) {
    console.error('Course recommendation controller error:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to generate recommendations',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Query current global AI request usage counter & remaining budget.
 * GET /api/courses/recommendations/usage
 */
export const getAIUsageStatusHandler = async (
  _req: Request,
  res: Response<ActionResult<{ count: number; limit: number; remaining: number }>>
): Promise<void> => {
  try {
    const usage = await getBudgetUsage();
    res.status(200).json({
      success: true,
      message: 'AI usage budget status retrieved successfully',
      data: usage,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve AI usage status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
