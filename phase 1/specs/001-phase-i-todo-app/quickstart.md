# Quickstart Guide: Phase I Todo Application

**Feature**: 001-phase-i-todo-app
**Date**: 2025-12-31
**Target Audience**: End users

## Overview

The Phase I Todo Application is a simple, console-based task manager that runs entirely in your terminal. Add tasks, view your list, mark tasks complete, update details, and delete tasks you no longer need. All data is stored in memory, so it's perfect for quick, temporary task tracking during a work session.

**Key Features**:
- ✅ Add tasks with title and description
- ✅ View all tasks in a clean list
- ✅ Mark tasks as complete or incomplete
- ✅ Update task details
- ✅ Delete tasks you no longer need

**Important Note**: This app stores data in memory only. When you exit, all tasks are lost. This is by design for Phase I.

---

## Prerequisites

**Required**:
- Python 3.13 or higher installed on your system

**Check your Python version**:
```bash
python --version
```
or
```bash
python3 --version
```

**Expected output**: `Python 3.13.0` or higher

If you don't have Python 3.13+, download it from [python.org](https://python.org).

---

## Installation

**Phase I has no installation required** - just run the Python script directly.

1. Navigate to the project directory:
   ```bash
   cd /path/to/todo_cli
   ```

2. Verify the `src/` directory exists:
   ```bash
   ls src/
   ```
   You should see: `__init__.py`, `models.py`, `operations.py`, `cli.py`, `main.py`

---

## Running the Application

From the project root directory, run:

```bash
python src/main.py
```

or

```bash
python3 src/main.py
```

You'll see the main menu:

```
===== Todo App Menu =====
1. Add Task
2. List Tasks
3. Update Task
4. Delete Task
5. Mark Task Complete
6. Mark Task Incomplete
7. Exit

Enter your choice (1-7):
```

---

## Quick Reference

### Add a Task
1. Select `1` from the menu
2. Enter a title (required)
3. Enter a description (optional, press Enter to skip)
4. Confirmation: "Task added successfully (ID: X)"

### View All Tasks
1. Select `2` from the menu
2. See all tasks with ID, title, description, and status
3. If no tasks: "No tasks found"

### Mark Task Complete
1. Select `5` from the menu
2. Enter the task ID number
3. Confirmation: "Task marked as complete"

### Mark Task Incomplete
1. Select `6` from the menu
2. Enter the task ID number
3. Confirmation: "Task marked as incomplete"

### Update a Task
1. Select `3` from the menu
2. Enter the task ID number
3. Enter new title (or press Enter to keep current)
4. Enter new description (or press Enter to keep current)
5. Confirmation: "Task updated successfully"

### Delete a Task
1. Select `4` from the menu
2. Enter the task ID number
3. Confirmation: "Task deleted successfully"

### Exit the Application
1. Select `7` from the menu
2. Message: "Goodbye! All data will be lost."
3. Application closes

---

## Example Workflows

### Workflow 1: Add and View Tasks

**Scenario**: You want to capture your daily tasks and review them.

**Steps**:

1. Run the application: `python src/main.py`

2. Add your first task:
   ```
   Enter your choice (1-7): 1
   Enter task title: Buy groceries
   Enter task description (optional): Milk, eggs, bread
   Task added successfully (ID: 1)
   ```

3. Add a second task:
   ```
   Enter your choice (1-7): 1
   Enter task title: Call dentist
   Enter task description (optional):
   Task added successfully (ID: 2)
   ```

4. View your task list:
   ```
   Enter your choice (1-7): 2

   ===== All Tasks =====

   ID: 1
   Title: Buy groceries
   Description: Milk, eggs, bread
   Status: Incomplete

   ID: 2
   Title: Call dentist
   Description:
   Status: Incomplete

   Total: 2 tasks
   ```

**Result**: You have a clear list of your tasks.

---

### Workflow 2: Complete and Track Progress

**Scenario**: You've finished some tasks and want to mark them complete.

**Prerequisites**: Tasks from Workflow 1 exist.

**Steps**:

1. Mark task 1 as complete:
   ```
   Enter your choice (1-7): 5
   Enter task ID to mark as complete: 1
   Task marked as complete
   ```

2. View updated list:
   ```
   Enter your choice (1-7): 2

   ===== All Tasks =====

   ID: 1
   Title: Buy groceries
   Description: Milk, eggs, bread
   Status: Complete

   ID: 2
   Title: Call dentist
   Description:
   Status: Incomplete

   Total: 2 tasks
   ```

**Result**: Task 1 shows as "Complete", task 2 remains "Incomplete".

---

### Workflow 3: Update Task Details

**Scenario**: You realize you need to add more items to your grocery list.

**Prerequisites**: Task 1 from Workflow 1 exists.

**Steps**:

1. Update task 1:
   ```
   Enter your choice (1-7): 3
   Enter task ID to update: 1
   Enter new title (or press Enter to keep current): Buy groceries and pharmacy items
   Enter new description (or press Enter to keep current): Milk, eggs, bread, prescription refill
   Task updated successfully
   ```

2. View updated task:
   ```
   Enter your choice (1-7): 2

   ===== All Tasks =====

   ID: 1
   Title: Buy groceries and pharmacy items
   Description: Milk, eggs, bread, prescription refill
   Status: Incomplete

   ID: 2
   Title: Call dentist
   Description:
   Status: Incomplete

   Total: 2 tasks
   ```

**Result**: Task 1 has updated title and description.

---

### Workflow 4: Delete Completed Tasks

**Scenario**: You've finished a task and want to remove it from your list.

