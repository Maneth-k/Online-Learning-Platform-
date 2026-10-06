import express, { type Application, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();
const PORT: number = Number(process.env.PORT) || 5000;
const CLIENT_URL: string = process.env.CLIENT_URL || 'http://localhost:5173';

// Standard Middleware
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger (Development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Health check endpoint
interface HealthResponse {
  status: 'ok' | 'degraded';
  message: string;
  timestamp: string;
  env: string;
}

app.get('/api/health', (_req: Request, res: Response<HealthResponse>) => {
  res.status(200).json({
    status: 'ok',
    message: 'LMS Backend Server is operational (TypeScript)',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

// 404 Route Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
});

// Custom Error Interface
interface HttpError extends Error {
  statusCode?: number;
}

// Global Error Handler Middleware
app.use((err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Server Initialization
const server = app.listen(PORT, () => {
  console.log(`🚀 LMS Server running on http://localhost:${PORT}`);
  console.log(`🛡️  CORS allowed origin: ${CLIENT_URL}`);
  console.log(`⚡ TypeScript environment initialized`);
});

// Graceful Process Termination
const handleShutdown = (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down server gracefully...`);
  server.close(() => {
    console.log('Server process terminated cleanly.');
    process.exit(0);
  });
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

export default app;
