# Data Model: Phase I Todo Application

**Feature**: 001-phase-i-todo-app
**Date**: 2025-12-31
**Status**: Complete

## Overview

Phase I uses a single-entity data model with in-memory storage. The Task entity represents all user todo items with four fields: ID, title, description, and status.

## Entity: Task

### Description

A Task represents a single todo item that a user wants to track. Each task has a unique identifier, required title, optional description, and completion status.

### Fields

| Field Name  | Data Type | Required | Default Value | Constraints                                      |
|-------------|-----------|----------|---------------|--------------------------------------------------|
| id          | int       | Yes      | Auto-generated| Unique, sequential, positive integer, starts at 1|
| title       | str       | Yes      | N/A           | Non-empty string, min length 1 character         |
| description | str       | No       | "" (empty)    | Any string including empty, no length limit      |
| status      | str       | Yes      | "Incomplete"  | Enum: exactly "Complete" or "Incomplete"         |

### Field Details

#### id (int)
- **Purpose**: Uniquely identifies each task
- **Generation**: Auto-generated sequentially starting from 1
- **Behavior**:
  - Increments by 1 for each new task
  - Never reused after task deletion (FR-018)
  - Never decrements or resets
- **Validation**: Must be a positive integer
- **Mutability**: Immutable (set once on creation, never changed)

#### title (str)
- **Purpose**: Brief description of what the task is
- **Input**: User-provided during task creation
- **Validation**:
  - Cannot be empty string (FR-010)
  - Can contain special characters (FR-017)
  - No maximum length constraint (Spec Boundary Conditions allow 500+ characters)
- **Mutability**: Mutable (can be updated via Update Task operation)
- **Examples**: "Buy groceries", "Fix bug #42 (urgent!)", "Call dentist"

#### description (str)
- **Purpose**: Optional detailed information about the task
- **Input**: User-provided during task creation, optional
- **Default**: Empty string ("") if not provided
- **Validation**:
  - No validation required (optional field)
  - Empty string is valid
  - Can contain special characters
  - No maximum length constraint
- **Mutability**: Mutable (can be updated via Update Task operation)
- **Examples**: "Milk, eggs, bread", "" (empty), "Urgent - must complete by Friday"

#### status (str)
- **Purpose**: Tracks whether the task is completed or not
- **Values**: Exactly "Complete" or "Incomplete" (case-sensitive)
- **Default**: "Incomplete" for all newly created tasks (FR-004)
- **Validation**: Must be one of the two allowed enum values
- **Mutability**: Mutable (toggled via Mark Complete/Incomplete operations)
- **Display**: Shown in task list to indicate progress

### State Diagram

```
         [Task Created]
               |
               v
         status = "Incomplete"
               |
               |<--- Mark Incomplete
               |
               +---> Mark Complete
               |
               v
         status = "Complete"
               |
               +---> Mark Incomplete
               |
               v
         status = "Incomplete"
```

### State Transitions

| Current State | Operation          | New State    | Notes                           |
|---------------|--------------------|--------------|---------------------------------|
| N/A           | Add Task           | Incomplete   | Initial state for all new tasks |
| Incomplete    | Mark Complete      | Complete     | User marks task as done         |
| Complete      | Mark Incomplete    | Incomplete   | User reopens task               |
| Complete      | Mark Complete      | Complete     | Idempotent operation            |
| Incomplete    | Mark Incomplete    | Incomplete   | Idempotent operation            |
| Any           | Update Task        | Unchanged    | Status not modified by update   |
| Any           | Delete Task        | [Deleted]    | Task removed from storage       |

## Relationships

**None** - Phase I has a single-entity model with no relationships.

Future phases may introduce:
- Phase II: Task → Category (many-to-one)
- Phase III: Task → User (many-to-one)
- Phase IV: Task → AI Suggestions (one-to-many)

## Storage Implementation

### In-Memory Structure

```python
# Module-level storage (operations.py)
tasks = {}  # Dictionary: {task_id: task_dict}
next_id = 1  # Sequential ID counter

# Task dictionary structure
task_dict = {
    'id': 1,
    'title': 'Buy groceries',
    'description': 'Milk, eggs, bread',
    'status': 'Incomplete'
}
```

### Storage Operations

**Create (Add Task)**:
```python
task_id = next_id
next_id += 1
tasks[task_id] = {
    'id': task_id,
    'title': user_title,
    'description': user_description or "",
    'status': 'Incomplete'
}
```

**Read (List Tasks)**:
```python
all_tasks = list(tasks.values())
# Return all tasks sorted by ID (ascending)
```

**Read Single (Get Task by ID)**:
```python
task = tasks.get(task_id)
# Returns task dict or None if not found
```

**Update (Update Task)**:
```python
if task_id in tasks:
    if new_title is not None:
        tasks[task_id]['title'] = new_title
    if new_description is not None:
        tasks[task_id]['description'] = new_description
```

**Delete (Delete Task)**:
```python
if task_id in tasks:
    del tasks[task_id]
# task_id is never reused for future tasks
```

