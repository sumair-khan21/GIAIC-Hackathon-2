# Error Handling

## Requirements

- Consistent error response format across all endpoints
- Appropriate HTTP status codes
- User-friendly error messages
- Error codes for frontend handling

## Standard Error Format

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

## HTTP Status Codes

| Status | Code | Usage |
|--------|------|-------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | CREATED | Successful POST |
| 400 | BAD_REQUEST | Validation errors |
| 401 | UNAUTHORIZED | Missing/invalid JWT |
| 403 | FORBIDDEN | Access denied (wrong user) |
| 404 | NOT_FOUND | Resource doesn't exist |
| 500 | SERVER_ERROR | Unexpected server error |

## Error Codes

```python
class ErrorCode:
    VALIDATION_ERROR = "VALIDATION_ERROR"
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"
    NOT_FOUND = "NOT_FOUND"
    SERVER_ERROR = "SERVER_ERROR"
```

## Error Examples

**401 Unauthorized:**
```json
{
  "error": "Invalid or missing authentication token",
  "code": "UNAUTHORIZED"
}
```

**403 Forbidden:**
```json
{
  "error": "Access denied to this resource",
  "code": "FORBIDDEN"
}
```

**404 Not Found:**
```json
{
  "error": "Task not found",
  "code": "NOT_FOUND"
}
```

**400 Validation Error:**
```json
{
  "error": "Title must be between 1 and 200 characters",
  "code": "VALIDATION_ERROR"
}
```

## Security

- Never expose internal error details
- Log detailed errors server-side
- Generic message for 500 errors

## Acceptance Criteria

- [ ] All errors follow standard format
- [ ] Status codes match error types
- [ ] Error codes are consistent
- [ ] Validation errors are descriptive
- [ ] 500 errors don't leak internals
