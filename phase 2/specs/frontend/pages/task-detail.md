# Task Detail Page Specification

## Overview

Single task view for viewing, editing, and deleting a task. Protected route with dynamic [id] parameter. Server Component with Client Component children for interactivity.

## Requirements

- Display full task information (title, description, status, dates)
- Allow editing task title and description
- Provide delete functionality with confirmation
- Toggle completion status
- Navigate back to dashboard
- Handle non-existent task (404)

## Technical Details

```typescript
// app/tasks/[id]/page.tsx (Server Component)
interface TaskDetailProps {
  params: { id: string }
}

interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}
```

## Layout Structure

```
┌─────────────────────────────────────┐
│ Header                              │
├─────────────────────────────────────┤
│ ← Back to Dashboard                 │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Task Title (editable)           │ │
│ │ ☐ Mark as complete              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Description:                        │
│ ┌─────────────────────────────────┐ │
│ │ Task description text...        │ │
│ │ (editable textarea)             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Created: Jan 11, 2026               │
│ Updated: Jan 11, 2026               │
│                                     │
│ [Save Changes]  [Delete Task]       │
└─────────────────────────────────────┘
```

## States

**View Mode**:
- Display task details read-only by default
- "Edit" button switches to edit mode

**Edit Mode**:
- Form fields become editable
- "Save" and "Cancel" buttons appear
- Validation on save

**Delete Confirmation**:
- Modal or inline confirmation
- "Are you sure you want to delete this task?"
- "Delete" and "Cancel" buttons

**Loading State**:
- Skeleton while fetching task
- Spinner on save/delete actions

**Error States**:
- Task not found → Show 404 message with link to dashboard
- Save failed → "Failed to save changes"
- Delete failed → "Failed to delete task"

## Acceptance Criteria

- [ ] Task details display on page load
- [ ] Edit mode allows changing title and description
- [ ] Save persists changes and shows success
- [ ] Delete removes task and redirects to dashboard
- [ ] Back link navigates to dashboard
- [ ] 404 displays for non-existent task
- [ ] Completion toggle updates status

## Dependencies

- `specs/frontend/components/task-form.md`
- `specs/frontend/api-client.md`
- `specs/frontend/error-handling.md`

## Examples

```tsx
// Back navigation
<Link href="/dashboard">← Back to Dashboard</Link>

// Delete confirmation
const handleDelete = async () => {
  if (confirm("Delete this task?")) {
    await deleteTask(userId, taskId);
    router.push("/dashboard");
  }
};
```
