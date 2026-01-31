# Tasks: Next.js Frontend

**Input**: Design documents from `/specs/001-nextjs-frontend/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/api-endpoints.md ✓

**Tests**: Manual testing only (Phase 2 scope - no automated tests)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and Next.js configuration

- [x] T001 Initialize Next.js project in `frontend/` with TypeScript, Tailwind, App Router, src directory
- [x] T002 Install dependencies: better-auth, react-hook-form, zod, @hookform/resolvers
- [x] T003 [P] Create environment file `frontend/.env.local` with API_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL
- [x] T004 [P] Configure Tailwind theme colors in `frontend/src/app/globals.css` (primary, success, error)
- [x] T005 [P] Create folder structure: `frontend/src/components/`, `frontend/src/lib/`, `frontend/src/types/`

**Checkpoint**: `npm run dev` starts without errors, TypeScript compiles, Tailwind works

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Type Definitions

- [x] T006 [P] Create auth types in `frontend/src/types/auth.ts` (User, Session, AuthError interfaces)
- [x] T007 [P] Create task types in `frontend/src/types/task.ts` (Task, CreateTaskInput, UpdateTaskInput, TaskFilter)
- [x] T008 [P] Create API types in `frontend/src/types/api.ts` (ApiResponse<T>, ApiError, TaskListResponse, TaskResponse)

### Validation Schemas

- [x] T009 Create Zod validation schemas in `frontend/src/lib/validations.ts` (signinSchema, signupSchema, taskSchema)

### Authentication Infrastructure

- [x] T010 Configure Better Auth client in `frontend/src/lib/auth.ts` with JWT plugin

### API Client

- [x] T011 Create base API client in `frontend/src/lib/api.ts` with fetch wrapper, JWT attachment, error handling
- [x] T012 Implement task API functions in `frontend/src/lib/api.ts` (getTasks, createTask, getTask, updateTask, deleteTask, toggleComplete)

### Global Layout

- [x] T013 Update root layout `frontend/src/app/layout.tsx` with metadata and global providers
- [x] T014 [P] Update global styles `frontend/src/app/globals.css` with base Tailwind directives

**Checkpoint**: Foundation ready - all types defined, API client operational, user story implementation can now begin

---

## Phase 3: User Story 1 - User Registration (Priority: P1) 🎯 MVP

**Goal**: New users can create an account to access the application

**Independent Test**: Complete signup form with valid email/password → account created → redirect to dashboard

### Implementation for User Story 1

- [x] T015 [US1] Create signup page at `frontend/src/app/auth/signup/page.tsx`
  - Client Component with react-hook-form
  - Email, password, confirmPassword fields
  - Zod validation using signupSchema
  - Better Auth signUp call
  - Redirect to /dashboard on success
  - Error display for validation and API errors
  - Link to signin page

**Checkpoint**: User Story 1 complete - new users can register accounts

---

## Phase 4: User Story 2 - User Authentication (Priority: P1) 🎯 MVP

**Goal**: Registered users can sign in and access protected pages

**Independent Test**: Sign in with valid credentials → authenticated → dashboard accessible; logout → session ends

### Implementation for User Story 2

- [x] T016 [US2] Create signin page at `frontend/src/app/auth/signin/page.tsx`
  - Client Component with react-hook-form
  - Email, password fields
  - Zod validation using signinSchema
  - Better Auth signIn call
  - Redirect to /dashboard on success
  - Link to signup page

- [x] T017 [US2] Create route protection middleware at `frontend/middleware.ts`
  - Check for auth token
  - Protect /dashboard and /tasks routes
  - Redirect unauthenticated to /auth/signin
  - Redirect authenticated away from /auth pages

- [x] T018 [US2] Build Header component at `frontend/src/components/Header.tsx`
  - Display app name "Todo App"
  - Display user email
  - Logout button with Better Auth signOut
  - Redirect to /auth/signin on logout

**Checkpoint**: User Story 2 complete - users can authenticate, protected routes enforced, logout works

---

## Phase 5: User Story 3 - Task CRUD Operations (Priority: P1) 🎯 MVP

**Goal**: Authenticated users can create, view, edit, and delete tasks

**Independent Test**: Create task → appears in list → click to view detail → edit title → delete → removed from list

### Components for User Story 3

- [x] T019 [P] [US3] Build TaskCard component at `frontend/src/components/TaskCard.tsx`
  - Display task title, description preview (50 chars)
  - Click to navigate to detail page
  - Visual styling for card container

- [x] T020 [P] [US3] Build TaskForm component at `frontend/src/components/TaskForm.tsx`
  - Support create and edit modes via props
  - Title input (required, 1-200 chars)
  - Description textarea (optional, max 1000 chars)
  - Zod validation with react-hook-form
  - Loading state during submission
  - Error display

- [x] T021 [P] [US3] Build TaskList component at `frontend/src/components/TaskList.tsx`
  - Render TaskCard for each task
  - Empty state: "No tasks yet. Create your first task!"
  - Loading skeleton support

### Pages for User Story 3

- [x] T022 [US3] Build dashboard page at `frontend/src/app/dashboard/page.tsx`
  - Server Component for initial task fetch
  - Get session and extract user_id
  - Fetch tasks from API
  - Render TaskForm (create mode), TaskList
  - Handle task creation with router.refresh()

- [x] T023 [US3] Create dashboard loading state at `frontend/src/app/dashboard/loading.tsx`
  - Skeleton UI for header and task list

- [x] T024 [US3] Build task detail page at `frontend/src/app/tasks/[id]/page.tsx`
  - Server Component
  - Fetch single task by ID
  - Display full task details (title, description, timestamps)
  - Edit button to show TaskForm (edit mode)
  - Delete button with confirmation dialog
  - Back button to dashboard

- [x] T025 [US3] Create task detail loading state at `frontend/src/app/tasks/[id]/loading.tsx`
  - Skeleton for task detail view

- [x] T026 [US3] Create task detail error boundary at `frontend/src/app/tasks/[id]/error.tsx`
  - User-friendly error display
  - Retry button
  - Link back to dashboard

**Checkpoint**: User Story 3 complete - full CRUD operations working

---

## Phase 6: User Story 4 - Task Status Management (Priority: P2)

**Goal**: Users can mark tasks complete/incomplete to track progress

**Independent Test**: Click complete on pending task → marked complete with visual indicator → click again → returns to pending

### Implementation for User Story 4

- [x] T027 [US4] Update TaskCard component at `frontend/src/components/TaskCard.tsx`
  - Add checkbox for completion toggle
  - Visual styling for completed state (line-through, muted colors)
  - Call toggleComplete API on checkbox change
  - Optimistic UI update

- [x] T028 [US4] Update task detail page at `frontend/src/app/tasks/[id]/page.tsx`
  - Show completion status prominently
  - Add toggle button for status change

**Checkpoint**: User Story 4 complete - task status can be toggled

---

## Phase 7: User Story 5 - Task Filtering (Priority: P2)

**Goal**: Users can filter task list by status (all, pending, completed)

**Independent Test**: Select "Pending" → only incomplete tasks shown; select "Completed" → only completed tasks; select "All" → all tasks

### Implementation for User Story 5

- [x] T029 [US5] Build FilterBar component at `frontend/src/components/FilterBar.tsx`
  - Three filter buttons: All, Pending, Completed
  - Active state styling for selected filter
  - Update URL search params on filter change

- [x] T030 [US5] Update dashboard page at `frontend/src/app/dashboard/page.tsx`
  - Read filter from URL searchParams
  - Pass filter to getTasks API call
  - Render FilterBar above TaskList

**Checkpoint**: User Story 5 complete - filtering works for all status types

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, routing, and production readiness

### Global Error Handling

- [x] T031 [P] Create home page redirect at `frontend/src/app/page.tsx`
  - Check auth state
  - Redirect to /dashboard if authenticated
  - Redirect to /auth/signin if not authenticated

- [x] T032 [P] Create 404 page at `frontend/src/app/not-found.tsx`
  - Styled "Page Not Found" message
  - Link to dashboard

- [x] T033 [P] Create global error boundary at `frontend/src/app/error.tsx`
  - User-friendly error display
  - Retry button
  - Log error for debugging

### Production Build

- [x] T034 Run production build: `npm run build` in frontend/
- [x] T035 Test production server: `npm run start` in frontend/

### Manual Testing

- [x] T036 Test complete user flow: Signup → Dashboard → Create Task → Edit → Toggle Complete → Filter → Delete → Logout
- [x] T037 Test responsive design: Mobile (375px), Tablet (768px), Desktop (1024px+)
- [x] T038 Test error scenarios: Invalid forms, network errors, invalid task IDs

**Checkpoint**: Application production-ready, all features functional

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 (Registration) → US2 (Authentication) should be sequential
  - US2 (Authentication) → US3 (CRUD) should be sequential (need auth to test)
  - US4 (Status) and US5 (Filtering) can run in parallel after US3
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

| Story | Depends On | Can Run After |
|-------|------------|---------------|
| US1 (Registration) | Phase 2 | Phase 2 complete |
| US2 (Authentication) | US1 | US1 complete |
| US3 (CRUD) | US2 | US2 complete |
| US4 (Status) | US3 | US3 complete |
| US5 (Filtering) | US3 | US3 complete |

### Parallel Opportunities

- **Phase 1**: T003, T004, T005 can run in parallel
- **Phase 2**: T006, T007, T008, T014 can run in parallel
- **Phase 5**: T019, T020, T021 can run in parallel
- **Phase 8**: T031, T032, T033 can run in parallel

---

## Implementation Strategy

### MVP First (Stories 1-3)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 - Registration
4. Complete Phase 4: User Story 2 - Authentication
5. Complete Phase 5: User Story 3 - Task CRUD
6. **STOP and VALIDATE**: Test full registration → signin → task management flow

### Full Feature Set

7. Complete Phase 6: User Story 4 - Status Management
8. Complete Phase 7: User Story 5 - Filtering
9. Complete Phase 8: Polish & Cross-Cutting Concerns
10. **Final Validation**: Production build and comprehensive testing

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- All pages use Next.js 16+ App Router (no Pages Router)
- Server Components by default, Client Components only for interactivity
- Better Auth handles all JWT token management
- API endpoints follow pattern: `/api/{user_id}/tasks[/{id}][/action]`
- Commit after each task or logical group
