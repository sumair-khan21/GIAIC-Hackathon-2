# Data Model: FastAPI Backend

**Feature**: 002-fastapi-backend
**Created**: 2026-01-12
**Status**: Complete

## Entity Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         TASKS                               │
├─────────────────────────────────────────────────────────────┤
│ id          │ INTEGER     │ PK, AUTO INCREMENT              │
│ user_id     │ VARCHAR(255)│ NOT NULL, INDEXED               │
│ title       │ VARCHAR(200)│ NOT NULL                        │
│ description │ TEXT        │ NULLABLE, MAX 1000              │
│ completed   │ BOOLEAN     │ DEFAULT FALSE                   │
│ created_at  │ TIMESTAMP   │ DEFAULT NOW()                   │
│ updated_at  │ TIMESTAMP   │ DEFAULT NOW(), AUTO UPDATE      │
└─────────────────────────────────────────────────────────────┘
```

## SQLModel Definitions

### Task (Database Model)

```python
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, nullable=False)
    title: str = Field(max_length=200, nullable=False)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

### TaskCreate (Request Schema)

```python
class TaskCreate(SQLModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
```

### TaskUpdate (Request Schema)

```python
class TaskUpdate(SQLModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: Optional[bool] = None
```

## Response Schemas

### Single Task Response

```python
class TaskResponse(SQLModel):
    data: Task
    message: str
```

### Task List Response

```python
class TaskListResponse(SQLModel):
    data: list[Task]
    message: str
```

### Error Response

```python
class ErrorResponse(SQLModel):
    error: str
    code: str
```

## Database Indexes

```sql
-- Primary lookup: tasks by user
CREATE INDEX idx_tasks_user_id ON tasks(user_id);

-- Filtered queries: tasks by user and completion status
CREATE INDEX idx_tasks_user_completed ON tasks(user_id, completed);

-- Sorted queries: tasks by user ordered by creation
CREATE INDEX idx_tasks_user_created ON tasks(user_id, created_at DESC);
```

## Data Flow

### Create Task
```
Frontend POST /api/{user_id}/tasks
    │
    ├─► Validate JWT → Extract user_id from token
    │
    ├─► Parse TaskCreate from body
    │
    ├─► Create Task(user_id=token.user_id, **task_data)
    │
    ├─► Session.add(task) → Session.commit()
    │
    └─► Return TaskResponse(data=task, message="Task created")
```

### Read Tasks
```
Frontend GET /api/{user_id}/tasks?filter=pending
    │
    ├─► Validate JWT → Extract user_id from token
    │
    ├─► Query: SELECT * FROM tasks WHERE user_id = :user_id
    │      └─► Apply filter if specified
    │
    └─► Return TaskListResponse(data=tasks, message="Tasks retrieved")
```

### Update Task
```
Frontend PUT /api/{user_id}/tasks/{id}
    │
    ├─► Validate JWT → Extract user_id from token
    │
    ├─► Query: SELECT * FROM tasks WHERE id = :id AND user_id = :user_id
    │      └─► 404 if not found
    │
    ├─► Parse TaskUpdate from body
    │
    ├─► Update fields, set updated_at = now()
    │
    └─► Return TaskResponse(data=task, message="Task updated")
```

### Delete Task
```
Frontend DELETE /api/{user_id}/tasks/{id}
    │
    ├─► Validate JWT → Extract user_id from token
    │
    ├─► Query: SELECT * FROM tasks WHERE id = :id AND user_id = :user_id
    │      └─► 404 if not found
    │
    ├─► Session.delete(task) → Session.commit()
    │
    └─► Return {"data": null, "message": "Task deleted"}
```

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| title | Required | "Title is required" |
| title | 1-200 chars | "Title must be between 1 and 200 characters" |
| description | Max 1000 chars | "Description must not exceed 1000 characters" |
| completed | Boolean | "Completed must be true or false" |

## User Isolation

**Critical Security Requirement**: All queries MUST filter by `user_id` from JWT token.

```python
# CORRECT - Always filter by authenticated user
tasks = session.exec(
    select(Task).where(Task.user_id == current_user["id"])
).all()

# WRONG - Never trust URL parameter alone
tasks = session.exec(
    select(Task).where(Task.user_id == url_user_id)  # SECURITY RISK
).all()
```

## Timestamps

- `created_at`: Set once on INSERT, never updated
- `updated_at`: Set on INSERT, updated on every UPDATE

```python
# On update
task.updated_at = datetime.utcnow()
session.add(task)
session.commit()
```
