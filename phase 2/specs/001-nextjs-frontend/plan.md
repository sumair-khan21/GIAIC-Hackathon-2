# Implementation Plan: Next.js Frontend

**Branch**: `001-nextjs-frontend` | **Date**: 2026-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-nextjs-frontend/spec.md`

## Summary

Build a Next.js 16+ frontend for the Todo Full-Stack application using App Router, Better Auth for authentication, and Tailwind CSS for styling. The frontend communicates with a FastAPI backend at http://localhost:8000 via REST API with JWT authentication.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Node.js 18+
**Primary Dependencies**: Next.js 16+, Better Auth, React Hook Form, Zod
**Storage**: N/A (frontend only, backend handles persistence)
**Testing**: Manual testing (Phase 2 scope)
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (monorepo frontend component)
**Performance Goals**: <2s initial load, <100ms interaction response
**Constraints**: Must use App Router, must use Better Auth, must connect to FastAPI backend
**Scale/Scope**: Single user, personal todo management, 5 pages, 5 components

## Constitution Check

*GATE: All gates pass ✅*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Spec-First Development | ✅ | All specs created in /specs/frontend/ before implementation |
| II. Monorepo Architecture | ✅ | Frontend in /frontend/ folder, separate from backend |
| III. Stateless JWT Authentication | ✅ | Better Auth with JWT, httpOnly cookies |
| IV. User Data Isolation | ✅ | API client includes user_id in all requests |
| V. RESTful API Design | ✅ | All endpoints follow /api/{user_id}/resource pattern |
| VI. Graceful Error Handling | ✅ | Error handling spec defines all status codes |

## Project Structure

### Documentation (this feature)

```text
specs/001-nextjs-frontend/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Technology decisions
├── data-model.md        # TypeScript types and validation
├── quickstart.md        # Setup instructions
├── contracts/           # API endpoint contracts
│   └── api-endpoints.md
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout with providers
│   │   ├── page.tsx             # Home redirect
│   │   ├── globals.css          # Global styles
│   │   ├── not-found.tsx        # 404 page
│   │   ├── error.tsx            # Global error boundary
│   │   ├── auth/
│   │   │   ├── signin/
│   │   │   │   └── page.tsx     # Login page
│   │   │   └── signup/
│   │   │       └── page.tsx     # Registration page
│   │   ├── dashboard/
│   │   │   ├── page.tsx         # Main task interface
│   │   │   └── loading.tsx      # Loading skeleton
│   │   └── tasks/
│   │       └── [id]/
│   │           ├── page.tsx     # Task detail page
│   │           ├── loading.tsx  # Loading skeleton
│   │           └── error.tsx    # Error boundary
│   ├── components/
│   │   ├── Header.tsx           # App header with logout
│   │   ├── TaskCard.tsx         # Individual task card
│   │   ├── TaskForm.tsx         # Create/edit task form
│   │   ├── TaskList.tsx         # Task list container
│   │   └── FilterBar.tsx        # Filter buttons
│   ├── lib/
│   │   ├── api.ts               # API client with JWT
│   │   ├── auth.ts              # Better Auth configuration
│   │   └── validations.ts       # Zod schemas
│   └── types/
│       ├── auth.ts              # Auth types
│       ├── task.ts              # Task types
│       └── api.ts               # API response types
├── middleware.ts                 # Route protection
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript config
└── package.json                 # Dependencies
```

**Structure Decision**: Web application structure with /frontend/ containing Next.js App Router project per constitution's monorepo architecture principle.

---

## Phase 1: Project Setup & Configuration

**Goal**: Initialize Next.js project with all tooling configured

### T1.1 Initialize Next.js Project

```bash
mkdir -p frontend
cd frontend
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
```

Select: TypeScript ✓, ESLint ✓, Tailwind ✓, src/ ✓, App Router ✓

**Files Created**: package.json, tsconfig.json, tailwind.config.ts, next.config.ts

### T1.2 Install Dependencies

```bash
npm install better-auth react-hook-form zod @hookform/resolvers
```

### T1.3 Configure Environment Variables

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=your-32-character-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
```

### T1.4 Configure Tailwind Theme

Update `tailwind.config.ts` with custom colors from styling spec:
- Primary: #3B82F6
- Primary-dark: #2563EB
- Success: #10B981
- Error: #EF4444

### T1.5 Create Folder Structure

Create directories:
- `src/components/`
- `src/lib/`
- `src/types/`

**Acceptance Criteria**:
- [ ] `npm run dev` runs without errors
- [ ] TypeScript compiles
- [ ] Tailwind classes work
- [ ] Environment variables load

---

