# API Endpoints

## Requirements

- 6 endpoints for task CRUD operations
- All endpoints require JWT authentication
- All queries filter by authenticated user_id
- Response format matches frontend expectations

## Endpoints

### GET /api/{user_id}/tasks

List all tasks for authenticated user.

**Query Parameters:**
- filter: `all` | `pending` | `completed` (default: all)

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "user_id": "user_123",
      "title": "Buy groceries",
      "description": "Milk, eggs",
      "completed": false,
      "created_at": "2026-01-12T10:00:00Z",
      "updated_at": "2026-01-12T10:00:00Z"
    }
  ],
  "message": "Tasks retrieved"
}
```

### POST /api/{user_id}/tasks

Create a new task.

**Request Body:**
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs"
}
```

**Response 201:**
```json
{
  "data": { "id": 1, ... },
  "message": "Task created"
}
```

### GET /api/{user_id}/tasks/{id}

Get single task by ID.

**Response 200:** Single task object
**Response 404:** Task not found
**Response 403:** Task belongs to different user

### PUT /api/{user_id}/tasks/{id}

Update existing task.

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description"
}
```

**Response 200:** Updated task object

### DELETE /api/{user_id}/tasks/{id}

Delete a task.

**Response 200:**
```json
{
  "data": null,
  "message": "Task deleted"
}
```

### PATCH /api/{user_id}/tasks/{id}/complete

Toggle task completion status.

**Response 200:** Task with toggled completed field

## Security

- All endpoints verify JWT token
- URL user_id must match token user_id
- Queries always filter by authenticated user_id

## Acceptance Criteria

- [ ] GET /tasks returns filtered list
- [ ] POST /tasks creates with 201 status
- [ ] GET /tasks/{id} returns single task
- [ ] PUT /tasks/{id} updates task
- [ ] DELETE /tasks/{id} removes task
- [ ] PATCH /tasks/{id}/complete toggles status
