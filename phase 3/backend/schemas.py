"""Request and response schemas for the API."""

from typing import Optional, List, Any
from sqlmodel import SQLModel, Field
from models import Task


class TaskCreate(SQLModel):
    """Schema for creating a new task."""

    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)


class TaskUpdate(SQLModel):
    """Schema for updating an existing task."""

    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: Optional[bool] = None


class TaskResponse(SQLModel):
    """Standard response containing a single task."""

    data: Task
    message: str


class TaskListResponse(SQLModel):
    """Standard response containing a list of tasks."""

    data: List[Task]
    message: str


class ErrorResponse(SQLModel):
    """Standard error response format."""

    error: str
    code: str


class MessageResponse(SQLModel):
    """Response for delete operations."""

    data: Any = None
    message: str
