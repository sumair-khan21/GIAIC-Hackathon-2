# API Endpoints Contract

**Feature**: 001-nextjs-frontend
**Backend**: FastAPI at http://localhost:8000

## Base Configuration

```
Base URL: http://localhost:8000
Authentication: Bearer token in Authorization header
Content-Type: application/json
```

## Task Endpoints

### List Tasks

```
GET /api/{user_id}/tasks?filter={all|pending|completed}
```

**Request**:
- Headers: `Authorization: Bearer <jwt_token>`
- Query: `filter` (optional, defaults to "all")

**Response 200**:
```json
{
  "data": [
    {
      "id": 1,
      "user_id": "user_123",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "created_at": "2026-01-11T10:00:00Z",
      "updated_at": "2026-01-11T10:00:00Z"
    }
  ],
  "message": "Tasks retrieved"
}
```

**Response 401**: Invalid/missing token

---

### Create Task

```
POST /api/{user_id}/tasks
```

**Request**:
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

**Response 201**:
```json
{
  "data": {
    "id": 1,
    "user_id": "user_123",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "created_at": "2026-01-11T10:00:00Z",
    "updated_at": "2026-01-11T10:00:00Z"
  },
  "message": "Task created"
}
```

**Response 400**: Validation error (title required, too long, etc.)

---

### Get Single Task

```
GET /api/{user_id}/tasks/{id}
```

**Response 200**:
```json
{
  "data": {
    "id": 1,
    "user_id": "user_123",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "created_at": "2026-01-11T10:00:00Z",
    "updated_at": "2026-01-11T10:00:00Z"
  },
  "message": "Task retrieved"
}
```

**Response 404**: Task not found
**Response 403**: Task belongs to another user

---

### Update Task

```
PUT /api/{user_id}/tasks/{id}
```

**Request**:
```json
{
  "title": "Buy groceries updated",
  "description": "Milk, eggs, bread, butter"
}
```

**Response 200**:
```json
{
  "data": {
    "id": 1,
    "user_id": "user_123",
    "title": "Buy groceries updated",
    "description": "Milk, eggs, bread, butter",
    "completed": false,
    "created_at": "2026-01-11T10:00:00Z",
    "updated_at": "2026-01-11T11:00:00Z"
  },
  "message": "Task updated"
}
```

---

### Delete Task

```
DELETE /api/{user_id}/tasks/{id}
```

**Response 200**:
```json
{
  "data": null,
  "message": "Task deleted"
}
```

**Response 404**: Task not found
**Response 403**: Task belongs to another user

---

### Toggle Complete

```
PATCH /api/{user_id}/tasks/{id}/complete
```

**Response 200**:
```json
{
  "data": {
    "id": 1,
    "user_id": "user_123",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": true,
    "created_at": "2026-01-11T10:00:00Z",
    "updated_at": "2026-01-11T12:00:00Z"
  },
  "message": "Task completion toggled"
}
```

## Error Response Format

All errors follow this format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid input data |
| UNAUTHORIZED | 401 | Missing or invalid token |
| FORBIDDEN | 403 | Access denied |
| NOT_FOUND | 404 | Resource not found |
| SERVER_ERROR | 500 | Internal server error |
