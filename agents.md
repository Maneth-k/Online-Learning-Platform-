# LMS Project Architecture & Development Guidelines
**Role: Senior Tech Lead**  
**Project:** Learning Management System (LMS) Full-Stack Assessment  
**Date:** October 2026  

---

## 1. Executive Summary & Working Agreement

Welcome to the LMS project. As your **Senior Tech Lead**, my role is to pair with you to build a production-grade, maintainable, and secure Learning Management System that adheres to current industry standards.

### Our Working Protocol:
- **Challenge Assumptions:** Every library, architectural decision, and schema choice must have a clear technical justification.
- **Strict Typing:** All frontend and backend code is standardized on **TypeScript** to eliminate contract mismatch bugs at compile-time.
- **Fail Early, Fail Safe:** Strict validation at boundaries (requests, inputs, environment variables) with centralized error handling.
- **Separation of Concerns:** Clear boundaries between presentation, routing, business logic, and data access.

---

## 2. Technology Stack & Decision Records

| Layer | Chosen Technology | Rationale & Standards |
| :--- | :--- | :--- |
| **Frontend** | React 19 + TypeScript + Vite | Blazing fast HMR, strict type safety, zero legacy bundler overhead. |
| **Styling** | Vanilla CSS Design System | High-performance CSS custom properties design tokens, accessible, zero extra CSS dependency bloat. |
| **Backend** | Express 5 + TypeScript (ESM) | Native async route handlers in Express 5, strict ES modules (`"type": "module"`). |
| **Testing** | Vitest + Supertest | Blazing fast ESM-native test runner, Jest-compatible API, integrated HTTP assertions with supertest. |
| **Runtime & Dev Server** | `tsx` (`tsx watch`) & `node` | Modern TypeScript execution engine built on `esbuild`. Instant execution with zero transpilation boilerplate, replaces outdated `ts-node` + `nodemon` setups. |

> **Tech Lead Note on Nodemon vs. `tsx`:**  
> In legacy setups, `nodemon` was paired with `ts-node`. In modern TypeScript (2024–2026), `tsx watch` is the industry benchmark because it natively parses modern TypeScript and ESM without complex compilation pipelines or transitive dependency vulnerabilities. We also provided `npm run dev:nodemon` in `package.json` for backward compatibility.

---

## 3. Repository Structure

```text
Lms/
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── assets/             # Static SVGs and imagery
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Routed page views (Dashboard, Courses, Auth, etc.)
│   │   ├── services/           # API clients and HTTP endpoints
│   │   ├── types/              # Frontend TypeScript interfaces & types
│   │   ├── App.tsx             # Root application view
│   │   ├── App.css             # Root component styles
│   │   ├── index.css           # Global design system tokens & resets
│   │   ├── main.tsx            # DOM bootstrap
│   │   └── vite-env.d.ts       # Vite client typings
│   ├── index.html              # HTML shell
│   ├── package.json            # Client dependencies and scripts
│   ├── tsconfig.json           # Client root TypeScript configuration
│   ├── tsconfig.app.json       # Browser app TypeScript settings
│   └── vite.config.ts          # Vite bundler configuration
│
├── server/                     # Backend API Application
│   ├── src/
│   │   ├── config/             # DB connection, env config (to be added)
│   │   ├── controllers/        # Route controllers (req/res orchestration)
│   │   ├── middleware/         # Auth, validation, error handler middlewares
│   │   ├── models/             # Data models / Schemas
│   │   ├── routes/             # Express API routes
│   │   ├── services/           # Core business logic layer
│   │   ├── types/              # Shared backend types
│   │   └── index.ts            # Server entry point & graceful shutdown
│   ├── .env                    # Local environment variables
│   ├── .env.example            # Environment template
│   ├── package.json            # Server dependencies and scripts
│   └── tsconfig.json           # Server TypeScript configuration (NodeNext)
│
├── .gitignore                  # Monorepo root ignore file
└── agents.md                   # This guidelines and roadmap document
```

---

## 4. Step-by-Step Implementation Roadmap

When continuing this assessment, execute the following steps in sequence:

### Phase 1: Environment & Database Layer
1. **Choose Database Engine:** Confirm whether the assessment specifies MongoDB (Mongoose), PostgreSQL (Prisma / Drizzle), or SQLite.
2. **Environment Validation:** Implement typed environment validation (e.g., using `zod` or `envalid`) to guarantee all required variables (`PORT`, `DATABASE_URL`, `JWT_SECRET`) exist at startup.
3. **Database Connection Lifecycle:** Set up connection pools with graceful disconnection on process termination.

