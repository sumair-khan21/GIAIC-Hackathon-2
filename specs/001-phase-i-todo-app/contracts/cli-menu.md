# CLI Menu Interface Contract: Phase I Todo Application

**Feature**: 001-phase-i-todo-app
**Date**: 2025-12-31
**Status**: Complete

## Overview

This document defines the exact console interface contract for the Phase I Todo Application. All menu displays, prompts, inputs, outputs, and error messages are specified to ensure consistent, predictable user experience.

## Main Menu

### Menu Display

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

**Display Requirements**:
- Header line with equals signs for visual separation
- Seven numbered options (1-7)
- Each option on its own line
- Blank line before prompt
- Prompt ends with colon and space (for input cursor positioning)

**User Interaction**:
- User enters a number (1-7) and presses Enter
- Invalid input (non-numeric, out of range) triggers error message
- Valid input navigates to corresponding operation
- After operation completes, return to this main menu
- Loop continues until user selects option 7 (Exit)

---

## Operation 1: Add Task

### Flow

1. User selects "1" from main menu
2. System prompts for title
3. User enters title (required)
4. System prompts for description
5. User enters description (optional, can press Enter for empty)
6. System creates task and displays confirmation
7. Return to main menu

### Prompts and Inputs

**Title Prompt**:
```
Enter task title:
```
- User input: Any non-empty string
- Validation: Title cannot be empty
- Special characters allowed

**Description Prompt**:
```
Enter task description (optional):
```
- User input: Any string or empty (press Enter only)
- Validation: None (optional field)
- Empty input is valid

### Success Output

```
Task added successfully (ID: X)
```
- X is the auto-generated task ID
- Example: "Task added successfully (ID: 1)"

### Error Output

**Empty Title**:
```
Error: Title is required
```
- Displayed when user enters empty string or whitespace-only for title
- Operation cancelled, return to main menu

---

## Operation 2: List Tasks

### Flow

1. User selects "2" from main menu
2. System displays all tasks or empty message
3. Return to main menu

### Output Format (Tasks Exist)

```
===== All Tasks =====

ID: 1
Title: Buy groceries
Description: Milk, eggs, bread
Status: Incomplete

ID: 2
Title: Call dentist
Description:
Status: Complete

ID: 4
Title: Review PR #123
Description: Check code quality and tests
Status: Incomplete

Total: 3 tasks
```

**Format Requirements**:
- Header with section title
- Blank line after header
- Each task separated by blank line
- Fields displayed in order: ID, Title, Description, Status
- Description shown even if empty
- Footer showing total count
- Tasks sorted by ID (ascending order)

### Output Format (No Tasks)

```
No tasks found
```
- Displayed when task list is empty
- Single line message
- Return to main menu immediately

---

## Operation 3: Update Task

### Flow

1. User selects "3" from main menu
2. System prompts for task ID
3. User enters task ID
4. System validates ID exists
5. System prompts for new title (optional)
6. User enters new title or presses Enter to keep current
7. System prompts for new description (optional)
8. User enters new description or presses Enter to keep current
9. System updates task and displays confirmation
10. Return to main menu

### Prompts and Inputs

**Task ID Prompt**:
```
Enter task ID to update:
```
- User input: Numeric string
- Validation: Must be numeric and must exist

**Title Prompt**:
```
Enter new title (or press Enter to keep current):
```
- User input: New title string or empty to skip
- Validation: If provided, cannot be empty string

**Description Prompt**:
```
Enter new description (or press Enter to keep current):
```
- User input: New description or empty to skip
- Validation: None (optional field)

### Success Output

```
Task updated successfully
```

### Error Outputs

**Task Not Found**:
```
Error: Task not found
```
- Displayed when task ID doesn't exist
- Operation cancelled, return to main menu

**Non-numeric ID**:
```
Error: Task ID must be a number
```
- Displayed when user enters non-numeric input for ID
- Operation cancelled, return to main menu

**Empty Title**:
```
Error: Title cannot be empty
```
- Displayed when user enters empty string for new title
- Operation cancelled, return to main menu

