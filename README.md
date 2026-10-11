# Learning Management System (LMS)

A full-stack web application designed for online learning. The platform allows students to discover courses, enroll, track learning progress, and receive AI-powered course recommendations. Instructors can create, edit, and manage courses, as well as monitor student enrollments.

The system is built as a monorepo containing a React frontend application and an Express.js backend API with a MongoDB database.

---

## Table of Contents

1. Project Overview
2. Technology Stack
3. System Architecture
4. System Design and Database Structure
5. Setup and Installation
6. API Documentation
7. Testing
8. Project Folder Structure

---

## 1. Project Overview

The Learning Management System provides two primary user roles:

- Student: Can browse the course catalog, search and filter courses by category, view course content, enroll in courses, mark enrollment progress, drop courses, and request tailored course recommendations from an AI advisor.
- Instructor: Can publish new courses, update course materials, delete their courses, view public instructor profiles, and view lists of students enrolled in their courses.

### Core Features

- Role-based Authentication: Secure registration and login for students and instructors using JSON Web Tokens (JWT) stored in HTTP-only cookies.
- Course Catalog: Public browsing with pagination, keyword search, category filtering, and instructor filtering.
- Enrollment Management: Student enrollment lifecycle management (enrolled, completed, dropped) with unique constraints preventing duplicate enrollments.
- AI Course Advisor: Generative AI recommendations using OpenAI. The advisor analyzes user learning goals, searches candidate courses, and provides recommendations with reasoning.
- Fallback System: If the AI service is unavailable or reaches its budget limit, the recommendation engine falls back to catalog matching automatically.
- Instructor Analytics: Displays course counts, category lists, and active student numbers for each instructor.

---

## 2. Technology Stack

### Frontend (client)

- Framework: React 19
- Build Tool: Vite 8
- Language: TypeScript 7
- Routing: React Router 7
- State Management and Data Fetching: TanStack Query (React Query)
- Form Handling and Validation: React Hook Form with Zod resolvers
- Styling: Custom Vanilla CSS design tokens and responsive layouts

### Backend (server)

- Runtime: Node.js (ES Modules)
- Web Framework: Express 5
- Language: TypeScript 7
- TypeScript Execution: tsx
- Database: MongoDB with Mongoose 9 ODM
- Authentication: JSON Web Tokens (jsonwebtoken) with bcrypt password hashing
- Cookie Handling: cookie-parser
- AI Integration: OpenAI Node SDK
- Testing: Vitest and Supertest

---

## 3. System Architecture

The application uses a client-server architecture with a RESTful backend API.

### Key Architectural Patterns

1. Separation of Concerns:
   The backend follows a Controller-Service pattern. Controllers handle HTTP request parsing, input validation, and response formatting. Services handle core business logic, such as OpenAI recommendation workflows and budget management.

2. Standardized API Response Format:
   All API endpoints return responses adhering to a unified format called ActionResult:

```typescript
{
  "success": boolean,
  "message"?: string,
  "data"?: T,
  "error"?: string
}
```

3. Cookie-based Authentication:
   Authentication tokens are issued as HTTP-only cookies named `auth_token`. This approach protects the session token against cross-site scripting (XSS) attacks because JavaScript running in the browser cannot read HTTP-only cookies.

4. Resilient Recommendation Pipeline:
   The recommendation engine operates in four stages:
   - Input sanitization: Cleans and limits the user prompt.
   - Candidate discovery: Queries the MongoDB database using text indexes and recency filters to find relevant courses with zero AI cost.
   - AI reranking: Sends candidate course summaries to the OpenAI API for evaluation and personalized explanations.
   - Graceful fallback: If the AI call fails, times out, or exceeds the request budget, the system returns candidate courses using catalog matching without breaking the user experience.

---

## 4. System Design and Database Structure

The database layer runs on MongoDB and is managed through Mongoose schemas.

### Entity Relationship Summary

- User (1) to Course (Many): An instructor can create multiple courses. Each course references a single instructor.
- User (1) to Enrollment (Many): A student can have multiple enrollments.
- Course (1) to Enrollment (Many): A course can have multiple student enrollments.
- AIUsage (Singleton): A single document that tracks total AI recommendation API requests against an allowed quota.

```
+------------------+         1:N         +-------------------+
|      User        | ------------------> |      Course       |
| (role:instructor)|  (instructor field) |                   |
+------------------+                     +-------------------+
        |                                          |
        | 1:N (student field)                      | 1:N (course field)
        v                                          v
+------------------------------------------------------------+
|                         Enrollment                         |
|      (unique compound index on student + course)           |
+------------------------------------------------------------+
```