### Phase 2: Domain Modeling & Database Schema
1. **User & Roles:** `Student`, `Instructor`, `Admin`.
2. **Course Catalog:** `Course` (title, description, price, instructorId, status).
3. **Course Content:** `Module` and `Lesson` (videoUrl, textContent, duration, orderIndex).
4. **Enrollments & Progress:** `Enrollment` (userId, courseId, progressPercentage, completedLessons).

### Phase 3: Security & Authentication
1. **Password Hashing:** `bcrypt` or `argon2`.
2. **Authentication Flow:** Stateless JWTs or HTTP-only signed cookies.
3. **Authorization Middleware:** `authenticate` and `authorizeRoles('instructor', 'admin')`.
4. **Security Hardening:** Add `helmet`, `express-rate-limit`, and sanitized CORS origin whitelist.

### Phase 4: RESTful API Layer (Controller-Service Pattern)
1. **Input Validation:** Use `zod` schema middleware on all route inputs (`req.body`, `req.params`, `req.query`).
2. **Service Layer:** Keep controllers thin; place domain rules and DB queries inside `/services`.
3. **Unified Response Format (`ActionResult<T>`):**
   All API endpoints and controllers must type their responses using the standardized `ActionResult<T>` type (`server/src/types/actionResult.ts`):
   ```typescript
   export interface ActionResult<T = unknown> {
     success: boolean;
     message?: string;
     data?: T;
     error?: string;
   }
   ```
   Express handlers must type the response parameter as `res: Response<ActionResult<T>>` to ensure compile-time adherence:
   ```typescript
   export const getCourses = async (
     req: Request,
     res: Response<ActionResult<{ courses: ICourse[] }>>
   ): Promise<void> => { ... };
   ```
4. **Centralized Error Handling:** All errors routed to the global error middleware via custom `ApiError` class.

### Phase 5: Frontend Integration & UI/UX
1. **API Client:** Centralized fetch/axios instance with base URL and auth token interceptors.
2. **State & Cache:** TanStack Query (`@tanstack/react-query`) or custom hooks with caching and loading/error states.
3. **Route Management:** React Router with Protected Route wrappers.
4. **UI Components:** Premium, responsive dashboard, course catalog, lesson player, and instructor management panel.

### Phase 6: Quality Assurance & Production Polish
1. **Type Check & Lint:** Ensure zero errors on `npm run build` in both `client` and `server`.
2. **API & Unit Testing:** Comprehensive test coverage for all use cases using Vitest and Supertest:
   - **Test File Naming Convention:** All test files must follow `*.test.ts` (e.g. `user.test.ts`, `jwt.test.ts`, `auth.middleware.test.ts`, `auth.routes.test.ts`).
   - **Coverage Standard:** Every domain model, controller endpoint, and security middleware must have dedicated test cases covering both happy paths and edge cases (400, 401, 403, 404, 409).
   - **Isolation:** Fast, deterministic unit & HTTP integration tests without external network dependencies.
3. **Documentation:** OpenAPI/Swagger or Postman collection.

---

## 5. Development Command Reference

### Client:
```bash
cd client
npm run dev        # Start Vite dev server on http://localhost:5173
npm run build      # Typecheck and create production bundle (dist/)
npm run preview    # Preview production bundle locally
```

### Server:
```bash
cd server
npm run dev        # Run with live reload via tsx watch on http://localhost:5000
npm run dev:nodemon# Alternative live reload via nodemon
npm run build      # Compile TypeScript into JavaScript (dist/)
npm run start      # Run production compiled server
npm test           # Execute Vitest test suite once
npm run test:watch # Run Vitest in interactive watch mode
npm run test:coverage # Generate test coverage report
```

---

## 6. Tech Lead Code Review Checklist (Run Before Every Submission)
- [ ] No `any` types in TypeScript (use `unknown` or specific interfaces).
- [ ] No secrets or API keys hardcoded in code (all via `.env`).
- [ ] Every API endpoint has input validation and handles edge cases (e.g., 400 Bad Request, 404 Not Found, 401/403 Auth).
- [ ] Every use case has automated test coverage in a `*.test.ts` file (e.g., `user.test.ts`).
- [ ] All tests pass via `npm test` before submitting code.
- [ ] No unhandled promise rejections.
- [ ] Frontend handles all 3 states: `Loading`, `Error`, and `Success/Empty`.
- [ ] CSS adheres to the responsive design tokens in `index.css`.

