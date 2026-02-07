# API Contracts: FastAPI Backend

**Feature**: 002-fastapi-backend
**Created**: 2026-01-12
**Status**: Complete

## Base Configuration

- **Base URL**: `http://localhost:8000`
- **Content-Type**: `application/json`
- **Authentication**: `Authorization: Bearer <jwt_token>`

## Common Headers

### Request Headers
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Response Headers
```http
Content-Type: application/json
Access-Control-Allow-Origin: http://localhost:3000
```

---

## Endpoint Contracts

### 1. GET /api/{user_id}/tasks

**Purpose**: Retrieve all tasks for authenticated user

**Request**:
```http
GET /api/user_abc123/tasks?filter=all HTTP/1.1
Host: localhost:8000
Authorization: Bearer <token>
```

**Query Parameters**:
| Parameter | Type | Required | Default | Values |
|-----------|------|----------|---------|--------|
| filter | string | No | all | all, pending, completed |

**Success Response (200)**:
```json
{
  "data": [
    {
      "id": 1,
      "user_id": "user_abc123",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "created_at": "2026-01-12T10:00:00Z",
      "updated_at": "2026-01-12T10:00:00Z"
    },
    {
      "id": 2,
      "user_id": "user_abc123",
      "title": "Call dentist",
      "description": null,
      "completed": true,
      "created_at": "2026-01-11T08:30:00Z",
      "updated_at": "2026-01-12T09:15:00Z"
    }
  ],
  "message": "Tasks retrieved"
}
```

**Empty Response (200)**:
```json
{
  "data": [],
  "message": "Tasks retrieved"
}
```

**Error Responses**:
- 401: Missing/invalid token
- 403: URL user_id doesn't match token

---

### 2. POST /api/{user_id}/tasks

**Purpose**: Create a new task

**Request**:
```http
POST /api/user_abc123/tasks HTTP/1.1
Host: localhost:8000
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

**Request Body Schema**:
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| title | string | Yes | 1-200 characters |
| description | string | No | Max 1000 characters |

**Success Response (201)**:
```json
{
  "data": {
    "id": 3,
    "user_id": "user_abc123",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "created_at": "2026-01-12T14:30:00Z",
    "updated_at": "2026-01-12T14:30:00Z"
  },
  "message": "Task created"
}
```

**Error Responses**:
- 400: Validation error (title missing/too long)
- 401: Missing/invalid token
- 403: URL user_id doesn't match token

**Validation Error (400)**:
```json
{
  "error": "Title must be between 1 and 200 characters",
  "code": "VALIDATION_ERROR"
}
```

---

### 3. GET /api/{user_id}/tasks/{id}

**Purpose**: Retrieve a single task by ID

**Request**:
```http
GET /api/user_abc123/tasks/1 HTTP/1.1
Host: localhost:8000
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "data": {
    "id": 1,
    "user_id": "user_abc123",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "created_at": "2026-01-12T10:00:00Z",
    "updated_at": "2026-01-12T10:00:00Z"
  },
  "message": "Task retrieved"
}
```

**Error Responses**:
- 401: Missing/invalid token
- 403: Task belongs to different user
- 404: Task not found

**Not Found (404)**:
```json
{
  "error": "Task not found",
  "code": "NOT_FOUND"
}
```

---

### 4. PUT /api/{user_id}/tasks/{id}

**Purpose**: Update an existing task

**Request**:
```http
PUT /api/user_abc123/tasks/1 HTTP/1.1
Host: localhost:8000
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Buy groceries and snacks",
  "description": "Milk, eggs, bread, chips"
}
```

**Request Body Schema**:
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| title | string | No | 1-200 characters (if provided) |
| description | string | No | Max 1000 characters |
| completed | boolean | No | true/false |

**Success Response (200)**:
```json
{
  "data": {
    "id": 1,
    "user_id": "user_abc123",
    "title": "Buy groceries and snacks",
    "description": "Milk, eggs, bread, chips",
    "completed": false,
    "created_at": "2026-01-12T10:00:00Z",
    "updated_at": "2026-01-12T15:00:00Z"
  },
  "message": "Task updated"
}
```

**Error Responses**:
- 400: Validation error
- 401: Missing/invalid token
- 403: Task belongs to different user
- 404: Task not found

---

### 5. DELETE /api/{user_id}/tasks/{id}

**Purpose**: Delete a task permanently

**Request**:
```http
DELETE /api/user_abc123/tasks/1 HTTP/1.1
Host: localhost:8000
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "data": null,
  "message": "Task deleted"
}
```

**Error Responses**:
- 401: Missing/invalid token
- 403: Task belongs to different user
- 404: Task not found

---

### 6. PATCH /api/{user_id}/tasks/{id}/complete

**Purpose**: Toggle task completion status

**Request**:
```http
PATCH /api/user_abc123/tasks/1/complete HTTP/1.1
Host: localhost:8000
Authorization: Bearer <token>
```

**Success Response (200)** - Toggle to completed:
```json
{
  "data": {
    "id": 1,
    "user_id": "user_abc123",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": true,
    "created_at": "2026-01-12T10:00:00Z",
    "updated_at": "2026-01-12T16:00:00Z"
  },
  "message": "Task marked as completed"
}
```

**Success Response (200)** - Toggle to incomplete:
```json
{
  "data": {
    "id": 1,
    ...
    "completed": false,
    ...
  },
  "message": "Task marked as incomplete"
}
```

**Error Responses**:
- 401: Missing/invalid token
- 403: Task belongs to different user
- 404: Task not found

---

## Error Response Format

All errors follow this standard format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

### Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | VALIDATION_ERROR | Request body validation failed |
| 401 | UNAUTHORIZED | Missing or invalid JWT token |
| 403 | FORBIDDEN | Access denied (wrong user) |
| 404 | NOT_FOUND | Resource doesn't exist |
| 500 | SERVER_ERROR | Unexpected server error |

---

## Health Check Endpoint

### GET /health

**Purpose**: Verify API is running

**Request**:
```http
GET /health HTTP/1.1
Host: localhost:8000
```

**Success Response (200)**:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-12T10:00:00Z"
}
```

---

## CORS Configuration

```python
CORSMiddleware(
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)
```

## Contract Validation Checklist

- [x] All 6 task endpoints defined
- [x] Request/response schemas documented
- [x] Error responses standardized
- [x] Authentication requirements specified
- [x] Query parameters documented
- [x] Health check endpoint included
