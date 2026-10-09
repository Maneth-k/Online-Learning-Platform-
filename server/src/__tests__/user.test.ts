import { describe, it, expect } from 'vitest';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

describe('User Model (User.ts)', () => {
  const getValidationError = async (doc: InstanceType<typeof User>) => {
    try {
      await doc.validate();
      return undefined;
    } catch (err) {
      return err as any;
    }
  };

  describe('Schema Validation', () => {
    it('should validate a properly formatted student user', async () => {
      const user = new User({
        username: 'student_valid',
        password: 'Password123!',
        role: 'student',
      });

      const validationError = await getValidationError(user);
      expect(validationError).toBeUndefined();
      expect(user.role).toBe('student');
    });

    it('should default role to "student" if not specified', () => {
      const user = new User({
        username: 'default_role_user',
        password: 'Password123!',
      });

      expect(user.role).toBe('student');
    });

    it('should allow "instructor" role', async () => {
      const user = new User({
        username: 'instructor_valid',
        password: 'Password123!',
        role: 'instructor',
      });

      const validationError = await getValidationError(user);
      expect(validationError).toBeUndefined();
      expect(user.role).toBe('instructor');
    });

    it('should reject invalid role enum values', async () => {
      const user = new User({
        username: 'invalid_role_user',
        password: 'Password123!',
        role: 'admin' as any,
      });

      const validationError = await getValidationError(user);
      expect(validationError).toBeDefined();
      expect(validationError?.errors['role']).toBeDefined();
      expect(validationError?.errors['role'].message).toContain('is not a valid role');
    });

    it('should require username', async () => {
      const user = new User({
        password: 'Password123!',
      });

      const validationError = await getValidationError(user);
      expect(validationError).toBeDefined();
      expect(validationError?.errors['username']).toBeDefined();
      expect(validationError?.errors['username'].message).toBe('Username is required');
    });

    it('should reject usernames shorter than 3 characters', async () => {
      const user = new User({
        username: 'ab',
        password: 'Password123!',
      });

      const validationError = await getValidationError(user);
      expect(validationError).toBeDefined();
      expect(validationError?.errors['username'].message).toContain('Username must be at least 3 characters long');
    });

    it('should require password', async () => {
      const user = new User({
        username: 'valid_user',
      });

      const validationError = await getValidationError(user);
      expect(validationError).toBeDefined();
      expect(validationError?.errors['password']).toBeDefined();
      expect(validationError?.errors['password'].message).toBe('Password is required');
    });

    it('should reject passwords shorter than 6 characters', async () => {
      const user = new User({
        username: 'valid_user',
        password: '12345',
      });

      const validationError = await getValidationError(user);
      expect(validationError).toBeDefined();
      expect(validationError?.errors['password'].message).toContain('Password must be at least 6 characters long');
    });
  });

  describe('comparePassword method', () => {
    it('should return true for matching password', async () => {
      const plainPassword = 'SecretPassword123!';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const user = new User({
        username: 'hash_test_user',
        password: hashedPassword,
      });

      const isMatch = await user.comparePassword(plainPassword);
      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const plainPassword = 'SecretPassword123!';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const user = new User({
        username: 'hash_test_user',
        password: hashedPassword,
      });

      const isMatch = await user.comparePassword('WrongPassword!');
      expect(isMatch).toBe(false);
    });
  });

  describe('Password Stripping in Serialization', () => {
    it('should strip password from toJSON representation', () => {
      const user = new User({
        username: 'serial_user',
        password: 'SecretPassword123!',
        role: 'student',
      });

      const jsonUser = user.toJSON();
      expect(jsonUser.password).toBeUndefined();
      expect(jsonUser.username).toBe('serial_user');
      expect(jsonUser.role).toBe('student');
    });

    it('should strip password from toObject representation', () => {
      const user = new User({
        username: 'serial_user_obj',
        password: 'SecretPassword123!',
        role: 'student',
      });

      const objUser = user.toObject();
      expect(objUser.password).toBeUndefined();
      expect(objUser.username).toBe('serial_user_obj');
    });
  });
});
