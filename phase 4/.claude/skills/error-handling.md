# Error Handling Skill

Implement consistent error handling across the stack.

## Frontend

| Pattern | Implementation |
|---------|----------------|
| User messages | Show user-friendly error messages |
| Network errors | Handle network errors gracefully |
| Loading states | Display loading states during requests |
| Form validation | Validate forms before submission |

### Frontend Example

```typescript
try {
  const response = await fetch('/api/tasks', {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Something went wrong');
  }

  return await response.json();
} catch (error) {
  // Show user-friendly message
  toast.error(error.message);
}
```

## Backend (FastAPI)

```python
from fastapi import HTTPException

# Not found
raise HTTPException(status_code=404, detail="Task not found")

# Unauthorized
raise HTTPException(status_code=401, detail="Invalid token")

# Validation error
raise HTTPException(status_code=400, detail="Title required")

# Forbidden
raise HTTPException(status_code=403, detail="Access denied")
```

## Common Error Codes

| Code | When to Use | Example Message |
|------|-------------|-----------------|
| 400 | Missing/invalid input | "Title required" |
| 401 | No token or invalid token | "Invalid token" |
| 403 | User accessing others' data | "Access denied" |
| 404 | Resource not found | "Task not found" |
| 500 | Server error | "Internal server error" |

## Error Response Format

```json
{
  "detail": "Error message here"
}
```

## Best Practices

### Backend
- [ ] Use appropriate HTTP status codes
- [ ] Provide clear error messages
- [ ] Don't expose sensitive information
- [ ] Log errors for debugging
- [ ] Handle database errors gracefully

### Frontend
- [ ] Catch all API errors
- [ ] Show loading indicators
- [ ] Display user-friendly messages
- [ ] Provide retry options where appropriate
- [ ] Validate input before sending

## Error Mapping

| Scenario | Code | Backend Message | Frontend Display |
|----------|------|-----------------|------------------|
| Missing token | 401 | "Invalid token" | "Please log in" |
| Wrong user | 403 | "Access denied" | "You don't have permission" |
| Not found | 404 | "Task not found" | "Item not found" |
| Bad input | 400 | "Title required" | "Please enter a title" |
| Server crash | 500 | "Internal error" | "Something went wrong" |
