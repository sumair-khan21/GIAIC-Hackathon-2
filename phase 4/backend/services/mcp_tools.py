"""MCP Tools for AI chatbot task operations using Cohere tool format."""

from typing import Optional, List
from sqlmodel import Session, select

from models import Task


# MCP Tools definition in Cohere format
MCP_TOOLS = [
    {
        "name": "add_task",
        "description": "Create a new task for the user",
        "parameter_definitions": {
            "title": {
                "type": "str",
                "required": True,
                "description": "The title of the task"
            },
            "description": {
                "type": "str",
                "required": False,
                "description": "Optional detailed description of the task"
            }
        }
    },
    {
        "name": "list_tasks",
        "description": "List all tasks, optionally filtered by completion status",
        "parameter_definitions": {
            "status": {
                "type": "str",
                "required": False,
                "description": "Filter: 'all', 'pending', or 'completed'. Defaults to 'all'"
            }
        }
    },
    {
        "name": "complete_task",
        "description": "Mark a task as completed",
        "parameter_definitions": {
            "task_id": {
                "type": "int",
                "required": True,
                "description": "The ID of the task to mark as complete"
            }
        }
    },
    {
        "name": "delete_task",
        "description": "Permanently delete a task",
        "parameter_definitions": {
            "task_id": {
                "type": "int",
                "required": True,
                "description": "The ID of the task to delete"
            }
        }
    },
    {
        "name": "update_task",
        "description": "Update the title or description of an existing task",
        "parameter_definitions": {
            "task_id": {
                "type": "int",
                "required": True,
                "description": "The ID of the task to update"
            },
            "title": {
                "type": "str",
                "required": False,
                "description": "New title for the task"
            },
            "description": {
                "type": "str",
                "required": False,
                "description": "New description for the task"
            }
        }
    }
]


def execute_add_task(
    user_id: str,
    session: Session,
    title: str,
    description: Optional[str] = None
) -> dict:
    """
    Create a new task for the user.

    Args:
        user_id: Authenticated user's ID (from JWT)
        session: Database session
        title: Task title
        description: Optional task description

    Returns:
        dict: Result with status, task_id, title, and message
    """
    task = Task(
        user_id=user_id,
        title=title,
        description=description,
        completed=False
    )
    session.add(task)
    session.commit()
    session.refresh(task)

    return {
        "status": "created",
        "task_id": task.id,
        "title": task.title,
        "message": f"Task '{title}' created successfully"
    }


def execute_list_tasks(
    user_id: str,
    session: Session,
    status: Optional[str] = "all"
) -> dict:
    """
    List tasks for the user with optional filtering.

    Args:
        user_id: Authenticated user's ID (from JWT)
        session: Database session
        status: Filter - "all", "pending", or "completed"

    Returns:
        dict: Result with status, count, and tasks list
    """
    query = select(Task).where(Task.user_id == user_id)

    if status == "pending":
        query = query.where(Task.completed == False)
    elif status == "completed":
        query = query.where(Task.completed == True)

    tasks = session.exec(query.order_by(Task.created_at.desc())).all()

    return {
        "status": "success",
        "count": len(tasks),
        "tasks": [
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "completed": t.completed
            }
            for t in tasks
        ]
    }


def execute_complete_task(
    user_id: str,
    session: Session,
    task_id: int
) -> dict:
    """
    Mark a task as completed.

    Args:
        user_id: Authenticated user's ID (from JWT)
        session: Database session
        task_id: ID of the task to complete

    Returns:
        dict: Result with status, task_id, title, and message
    """
    task = session.exec(
        select(Task)
        .where(Task.id == task_id)
        .where(Task.user_id == user_id)
    ).first()

    if not task:
        return {
            "status": "error",
            "message": f"Task with ID {task_id} not found"
        }

    if task.completed:
        return {
            "status": "already_completed",
            "task_id": task_id,
            "title": task.title,
            "message": f"Task '{task.title}' is already marked as complete"
        }

    task.completed = True
    session.add(task)
    session.commit()

    return {
        "status": "completed",
        "task_id": task_id,
        "title": task.title,
        "message": f"Task '{task.title}' marked as complete"
    }


def execute_delete_task(
    user_id: str,
    session: Session,
    task_id: int
) -> dict:
    """
    Permanently delete a task.

    Args:
        user_id: Authenticated user's ID (from JWT)
        session: Database session
        task_id: ID of the task to delete

    Returns:
        dict: Result with status, task_id, title, and message
    """
    task = session.exec(
        select(Task)
        .where(Task.id == task_id)
        .where(Task.user_id == user_id)
    ).first()

    if not task:
        return {
            "status": "error",
            "message": f"Task with ID {task_id} not found"
        }

    title = task.title
    session.delete(task)
    session.commit()

    return {
        "status": "deleted",
        "task_id": task_id,
        "title": title,
        "message": f"Task '{title}' has been deleted"
    }


def execute_update_task(
    user_id: str,
    session: Session,
    task_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None
) -> dict:
    """
    Update a task's title or description.

    Args:
        user_id: Authenticated user's ID (from JWT)
        session: Database session
        task_id: ID of the task to update
        title: New title (optional)
        description: New description (optional)

    Returns:
        dict: Result with status, task_id, old_title, new_title, and message
    """
    task = session.exec(
        select(Task)
        .where(Task.id == task_id)
        .where(Task.user_id == user_id)
    ).first()

    if not task:
        return {
            "status": "error",
            "message": f"Task with ID {task_id} not found"
        }

    old_title = task.title
    changes = []

    if title is not None:
        task.title = title
        changes.append(f"title changed from '{old_title}' to '{title}'")

    if description is not None:
        task.description = description
        changes.append("description updated")

    if not changes:
        return {
            "status": "no_changes",
            "task_id": task_id,
            "message": "No changes provided"
        }

    session.add(task)
    session.commit()

    return {
        "status": "updated",
        "task_id": task_id,
        "old_title": old_title,
        "new_title": task.title,
        "message": f"Task updated: {', '.join(changes)}"
    }


def execute_tool(
    tool_name: str,
    parameters: dict,
    user_id: str,
    session: Session
) -> dict:
    """
    Route tool call to the appropriate executor function.

    IMPORTANT: user_id is ALWAYS passed from JWT token, never from tool parameters.
    This ensures users can only access their own tasks.

    Args:
        tool_name: Name of the tool to execute
        parameters: Tool parameters from Cohere
        user_id: Authenticated user's ID (from JWT, not from parameters)
        session: Database session

    Returns:
        dict: Result from the tool execution
    """
    executors = {
        "add_task": execute_add_task,
        "list_tasks": execute_list_tasks,
        "complete_task": execute_complete_task,
        "delete_task": execute_delete_task,
        "update_task": execute_update_task,
    }

    executor = executors.get(tool_name)
    if not executor:
        return {
            "status": "error",
            "message": f"Unknown tool: {tool_name}"
        }

    # Always inject user_id from JWT, removing any user_id from parameters
    safe_params = {k: v for k, v in parameters.items() if k != "user_id"}

    return executor(user_id=user_id, session=session, **safe_params)
