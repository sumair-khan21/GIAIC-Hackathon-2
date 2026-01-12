# API Client Specification

## Overview

Centralized API client for all backend communication. Located at `lib/api.ts`. Handles JWT attachment, error parsing, and response typing.

## Requirements

- Configure base URL from environment
- Attach JWT token to all requests
- Parse response JSON with error handling
- Provide typed functions for all endpoints
- Handle network errors gracefully

## Technical Details

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ApiResponse<T> {
  data: T;
  message: string;
}

interface ApiError {
  error: string;
  code: string;
}
```

## Configuration

| Variable | Value | Description |
|----------|-------|-------------|
| NEXT_PUBLIC_API_URL | http://localhost:8000 | Backend API base URL |

## API Functions

### Task Operations

```typescript
// Get all tasks (with optional filter)
async function getTasks(
  userId: string,
  filter?: "all" | "pending" | "completed"
): Promise<Task[]>
// GET /api/{user_id}/tasks?filter={filter}

// Create new task
async function createTask(
  userId: string,
  data: { title: string; description?: string }
): Promise<Task>
// POST /api/{user_id}/tasks

// Get single task
async function getTask(
  userId: string,
  taskId: number
): Promise<Task>
// GET /api/{user_id}/tasks/{id}

// Update task
async function updateTask(
  userId: string,
  taskId: number,
  data: { title?: string; description?: string }
): Promise<Task>
// PUT /api/{user_id}/tasks/{id}

// Delete task
async function deleteTask(
  userId: string,
  taskId: number
): Promise<void>
// DELETE /api/{user_id}/tasks/{id}

// Toggle completion
async function toggleComplete(
  userId: string,
  taskId: number
): Promise<Task>
// PATCH /api/{user_id}/tasks/{id}/complete
```

## Request Pattern

```typescript
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken(); // From Better Auth

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(error.detail || "Request failed", response.status);
  }

  return response.json();
}
```

## Error Handling

| Status | Action |
|--------|--------|
| 401 | Redirect to signin |
| 403 | Show access denied message |
| 404 | Show not found message |
| 400 | Display validation error |
| 500 | Show generic error |

## Acceptance Criteria

- [ ] Base URL configurable via environment
- [ ] JWT token attached to all requests
- [ ] All CRUD operations implemented
- [ ] Errors parsed and thrown correctly
- [ ] TypeScript types for all responses

## Dependencies

- `specs/frontend/authentication.md` - Token retrieval
- `.specify/memory/constitution.md` - API conventions

## Examples

```typescript
// Usage in component
const tasks = await getTasks(userId, "pending");

// Create with error handling
try {
  await createTask(userId, { title: "New task" });
} catch (error) {
  if (error.status === 400) {
    setError("Invalid task data");
  }
}
```
