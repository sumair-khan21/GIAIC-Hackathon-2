# TaskList Component Specification

## Overview

Renders a list of TaskCard components with filtering support. Server Component for initial render with Client Component children for interactivity.

## Requirements

- Render array of tasks as TaskCard components
- Filter tasks by status (all, pending, completed)
- Display empty state message
- Show loading skeleton during fetch
- Handle task toggle callback

## Technical Details

```typescript
// components/TaskList.tsx (can be Server Component)
interface TaskListProps {
  tasks: Task[];
  filter: "all" | "pending" | "completed";
  onToggle: (id: number) => Promise<void>;
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

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| tasks | Task[] | Yes | Array of task objects |
| filter | string | Yes | Current filter status |
| onToggle | function | Yes | Handler passed to TaskCards |

## Visual Design

```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │ TaskCard 1                      │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ TaskCard 2                      │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ TaskCard 3                      │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Empty States

| Filter | Message |
|--------|---------|
| all | "No tasks yet. Create your first task above!" |
| pending | "No pending tasks. Great job!" |
| completed | "No completed tasks yet." |

## Loading Skeleton

```
┌─────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░                 │
└─────────────────────────────────────┘
(Repeat 3 times)
```

## Filtering Logic

```typescript
const filteredTasks = tasks.filter(task => {
  if (filter === "all") return true;
  if (filter === "pending") return !task.completed;
  if (filter === "completed") return task.completed;
});
```

## Acceptance Criteria

- [ ] All tasks render when filter is "all"
- [ ] Only pending tasks show for "pending" filter
- [ ] Only completed tasks show for "completed" filter
- [ ] Empty state displays appropriate message
- [ ] Loading skeleton shows during fetch
- [ ] Task toggle callback propagates correctly

## Dependencies

- `specs/frontend/components/task-card.md`
- `specs/frontend/styling.md`

## Examples

```tsx
<TaskList
  tasks={tasks}
  filter="pending"
  onToggle={async (id) => {
    await toggleComplete(userId, id);
    refresh();
  }}
/>
```
