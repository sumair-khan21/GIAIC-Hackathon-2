<!--
Sync Impact Report
==================
Version change: 0.0.0 → 1.0.0 (MAJOR - initial constitution)
Modified principles: N/A (new document)
Added sections:
  - Project Identity
  - Architectural Principles (6 principles)
  - Technology Stack
  - Security Requirements
  - Development Workflow
  - API Conventions
  - Database Design Rules
  - Frontend Standards
  - Authentication Flow
  - Quality Gates
  - Governance
Removed sections: N/A
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (compatible)
  - .specify/templates/spec-template.md ✅ (compatible)
  - .specify/templates/tasks-template.md ✅ (compatible)
Follow-up TODOs: None
-->

# Todo Full-Stack Application Constitution

## Project Identity

**Name**: Todo Full-Stack
**Purpose**: Multi-user task management web application with secure authentication and data isolation
**Phase**: Phase 2 - Hackathon Full-Stack Transformation

**Target Users**: Individual users who need personal task management with web access

**Success Criteria**:
- Users can sign up, sign in, and manage their own tasks
- Complete CRUD operations (Create, Read, Update, Delete) for tasks
- User data isolation - no user can access another user's tasks
- Responsive web interface accessible from any device
- All code generated through specifications (no manual coding)

## Core Principles

### I. Spec-First Development

All code MUST be generated from specifications. No manual coding is permitted.

- Every feature starts with a specification document
- Implementation follows spec → plan → tasks workflow
- Claude Code generates all application code
- Changes require spec updates first, then regeneration

**Rationale**: Spec-driven development ensures consistency, traceability, and enables AI-assisted generation.

### II. Monorepo Architecture

Frontend and backend MUST reside in a single repository with clear separation.

```
/
├── frontend/          # Next.js 16+ App Router
├── backend/           # FastAPI + SQLModel
├── specs/             # Feature specifications
└── .specify/          # Spec-Kit Plus configuration
```

- Frontend and backend are independently deployable
- Shared types/contracts live in specs/
- No code duplication between frontend and backend

**Rationale**: Monorepo simplifies dependency management and enables atomic changes across stack.

### III. Stateless JWT Authentication

All API requests MUST include JWT token validation. No session state on server.

- Better Auth handles frontend authentication
- JWT tokens contain user_id and email
- Backend validates token on every request
- Token expiry: 7 days
- No server-side session storage

**Rationale**: Stateless auth enables horizontal scaling and simplifies deployment.

### IV. User Data Isolation

Every database query MUST filter by authenticated user_id.

- Extract user_id from JWT token (not URL)
- Add `WHERE user_id = {token_user_id}` to all queries
- Return 403 for cross-user access attempts
- Never trust user_id from request parameters alone

**Rationale**: Prevents data leaks and ensures privacy compliance.

### V. RESTful API Design

All endpoints MUST follow REST conventions with consistent patterns.

- Pattern: `/api/{user_id}/resource[/{id}][/action]`
- Use proper HTTP methods: GET (read), POST (create), PUT (update), DELETE (remove)
- Return consistent response format: `{ "data": {...}, "message": "..." }`
- Return consistent error format: `{ "error": "...", "code": "..." }`

**Rationale**: Predictable APIs reduce frontend complexity and enable tooling.

### VI. Graceful Error Handling

All errors MUST be caught, logged, and returned with appropriate status codes.

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Invalid input |
| 401 | Missing/invalid token |
| 403 | Access denied |
| 404 | Resource not found |
| 500 | Server error |

**Rationale**: Consistent error handling improves debugging and user experience.

## Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | Next.js 16+ (App Router) | Server Components, built-in routing, React 19 |
| Backend | FastAPI + SQLModel | Async Python, automatic OpenAPI, Pydantic validation |
| Database | Neon PostgreSQL | Serverless, auto-scaling, branching for development |
| Auth | Better Auth + JWT | Modern auth library, JWT for stateless verification |
| Styling | Tailwind CSS | Utility-first, responsive, minimal bundle |

## Security Requirements

