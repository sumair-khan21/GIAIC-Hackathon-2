# Tasks: FastAPI Backend

**Input**: Design documents from `/specs/002-fastapi-backend/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Manual testing only (Phase 2 hackathon scope - no automated tests requested)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app monorepo**: `backend/` for FastAPI, `frontend/` for Next.js
- All backend files in `backend/` directory

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize backend directory with dependencies and configuration

- [x] T001 Create backend directory structure: backend/, backend/routes/
- [x] T002 [P] Create requirements.txt in backend/requirements.txt with FastAPI, SQLModel, uvicorn, python-jose, psycopg2-binary, python-dotenv
- [x] T003 [P] Create .env.example in backend/.env.example with NEON_DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL
- [x] T004 [P] Create .gitignore in backend/.gitignore for __pycache__, .env, venv

**Checkpoint**: Directory structure and dependencies ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create database.py in backend/database.py with SQLModel engine, get_db dependency, create_tables function
- [x] T006 Create models.py in backend/models.py with Task SQLModel class (id, user_id, title, description, completed, created_at, updated_at)
- [x] T007 [P] Create schemas.py in backend/schemas.py with TaskCreate, TaskUpdate, TaskResponse, TaskListResponse, ErrorResponse
- [x] T008 Create auth.py in backend/auth.py with get_current_user dependency (JWT verification with BETTER_AUTH_SECRET)
- [x] T009 Add verify_user_access function in backend/auth.py to check URL user_id matches token user_id
- [x] T010 [P] Create routes/__init__.py in backend/routes/__init__.py (empty file for package)

**Checkpoint**: Foundation ready - database, models, auth, schemas all in place

---

## Phase 3: User Story 1 - API Serves Task List (Priority: P1) MVP

**Goal**: The Next.js frontend requests the user's task list, and the backend returns all tasks belonging to that authenticated user.

**Independent Test**: Send GET request with valid JWT to /api/{user_id}/tasks and verify JSON response contains task array.

### Implementation for User Story 1

- [x] T011 [US1] Create routes/tasks.py in backend/routes/tasks.py with APIRouter prefix="/api/{user_id}/tasks"
- [x] T012 [US1] Implement GET /api/{user_id}/tasks endpoint in backend/routes/tasks.py with filter parameter (all/pending/completed)
- [x] T013 [US1] Add user verification and user_id filtering to GET endpoint in backend/routes/tasks.py

**Checkpoint**: User Story 1 complete - authenticated users can list their tasks with filters

---

## Phase 4: User Story 2 - API Creates Tasks (Priority: P1)

**Goal**: The frontend submits a new task, and the backend persists it with the authenticated user's ID.

**Independent Test**: POST valid task data and verify 201 response with created task including auto-generated ID.

### Implementation for User Story 2

- [x] T014 [US2] Implement POST /api/{user_id}/tasks endpoint in backend/routes/tasks.py
- [x] T015 [US2] Add validation for TaskCreate (title 1-200 chars, description max 1000) in POST endpoint
- [x] T016 [US2] Set user_id from JWT token (not request body) in POST endpoint

**Checkpoint**: User Story 2 complete - authenticated users can create tasks

---

## Phase 5: User Story 3 - API Updates and Deletes Tasks (Priority: P1)

**Goal**: The frontend can update task details or delete tasks entirely.

**Independent Test**: PUT to update task, verify changes persisted. DELETE task, verify 200 response.

### Implementation for User Story 3

- [x] T017 [US3] Implement GET /api/{user_id}/tasks/{id} endpoint in backend/routes/tasks.py
- [x] T018 [US3] Implement PUT /api/{user_id}/tasks/{id} endpoint in backend/routes/tasks.py with TaskUpdate validation
- [x] T019 [US3] Implement DELETE /api/{user_id}/tasks/{id} endpoint in backend/routes/tasks.py
- [x] T020 [US3] Add 404 handling for non-existent tasks in GET, PUT, DELETE endpoints
- [x] T021 [US3] Add 403 handling when task belongs to different user in backend/routes/tasks.py

**Checkpoint**: User Story 3 complete - full CRUD operations available

---

## Phase 6: User Story 4 - API Enforces Authentication (Priority: P1)

**Goal**: All API requests require valid JWT token verified against shared secret.

**Independent Test**: Send request without token, verify 401. Send with invalid token, verify 401.

### Implementation for User Story 4

- [x] T022 [US4] Add get_current_user dependency to all task endpoints in backend/routes/tasks.py
- [x] T023 [US4] Verify 401 response for missing Authorization header
- [x] T024 [US4] Verify 401 response for expired/invalid JWT tokens
- [x] T025 [US4] Verify 403 response when URL user_id doesn't match token user_id

**Checkpoint**: User Story 4 complete - all endpoints require valid authentication

---

## Phase 7: User Story 5 - API Toggles Task Completion (Priority: P2)

**Goal**: Users can mark tasks complete/incomplete via dedicated endpoint.

**Independent Test**: PATCH /api/{user_id}/tasks/{id}/complete and verify completed field toggles.

### Implementation for User Story 5

- [x] T026 [US5] Implement PATCH /api/{user_id}/tasks/{id}/complete endpoint in backend/routes/tasks.py
- [x] T027 [US5] Toggle completed field (true→false, false→true) and update updated_at timestamp
- [x] T028 [US5] Return appropriate message ("Task marked as completed" or "Task marked as incomplete")

**Checkpoint**: User Story 5 complete - task completion toggle available

---

## Phase 8: Application Assembly

**Purpose**: Wire everything together in main.py

- [x] T029 Create main.py in backend/main.py with FastAPI app instance
- [x] T030 Add CORS middleware in backend/main.py allowing http://localhost:3000 origin
- [x] T031 Include tasks router in backend/main.py
- [x] T032 Add startup event to call create_tables() in backend/main.py
- [x] T033 Add /health endpoint in backend/main.py returning {"status": "healthy"}

**Checkpoint**: Application assembled and ready to start

---

## Phase 9: Error Handling

**Purpose**: Implement consistent error responses

- [x] T034 Add RequestValidationError exception handler in backend/main.py with standard format
- [x] T035 Add generic exception handler in backend/main.py for 500 errors (no internal details exposed)

**Checkpoint**: Error handling complete with standard format

---

## Phase 10: Polish & Validation

**Purpose**: Final verification and integration testing

- [x] T036 Install dependencies: pip install -r backend/requirements.txt
- [x] T037 Start server: uvicorn main:app --reload --port 8000
- [x] T038 Verify health check: curl http://localhost:8000/health returns {"status": "healthy"}
- [x] T039 Manual integration test with frontend (list, create, update, delete, toggle tasks)

**Checkpoint**: Backend fully operational and integrated with frontend

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-7)**: All depend on Foundational phase completion
  - US1-US4 are P1 priority (core CRUD + auth)
  - US5 is P2 priority (toggle completion)
- **Assembly (Phase 8)**: Depends on User Stories for router to include
- **Error Handling (Phase 9)**: Depends on Assembly
- **Polish (Phase 10)**: Depends on all phases complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - provides task listing
- **User Story 2 (P1)**: Can start after Foundational - provides task creation
- **User Story 3 (P1)**: Can start after Foundational - provides update/delete
- **User Story 4 (P1)**: Applied during implementation of US1-3 via dependencies
- **User Story 5 (P2)**: Can start after US3 (needs task retrieval logic)

### Within Each User Story

- Core endpoint implementation first
- Validation and error handling after
- User verification integrated throughout

### Parallel Opportunities

**Phase 1 (Setup)**:
```bash
# Can run in parallel:
Task T002: Create requirements.txt
Task T003: Create .env.example
Task T004: Create .gitignore
```

**Phase 2 (Foundational)**:
```bash
# Can run in parallel:
Task T007: Create schemas.py
Task T010: Create routes/__init__.py
```

---

## Summary

| Phase | Tasks | User Story | Status |
|-------|-------|------------|--------|
| Phase 1: Setup | T001-T004 (4 tasks) | - | COMPLETE |
| Phase 2: Foundational | T005-T010 (6 tasks) | - | COMPLETE |
| Phase 3: US1 Task List | T011-T013 (3 tasks) | US1 (P1) | COMPLETE |
| Phase 4: US2 Create Tasks | T014-T016 (3 tasks) | US2 (P1) | COMPLETE |
| Phase 5: US3 Update/Delete | T017-T021 (5 tasks) | US3 (P1) | COMPLETE |
| Phase 6: US4 Authentication | T022-T025 (4 tasks) | US4 (P1) | COMPLETE |
| Phase 7: US5 Toggle Complete | T026-T028 (3 tasks) | US5 (P2) | COMPLETE |
| Phase 8: Assembly | T029-T033 (5 tasks) | - | COMPLETE |
| Phase 9: Error Handling | T034-T035 (2 tasks) | - | COMPLETE |
| Phase 10: Polish | T036-T039 (4 tasks) | - | COMPLETE |

**Total Tasks**: 39
**Completed**: 39
**Remaining**: 0

---

## Implementation Strategy

### MVP First (User Stories 1-4)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phases 3-6: User Stories 1-4 (core CRUD + auth)
4. Complete Phase 8: Assembly
5. Complete Phase 9: Error Handling
6. **STOP and VALIDATE**: Test all CRUD operations with authentication
7. Deploy/demo if ready

### Full Implementation

1. Continue from MVP
2. Add Phase 7: User Story 5 (toggle completion)
3. Complete Phase 10: Polish & Validation
4. Full integration test with frontend

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Authentication (US4) is woven throughout US1-3 implementation via dependencies
- Manual testing only - no automated tests per Phase 2 hackathon scope
- All queries MUST filter by user_id from JWT token (critical security requirement)
- CORS must be exactly http://localhost:3000 (no trailing slash)
- JWT secret must match frontend BETTER_AUTH_SECRET exactly
