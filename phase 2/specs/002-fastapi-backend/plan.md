# Implementation Plan: FastAPI Backend

**Feature**: 002-fastapi-backend
**Created**: 2026-01-12
**Status**: Ready for Tasks Generation
**Branch**: `002-fastapi-backend`

## Overview

This plan details the step-by-step implementation of a FastAPI backend that integrates with the existing Next.js frontend. The backend provides REST API endpoints for task management with JWT authentication and Neon PostgreSQL database.

## Prerequisites

- Python 3.11+ installed
- Neon PostgreSQL database provisioned
- Frontend running at http://localhost:3000
- BETTER_AUTH_SECRET from frontend .env

## Implementation Phases

---

### Phase 1: Project Setup

**Goal**: Initialize backend directory with dependencies and configuration

#### Task 1.1: Create Backend Directory Structure

Create the following directory structure:
```
backend/
├── main.py              # FastAPI application entry
├── models.py            # SQLModel database models
├── schemas.py           # Request/response schemas
├── database.py          # Database connection
├── auth.py              # JWT authentication
├── routes/
│   └── tasks.py         # Task CRUD endpoints
├── requirements.txt     # Python dependencies
├── .env.example         # Environment template
└── .gitignore           # Python gitignore
```

**Acceptance**: Directory structure exists

#### Task 1.2: Create requirements.txt

```
fastapi==0.109.0
sqlmodel==0.0.14
uvicorn[standard]==0.27.0
python-jose[cryptography]==3.3.0
psycopg2-binary==2.9.9
python-dotenv==1.0.0
```

**Acceptance**: `pip install -r requirements.txt` succeeds

#### Task 1.3: Create Environment Files

`.env.example`:
```bash
NEON_DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
BETTER_AUTH_SECRET=your-32-char-secret-here
BETTER_AUTH_URL=http://localhost:3000
```

`.gitignore`:
```
__pycache__/
*.py[cod]
.env
.venv/
venv/
```

**Acceptance**: Environment template exists, .env excluded from git

---

### Phase 2: Database Connection

**Goal**: Establish connection to Neon PostgreSQL

#### Task 2.1: Create database.py

Implement:
- Load NEON_DATABASE_URL from environment
- Create SQLModel engine with SSL
- Create `get_db` dependency function
- Add `create_tables` startup function

```python
import os
from sqlmodel import SQLModel, Session, create_engine
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("NEON_DATABASE_URL")
engine = create_engine(DATABASE_URL, echo=False)

def get_db():
    with Session(engine) as session:
        yield session

def create_tables():
    SQLModel.metadata.create_all(engine)
```

**Acceptance**: `create_tables()` runs without error

---

### Phase 3: Data Models

**Goal**: Define SQLModel classes for tasks

#### Task 3.1: Create models.py

Implement `Task` SQLModel class:
- `id`: Optional[int], primary key
- `user_id`: str, indexed
- `title`: str, max 200
- `description`: Optional[str], max 1000
- `completed`: bool, default False
- `created_at`: datetime
- `updated_at`: datetime

**Acceptance**: Model imports without errors

#### Task 3.2: Create schemas.py

Implement request/response schemas:
- `TaskCreate`: title (required), description (optional)
- `TaskUpdate`: title, description, completed (all optional)
- `TaskResponse`: data (Task), message (str)
- `TaskListResponse`: data (list[Task]), message (str)
- `ErrorResponse`: error (str), code (str)

**Acceptance**: Schemas import without errors

---

### Phase 4: JWT Authentication

**Goal**: Implement JWT token verification

#### Task 4.1: Create auth.py

Implement `get_current_user` dependency:
1. Extract `Authorization` header
2. Parse `Bearer <token>` format
3. Decode JWT with `BETTER_AUTH_SECRET`
4. Return `{"id": sub, "email": email}`
5. Raise 401 for missing/invalid tokens

```python
async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")

    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(
            token,
            os.getenv("BETTER_AUTH_SECRET"),
            algorithms=["HS256"]
        )
        return {"id": payload["sub"], "email": payload.get("email")}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

**Acceptance**: Returns 401 for missing token, extracts user from valid token

#### Task 4.2: Create verify_user_access Function

Implement function to verify URL user_id matches token:
```python
def verify_user_access(user_id: str, current_user: dict):
    if user_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