### Database Schemas

#### 1. User Schema (`users` collection)

Represents both students and instructors in the system.

| Field | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Auto | Auto | Unique identifier |
| `username` | String | Yes | None | Unique username, trimmed, minimum 3 characters |
| `password` | String | Yes | None | Hashed with bcrypt before saving (salt rounds: 10) |
| `role` | String | Yes | `'student'` | Enum: `'student'` or `'instructor'` |
| `createdAt` | Date | Auto | Current Date | Creation timestamp |
| `updatedAt` | Date | Auto | Current Date | Last update timestamp |

Schema Details:
- The password field is excluded automatically when converting user documents to JSON or plain objects.
- A Mongoose pre-save hook automatically hashes modified passwords.
- A helper method `comparePassword(candidate)` checks plain text passwords against the stored hash.

#### 2. Course Schema (`courses` collection)

Represents educational courses created by instructors.

| Field | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Auto | Auto | Unique identifier |
| `title` | String | Yes | None | Course title, maximum 200 characters |
| `description` | String | Yes | None | Detailed course description |
| `content` | String | Yes | None | Syllabus or course lesson material |
| `category` | String | Yes | None | Subject category (e.g. Engineering, Product) |
| `instructor` | ObjectId | Yes | None | Reference to the User document (must be an instructor) |
| `createdAt` | Date | Auto | Current Date | Creation timestamp |
| `updatedAt` | Date | Auto | Current Date | Last update timestamp |

Indexes:
- Compound Index: `{ category: 1, createdAt: -1 }` for filtering courses by category sorted by date.
- Text Index: `{ title: 'text', description: 'text' }` for full-text candidate searches.
- Field Index: `{ instructor: 1 }` for instructor-specific queries.

#### 3. Enrollment Schema (`enrollments` collection)

Represents a student registration in a specific course.

| Field | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Auto | Auto | Unique identifier |
| `student` | ObjectId | Yes | None | Reference to the User document |
| `course` | ObjectId | Yes | None | Reference to the Course document |
| `status` | String | Yes | `'enrolled'` | Enum: `'enrolled'`, `'completed'`, `'dropped'` |
| `enrollmentDate` | Date | Yes | `Date.now` | Date when the student enrolled |
| `completedAt` | Date | No | `null` | Timestamp when marked as completed |
| `createdAt` | Date | Auto | Current Date | Creation timestamp |
| `updatedAt` | Date | Auto | Current Date | Last update timestamp |

Indexes:
- Compound Unique Index: `{ student: 1, course: 1 }` prevents a student from enrolling in the same course more than once.
- Compound Index: `{ course: 1, status: 1 }` speeds up queries when instructors list their students.
- Compound Index: `{ student: 1, status: 1 }` speeds up queries for student enrollment lists.

#### 4. AIUsage Schema (`aiusages` collection)

Maintains the system-wide budget counter for external AI requests.

| Field | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Auto | Auto | Unique identifier |
| `key` | String | Yes | `'global'` | Unique identifier for tracking scope |
| `count` | Number | Yes | `0` | Number of AI calls made |
| `limit` | Number | Yes | `200` | Maximum allowed AI calls before fallback |
| `lastUsedAt` | Date | No | `null` | Timestamp of the most recent AI call |
| `createdAt` | Date | Auto | Current Date | Creation timestamp |
| `updatedAt` | Date | Auto | Current Date | Last update timestamp |

---

## 5. Setup and Installation

### Prerequisites

Make sure you have the following installed on your machine:
- Node.js (version 18.0.0 or higher)
- npm (version 9.0.0 or higher)
- A running MongoDB instance (local MongoDB server or a MongoDB Atlas connection string)
- An OpenAI API key (optional, only needed for live AI recommendations)

### Step 1: Clone and Open Project

Open a terminal in the project root directory:

```bash
cd Lms
```

### Step 2: Configure and Start the Backend Server

1. Navigate to the server folder:

```bash
cd server
```

2. Install server dependencies:

```bash
npm install
```

3. Create the environment configuration file:

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

