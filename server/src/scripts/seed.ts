import dotenv from 'dotenv';
dotenv.config();

import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Course from '../models/Course.js';

interface SeedCourse {
  title: string;
  description: string;
  content: string;
  category: string;
}

const SAMPLE_COURSES: SeedCourse[] = [
  {
    title: 'Full-Stack Web Development with React and Node.js',
    description: 'Learn to build modern, scalable web applications using React 19, Express 5, and MongoDB.',
    category: 'web-development',
    content: `Module 1: Full-Stack Architecture Foundations
- Client-server models and REST APIs
- Monorepos and project structures

Module 2: Frontend with React 19 & Vite
- Modern component design and hooks
- TanStack Query server-state management

Module 3: Backend with Express 5 & TypeScript
- Controller-Service patterns
- JWT cookie-based authentication

Module 4: MongoDB & Mongoose
- Schema design and indexing
- Data validation and security best practices`,
  },
  {
    title: 'Advanced TypeScript for Enterprise Applications',
    description: 'Master advanced TypeScript patterns, strict typing, generics, and end-to-end type safety.',
    category: 'programming',
    content: `Module 1: Advanced Type System
- Conditional types, template literals, infer keyword
- Discriminated unions and exhaustive type checking

Module 2: Strict Architecture
- Type-safe HTTP contracts and validation
- Clean code patterns and domain-driven design`,
  },
  {
    title: 'Database Engineering with MongoDB & Mongoose',
    description: 'Design resilient database schemas, query optimizations, and production indexing strategies.',
    category: 'databases',
    content: `Module 1: Schema Modeling
- Embedding vs referencing relationships
- Validation schemas with Mongoose

Module 2: Performance & Indexing
- Single-field and compound indexes
- Query explanation and execution plans`,
  },
];

async function seed(): Promise<void> {
  console.log('🌱 Starting database seed script...');

  try {
    await connectDB();

    // 1. Seed or find Instructor
    const instructorUsername = 'instructor1';
    const instructorPassword = 'Instructor123!';

    let instructor = await User.findOne({ username: instructorUsername });

    if (!instructor) {
      console.log(`Creating default instructor user: "${instructorUsername}"...`);
      instructor = await User.create({
        username: instructorUsername,
        password: instructorPassword,
        role: 'instructor',
      });
      console.log(`✅ Instructor "${instructorUsername}" created successfully.`);
    } else {
      console.log(`ℹ️  Instructor "${instructorUsername}" already exists (ID: ${instructor._id}).`);
      // Ensure role is instructor
      if (instructor.role !== 'instructor') {
        instructor.role = 'instructor';
        await instructor.save();
        console.log(`Updated role for "${instructorUsername}" to instructor.`);
      }
    }

    // 2. Seed Sample Courses
    console.log(`Seeding courses for instructor ${instructor.username}...`);
    let createdCourseCount = 0;

    for (const courseData of SAMPLE_COURSES) {
      const existingCourse = await Course.findOne({
        title: courseData.title,
        instructor: instructor._id,
      });

      if (!existingCourse) {
        await Course.create({
          title: courseData.title,
          description: courseData.description,
          content: courseData.content,
          category: courseData.category,
          instructor: instructor._id,
        });
        console.log(`✅ Seeded course: "${courseData.title}"`);
        createdCourseCount++;
      } else {
        console.log(`ℹ️  Course already exists: "${courseData.title}"`);
      }
    }

    console.log('\n========================================');
    console.log('🎉 Database seeding completed successfully!');
    console.log('========================================');
    console.log('Seeded Instructor Credentials:');
    console.log(`  Username: ${instructorUsername}`);
    console.log(`  Password: ${instructorPassword}`);
    console.log(`  Role:     ${instructor.role}`);
    console.log(`Courses Created This Run: ${createdCourseCount}`);
    console.log('========================================\n');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

seed();
