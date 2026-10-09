import { beforeAll, afterEach, vi } from 'vitest';

beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_super_secret_jwt_key_for_vitest_2026';
  process.env.JWT_EXPIRES_IN = '7d';
});

afterEach(() => {
  vi.restoreAllMocks();
});
