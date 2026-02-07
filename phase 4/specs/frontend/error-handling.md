# Error Handling Specification

## Overview

Consistent error handling across the frontend for API failures, network issues, and validation errors. User-friendly messages with appropriate recovery options.

## Requirements

- Display user-friendly error messages
- Handle all HTTP error status codes
- Show network error states
- Provide recovery options (retry, redirect)
- Log errors for debugging

## Error Types

| Type | Source | Handling |
|------|--------|----------|
| Validation | Form input | Inline error display |
| API | Backend response | Toast/alert message |
| Network | Connection failure | Full-screen error state |
| Auth | 401 response | Redirect to signin |
| Permission | 403 response | Access denied message |
| Not Found | 404 response | Show not found page |

## HTTP Status Handling

```typescript
// lib/api.ts error handler
function handleApiError(status: number, detail: string) {
  switch (status) {
    case 400:
      throw new ValidationError(detail || "Invalid input");
    case 401:
      // Redirect to signin
      window.location.href = "/auth/signin";
      throw new AuthError("Please sign in to continue");
    case 403:
      throw new ForbiddenError("You don't have permission");
    case 404:
      throw new NotFoundError("Item not found");
    case 500:
      throw new ServerError("Something went wrong");
    default:
      throw new Error(detail || "An error occurred");
  }
}
```

## Error Display Components

### Toast Notification

```tsx
// For non-blocking errors
function Toast({ message, type }: { message: string; type: "error" | "success" }) {
  return (
    <div className={cn(
      "fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg",
      type === "error" ? "bg-error text-white" : "bg-success text-white"
    )}>
      {message}
    </div>
  );
}
```

### Inline Form Error

```tsx
// For validation errors
<div className="text-error text-sm mt-1">
  {error.message}
</div>
```

### Full Page Error

```tsx
// For critical errors (error.tsx)
<div className="text-center py-10">
  <h2 className="text-xl font-semibold text-error">
    Something went wrong
  </h2>
  <p className="text-gray-600 mt-2">{error.message}</p>
  <button onClick={reset} className="btn-primary mt-4">
    Try again
  </button>
</div>
```

## Error Messages

| Scenario | Technical | User-Friendly |
|----------|-----------|---------------|
| Invalid credentials | 401 Unauthorized | "Invalid email or password" |
| Network failure | fetch failed | "Unable to connect. Check your internet." |
| Task not found | 404 Not Found | "This task doesn't exist" |
| Validation | Zod error | "Title is required" |
| Server error | 500 Internal | "Something went wrong. Please try again." |
| Access denied | 403 Forbidden | "You don't have permission to do this" |

## Network Error Handling

```tsx
async function fetchWithErrorHandling(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const data = await response.json();
      handleApiError(response.status, data.detail);
    }
    return response.json();
  } catch (error) {
    if (error.name === "TypeError") {
      throw new NetworkError("Unable to connect to server");
    }
    throw error;
  }
}
```

## Error Boundary Pattern

```tsx
// app/error.tsx
"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
```

## Acceptance Criteria

- [ ] All API errors display user-friendly messages
- [ ] 401 errors redirect to signin
- [ ] Network errors show connection message
- [ ] Validation errors display inline
- [ ] Error boundaries catch rendering errors
- [ ] Retry option available for recoverable errors

## Dependencies

- `specs/frontend/api-client.md` - Error throwing
- `specs/frontend/validation.md` - Form error display
