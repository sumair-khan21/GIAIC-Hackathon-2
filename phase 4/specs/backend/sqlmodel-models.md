# SQLModel Models

## Requirements

- Task model for database table
- TaskCreate schema for POST requests
- TaskUpdate schema for PUT requests
- Pydantic validation on all inputs

## Task Model (Database)

```python
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

## Request Schemas

```python
class TaskCreate(SQLModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)

class TaskUpdate(SQLModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: Optional[bool] = None
```

## Response Schemas

```python
class TaskResponse(SQLModel):
    data: Task
    message: str

class TaskListResponse(SQLModel):
    data: list[Task]
    message: str
```

## Security

- user_id never accepted from request body
- user_id set from authenticated JWT token
- Validation prevents oversized inputs

## Acceptance Criteria

- [ ] Task model maps to tasks table
- [ ] TaskCreate validates title length
- [ ] TaskUpdate allows partial updates
- [ ] Response schemas match frontend expectations
