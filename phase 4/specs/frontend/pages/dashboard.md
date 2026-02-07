# Dashboard Page Specification

## Overview

Main task management interface displaying the user's task list with create, filter, and status toggle functionality. Protected route requiring authentication.

## Requirements

- Display user's tasks in a scrollable list
- Provide form to create new tasks
- Filter tasks by status (all, pending, completed)
- Toggle task completion status
- Navigate to task detail on click
- Show loading skeleton during data fetch
- Display empty state when no tasks

## Technical Details

```typescript
// app/dashboard/page.tsx (Server Component)
interface DashboardProps {
  searchParams: { filter?: "all" | "pending" | "completed" }
}

// Task data structure
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
│ Header (user info + logout)         │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Create Task Form                │ │
│ │ [Title input] [+ Add Button]    │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Filter: [All] [Pending] [Done]  │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Task Card                       │ │
│ │ ☐ Task title here...            │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Task Card                       │ │
│ │ ☑ Completed task...             │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## States

**Loading State**:
- Show skeleton cards while fetching tasks
- Disable form submission

**Empty State**:
- No tasks: "No tasks yet. Create your first task above!"
- Filtered empty: "No [pending/completed] tasks found."

**Error State**:
- API failure: "Failed to load tasks. Please refresh."

## Acceptance Criteria

- [ ] Tasks load on page visit
- [ ] New task appears in list after creation
- [ ] Filter buttons update displayed tasks
- [ ] Clicking task navigates to detail page
- [ ] Toggle complete updates task status
- [ ] Loading skeleton displays during fetch
- [ ] Empty state shows when no tasks match

## Dependencies

- `specs/frontend/components/task-form.md`
- `specs/frontend/components/task-list.md`
- `specs/frontend/components/filter-bar.md`
- `specs/frontend/api-client.md`

## Examples

```tsx
// Filter handling via URL params
<Link href="/dashboard?filter=pending">Pending</Link>

// Data fetching in Server Component
const tasks = await getTasks(userId, searchParams.filter);
```