## Phase 2: TypeScript Types & Validation

**Goal**: Define all TypeScript types and Zod validation schemas

### T2.1 Create Auth Types

File: `src/types/auth.ts`
- User interface
- Session interface
- AuthError interface

### T2.2 Create Task Types

File: `src/types/task.ts`
- Task interface
- CreateTaskInput interface
- UpdateTaskInput interface
- TaskFilter type

### T2.3 Create API Types

File: `src/types/api.ts`
- ApiResponse<T> interface
- ApiError interface
- Response type aliases

### T2.4 Create Validation Schemas

File: `src/lib/validations.ts`
- signinSchema (email, password)
- signupSchema (email, password, confirmPassword)
- taskSchema (title, description)

**Acceptance Criteria**:
- [ ] All types defined and exported
- [ ] Zod schemas validate correctly
- [ ] No TypeScript errors

---

## Phase 3: Authentication Setup

**Goal**: Configure Better Auth and build auth pages

### T3.1 Configure Better Auth Client

File: `src/lib/auth.ts`
- Create auth client with Better Auth
- Configure JWT plugin
- Export auth helper functions

### T3.2 Build Signup Page

File: `src/app/auth/signup/page.tsx`
- Client Component with form
- Email, password, confirmPassword fields
- Zod validation with react-hook-form
- Better Auth signUp call
- Redirect to /dashboard on success
- Error display

Reference: `specs/frontend/pages/auth-pages.md`

### T3.3 Build Signin Page

File: `src/app/auth/signin/page.tsx`
- Client Component with form
- Email, password fields
- Zod validation
- Better Auth signIn call
- Redirect to /dashboard on success
- Link to signup

Reference: `specs/frontend/pages/auth-pages.md`

### T3.4 Create Protected Route Middleware

File: `frontend/middleware.ts`
- Check for auth token
- Protect /dashboard and /tasks routes
- Redirect to /auth/signin if unauthenticated
- Redirect authenticated users away from /auth pages

Reference: `specs/frontend/routing.md`

**Acceptance Criteria**:
- [ ] Signup creates account and redirects
- [ ] Signin authenticates and redirects
- [ ] Protected routes redirect unauthenticated users
- [ ] Form validation works

---

## Phase 4: API Client Implementation

**Goal**: Build typed API client for backend communication

### T4.1 Create API Base Client

File: `src/lib/api.ts`
- Base URL from environment
- Fetch wrapper with error handling
- JWT token attachment
- Response parsing

### T4.2 Implement Task API Functions

In `src/lib/api.ts`:
- getTasks(userId, filter?)
- createTask(userId, data)
- getTask(userId, taskId)
- updateTask(userId, taskId, data)
- deleteTask(userId, taskId)
- toggleComplete(userId, taskId)

### T4.3 Implement Error Handling

- Parse API error responses
- Handle 401 → redirect to signin
- Handle 403, 404, 500 → show error

Reference: `specs/frontend/api-client.md`, `contracts/api-endpoints.md`

**Acceptance Criteria**:
- [ ] All API functions typed correctly
- [ ] JWT token attached to requests
- [ ] Errors parsed and handled

---

## Phase 5: Reusable Components

**Goal**: Build all UI components from specs

### T5.1 Build Header Component

File: `src/components/Header.tsx`
- Display app name, user email
- Logout button with Better Auth signOut
- Responsive layout

Reference: `specs/frontend/components/header.md`

### T5.2 Build TaskCard Component

File: `src/components/TaskCard.tsx` (Client Component)
- Display task title, description preview
- Checkbox for completion toggle
- Click to navigate to detail
- Styling for completed state

Reference: `specs/frontend/components/task-card.md`

### T5.3 Build TaskForm Component

File: `src/components/TaskForm.tsx` (Client Component)
- Create and edit modes
- Title input, description textarea
- Zod validation with react-hook-form
- Loading state
- Error display

Reference: `specs/frontend/components/task-form.md`

### T5.4 Build TaskList Component

File: `src/components/TaskList.tsx`
- Render TaskCard for each task
- Empty state message
- Loading skeleton

Reference: `specs/frontend/components/task-list.md`

### T5.5 Build FilterBar Component

File: `src/components/FilterBar.tsx` (Client Component)
- All, Pending, Completed buttons
- Active state styling
- URL param updates

Reference: `specs/frontend/components/filter-bar.md`

**Acceptance Criteria**:
- [ ] All components render without errors
- [ ] Props typed correctly
- [ ] Styling matches spec
- [ ] Client/Server components used correctly

---

## Phase 6: Dashboard Page

**Goal**: Build main task management interface

### T6.1 Create Dashboard Layout

