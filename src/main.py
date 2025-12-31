"""
Main entry point for Phase I Todo Application.

This module initializes the application and starts the main event loop.
"""

from cli import (display_menu, get_menu_choice, add_task_cli,
                 list_tasks_cli, mark_complete_cli, mark_incomplete_cli,
                 update_task_cli, delete_task_cli)


def main():
    """
    Main application loop.

    Displays menu, gets user choice, routes to operations, and repeats
    until user selects Exit (option 7).
    """
    while True:
        display_menu()
        choice = get_menu_choice()

        if choice == '1':
            # Add Task
            add_task_cli()
        elif choice == '2':
            # List Tasks
            list_tasks_cli()
        elif choice == '3':
            # Update Task
            update_task_cli()
        elif choice == '4':
            # Delete Task
            delete_task_cli()
        elif choice == '5':
            # Mark Task Complete
            mark_complete_cli()
        elif choice == '6':
            # Mark Task Incomplete
            mark_incomplete_cli()
        elif choice == '7':
            # Exit
            print("Goodbye!")
            break
        else:
            # Invalid choice
            print("Error: Invalid choice. Please enter a number between 1 and 7.")


if __name__ == "__main__":
    main()
