import dotenv from 'dotenv';
dotenv.config();

import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Course from '../models/Course.js';

interface SeedInstructor {
  email: string;
  username: string;
  courses: {
    title: string;
    description: string;
    content: string;
    category: string;
  }[];
}

const SEED_INSTRUCTORS: SeedInstructor[] = [
  {
    email: 'soren.vance@mentora.edu',
    username: 'dr_soren_vance',
    courses: [
      {
        title: 'AI & Full-Stack Systems Architecture',
        description: 'Design distributed resilient systems with modern event loops, micro-frontends, and AI orchestration.',
        category: 'Engineering',
        content: `Module 1: High-Performance Distributed Topologies
- Event-driven event loops and non-blocking pipelines
- Resilient API gateways and backpressure handling

Module 2: Full-Stack React 19 & Node Ecosystem
- Server-side streaming and concurrent transitions
- Distributed caching and idempotency keys`,
      },
      {
        title: 'Advanced TypeScript for Enterprise Scale',
        description: 'Master advanced TypeScript patterns, strict compiler flags, template literal types, and AST transformations.',
        category: 'Engineering',
        content: `Module 1: Advanced Type System
- Conditional types, mapped types, and recursive types
- Discriminated unions and exhaustive validation`,
      },
    ],
  },
  {
    email: 'elena.rostova@mentora.edu',
    username: 'elena_rostova',
    courses: [
      {
        title: 'Modern Product Management & AI Strategy',
        description: 'Scale AI products from discovery to product-market fit with quantitative outcome metrics and user psychology.',
        category: 'Product',
        content: `Module 1: Product Discovery in the Age of AI
- Identifying viable automation wedges
- Risk-weighted opportunity trees and PRD synthesis

Module 2: Metric Architecture & Retention Dynamics
- North star metric trees
- Cohort analysis and retention curve shaping`,
      },
    ],
  },
  {
    email: 'aris.thorne@mentora.edu',
    username: 'prof_aris_thorne',
    courses: [
      {
        title: 'Applied Machine Learning & Neural Networks',
        description: 'Deep mathematical and practical foundations in tensor calculus, backpropagation, and transformer architectures.',
        category: 'Data & ML',
        content: `Module 1: Foundations of Deep Learning
- Vector spaces, gradient descent optimization, and loss landscapes
- Multi-layer perceptrons and regularization

Module 2: Transformer Architectures & Attention
- Self-attention mechanisms and multi-head projection
- Positional encodings and cross-attention decoders`,
      },
    ],
  },
  {
    email: 'kavita.sharma@mentora.edu',
    username: 'kavita_sharma',
    courses: [
      {
        title: 'NextGen Cloud Engineering & DevOps',
        description: 'Zero-downtime deployments, Kubernetes cluster orchestration, Terraform infrastructure as code, and observability.',
        category: 'Infrastructure',
        content: `Module 1: Modern Cloud Infrastructure
- Immutable infrastructure and declarative state
- Kubernetes pods, ingress controllers, and service meshes

Module 2: Observability & Chaos Engineering
- Distributed tracing with OpenTelemetry
- Automated canary rollouts and circuit breakers`,
      },
    ],
  },
  {
    email: 'instructor1@mentora.edu',
    username: 'instructor1',
    courses: [
      {
        title: 'Database Engineering with MongoDB & Mongoose',
        description: 'Design resilient database schemas, query optimizations, and production indexing strategies.',
        category: 'Infrastructure',
        content: `Module 1: Schema Modeling
- Embedding vs referencing relationships
- Validation schemas with Mongoose

Module 2: Performance & Indexing
- Single-field and compound indexes
- Query explanation and execution plans`,
      },
    ],
  },
];

async function seed(): Promise<void> {
  console.log('Starting database seed script...');

  try {
    await connectDB();
    const defaultPassword = 'Instructor123!';

    let createdInstructorCount = 0;
    let createdCourseCount = 0;

    for (const instData of SEED_INSTRUCTORS) {
      let instructor = await User.findOne({
        $or: [{ email: instData.email }, { username: instData.username }],
      });

      if (!instructor) {
        instructor = await User.create({
          email: instData.email,
          username: instData.username,
          password: defaultPassword,
          role: 'instructor',
        });
        console.log(`[Created] Instructor: "${instData.email}" (${instData.username})`);
        createdInstructorCount++;
      } else {
        if (!instructor.email) {
          instructor.email = instData.email;
        }
        if (instructor.role !== 'instructor') {
          instructor.role = 'instructor';
        }
        await instructor.save();
      }

      for (const courseData of instData.courses) {
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
          console.log(`  └─ [Seeded] Course: "${courseData.title}" [${courseData.category}]`);
          createdCourseCount++;
        }
      }
    }

    console.log('\n========================================');
    console.log('Database seeding completed successfully!');
    console.log(`Total New Instructors: ${createdInstructorCount}`);
    console.log(`Total New Courses:     ${createdCourseCount}`);
    console.log('Default Password for all seeded instructors: Instructor123!');
    console.log('========================================\n');
  } catch (error) {
    console.error('Seeding error:', error);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

seed();
