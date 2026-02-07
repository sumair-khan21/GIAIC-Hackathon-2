# TaskForm Component Specification

## Overview

Form component for creating and editing tasks. Client Component with validation, loading states, and error handling.

## Requirements

- Support create and edit modes
- Validate title (required, 1-200 chars)
- Validate description (optional, max 1000 chars)
- Show loading state during submission
- Display validation errors inline
- Clear form after successful create

## Technical Details

```typescript
// components/TaskForm.tsx
"use client"

interface TaskFormProps {
  mode: "create" | "edit";
  initialValues?: {
    title: string;
    description?: string;
  };
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel?: () => void;
}

interface TaskFormData {
  title: string;
  description?: string;
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| mode | "create" \| "edit" | Yes | Form behavior mode |
| initialValues | object | No | Pre-fill for edit mode |
| onSubmit | function | Yes | Form submission handler |
| onCancel | function | No | Cancel handler (edit mode) |

## Form Fields

| Field | Type | Validation | Error Message |
|-------|------|------------|---------------|
| title | text | Required, 1-200 chars | "Title is required" / "Title must be under 200 characters" |
| description | textarea | Optional, max 1000 chars | "Description must be under 1000 characters" |

## Visual Design

**Create Mode** (inline on dashboard):
```
┌─────────────────────────────────────┐
│ [Title input          ] [+ Add]     │
└─────────────────────────────────────┘
```

**Edit Mode** (on detail page):
```
┌─────────────────────────────────────┐
│ Title:                              │
│ [Task title input               ]   │
│                                     │
│ Description:                        │
│ [Textarea for description       ]   │
│ [                               ]   │
│                                     │
│ [Save]  [Cancel]                    │
└─────────────────────────────────────┘
```

## States

**Default**: Form ready for input
**Loading**: Submit button disabled, shows spinner
**Error**: Red border on invalid fields, error text below
**Success**: Clear form (create) or show success message (edit)

## Acceptance Criteria

- [ ] Create mode shows single-line form
- [ ] Edit mode shows full form with description
- [ ] Empty title shows validation error
- [ ] Title over 200 chars shows error
- [ ] Description over 1000 chars shows error
- [ ] Submit disabled during loading
- [ ] Form clears after successful create

## Dependencies

- `specs/frontend/validation.md` - Zod schemas

## Examples

```tsx
// Create mode
<TaskForm
  mode="create"
  onSubmit={async (data) => {
    await createTask(userId, data);
    // Form auto-clears
  }}
/>

// Edit mode
<TaskForm
  mode="edit"
  initialValues={{ title: "Task", description: "Details" }}
  onSubmit={handleUpdate}
  onCancel={() => setEditing(false)}
/>
```
