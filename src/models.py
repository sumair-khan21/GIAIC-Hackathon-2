"""
Task data structures for Phase I Todo Application.

This module defines the Task entity and its associated data structure.
"""


def create_task(task_id, title, description=""):
    """
    Create a new task dictionary.

    Args:
        task_id (int): Unique sequential identifier for the task
        title (str): Required title for the task
        description (str): Optional description (defaults to empty string)

    Returns:
        dict: Task dictionary with id, title, description, and status fields
    """
    return {
        'id': task_id,
        'title': title,
        'description': description,
        'status': 'Incomplete'
    }
