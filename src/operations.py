"""
CRUD operations for Phase I Todo Application.

This module implements all task management operations:
- Add Task
- List Tasks
- Update Task
- Delete Task
- Mark Task Complete/Incomplete
"""

# In-memory storage - all data lost on application exit
tasks = {}  # Dictionary: {task_id: task_dict}
next_id = 1  # Sequential ID counter, never decremented


from models import create_task


def validate_title(title):
    """
    Validate that a task title is non-empty.

    Args:
        title (str): The title to validate

    Returns:
        bool: True if title is valid (non-empty after stripping), False otherwise
    """
    return len(title.strip()) > 0


def add_task(title, description=""):
    """
    Add a new task to the in-memory storage.

    Args:
        title (str): Required task title (must be non-empty)
        description (str): Optional task description (defaults to empty string)

    Returns:
        tuple: (success: bool, message: str, task_id: int or None)
            - success: True if task added, False if validation failed
            - message: Success message or error message
            - task_id: The assigned task ID if successful, None otherwise
    """
    global next_id

    # Validate title (FR-010)
    if not validate_title(title):
        return (False, "Error: Title is required", None)

    # Create task with auto-generated ID
    task_id = next_id
    task = create_task(task_id, title.strip(), description)

    # Store task
    tasks[task_id] = task

    # Increment ID counter (never reused per FR-018)
    next_id += 1

    return (True, f"Task added successfully (ID: {task_id})", task_id)


def list_tasks():
    """
    Get all tasks sorted by ID.

    Returns:
        list: List of task dictionaries sorted by ID (ascending order)
    """
    # Return all tasks sorted by ID
    return sorted(tasks.values(), key=lambda task: task['id'])


def validate_task_id(task_id_str):
    """
    Validate task ID input.

    Args:
        task_id_str (str): The task ID input to validate

    Returns:
        tuple: (valid: bool, task_id: int or None, error_message: str or None)
            - valid: True if ID is numeric and exists, False otherwise
            - task_id: The integer ID if valid, None otherwise
            - error_message: Error message if invalid, None if valid
    """
    # Check if numeric (FR-011)
    if not task_id_str.isdigit():
        return (False, None, "Error: Task ID must be a number")

    task_id = int(task_id_str)

    # Check if exists (FR-011)
    if task_id not in tasks:
        return (False, None, "Error: Task not found")

    return (True, task_id, None)


def mark_complete(task_id):
    """
    Mark a task as complete.

    Args:
        task_id (int): The ID of the task to mark complete

    Returns:
        tuple: (success: bool, message: str)
    """
    if task_id in tasks:
        tasks[task_id]['status'] = 'Complete'
        return (True, "Task marked as complete")
    return (False, "Error: Task not found")


def mark_incomplete(task_id):
    """
    Mark a task as incomplete.

    Args:
        task_id (int): The ID of the task to mark incomplete

    Returns:
        tuple: (success: bool, message: str)
    """
    if task_id in tasks:
        tasks[task_id]['status'] = 'Incomplete'
        return (True, "Task marked as incomplete")
    return (False, "Error: Task not found")


def update_task(task_id, new_title=None, new_description=None):
    """
    Update task title and/or description.

    Args:
        task_id (int): The ID of the task to update
        new_title (str or None): New title, or None to keep current
        new_description (str or None): New description, or None to keep current

    Returns:
        tuple: (success: bool, message: str)
    """
    if task_id not in tasks:
        return (False, "Error: Task not found")

    # Validate new title if provided (FR-010)
    if new_title is not None and not validate_title(new_title):
        return (False, "Error: Title cannot be empty")

    # Update title if provided
    if new_title is not None:
        tasks[task_id]['title'] = new_title.strip()

    # Update description if provided
    if new_description is not None:
        tasks[task_id]['description'] = new_description.strip()

    return (True, "Task updated successfully")


def delete_task(task_id):
    """
    Delete a task from storage.

    Args:
        task_id (int): The ID of the task to delete

    Returns:
        tuple: (success: bool, message: str)

    Note: Task IDs are never reused after deletion (FR-018).
          The next_id counter is never decremented.
    """
    if task_id in tasks:
        del tasks[task_id]
        # Note: next_id is NOT decremented - IDs are never reused (FR-018)
        return (True, "Task deleted successfully")
    return (False, "Error: Task not found")