**Status Update (Mark Complete/Incomplete)**:
```python
if task_id in tasks:
    tasks[task_id]['status'] = 'Complete'  # or 'Incomplete'
```

## Validation Rules

### Title Validation
- **Rule**: Title must be a non-empty string
- **Check**: `len(title.strip()) > 0`
- **Error**: "Title is required" (FR-012)
- **Applied On**: Add Task, Update Task operations

### ID Validation
- **Rule**: ID must be numeric and exist in tasks dictionary
- **Check**: `task_id.isdigit()` and `int(task_id) in tasks`
- **Errors**:
  - Non-numeric: "Task ID must be a number"
  - Not found: "Task not found"
- **Applied On**: Update Task, Delete Task, Mark Complete, Mark Incomplete operations

### Description Validation
- **Rule**: None (optional field, any string is valid including empty)
- **Check**: Not required
- **Applied On**: Add Task, Update Task operations

### Status Validation
- **Rule**: Must be exactly "Complete" or "Incomplete"
- **Check**: `status in ['Complete', 'Incomplete']`
- **Note**: This validation is internal only (users don't set status directly, they use Mark operations)

## Edge Cases

### Empty Task List
- **Scenario**: No tasks have been added yet
- **Storage State**: `tasks = {}`, `next_id = 1`
- **List Operation**: Returns empty list, displays "No tasks found"
- **Get Operation**: Returns None for any ID, displays "Task not found"

### After Task Deletion
- **Scenario**: Task ID 3 is deleted from list containing tasks 1, 2, 3, 4, 5
- **Storage State**: `tasks = {1: ..., 2: ..., 4: ..., 5: ...}`
- **ID Counter**: `next_id = 6` (unchanged, IDs never reused)
- **List Operation**: Returns tasks 1, 2, 4, 5 (gap in sequence is expected)

### Maximum Scale
- **Scenario**: 1000 tasks added (Spec SC-005 performance expectation)
- **Storage State**: `tasks` contains 1000 key-value pairs
- **Performance**: All operations remain instant (O(1) lookup, O(n) list)
- **ID Counter**: `next_id = 1001`

### Special Characters
- **Scenario**: Title contains "Fix bug #42 (urgent!)"
- **Storage**: Stored exactly as entered (FR-017)
- **Display**: Shown exactly as entered, no escaping or sanitization

### Long Strings
- **Scenario**: Title is 500 characters long
- **Storage**: Stored completely (no length limit per Spec Boundary Conditions)
- **Display**: Shown completely, wrapping if needed (FR-016 readability requirement)

## Data Persistence

**Phase I Constraint**: No persistence

- **On Application Exit**: All data in `tasks` dictionary is lost
- **On Application Restart**: `tasks = {}`, `next_id = 1` (fresh state)
- **User Expectation**: Defined in Spec Assumptions: "Users accept that data is lost when the application exits"
- **Future Phases**: Phase II will add database persistence

## Data Integrity Guarantees

1. **Uniqueness**: Every task ID is unique within a session
2. **Immutability**: Task IDs never change once assigned
3. **No Reuse**: Deleted task IDs are never reassigned to new tasks
4. **Sequential**: Task IDs increase in order of creation
5. **Consistency**: All tasks always have all four required fields
6. **Type Safety**: Field types are enforced during operations

## Examples

### Example Task 1: Basic Task
```python
{
    'id': 1,
    'title': 'Buy groceries',
    'description': 'Milk, eggs, bread',
    'status': 'Incomplete'
}
```

### Example Task 2: Task with Empty Description
```python
{
    'id': 2,
    'title': 'Call dentist',
    'description': '',
    'status': 'Incomplete'
}
```

### Example Task 3: Completed Task with Special Characters
```python
{
    'id': 3,
    'title': 'Fix bug #42 (urgent!)',
    'description': 'Memory leak in parser module - see ticket #42',
    'status': 'Complete'
}
```

### Example Storage State
```python
tasks = {
    1: {
        'id': 1,
        'title': 'Buy groceries',
        'description': 'Milk, eggs, bread',
        'status': 'Incomplete'
    },
    2: {
        'id': 2,
        'title': 'Call dentist',
        'description': '',
        'status': 'Complete'
    },
    4: {  # ID 3 was deleted
        'id': 4,
        'title': 'Review code',
        'description': 'PR #123 needs review',
        'status': 'Incomplete'
    }
}
next_id = 5  # Next task will get ID 5
```

## Compliance Check

✅ **Spec Alignment**: Data model matches Task entity definition from spec.md
✅ **Constitution Compliance**: In-memory only, no persistence, simple structure
✅ **Phase I Boundaries**: Single entity, no relationships, no complex patterns
✅ **Validation Coverage**: All FR-010, FR-011, FR-017, FR-018 requirements met
✅ **Edge Cases**: All edge cases from spec.md addressed in model design

**Data Model Status**: ✅ Complete and ready for implementation