---

## Operation 4: Delete Task

### Flow

1. User selects "4" from main menu
2. System prompts for task ID
3. User enters task ID
4. System validates ID exists
5. System deletes task and displays confirmation
6. Return to main menu

### Prompts and Inputs

**Task ID Prompt**:
```
Enter task ID to delete:
```
- User input: Numeric string
- Validation: Must be numeric and must exist

### Success Output

```
Task deleted successfully
```

### Error Outputs

**Task Not Found**:
```
Error: Task not found
```

**Non-numeric ID**:
```
Error: Task ID must be a number
```

---

## Operation 5: Mark Task Complete

### Flow

1. User selects "5" from main menu
2. System prompts for task ID
3. User enters task ID
4. System validates ID exists
5. System updates status to "Complete" and displays confirmation
6. Return to main menu

### Prompts and Inputs

**Task ID Prompt**:
```
Enter task ID to mark as complete:
```
- User input: Numeric string
- Validation: Must be numeric and must exist

### Success Output

```
Task marked as complete
```

### Error Outputs

**Task Not Found**:
```
Error: Task not found
```

**Non-numeric ID**:
```
Error: Task ID must be a number
```

---

## Operation 6: Mark Task Incomplete

### Flow

1. User selects "6" from main menu
2. System prompts for task ID
3. User enters task ID
4. System validates ID exists
5. System updates status to "Incomplete" and displays confirmation
6. Return to main menu

### Prompts and Inputs

**Task ID Prompt**:
```
Enter task ID to mark as incomplete:
```
- User input: Numeric string
- Validation: Must be numeric and must exist

### Success Output

```
Task marked as incomplete
```

### Error Outputs

**Task Not Found**:
```
Error: Task not found
```

**Non-numeric ID**:
```
Error: Task ID must be a number
```

---

## Operation 7: Exit

### Flow

1. User selects "7" from main menu
2. System displays goodbye message
3. Application terminates gracefully

### Output

```
Goodbye! All data will be lost.
```

**Behavior**:
- Application exits immediately after displaying message
- All in-memory data is lost (expected behavior per Phase I constraints)
- Clean termination (no errors or warnings)

---

## Error Handling Principles

### Validation Order

1. Check if input is numeric (for ID inputs)
2. Check if ID exists in task list
3. Check if title is non-empty (for title inputs)

### Error Display Format

```
Error: <specific error message>
```

**Requirements**:
- Prefix with "Error: "
- Clear, actionable message
- No stack traces or technical details
- User understands what went wrong and how to fix it

### No Silent Failures

- Every operation provides feedback (success or error)
- No operation completes without displaying a message
- No exceptions bubble to console (all caught and translated to user-friendly errors)

---

## Input Handling

### Whitespace Handling

- Leading/trailing whitespace is stripped from all inputs
- Empty strings after stripping are considered empty
- Internal whitespace is preserved

### Special Characters

- All special characters are accepted and stored as-is
- No escaping or sanitization
- Examples: `#`, `!`, `()`, `[]`, `-`, etc.

### Long Inputs

- No maximum length restrictions
- Long titles/descriptions are accepted and stored completely
- Display wraps naturally in console (no truncation)

---

## Display Formatting

### Alignment

- Left-aligned text
- No right padding
- Field labels followed by colon and space

### Spacing

- Single blank line between tasks in list view
- Single blank line after section headers
- No blank lines within a single task's fields

### Visual Separators

- Equals signs for section headers (e.g., `===== Todo App Menu =====`)
- Consistent width (21 characters minimum)

---

## Contract Compliance Checklist

✅ All prompts match exact text specified in this document
✅ All success messages match exact text specified
✅ All error messages match exact text specified
✅ Menu layout matches visual format exactly
✅ Task list format matches specification
✅ All operations return to main menu
✅ Exit operation terminates gracefully
✅ No silent failures (100% feedback)
✅ Input validation follows specified order
✅ Special characters handled correctly
✅ Empty inputs validated according to requirements

**CLI Contract Status**: ✅ Complete and ready for implementation