1. **Secrets Management**: All secrets in `.env` files, never committed to git
2. **JWT Validation**: Verify signature with `BETTER_AUTH_SECRET` on every request
3. **CORS**: Configure allowed origins explicitly (no wildcards in production)
4. **Password Hashing**: Use bcrypt with minimum 10 rounds
5. **Input Validation**: Validate all inputs at API boundary using Pydantic

Required environment variables:
```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=<random-32-chars>
BETTER_AUTH_URL=http://localhost:3000
```

## Development Workflow

1. **Specify**: Define feature in `specs/<feature>/spec.md`
2. **Plan**: Create implementation plan in `specs/<feature>/plan.md`
3. **Tasks**: Generate task list in `specs/<feature>/tasks.md`
4. **Implement**: Execute tasks via Claude Code
5. **Validate**: Run tests and verify acceptance criteria

**Folder Structure**:
```
specs/
├── features/          # Feature specifications
├── api/               # API endpoint specs
├── database/          # Schema definitions
└── ui/                # Component specs
```

**File Naming**:
- Specs: `kebab-case.md`
- Python: `snake_case.py`
- TypeScript: `kebab-case.ts` or `PascalCase.tsx` for components

## API Conventions

### Endpoint Structure
```
GET    /api/{user_id}/tasks           # List all tasks
POST   /api/{user_id}/tasks           # Create task
GET    /api/{user_id}/tasks/{id}      # Get single task
PUT    /api/{user_id}/tasks/{id}      # Update task
DELETE /api/{user_id}/tasks/{id}      # Delete task
PATCH  /api/{user_id}/tasks/{id}/complete  # Mark complete
```

### Request Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Response Format
```json
{
  "data": { "id": "...", "title": "...", "completed": false },
  "message": "Task created successfully"
}
```

## Database Design Rules

1. **Table Names**: Lowercase, plural (e.g., `users`, `tasks`)
2. **Primary Keys**: UUID or auto-increment integer named `id`
3. **Foreign Keys**: Named `{table}_id` (e.g., `user_id`)
4. **Timestamps**: Include `created_at` and `updated_at` on all tables
5. **Indexes**: Create index on `user_id` for all user-owned tables
6. **Deletion**: Use hard delete (no soft delete for hackathon scope)

### Task Schema
```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

## Frontend Standards

### Component Types
- **Server Components**: Data fetching, SEO content, static rendering
- **Client Components**: Interactivity, forms, state management (use `"use client"`)

### Folder Structure
```
frontend/src/
├── app/               # App Router pages
├── components/        # Reusable components
├── lib/               # Utilities and API client
└── styles/            # Global styles
```

### API Client Pattern
```typescript
async function fetchTasks(token: string, userId: string) {
  const res = await fetch(`/api/${userId}/tasks`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}
```

### Tailwind Conventions
- Use utility classes directly in JSX
- Extract repeated patterns to components (not CSS)
- Mobile-first responsive design (`sm:`, `md:`, `lg:`)

## Authentication Flow

1. **Signup**: User submits email/password → Better Auth creates account → JWT issued
2. **Signin**: User submits credentials → Better Auth validates → JWT issued
3. **Storage**: JWT stored in httpOnly cookie via Better Auth
4. **API Calls**: Frontend includes `Authorization: Bearer <token>` header
5. **Verification**: Backend extracts token → validates signature → extracts user_id
6. **Expiry**: Token expires after 7 days → user must re-authenticate

## Quality Gates

All implementations MUST pass these gates:

- [ ] Every endpoint requires valid JWT token
- [ ] Every database query filters by user_id from token
- [ ] Every form has client-side validation
- [ ] Every API error returns proper status code
- [ ] Every response follows standard format
- [ ] No secrets hardcoded in source code
- [ ] No cross-user data access possible

## Governance

This constitution is the authoritative source for all architectural decisions.

**Amendment Process**:
1. Propose change with rationale
2. Document in ADR if architecturally significant
3. Update constitution version
4. Propagate changes to dependent specs

**Compliance**: All PRs must verify alignment with constitution principles.

**Version**: 1.0.0 | **Ratified**: 2026-01-11 | **Last Amended**: 2026-01-11
