import express, { type Application } from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from '../routes/authRoutes.js';
import courseRoutes from '../routes/courseRoutes.js';
import type { Response as SupertestResponse } from 'supertest';

/**
 * Creates an isolated Express app configured identically to production
 * for supertest HTTP integration testing.
 */
export const createTestApp = (): Application => {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api/auth', authRoutes);
  app.use('/api/courses', courseRoutes);
  return app;
};

/**
 * Extracts a specific cookie name=value from supertest response headers.
 */
export const extractCookie = (res: SupertestResponse, cookieName: string): string | null => {
  const cookies = res.headers['set-cookie'];
  if (!cookies) return null;

  const cookieList = Array.isArray(cookies) ? cookies : [cookies];
  for (const cookie of cookieList) {
    if (cookie.startsWith(`${cookieName}=`)) {
      return cookie.split(';')[0];
    }
  }
  return null;
};
