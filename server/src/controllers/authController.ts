import type { Request, Response } from 'express';
import { User, type UserRole } from '../models/User.js';
import {
  signToken,
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
  getClearCookieOptions,
} from '../utils/jwt.js';
import type { ActionResult } from '../types/actionResult.js';

/**
 * Register a new user and attach auth cookie.
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response<ActionResult>): Promise<void> => {
  try {
    const rawEmail = req.body.email || req.body.username;
    const { password, role } = req.body;

    // Basic input validations
    if (!rawEmail || typeof rawEmail !== 'string' || rawEmail.trim().length < 3) {
      res.status(400).json({
        success: false,
        message: req.body.email
          ? 'Email is required and must be valid'
          : 'Username is required and must be at least 3 characters long',
      });
      return;
    }

    const email = rawEmail.trim().toLowerCase();

    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password is required and must be at least 6 characters long',
      });
      return;
    }

    const assignedRole: UserRole = role === 'instructor' ? 'instructor' : 'student';

    // Check for existing user by email or username
    const existingUser = await User.findOne({
      $or: [{ email }, { username: email }],
    });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: req.body.email ? 'Email is already registered' : 'Username is already taken',
      });
      return;
    }

    // Create new user (password is automatically hashed by pre-save hook)
    const newUser = await User.create({
      email,
      username: req.body.username?.trim() || email.split('@')[0],
      password,
      role: assignedRole,
    });

    // Generate JWT token
    const token = signToken({
      userId: newUser._id.toString(),
      role: newUser.role,
    });

    // Set HTTP-only cookie
    res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser._id,
          email: newUser.email,
          username: newUser.username || newUser.email,
          role: newUser.role,
          createdAt: newUser.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Log in an existing user and attach auth cookie.
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response<ActionResult>): Promise<void> => {
  try {
    const rawEmail = req.body.email || req.body.username;
    const { password } = req.body;

    if (!rawEmail || !password) {
      res.status(400).json({
        success: false,
        message: req.body.email
          ? 'Email and password are required'
          : 'Username and password are required',
      });
      return;
    }

    const identifier = rawEmail.trim().toLowerCase();

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    if (!user) {
      res.status(401).json({
        success: false,
        message: req.body.email ? 'Invalid email or password' : 'Invalid username or password',
      });
      return;
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: req.body.email ? 'Invalid email or password' : 'Invalid username or password',
      });
      return;
    }

    // Generate JWT token
    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
    });

    // Set HTTP-only cookie
    res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: {
          id: user._id,
          email: user.email || (user as any).username,
          username: user.username || user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log in',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Log out user by clearing the auth cookie.
 * POST /api/auth/logout
 */
export const logout = async (_req: Request, res: Response<ActionResult>): Promise<void> => {
  try {
    res.clearCookie(AUTH_COOKIE_NAME, getClearCookieOptions());
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log out',
    });
  }
};

/**
 * Get the currently authenticated user's profile.
 * GET /api/auth/me
 */
export const getMe = async (req: Request, res: Response<ActionResult>): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email || (user as any).username,
          username: user.username || user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch current user profile',
    });
  }
};
