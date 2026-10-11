import type { TokenPayload } from '../utils/jwt.js';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: TokenPayload;
  }
}

export {};
