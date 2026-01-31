# API Design Skill

Design RESTful API endpoints following these conventions:

## URL Pattern

```
/api/{user_id}/resource[/{id}][/action]
```

## CRUD Operations

| Operation | Method | Endpoint |
|-----------|--------|----------|
| List | GET | `/api/{user_id}/tasks` |
| Create | POST | `/api/{user_id}/tasks` |
| Read | GET | `/api/{user_id}/tasks/{id}` |
| Update | PUT | `/api/{user_id}/tasks/{id}` |
| Delete | DELETE | `/api/{user_id}/tasks/{id}` |
| Custom | PATCH | `/api/{user_id}/tasks/{id}/complete` |

## Response Format

### Success Response
```json
{
  "data": {...},
  "message": "Success"
}
```

### Error Response
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 500 | Server error |
