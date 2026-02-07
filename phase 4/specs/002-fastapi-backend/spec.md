# Feature Specification: FastAPI Backend

**Feature Branch**: `002-fastapi-backend`
**Created**: 2026-01-12
**Status**: Draft
**Input**: FastAPI backend for Todo application integrating with existing Next.js frontend

## User Scenarios & Testing *(mandatory)*

### User Story 1 - API Serves Task List (Priority: P1)

The Next.js frontend requests the user's task list, and the backend returns all tasks belonging to that authenticated user.

**Why this priority**: Core functionality - without task retrieval, no other features work.

**Independent Test**: Send GET request with valid JWT to /api/{user_id}/tasks and verify JSON response contains task array.

**Acceptance Scenarios**:

1. **Given** authenticated user with 3 tasks, **When** GET /api/{user_id}/tasks, **Then** response contains array of 3 tasks
2. **Given** authenticated user with no tasks, **When** GET /api/{user_id}/tasks, **Then** response contains empty array
3. **Given** request with filter=completed, **When** GET /api/{user_id}/tasks?filter=completed, **Then** only completed tasks returned

---

### User Story 2 - API Creates Tasks (Priority: P1)

The frontend submits a new task, and the backend persists it with the authenticated user's ID.

**Why this priority**: Users need to create tasks - core CRUD operation.

**Independent Test**: POST valid task data and verify 201 response with created task including auto-generated ID.

**Acceptance Scenarios**:

1. **Given** valid task data, **When** POST /api/{user_id}/tasks, **Then** 201 response with new task
2. **Given** missing title, **When** POST /api/{user_id}/tasks, **Then** 400 validation error
3. **Given** title over 200 chars, **When** POST /api/{user_id}/tasks, **Then** 400 validation error

---

### User Story 3 - API Updates and Deletes Tasks (Priority: P1)

The frontend can update task details or delete tasks entirely.

**Why this priority**: Complete CRUD operations required for functional app.

**Independent Test**: PUT to update task, verify changes persisted. DELETE task, verify 200 response.

**Acceptance Scenarios**:

1. **Given** existing task, **When** PUT /api/{user_id}/tasks/{id}, **Then** task updated with new values
2. **Given** existing task, **When** DELETE /api/{user_id}/tasks/{id}, **Then** task removed, 200 response
3. **Given** non-existent task, **When** DELETE /api/{user_id}/tasks/999, **Then** 404 error

---

### User Story 4 - API Enforces Authentication (Priority: P1)

All API requests require valid JWT token verified against shared secret.

**Why this priority**: Security is non-negotiable - must protect user data.

**Independent Test**: Send request without token, verify 401. Send with invalid token, verify 401.

**Acceptance Scenarios**:

1. **Given** request without Authorization header, **When** any endpoint, **Then** 401 Unauthorized
2. **Given** expired JWT token, **When** any endpoint, **Then** 401 Unauthorized
3. **Given** valid token for user A, **When** accessing user B's tasks, **Then** 403 Forbidden

---

### User Story 5 - API Toggles Task Completion (Priority: P2)

Users can mark tasks complete/incomplete via dedicated endpoint.

**Why this priority**: Important UX feature but not blocking for MVP.

**Independent Test**: PATCH /api/{user_id}/tasks/{id}/complete and verify completed field toggles.

**Acceptance Scenarios**:

1. **Given** task with completed=false, **When** PATCH complete, **Then** completed=true
2. **Given** task with completed=true, **When** PATCH complete, **Then** completed=false

---

### Edge Cases

- What happens when database connection fails? → 500 error with generic message
- What happens when user_id in URL doesn't match token? → 403 Forbidden
- What happens with concurrent updates? → Last write wins
- What happens with empty request body on POST? → 400 validation error

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST verify JWT tokens using BETTER_AUTH_SECRET
- **FR-002**: System MUST filter all queries by authenticated user_id
- **FR-003**: System MUST return 401 for missing/invalid tokens
- **FR-004**: System MUST return 403 when URL user_id doesn't match token
- **FR-005**: System MUST validate task title is 1-200 characters
- **FR-006**: System MUST validate task description is max 1000 characters
- **FR-007**: System MUST auto-populate created_at and updated_at timestamps
- **FR-008**: System MUST support filter query parameter (all/pending/completed)
- **FR-009**: System MUST return consistent JSON error format
- **FR-010**: System MUST allow CORS from http://localhost:3000

### Key Entities

- **Task**: Represents a todo item with title, optional description, completion status, and timestamps. Belongs to a single user.
- **User**: Authenticated via JWT token from Better Auth frontend. Identified by user_id in token payload.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: API responds to all endpoints within 500ms under normal load
- **SC-002**: All requests without valid JWT receive 401 within 100ms
- **SC-003**: Task CRUD operations complete successfully for authenticated users
- **SC-004**: Zero cross-user data leakage in any scenario
- **SC-005**: Frontend can complete full task management flow using backend
- **SC-006**: Database connection recovers gracefully from temporary failures

## Assumptions

- Better Auth JWT tokens use HS256 algorithm with BETTER_AUTH_SECRET
- Token payload contains "sub" claim with user_id
- Frontend handles token refresh before expiration
- Single Neon PostgreSQL database for all data
- No rate limiting required for Phase 2

## Supporting Specifications

| Spec File | Purpose |
|-----------|---------|
| [overview.md](../backend/overview.md) | Architecture and request flow |
| [database-schema.md](../backend/database-schema.md) | Tasks table definition |
| [sqlmodel-models.md](../backend/sqlmodel-models.md) | Python model classes |
| [jwt-authentication.md](../backend/jwt-authentication.md) | Token verification |
| [api-endpoints.md](../backend/api-endpoints.md) | Endpoint specifications |
| [error-handling.md](../backend/error-handling.md) | Error response format |
| [project-structure.md](../backend/project-structure.md) | File organization |
| [dependencies.md](../backend/dependencies.md) | Python packages and config |
