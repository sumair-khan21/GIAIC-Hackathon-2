# Validation Specification

## Overview

Client-side form validation using Zod schemas. Provides real-time validation feedback and prevents invalid submissions.

## Requirements

- Define Zod schemas for all forms
- Validate on blur and submit
- Display inline error messages
- Prevent form submission if invalid

## Validation Schemas

### Auth Schemas

```typescript
// lib/validations.ts
import { z } from "zod";

export const signinSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters"),
});

export const signupSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
    .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
```

### Task Schemas

```typescript
export const taskSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(200, "Title must be under 200 characters"),
  description: z.string()
    .max(1000, "Description must be under 1000 characters")
    .optional(),
});
```

## Validation Rules

| Field | Rules | Error Messages |
|-------|-------|----------------|
| email | Required, valid email | "Email is required", "Invalid email format" |
| password | Required, min 8 chars | "Password must be at least 8 characters" |
| confirmPassword | Must match password | "Passwords do not match" |
| title | Required, 1-200 chars | "Title is required", "Title must be under 200 characters" |
| description | Optional, max 1000 | "Description must be under 1000 characters" |

## Validation Timing

| Event | Behavior |
|-------|----------|
| On blur | Validate single field |
| On change | Clear error if field becomes valid |
| On submit | Validate all fields, prevent if invalid |

## Error Display Pattern

```tsx
// Inline error display
<div>
  <input
    {...register("email")}
    className={cn("input", errors.email && "input-error")}
  />
  {errors.email && (
    <p className="text-error text-sm mt-1">
      {errors.email.message}
    </p>
  )}
</div>
```

## React Hook Form Integration

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const form = useForm({
  resolver: zodResolver(taskSchema),
  defaultValues: { title: "", description: "" },
});
```

## Acceptance Criteria

- [ ] All forms use Zod schemas
- [ ] Validation errors display inline
- [ ] Invalid forms cannot submit
- [ ] Errors clear when corrected
- [ ] Real-time feedback on blur

## Dependencies

- `zod` - Schema validation
- `react-hook-form` - Form state management
- `@hookform/resolvers` - Zod integration

## Examples

```tsx
// Form with validation
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(taskSchema),
});

const onSubmit = (data) => {
  // Only called if validation passes
  createTask(data);
};

<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register("title")} />
  {errors.title && <span>{errors.title.message}</span>}
  <button type="submit">Create</button>
</form>
```