**Prerequisites**: Task 1 from Workflow 2 is marked complete.

**Steps**:

1. Delete task 1:
   ```
   Enter your choice (1-7): 4
   Enter task ID to delete: 1
   Task deleted successfully
   ```

2. View remaining tasks:
   ```
   Enter your choice (1-7): 2

   ===== All Tasks =====

   ID: 2
   Title: Call dentist
   Description:
   Status: Incomplete

   Total: 1 task
   ```

**Result**: Task 1 is removed. Task 2 keeps its original ID (2).

**Note**: If you add a new task now, it will get ID 3 (not ID 1). IDs are never reused.

---

## Common Scenarios

### Scenario: Empty Task List

**What happens**: When you first start the app, or after deleting all tasks.

```
Enter your choice (1-7): 2
No tasks found
```

**Action**: Add tasks using option 1.

---

### Scenario: Invalid Task ID

**What happens**: You try to update/delete/mark a task that doesn't exist.

```
Enter your choice (1-7): 5
Enter task ID to mark as complete: 99
Error: Task not found
```

**Action**: Use option 2 to see valid task IDs, then try again.

---

### Scenario: Empty Title

**What happens**: You try to add or update a task without a title.

```
Enter your choice (1-7): 1
Enter task title:
Error: Title is required
```

**Action**: Enter a non-empty title. Titles are required.

---

### Scenario: Optional Description

**What happens**: You skip the description by pressing Enter.

```
Enter task title: Quick task
Enter task description (optional):
Task added successfully (ID: 3)
```

**Result**: Task is created with empty description. This is valid.

---

### Scenario: Special Characters in Title

**What happens**: Your title contains `#`, `!`, `()`, etc.

```
Enter task title: Fix bug #42 (urgent!)
Enter task description (optional): Memory leak in parser
Task added successfully (ID: 4)
```

**Result**: Title is stored and displayed exactly as entered. Special characters are allowed.

---

## Tips and Best Practices

### Tip 1: Keep Titles Concise
- Titles are the main identifier in the task list
- Use descriptions for details
- Example: Title = "Dentist appointment", Description = "Friday 2pm, Dr. Smith"

### Tip 2: Use Descriptions for Context
- Descriptions help you remember details
- Can be empty if task is self-explanatory
- Example: Title = "Call Mom", Description = "Wish her happy birthday"

### Tip 3: Mark Tasks Complete Immediately
- Don't let completed tasks accumulate
- Marking complete gives a sense of accomplishment
- Use "List Tasks" regularly to see progress

### Tip 4: Delete Old Tasks
- Remove tasks you no longer need
- Keep your list focused on current priorities
- Remember: IDs won't be reused, so gaps are normal

### Tip 5: Remember Data is Temporary
- All tasks are lost when you exit
- This app is for session-based task tracking
- For permanent storage, wait for Phase II

---

## Troubleshooting

### Problem: "Command not found: python"

**Solution**: Try `python3` instead of `python`, or install Python 3.13+.

---

### Problem: "Python version is 3.11"

**Solution**: You need Python 3.13 or higher. Upgrade from [python.org](https://python.org).

---

### Problem: "No module named 'models'"

**Solution**: You're not in the project root directory. Navigate to the directory containing `src/` and run from there.

---

### Problem: "Application freezes or doesn't respond"

**Solution**:
- Press `Ctrl+C` to interrupt
- Restart: `python src/main.py`
- If problem persists, check that you entered valid input (numbers for menu choices, numeric IDs for tasks)

---

### Problem: "I can't see my tasks after restarting"

**Expected Behavior**: Phase I doesn't save data. All tasks are lost when you exit.

**Workaround**: Keep the application running during your work session, or manually copy tasks to a notepad.

**Future**: Phase II will add database persistence.

---

## Frequently Asked Questions (FAQ)

### Q: Can I save my tasks to a file?
**A**: Not in Phase I. This version stores data in memory only. Phase II will add file/database persistence.

### Q: Can I sort tasks by priority or due date?
**A**: Not in Phase I. Tasks are always sorted by ID. Phase II will add sorting and prioritization features.

### Q: Can I search for tasks?
**A**: Not in Phase I. Use "List Tasks" to see all tasks. Phase III will add search and filtering.

### Q: Can I share my tasks with others?
**A**: Not in Phase I. This is a single-user application. Phase III will add user management.

### Q: Why do task IDs skip numbers after deletion?
**A**: IDs are never reused. If you delete task 3, the next new task will NOT get ID 3. This prevents confusion when referencing task history.

### Q: Can I undo an operation?
**A**: Not in Phase I. Operations are final. Be careful when deleting tasks.

### Q: What's the maximum number of tasks?
**A**: The application supports up to 1000 tasks without performance issues.

### Q: Can I use this app on Windows/Mac/Linux?
**A**: Yes! It works on any platform with Python 3.13+ installed.

---

## Next Steps

**After mastering Phase I**:
- Phase II: Add database persistence, so tasks survive restarts
- Phase III: Add web interface, so you can access tasks from a browser
- Phase IV: Add AI features, like task suggestions and smart prioritization

**For now**: Enjoy simple, fast task management right in your terminal!

---

## Support

**Found a bug?** Check that:
- Your Python version is 3.13+
- You followed the exact prompts and inputs
- You're running from the correct directory

**Questions?** Review this quickstart guide and the [spec.md](spec.md) for detailed requirements.

**Feature requests?** Phase I is feature-complete. Enhancements will come in future phases.

---

**Happy task tracking!** 🎯
