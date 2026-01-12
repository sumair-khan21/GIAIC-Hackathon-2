# Data Model: Next.js Frontend

**Feature**: 001-nextjs-frontend
**Date**: 2026-01-11

## TypeScript Types

### User Entity

```typescript
// types/auth.ts
interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

interface Session {
  user: User;
  token: string;
  expiresAt: string;
}

interface AuthError {
  message: string;
  code: string;
}
```

### Task Entity

```typescript
// types/task.ts
interface Task {
  id: number;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateTaskInput {
  title: string;
  description?: string;
}

interface UpdateTaskInput {
  title?: string;
  description?: string;
}

type TaskFilter = "all" | "pending" | "completed";
```

### API Response Types

```typescript
// types/api.ts
interface ApiResponse<T> {
  data: T;
  message: string;
}

interface ApiError {
  error: string;
  code: string;
}

interface TaskListResponse extends ApiResponse<Task[]> {}
interface TaskResponse extends ApiResponse<Task> {}
```

## Entity Relationships

```
User (from Better Auth)
  │
  └── owns many ──→ Task
                     │
                     ├── id (number, primary key)
                     ├── user_id (string, foreign key)
                     ├── title (string, 1-200 chars)
                     ├── description (string, optional, max 1000)
                     ├── completed (boolean, default false)
                     ├── created_at (timestamp)
                     └── updated_at (timestamp)
```

## Validation Rules

### Task Validation Schema

```typescript
// lib/validations.ts
import { z } from "zod";

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be under 200 characters"),
  description: z
    .string()
    .max(1000, "Description must be under 1000 characters")
    .optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;
```

### Auth Validation Schemas

```typescript
export const signinSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

export const signupSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: z
    .string()
    .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type SigninFormData = z.infer<typeof signinSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
```

## State Transitions

### Task Status

```
[Pending] ←──toggle──→ [Completed]
    │                       │
    └───────delete──────────┴──→ [Deleted]
```

### Auth State

```
[Unauthenticated] ──signup/signin──→ [Authenticated]
                                          │
                                     logout/expiry
                                          │
                                          ↓
                                   [Unauthenticated]
```

## Data Flow

### Dashboard Page

```
1. Server Component loads
2. Get session from Better Auth
3. Extract user_id from session
4. Fetch tasks: GET /api/{user_id}/tasks
5. Pass tasks to TaskList component
6. Client Components handle mutations
7. router.refresh() after mutations
```

### Task Creation

```
1. User fills TaskForm
2. Zod validates input
3. Submit: POST /api/{user_id}/tasks
4. API returns new task
5. router.refresh() triggers re-fetch
6. New task appears in list
```

## Frontend State Shape

```typescript
// Dashboard page state (mostly server-driven)
interface DashboardState {
  // From Server Component (props)
  tasks: Task[];
  user: User;

  // From URL params
  filter: TaskFilter;

  // Client Component local state
  isCreating: boolean;
  editingTaskId: number | null;
  error: string | null;
}
```