4. Configure your `.env` variables:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/lms
DB_NAME=lms
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
AI_REQUEST_LIMIT=200
```

Environment Variable Reference:
- `PORT`: Port number on which the Express server listens (default: 5000).
- `NODE_ENV`: Application environment (`development` or `production`).
- `CLIENT_URL`: Origin URL of the frontend application for CORS authorization (default: `http://localhost:5173`).
- `MONGODB_URI`: Connection string for MongoDB (local or Atlas).
- `DB_NAME`: Database name inside MongoDB.
- `JWT_SECRET`: Secret string used to sign and verify JWT authentication tokens.
- `JWT_EXPIRES_IN`: Lifespan of the generated token (for example, `7d`).
- `OPENAI_API_KEY`: API key for OpenAI (optional, system falls back if missing).
- `OPENAI_MODEL`: OpenAI model name to use (default: `gpt-3.5-turbo`).
- `AI_REQUEST_LIMIT`: Maximum number of allowed OpenAI requests (default: 200).

5. Seed Initial Data (Optional but Recommended):

The project includes a seed script that creates sample instructors and published courses:

```bash
npm run seed
```

Sample accounts created by the seed script:
- `dr_soren_vance` (password: `password123`)
- `elena_rostova` (password: `password123`)
- `marcus_chen` (password: `password123`)
- `aisha_patel` (password: `password123`)

6. Start the Backend Development Server:

```bash
npm run dev
```

The server will start on `http://localhost:5000`. You can verify it by opening `http://localhost:5000/api/health` in your browser.

### Step 3: Configure and Start the Frontend Client

1. Open a new terminal window and navigate to the client folder:

```bash
cd client
```

2. Install client dependencies:

```bash
npm install
```

3. Start the Frontend Development Server:

```bash
npm run dev
```

The client will start on `http://localhost:5173`. Open this URL in your web browser.

4. Build for Production (Optional):

```bash
npm run build
```

This checks TypeScript types and compiles the production bundle into the `dist` directory.

---

## 6. API Documentation

Base URL: `http://localhost:5000/api`

All protected endpoints expect authentication credentials via the `auth_token` HTTP-only cookie, which is automatically attached upon login or registration.

### 1. Authentication Endpoints

#### Register a New User
- Method: `POST`
- Path: `/api/auth/register`
- Access: Public
- Request Body:
```json
{
  "username": "johndoe",
  "password": "password123",
  "role": "student"
}
```
Note: `role` can be `'student'` or `'instructor'`. Defaults to `'student'`.
- Response: `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "60d0fe4f5311236168a109ca",
      "username": "johndoe",
      "role": "student",
      "createdAt": "2026-10-11T10:00:00.000Z"
    }
  }
}
```

#### Log In
- Method: `POST`
- Path: `/api/auth/login`
- Access: Public
- Request Body:
```json
{
  "username": "johndoe",
  "password": "password123"
}
```
- Response: `200 OK` (Sets HTTP-only `auth_token` cookie)
```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "user": {
      "id": "60d0fe4f5311236168a109ca",
      "username": "johndoe",
      "role": "student",
      "createdAt": "2026-10-11T10:00:00.000Z"
    }
  }
}
```

#### Log Out
- Method: `POST`
- Path: `/api/auth/logout`
- Access: Public
- Response: `200 OK` (Clears `auth_token` cookie)
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Get Current Profile
- Method: `GET`
- Path: `/api/auth/me`
- Access: Authenticated (Student or Instructor)
- Response: `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "60d0fe4f5311236168a109ca",
      "username": "johndoe",
      "role": "student",
      "createdAt": "2026-10-11T10:00:00.000Z"
    }
  }
}
```

---

### 2. Course Endpoints

#### List Courses
- Method: `GET`
- Path: `/api/courses`
- Access: Public
- Query Parameters:
  - `page` (number, default: 1): Page number.
  - `limit` (number, default: 10, max: 50): Number of items per page.
  - `offset` (number, optional): Custom skip count.
  - `q` or `search` (string, optional): Search keyword matching title or description.
  - `category` (string, optional): Filter by exact category.
  - `instructor` (string, optional): Filter by instructor ObjectId.
