# TaskCard Component Specification

## Overview

Displays a single task in the task list with title, completion status, and action buttons. Client Component for interactive toggle and navigation.

## Requirements

- Display task title with completion indicator
- Show truncated description if present
- Toggle completion on checkbox click
- Navigate to detail page on card click
- Visual distinction for completed tasks

## Technical Details

```typescript
// components/TaskCard.tsx
"use client"

interface TaskCardProps {
  task: {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
  };
  onToggle: (id: number) => Promise<void>;
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| task | Task | Yes | Task data object |
| onToggle | function | Yes | Handler for completion toggle |

## Visual Design

```
┌─────────────────────────────────────┐
│ ☐ Task title here                   │
│    Description preview...            │
└─────────────────────────────────────┘

Completed state:
┌─────────────────────────────────────┐
│ ☑ Task title here (strikethrough)   │
│    Description preview...            │
└─────────────────────────────────────┘
```

## Styling

```css
/* Tailwind classes */
.card-base: "p-4 border rounded-lg hover:shadow-md cursor-pointer"
.completed: "bg-gray-50 opacity-75"
.title-completed: "line-through text-gray-500"
.checkbox: "w-5 h-5 rounded border-gray-300"
```

## Behaviors

**Click on card**: Navigate to `/tasks/{id}`
**Click on checkbox**: Toggle completion (stop propagation)
**Hover**: Subtle shadow elevation

## Acceptance Criteria

- [ ] Card displays title and truncated description
- [ ] Checkbox reflects completed state
- [ ] Clicking checkbox toggles completion
- [ ] Clicking card navigates to detail page
- [ ] Completed tasks have visual distinction
- [ ] Hover state provides feedback

## Dependencies

- `specs/frontend/styling.md` - Color palette
- `specs/frontend/api-client.md` - Toggle API

## Examples

```tsx
<TaskCard
  task={{
    id: 1,
    title: "Complete project",
    description: "Finish the frontend specs",
    completed: false
  }}
  onToggle={handleToggle}
/>
```