```

**Acceptance**: Returns 403 when user_id mismatch

---

### Phase 5: Task Endpoints

**Goal**: Implement all 6 CRUD endpoints

#### Task 5.1: Create routes/tasks.py Router

Create FastAPI APIRouter with prefix `/api/{user_id}/tasks`

#### Task 5.2: Implement GET /api/{user_id}/tasks

- Dependency: `get_current_user`, `get_db`
- Verify user access
- Query tasks filtered by user_id
- Apply filter parameter (all/pending/completed)
- Return TaskListResponse

**Acceptance**: Returns user's tasks, filters work correctly

#### Task 5.3: Implement POST /api/{user_id}/tasks

- Dependency: `get_current_user`, `get_db`
- Verify user access
- Validate TaskCreate body
- Create Task with user_id from token
- Return 201 with TaskResponse

**Acceptance**: Creates task, returns 201, validates input

#### Task 5.4: Implement GET /api/{user_id}/tasks/{id}

- Dependency: `get_current_user`, `get_db`
- Verify user access
- Query task by id AND user_id
- Return 404 if not found
- Return TaskResponse

**Acceptance**: Returns single task, 404 for missing

#### Task 5.5: Implement PUT /api/{user_id}/tasks/{id}

- Dependency: `get_current_user`, `get_db`
- Verify user access
- Query task by id AND user_id
- Return 404 if not found
- Update fields from TaskUpdate
- Set updated_at to now
- Return TaskResponse

**Acceptance**: Updates task, sets updated_at, validates input

#### Task 5.6: Implement DELETE /api/{user_id}/tasks/{id}

- Dependency: `get_current_user`, `get_db`
- Verify user access
- Query task by id AND user_id
- Return 404 if not found
- Delete task from database
- Return success message

**Acceptance**: Deletes task, returns 200, 404 for missing

#### Task 5.7: Implement PATCH /api/{user_id}/tasks/{id}/complete

- Dependency: `get_current_user`, `get_db`
- Verify user access
- Query task by id AND user_id
- Toggle completed field
- Set updated_at to now
- Return TaskResponse with appropriate message

**Acceptance**: Toggles completion status

---

### Phase 6: FastAPI Application

**Goal**: Wire everything together in main.py

#### Task 6.1: Create main.py

Implement:
- Create FastAPI app instance
- Configure CORS middleware
- Include task router
- Add health check endpoint
- Call create_tables on startup

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import create_tables
from routes.tasks import router as tasks_router

app = FastAPI(title="Todo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks_router)

@app.on_event("startup")
def on_startup():
    create_tables()

@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

**Acceptance**: Server starts, health check returns 200

---

### Phase 7: Error Handling

**Goal**: Implement consistent error responses

#### Task 7.1: Add Exception Handlers

Add custom exception handlers for:
- `RequestValidationError` → 400 with standard format
- Generic exceptions → 500 with generic message

```python
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content={"error": str(exc.errors()[0]["msg"]), "code": "VALIDATION_ERROR"}
    )
```

**Acceptance**: Validation errors return standard format

---

### Phase 8: Testing & Validation

**Goal**: Verify backend works with frontend

#### Task 8.1: Create .env File

Copy values from frontend:
```bash
NEON_DATABASE_URL=<from Neon dashboard>
BETTER_AUTH_SECRET=<same as frontend>
BETTER_AUTH_URL=http://localhost:3000
```

#### Task 8.2: Start Backend Server

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Acceptance**: Server starts on port 8000

#### Task 8.3: Verify Health Check

```bash
curl http://localhost:8000/health
```

**Acceptance**: Returns `{"status": "healthy"}`

#### Task 8.4: Manual Integration Test

1. Sign in via frontend (get JWT)
2. Test each endpoint with curl/Postman
3. Verify CORS allows frontend requests
4. Verify user isolation (can't access other user's tasks)

**Acceptance**: All endpoints work with frontend

---

## File Creation Order

1. `backend/` directory
2. `backend/requirements.txt`
3. `backend/.env.example`
4. `backend/.gitignore`
5. `backend/database.py`
6. `backend/models.py`
7. `backend/schemas.py`
8. `backend/auth.py`
9. `backend/routes/__init__.py`
10. `backend/routes/tasks.py`
11. `backend/main.py`
12. `backend/.env` (manual, from Neon dashboard)

## Critical Implementation Notes

### User Isolation
**CRITICAL**: Every database query MUST include `WHERE user_id = current_user["id"]`. Never trust URL parameters alone.

### JWT Secret
Use the **exact same** `BETTER_AUTH_SECRET` value from frontend `.env`. Mismatch causes all auth to fail.

### CORS Origin
Must be exactly `http://localhost:3000` (no trailing slash).

### Timestamps
Use `datetime.utcnow()` for consistency. Never use local time.

## Success Criteria

- [ ] All 6 task endpoints return correct responses
- [ ] Authentication rejects invalid/missing tokens
- [ ] User isolation prevents cross-user access
- [ ] CORS allows frontend requests
- [ ] Validation errors return standard format
- [ ] Server starts without errors
- [ ] Tables created automatically on startup

## Dependencies

| Artifact | Purpose |
|----------|---------|
| [spec.md](spec.md) | Feature requirements |
| [research.md](research.md) | Technology decisions |
| [data-model.md](data-model.md) | SQLModel schemas |
| [contracts/api-endpoints.md](contracts/api-endpoints.md) | API contracts |
| [../backend/](../backend/) | Supporting specifications |

## Next Steps

1. Run `/sp.tasks` to generate task list
2. Run `/sp.implement` to build backend
3. Test integration with frontend
4. Create PHR for implementation