File: `src/app/dashboard/layout.tsx`
- Include Header component
- Main content wrapper

### T6.2 Build Dashboard Page

File: `src/app/dashboard/page.tsx`
- Server Component for initial data
- Get session and user_id
- Fetch tasks on server
- Render FilterBar, TaskForm, TaskList

Reference: `specs/frontend/pages/dashboard.md`

### T6.3 Add Dashboard Loading State

File: `src/app/dashboard/loading.tsx`
- Skeleton UI for task list

### T6.4 Implement Task Operations

Dashboard page features:
- Create task → TaskForm in create mode
- Toggle complete → optimistic update
- Edit → navigate to detail or inline
- Delete → confirmation dialog
- Filter → URL params

**Acceptance Criteria**:
- [ ] Tasks display on page load
- [ ] Create task works
- [ ] Toggle complete works
- [ ] Filter works
- [ ] Loading state displays

---

## Phase 7: Task Detail Page

**Goal**: Build individual task view and edit

### T7.1 Create Task Detail Page

File: `src/app/tasks/[id]/page.tsx`
- Server Component
- Fetch task by ID
- Display full task details
- Edit and delete buttons

Reference: `specs/frontend/pages/task-detail.md`

### T7.2 Add Loading and Error States

Files:
- `src/app/tasks/[id]/loading.tsx`
- `src/app/tasks/[id]/error.tsx`

### T7.3 Implement Edit Functionality

- TaskForm in edit mode
- Pre-fill with task data
- Save and cancel buttons

### T7.4 Implement Delete Functionality

- Confirmation dialog
- Delete API call
- Redirect to dashboard

### T7.5 Handle Not Found

- 404 for non-existent task
- User-friendly message

**Acceptance Criteria**:
- [ ] Task details display correctly
- [ ] Edit saves changes
- [ ] Delete removes task
- [ ] 404 handled gracefully

---

## Phase 8: Routing & Global Error Handling

**Goal**: Complete navigation and error handling

### T8.1 Setup Home Page Redirect

File: `src/app/page.tsx`
- Check auth state
- Redirect to /dashboard or /auth/signin

### T8.2 Create 404 Page

File: `src/app/not-found.tsx`
- Styled 404 message
- Link to dashboard

### T8.3 Create Global Error Boundary

File: `src/app/error.tsx`
- User-friendly error display
- Retry button

Reference: `specs/frontend/error-handling.md`, `specs/frontend/routing.md`

**Acceptance Criteria**:
- [ ] Home redirects correctly
- [ ] 404 page displays
- [ ] Errors caught and displayed

---

## Phase 9: Testing & Polish

**Goal**: Verify all functionality and optimize

### T9.1 Manual Testing

Test all user flows:
- Signup → Dashboard → Create → Edit → Delete → Logout
- Signin → Filter → Toggle → Detail → Back

### T9.2 Responsive Testing

- Mobile (375px)
- Tablet (768px)
- Desktop (1024px+)

### T9.3 Error Handling Testing

- Invalid forms
- Network errors (disconnect)
- Invalid task IDs

### T9.4 Production Build

```bash
npm run build
npm run start
```

**Acceptance Criteria**:
- [ ] All features work as specified
- [ ] No console errors
- [ ] Responsive on all sizes
- [ ] Production build succeeds

---

## Implementation Order Summary

```
Phase 1: Setup (foundation)
    ↓
Phase 2: Types (data structures)
    ↓
Phase 3: Auth (user system)
    ↓
Phase 4: API Client (backend connection)
    ↓
Phase 5: Components (reusable UI)
    ↓
Phase 6: Dashboard (main feature)
    ↓
Phase 7: Detail Page (secondary feature)
    ↓
Phase 8: Routing (navigation)
    ↓
Phase 9: Testing (quality)
```

## Critical Dependencies

| Phase | Depends On | Blocks |
|-------|------------|--------|
| 1 | - | All |
| 2 | 1 | 3, 4, 5 |
| 3 | 1, 2 | 4, 6, 7 |
| 4 | 2, 3 | 5, 6, 7 |
| 5 | 2, 4 | 6, 7 |
| 6 | 5, 4 | 7, 9 |
| 7 | 5, 4 | 9 |
| 8 | 6, 7 | 9 |
| 9 | All | - |

## Complexity Tracking

No constitution violations. Implementation follows all principles:
- Spec-first: All specs created before this plan
- Monorepo: Frontend in /frontend/ folder
- JWT Auth: Better Auth with JWT configured
- Data Isolation: API includes user_id in all calls
- REST: Standard patterns used
- Error Handling: All status codes handled
