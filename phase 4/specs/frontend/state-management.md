# State Management Specification

## Overview

State management using React built-ins (useState, useReducer) and Next.js patterns. No external state library. Server Components for data fetching, Client Components for interactivity.

## Requirements

- Use Server Components for initial data
- Use Client Components for forms and interactivity
- Local state with useState for UI state
- URL params for filter state persistence
- Optimistic updates for better UX

## Component Strategy

| Component Type | Use For | State Pattern |
|----------------|---------|---------------|
| Server Component | Data fetching, static content | No React hooks |
| Client Component | Forms, toggles, interactions | useState, useReducer |

### When to Use "use client"

Add `"use client"` when component needs:
- Event handlers (onClick, onChange, onSubmit)
- useState, useEffect, useReducer
- Browser APIs (localStorage, window)
- Third-party client-side libraries

## State Patterns

### Form State (useState)

```typescript
"use client"

function TaskForm() {
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await createTask({ title });
      setTitle(""); // Clear on success
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };
}
```

### Filter State (URL Params)

```typescript
// Persist filter in URL for shareability
// app/dashboard/page.tsx (Server Component)
export default function Dashboard({
  searchParams,
}: {
  searchParams: { filter?: string }
}) {
  const filter = searchParams.filter || "all";
  const tasks = await getTasks(userId, filter);
}
```

### Toggle State (Optimistic Updates)

```typescript
"use client"

function TaskCard({ task, onToggle }) {
  const [optimisticCompleted, setOptimisticCompleted] = useState(
    task.completed
  );

  const handleToggle = async () => {
    // Optimistically update UI
    setOptimisticCompleted(!optimisticCompleted);
    try {
      await onToggle(task.id);
    } catch {
      // Revert on failure
      setOptimisticCompleted(task.completed);
    }
  };
}
```

## Data Fetching Patterns

### Server Component Fetch

```typescript
// Fetch in Server Component, pass to Client Components
export default async function Dashboard() {
  const session = await auth();
  const tasks = await getTasks(session.user.id);

  return <TaskList tasks={tasks} />;
}
```

### Client-Side Refresh

```typescript
"use client"
import { useRouter } from "next/navigation";

function TaskForm() {
  const router = useRouter();

  const handleCreate = async (data) => {
    await createTask(data);
    router.refresh(); // Re-fetch Server Component data
  };
}
```

## Cache Invalidation

After mutations, use `router.refresh()` to:
- Refetch Server Component data
- Update task list after create/update/delete
- Sync UI with server state

## Acceptance Criteria

- [ ] Server Components fetch initial data
- [ ] Client Components handle interactivity
- [ ] Forms use useState for local state
- [ ] Filter persists in URL params
- [ ] Optimistic updates for toggles
- [ ] router.refresh() used after mutations

## Dependencies

- `specs/frontend/api-client.md` - Data fetching functions
- `next/navigation` - useRouter for refresh
