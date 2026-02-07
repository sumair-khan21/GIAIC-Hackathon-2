# Backend Overview

## Requirements

- FastAPI application serving REST API at http://localhost:8000
- SQLModel ORM connecting to Neon PostgreSQL
- JWT authentication using BETTER_AUTH_SECRET
- CORS enabled for http://localhost:3000 (Next.js frontend)
- All endpoints under /api/{user_id}/tasks pattern

## Architecture

```
Frontend (Next.js :3000)
    │
    │ HTTP + JWT Bearer Token
    ▼
FastAPI Application (:8000)
    │
    ├─► JWT Middleware (verify token, extract user_id)
    │
    ├─► Route Handlers (CRUD operations)
    │
    └─► SQLModel + Neon PostgreSQL
```

## Request Flow

1. Frontend sends request with `Authorization: Bearer <token>`
2. CORS middleware validates origin (localhost:3000)
3. JWT middleware extracts and verifies token
4. Route handler processes request with authenticated user_id
5. SQLModel executes query (always filtered by user_id)
6. JSON response returned to frontend

## Database Connection

- Connection string from NEON_DATABASE_URL environment variable
- Connection pooling for serverless environment
- SSL required (sslmode=require)

## Security

- All routes require valid JWT token
- User isolation: queries always filter by authenticated user_id
- URL user_id must match token user_id (403 if mismatch)
- No cross-user data access possible

## Acceptance Criteria

- [ ] FastAPI starts on port 8000
- [ ] CORS allows requests from localhost:3000
- [ ] All endpoints require JWT authentication
- [ ] Database connection uses environment variable
- [ ] Health check endpoint returns 200
