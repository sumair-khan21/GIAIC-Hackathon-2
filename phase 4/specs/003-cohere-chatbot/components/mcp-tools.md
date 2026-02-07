# MCP Tools Specification

**Component**: mcp-tools
**Parent Feature**: 003-cohere-chatbot

## Overview

Five tools enabling AI to perform task CRUD operations on behalf of authenticated users.

## Tool Definitions (Cohere Format)

```python
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
                "description": "Optional detailed description"
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
                "description": "Filter: 'all', 'pending', or 'completed'"
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
                "description": "ID of the task to complete"
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
                "description": "ID of the task to delete"
            }
        }
    },
    {
        "name": "update_task",
        "description": "Update task title or description",
        "parameter_definitions": {
            "task_id": {
                "type": "int",
                "required": True,
                "description": "ID of the task to update"
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
```

## Tool Executor Functions

```python
from sqlmodel import Session, select
from models import Task

def execute_tool(tool_name: str, parameters: dict, user_id: str, session: Session):
    """Route tool call to appropriate executor."""
    executors = {
        "add_task": execute_add_task,
        "list_tasks": execute_list_tasks,
        "complete_task": execute_complete_task,
        "delete_task": execute_delete_task,
        "update_task": execute_update_task,
    }
    executor = executors.get(tool_name)
    if not executor:
        return {"error": f"Unknown tool: {tool_name}"}
    return executor(user_id=user_id, session=session, **parameters)
```

### add_task

```python
def execute_add_task(user_id: str, session: Session, title: str, description: str = None):
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
```

### list_tasks

```python
def execute_list_tasks(user_id: str, session: Session, status: str = "all"):
    query = select(Task).where(Task.user_id == user_id)

    if status == "pending":
        query = query.where(Task.completed == False)
    elif status == "completed":
        query = query.where(Task.completed == True)

    tasks = session.exec(query).all()
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
```

### complete_task

```python
def execute_complete_task(user_id: str, session: Session, task_id: int):
    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()

    if not task:
        return {"status": "error", "message": "Task not found"}

    task.completed = True
    session.add(task)
    session.commit()
    return {
        "status": "completed",
        "task_id": task_id,
        "title": task.title,
        "message": f"Task '{task.title}' marked as complete"
    }
```

### delete_task

```python
def execute_delete_task(user_id: str, session: Session, task_id: int):
    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()

    if not task:
        return {"status": "error", "message": "Task not found"}

    title = task.title
    session.delete(task)
    session.commit()
    return {
        "status": "deleted",
        "task_id": task_id,
        "title": title,
        "message": f"Task '{title}' deleted"
    }
```

### update_task

```python
def execute_update_task(user_id: str, session: Session, task_id: int,
                        title: str = None, description: str = None):
    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()

    if not task:
        return {"status": "error", "message": "Task not found"}

    old_title = task.title
    if title:
        task.title = title
    if description is not None:
        task.description = description

    session.add(task)
    session.commit()
    return {
        "status": "updated",
        "task_id": task_id,
        "old_title": old_title,
        "new_title": task.title,
        "message": f"Task updated successfully"
    }
```

## Security: User Isolation

**CRITICAL**: user_id is ALWAYS injected from JWT token, never from tool parameters.

```python
# CORRECT: user_id from authentication
result = execute_tool(
    tool_name=tool_call.name,
    parameters=tool_call.parameters,
    user_id=current_user.id,  # From JWT
    session=session
)

# WRONG: Never trust user_id from AI parameters
# result = execute_tool(..., user_id=tool_call.parameters.get("user_id"))
```
