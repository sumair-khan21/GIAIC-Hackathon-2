"""
Console interface for Phase I Todo Application.

This module handles all user interaction, menu display, input prompts,
and output formatting.
"""


def display_menu():
    """
    Display the main menu with all available operations.

    Menu options match the exact CLI contract specification.
    """
    print("\n===== Todo App Menu =====")
    print("1. Add Task")
    print("2. List Tasks")
    print("3. Update Task")
    print("4. Delete Task")
    print("5. Mark Task Complete")
    print("6. Mark Task Incomplete")
    print("7. Exit")
    print()


def get_menu_choice():
    """
    Get and validate user's menu choice.

    Returns:
        str: User's choice (1-7) as a string, or empty string if invalid

    The function prompts the user and returns their input.
    Validation happens in the main loop.
    """
    choice = input("Enter your choice (1-7): ").strip()
    return choice


def add_task_cli():
    """
    CLI flow for adding a new task.

    Prompts user for title and description, validates input,
    calls add_task operation, and displays result.
    """
    from operations import add_task

    # Prompt for title (required)
    title = input("Enter task title: ").strip()

    # Prompt for description (optional)
    description = input("Enter task description (optional): ").strip()

    # Call add_task operation
    success, message, task_id = add_task(title, description)

    # Display result
    print(message)


def list_tasks_cli():
    """
    CLI flow for listing all tasks.

    Retrieves all tasks, formats and displays them.
    Handles empty list case.
    """
    from operations import list_tasks

    # Get all tasks
    all_tasks = list_tasks()

    # Handle empty list
    if not all_tasks:
        print("No tasks found")
        return

    # Display header
    print("\n===== All Tasks =====\n")

    # Display each task
    for task in all_tasks:
        print(f"ID: {task['id']}")
        print(f"Title: {task['title']}")
        print(f"Description: {task['description']}")
        print(f"Status: {task['status']}")
        print()  # Blank line between tasks

    # Display footer with count
    print(f"Total: {len(all_tasks)} {'task' if len(all_tasks) == 1 else 'tasks'}")


def mark_complete_cli():
    """
    CLI flow for marking a task as complete.

    Prompts for task ID, validates, marks complete, and displays result.
    """
    from operations import validate_task_id, mark_complete

    # Prompt for task ID
    task_id_str = input("Enter task ID to mark as complete: ").strip()

    # Validate task ID
    valid, task_id, error_message = validate_task_id(task_id_str)
    if not valid:
        print(error_message)
        return

    # Mark complete
    success, message = mark_complete(task_id)
    print(message)


def mark_incomplete_cli():
    """
    CLI flow for marking a task as incomplete.

    Prompts for task ID, validates, marks incomplete, and displays result.
    """
    from operations import validate_task_id, mark_incomplete

    # Prompt for task ID
    task_id_str = input("Enter task ID to mark as incomplete: ").strip()

    # Validate task ID
    valid, task_id, error_message = validate_task_id(task_id_str)
    if not valid:
        print(error_message)
        return

    # Mark incomplete
    success, message = mark_incomplete(task_id)
    print(message)


def update_task_cli():
    """
    CLI flow for updating a task.

    Prompts for task ID, new title, new description, validates, updates, and displays result.
    Allows partial updates (empty input keeps current value).
    """
    from operations import validate_task_id, update_task

    # Prompt for task ID
    task_id_str = input("Enter task ID to update: ").strip()

    # Validate task ID
    valid, task_id, error_message = validate_task_id(task_id_str)
    if not valid:
        print(error_message)
        return

    # Prompt for new title (optional - empty keeps current)
    new_title_input = input("Enter new title (or press Enter to keep current): ").strip()
    new_title = new_title_input if new_title_input else None

    # Prompt for new description (optional - empty keeps current)
    new_description_input = input("Enter new description (or press Enter to keep current): ").strip()
    new_description = new_description_input if new_description_input else None

    # Update task
    success, message = update_task(task_id, new_title, new_description)
    print(message)


def delete_task_cli():
    """
    CLI flow for deleting a task.

    Prompts for task ID, validates, deletes, and displays result.
    """
    from operations import validate_task_id, delete_task

    # Prompt for task ID
    task_id_str = input("Enter task ID to delete: ").strip()

    # Validate task ID
    valid, task_id, error_message = validate_task_id(task_id_str)
    if not valid:
        print(error_message)
        return

    # Delete task
    success, message = delete_task(task_id)
    print(message)
