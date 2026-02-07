"""Task CRUD endpoints for the Todo API."""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from database import get_db
from models import Task
from schemas import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskListResponse,
    MessageResponse,
)
from auth import get_current_user, verify_user_access

router = APIRouter(prefix="/api/{user_id}/tasks", tags=["tasks"])


# ============================================================================
# User Story 1: API Serves Task List (P1)
# ============================================================================


@router.get("", response_model=TaskListResponse)
async def list_tasks(
    user_id: str,
    filter: Optional[str] = Query(default="all", regex="^(all|pending|completed)$"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get all tasks for the authenticated user.

    Query Parameters:
        filter: Filter tasks by status (all, pending, completed)
    """
    # Verify user access (T013, T022-T025)
    verify_user_access(user_id, current_user)

    # Build query filtered by user_id from token (not URL)
    statement = select(Task).where(Task.user_id == current_user["id"])

    # Apply filter
    if filter == "pending":
        statement = statement.where(Task.completed == False)
    elif filter == "completed":
        statement = statement.where(Task.completed == True)

    # Order by created_at descending (newest first)
    statement = statement.order_by(Task.created_at.desc())

    tasks = db.exec(statement).all()

    return TaskListResponse(data=tasks, message="Tasks retrieved")


# ============================================================================
# User Story 2: API Creates Tasks (P1)
# ============================================================================


@router.post("", response_model=TaskResponse, status_code=201)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new task for the authenticated user.

    The user_id is taken from the JWT token, not the request body (T016).
    """
    # Verify user access (T022-T025)
    verify_user_access(user_id, current_user)

    # Create task with user_id from token (T016)
    task = Task(
        user_id=current_user["id"],
        title=task_data.title,
        description=task_data.description,
        completed=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    db.add(task)
    db.commit()
    # Removed db.refresh(task) - unnecessary extra query

    return TaskResponse(data=task, message="Task created")


# ============================================================================
# User Story 3: API Updates and Deletes Tasks (P1)
# ============================================================================


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    user_id: str,
    task_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single task by ID."""
    # Verify user access (T022-T025)
    verify_user_access(user_id, current_user)

    # Query task by ID and user_id (T020, T021)
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user["id"]
    )
    task = db.exec(statement).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return TaskResponse(data=task, message="Task retrieved")


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    user_id: str,
    task_id: int,
    task_data: TaskUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update an existing task."""
    # Verify user access (T022-T025)
    verify_user_access(user_id, current_user)

    # Query task by ID and user_id (T020, T021)
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user["id"]
    )
    task = db.exec(statement).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Update fields if provided
    if task_data.title is not None:
        task.title = task_data.title
    if task_data.description is not None:
        task.description = task_data.description
    if task_data.completed is not None:
        task.completed = task_data.completed

    # Always update the updated_at timestamp
    task.updated_at = datetime.utcnow()

    db.add(task)
    db.commit()
    # Removed db.refresh(task) - unnecessary extra query

    return TaskResponse(data=task, message="Task updated")


@router.delete("/{task_id}", response_model=MessageResponse)
async def delete_task(
    user_id: str,
    task_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a task."""
    # Verify user access (T022-T025)
    verify_user_access(user_id, current_user)

    # Query task by ID and user_id (T020, T021)
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user["id"]
    )
    task = db.exec(statement).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()

    return MessageResponse(data=None, message="Task deleted")


# ============================================================================
# User Story 5: API Toggles Task Completion (P2)
# ============================================================================


@router.patch("/{task_id}/complete", response_model=TaskResponse)
async def toggle_task_completion(
    user_id: str,
    task_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Toggle the completion status of a task."""
    # Verify user access (T022-T025)
    verify_user_access(user_id, current_user)

    # Query task by ID and user_id
    statement = select(Task).where(
        Task.id == task_id,
        Task.user_id == current_user["id"]
    )
    task = db.exec(statement).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Toggle completed status (T027)
    task.completed = not task.completed
    task.updated_at = datetime.utcnow()

    db.add(task)
    db.commit()
    # Removed db.refresh(task) - unnecessary extra query

    # Return appropriate message (T028)
    message = "Task marked as completed" if task.completed else "Task marked as incomplete"

    return TaskResponse(data=task, message=message)