- Response: `200 OK`
```json
{
  "success": true,
  "message": "Courses retrieved successfully",
  "data": {
    "courses": [
      {
        "_id": "60d0fe4f5311236168a109cb",
        "title": "Full-Stack Systems Architecture",
        "description": "Learn resilient system design.",
        "content": "Course syllabus...",
        "category": "Engineering",
        "instructor": {
          "_id": "60d0fe4f5311236168a109ca",
          "username": "dr_soren_vance"
        },
        "createdAt": "2026-10-11T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalCourses": 1,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

#### Get Course by ID
- Method: `GET`
- Path: `/api/courses/:id`
- Access: Public
- Response: `200 OK`
```json
{
  "success": true,
  "data": {
    "course": {
      "_id": "60d0fe4f5311236168a109cb",
      "title": "Full-Stack Systems Architecture",
      "description": "Learn resilient system design.",
      "content": "Full course materials and modules...",
      "category": "Engineering",
      "instructor": {
        "_id": "60d0fe4f5311236168a109ca",
        "username": "dr_soren_vance"
      }
    }
  }
}
```

#### Create a Course
- Method: `POST`
- Path: `/api/courses`
- Access: Authenticated (Instructor only)
- Request Body:
```json
{
  "title": "TypeScript at Scale",
  "description": "Deep dive into advanced TypeScript patterns.",
  "content": "Module 1: Advanced Types. Module 2: Generics.",
  "category": "Engineering"
}
```
- Response: `201 Created`
```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "course": {
      "_id": "60d0fe4f5311236168a109cc",
      "title": "TypeScript at Scale",
      "description": "Deep dive into advanced TypeScript patterns.",
      "content": "Module 1: Advanced Types. Module 2: Generics.",
      "category": "Engineering",
      "instructor": "60d0fe4f5311236168a109ca"
    }
  }
}
```

#### Update a Course
- Method: `PUT`
- Path: `/api/courses/:id`
- Access: Authenticated (Instructor who owns the course)
- Request Body (at least one field required):
```json
{
  "title": "TypeScript at Scale (Updated)",
  "description": "Updated course description."
}
```
- Response: `200 OK`
```json
{
  "success": true,
  "message": "Course updated successfully",
  "data": {
    "course": {
      "_id": "60d0fe4f5311236168a109cc",
      "title": "TypeScript at Scale (Updated)",
      "description": "Updated course description.",
      "category": "Engineering"
    }
  }
}
```

#### Delete a Course
- Method: `DELETE`
- Path: `/api/courses/:id`
- Access: Authenticated (Instructor who owns the course)
- Note: Deleting a course updates related active student enrollments to `'dropped'`.
- Response: `200 OK`
```json
{
  "success": true,
  "message": "Course deleted successfully"
}
```

#### Get AI Course Recommendations
- Method: `POST`
- Path: `/api/courses/recommendations` (also available as `/api/v1/ai/recommendations`)
- Access: Public or Authenticated (if logged in as student, existing active enrollments are excluded from results)
- Request Body:
```json
{
  "prompt": "I want to learn modern backend development with TypeScript and databases"
}
```
- Response: `200 OK`
```json
{
  "success": true,
  "message": "Personalized course recommendations generated successfully",
  "data": {
    "source": "ai",
    "summary": "Here are courses tailored to your goals.",
    "courses": [
      {
        "_id": "60d0fe4f5311236168a109cb",
        "title": "Full-Stack Systems Architecture",
        "description": "Learn resilient system design.",
        "category": "Engineering",
        "reason": "Directly matches your interest in backend TypeScript architecture."
      }
    ]
  }
}
```
Note: If the OpenAI API key is missing or quota is exhausted, `source` returns `'fallback'` with recommendations selected from the course catalog.

#### Get AI Request Usage Status
- Method: `GET`
- Path: `/api/courses/recommendations/usage`
- Access: Public
- Response: `200 OK`
```json
{
  "success": true,
  "message": "AI usage budget status retrieved successfully",
  "data": {
    "count": 12,
    "limit": 200,
    "remaining": 188
  }
}
```

---

### 3. Enrollment Endpoints

#### Enroll in a Course
- Method: `POST`
- Path: `/api/enrollments`
- Access: Authenticated (Student only)
- Request Body:
```json
{
  "courseId": "60d0fe4f5311236168a109cb"
}
```
- Response: `201 Created`
```json
{
  "success": true,
  "message": "Successfully enrolled in course",
  "data": {
    "enrollment": {
      "_id": "60d0fe4f5311236168a109cd",
      "student": "60d0fe4f5311236168a109ca",
      "course": "60d0fe4f5311236168a109cb",
      "status": "enrolled",
      "enrollmentDate": "2026-10-11T10:00:00.000Z"
    }
  }
}
```
Note: Returns `409 Conflict` if the student is already enrolled.

#### Get My Enrollments
- Method: `GET`
- Path: `/api/enrollments/me`
- Access: Authenticated (Student only)
- Query Parameters:
  - `page` (number, default: 1)
  - `limit` (number, default: 10, max: 50)
  - `status` (string, optional: `'enrolled'`, `'completed'`, or `'dropped'`)
- Response: `200 OK`
```json
{
  "success": true,
  "message": "Enrollments retrieved successfully",
  "data": {
    "enrollments": [
      {
        "_id": "60d0fe4f5311236168a109cd",
        "course": {
          "_id": "60d0fe4f5311236168a109cb",
          "title": "Full-Stack Systems Architecture",
          "description": "Learn resilient system design.",
          "category": "Engineering",
          "instructor": {
            "_id": "60d0fe4f5311236168a109ca",
            "username": "dr_soren_vance"
          }
        },
        "status": "enrolled",
        "enrollmentDate": "2026-10-11T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalEnrollments": 1,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

#### Get Course Students (Roster)
- Method: `GET`
- Path: `/api/enrollments/course/:courseId`
- Access: Authenticated (Instructor who owns the course)
- Query Parameters: `page`, `limit`, `status`
- Response: `200 OK`
```json
{
  "success": true,
  "message": "Course enrollments retrieved successfully",
  "data": {
    "course": {
      "id": "60d0fe4f5311236168a109cb",
      "title": "Full-Stack Systems Architecture"
    },
    "enrollments": [
      {
        "_id": "60d0fe4f5311236168a109cd",
        "student": {
          "_id": "60d0fe4f5311236168a109ca",
          "username": "student_one",
          "role": "student"
        },
        "status": "enrolled",
        "enrollmentDate": "2026-10-11T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalEnrollments": 1,
      "totalPages": 1
    }
  }
}
```

#### Update Enrollment Status
- Method: `PATCH`
- Path: `/api/enrollments/:id/status`
- Access: Authenticated
  - Students can update their own status to `'dropped'`.
  - Instructors owning the course can update status to `'enrolled'`, `'completed'`, or `'dropped'`.
- Request Body:
```json
{
  "status": "completed"
}
```
- Response: `200 OK`
```json
{
  "success": true,
  "message": "Enrollment status updated successfully",
  "data": {
    "enrollment": {
      "_id": "60d0fe4f5311236168a109cd",
      "status": "completed",
      "completedAt": "2026-10-11T12:00:00.000Z"
    }
  }
}
```

#### Unenroll from Course
- Method: `DELETE`
- Path: `/api/enrollments/:id`
- Access: Authenticated (Student who owns the enrollment)
- Note: Cannot delete an enrollment that is already marked as completed.
- Response: `200 OK`
```json
{
  "success": true,
  "message": "Unenrolled successfully"
}
```

#### Check Enrollment Status
- Method: `GET`
- Path: `/api/enrollments/check/:courseId`
- Access: Authenticated (Student or Instructor)
- Response: `200 OK`
```json
{
  "success": true,
  "data": {
    "isEnrolled": true,
    "enrollment": {
      "_id": "60d0fe4f5311236168a109cd",
      "status": "enrolled"
    }
  }
}
```

---

### 4. Instructor Endpoints

#### List Instructors
- Method: `GET`
- Path: `/api/instructors`
- Access: Public
- Query Parameters:
  - `page` (number, default: 1)
  - `limit` (number, default: 12)
  - `q` or `search` (string, optional): Matches instructor username or course title.
  - `category` (string, optional): Filter by course category taught.
- Response: `200 OK`
```json
{
  "success": true,
  "message": "Instructors retrieved successfully",
  "data": {
    "instructors": [
      {
        "_id": "60d0fe4f5311236168a109ca",
        "username": "dr_soren_vance",
        "role": "instructor",
        "coursesCount": 2,
        "categories": ["Engineering"],
        "courses": [
          {
            "_id": "60d0fe4f5311236168a109cb",
            "title": "Full-Stack Systems Architecture",
            "category": "Engineering",
            "description": "Learn resilient system design."
          }
        ],
        "totalStudents": 45
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "totalInstructors": 1,
      "totalPages": 1
    }
  }
}
```

#### Get Instructor Details
- Method: `GET`
- Path: `/api/instructors/:id`
- Access: Public
- Response: `200 OK`
```json
{
  "success": true,
  "message": "Instructor details retrieved successfully",
  "data": {
    "instructor": {
      "_id": "60d0fe4f5311236168a109ca",
      "username": "dr_soren_vance",
      "role": "instructor",
      "coursesCount": 2,
      "categories": ["Engineering"],
      "courses": [
        {
          "_id": "60d0fe4f5311236168a109cb",
          "title": "Full-Stack Systems Architecture",
          "category": "Engineering",
          "description": "Learn resilient system design."
        }
      ],
      "totalStudents": 45
    }
  }
}
```

---

### 5. System Health Endpoint

#### Check Server and Database Health
- Method: `GET`
- Path: `/api/health`
- Access: Public
- Response: `200 OK` (or `503 Service Unavailable` if database disconnected)
```json
{
  "status": "ok",
  "message": "LMS Backend Server and Database are operational",
  "timestamp": "2026-10-11T12:00:00.000Z",
  "env": "development",
  "database": {
    "status": "connected",
    "name": "lms",
    "host": "localhost"
  }
}
```

---

## 7. Testing

The backend includes automated tests using Vitest and Supertest covering models, middleware, controllers, routes, and recommendation services.

### Running Backend Tests

Navigate to the `server` directory:

```bash
cd server
```

Run test suite once:

```bash
npm test
```

Run tests in watch mode during development:

```bash
npm run test:watch
```

Run tests with coverage reporting:

```bash
npm run test:coverage
```

### Test Suite Overview

- `user.test.ts`: User model validation, password hashing, and comparison tests.
- `jwt.test.ts`: JWT token signing, verification, and expiration tests.
- `auth.middleware.test.ts`: Token extraction and role authorization middleware tests.
- `auth.routes.test.ts`: Registration, login, logout, and profile endpoints.
- `course.routes.test.ts`: Course creation, editing, deletion, pagination, and ownership controls.
- `enrollment.routes.test.ts`: Student enrollments, duplicate checks, roster views, and status updates.
- `instructor.routes.test.ts`: Instructor listing, search filters, and statistics calculation.
- `recommendation.routes.test.ts`: AI recommendation endpoints, input sanitization, and quota usage checks.
- `recommendation.service.test.ts`: Unit tests for prompt sanitization, candidate discovery, and fallback modes.

---

## 8. Project Folder Structure

```text
Lms/
+-- client/                     Frontend React application
|   +-- public/                 Static assets
|   +-- src/
|   |   +-- assets/             SVGs and branding assets
|   |   +-- components/         React UI components
|   |   |   +-- auth/           Login and registration screens
|   |   |   +-- course/         Course list, cards, and detail pages
|   |   |   +-- dashboard/      Student and instructor dashboards
|   |   |   +-- instructors/    Instructor listing and profile cards
|   |   |   +-- landing/        Home landing page and navigation
|   |   |   +-- layout/         Navbar, footer, and protected route wrapper
|   |   |   \-- recommendations/ AI recommendation interface
|   |   +-- hooks/              Custom React hooks (useAuth, useCourses)
|   |   +-- schemas/            Zod validation schemas for forms
|   |   +-- services/           API client functions
|   |   +-- types/              TypeScript type definitions
|   |   +-- App.css             Root application styles
|   |   +-- App.tsx             Root router and page definitions
|   |   +-- index.css           Global CSS tokens, resets, and themes
|   |   \-- main.tsx            React entry point
|   +-- index.html              HTML document entry
|   +-- package.json            Client package scripts and dependencies
|   +-- tsconfig.json           Client TypeScript configuration
|   \-- vite.config.ts          Vite configuration
|
+-- server/                     Backend Express application
|   +-- src/
|   |   +-- __tests__/          Automated test suite (Vitest + Supertest)
|   |   +-- config/             Database connection and health checks
|   |   +-- controllers/        Route controller functions
|   |   |   +-- authController.ts
|   |   |   +-- courseController.ts
|   |   |   +-- enrollmentController.ts
|   |   |   +-- instructorController.ts
|   |   |   \-- recommendationController.ts
|   |   +-- middleware/         Authentication and role authorization
|   |   +-- models/             Mongoose database models
|   |   |   +-- AIUsage.ts
|   |   |   +-- Course.ts
|   |   |   +-- Enrollment.ts
|   |   |   \-- User.ts
|   |   +-- routes/             Express route definitions
|   |   +-- scripts/            Database seed scripts (seed.ts)
|   |   +-- services/           Business logic and AI recommendation service
|   |   +-- types/              TypeScript interfaces and ActionResult
|   |   +-- utils/              JWT helpers, cookie options, error classes
|   |   \-- index.ts            Express server entry point and lifecycle
|   +-- .env.example            Template for environment variables
|   +-- package.json            Server package scripts and dependencies
|   +-- tsconfig.json           Server TypeScript configuration
|   \-- vitest.config.ts        Vitest test runner configuration
|
\-- README.md                   Project documentation
```
