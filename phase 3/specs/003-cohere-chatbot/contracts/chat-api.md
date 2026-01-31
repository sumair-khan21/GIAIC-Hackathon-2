# Chat API Contract

**Feature**: 003-cohere-chatbot
**Version**: 1.0.0
**Base URL**: `/api/{user_id}`

## Endpoints

### POST /chat

Send a message to the AI chatbot and receive a response.

#### Request

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | string | Yes | Authenticated user's ID (must match JWT) |

**Body**:
```json
{
  "conversation_id": 123,
  "message": "Add buy groceries to my list"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| conversation_id | integer | No | Existing conversation ID. Omit to start new. |
| message | string | Yes | User's message text (1-2000 chars) |

#### Response

**Success (200 OK)**:
```json
{
  "conversation_id": 123,
  "response": "✅ Added 'Buy groceries' to your tasks!",
  "tool_calls": [
    {
      "name": "add_task",
      "parameters": {"title": "Buy groceries"},
      "result": {"status": "created", "task_id": 42, "title": "Buy groceries"}
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| conversation_id | integer | Conversation ID (same or newly created) |
| response | string | AI assistant's text response |
| tool_calls | array | Tool calls executed (null if none) |

**Error Responses**:

**400 Bad Request** - Invalid input:
```json
{
  "detail": "Message cannot be empty"
}
```

**401 Unauthorized** - Missing/invalid token:
```json
{
  "detail": "Invalid or expired token"
}
```

**403 Forbidden** - User ID mismatch:
```json
{
  "detail": "Access denied"
}
```

**429 Too Many Requests** - Rate limited:
```json
{
  "detail": "Rate limit exceeded. Try again in 60 seconds."
}
```

**500 Internal Server Error** - Server/API error:
```json
{
  "detail": "An error occurred. Please try again."
}
```

## Request/Response Schemas

### ChatRequest (Pydantic)

```python
from pydantic import BaseModel, Field
from typing import Optional

class ChatRequest(BaseModel):
    conversation_id: Optional[int] = Field(
        default=None,
        description="Existing conversation ID. Omit to start new."
    )
    message: str = Field(
        min_length=1,
        max_length=2000,
        description="User's message text"
    )
```

### ChatResponse (Pydantic)

```python
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class ToolCallResult(BaseModel):
    name: str
    parameters: Dict[str, Any]
    result: Dict[str, Any]

class ChatResponse(BaseModel):
    conversation_id: int
    response: str
    tool_calls: Optional[List[ToolCallResult]] = None
```

## Authentication

All requests require JWT Bearer token in Authorization header.

The `user_id` path parameter MUST match the user ID in the JWT token. If they don't match, return 403 Forbidden.

```python
@router.post("/api/{user_id}/chat")
async def chat(
    user_id: str,
    request: ChatRequest,
    current_user = Depends(get_current_user)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    # ...
```

## Rate Limiting

- **Limit**: 100 requests per hour per user
- **Header**: `X-RateLimit-Remaining` in response
- **Reset**: `X-RateLimit-Reset` (Unix timestamp)

## Examples

### Start New Conversation

**Request**:
```bash
curl -X POST "https://api.example.com/api/user123/chat" \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"message": "What tasks do I have?"}'
```

**Response**:
```json
{
  "conversation_id": 1,
  "response": "📋 Here are your tasks:\n\n1. Buy groceries\n2. Call dentist\n3. Finish report\n\nWould you like to add, complete, or delete any tasks?",
  "tool_calls": [
    {
      "name": "list_tasks",
      "parameters": {},
      "result": {"status": "success", "count": 3, "tasks": [...]}
    }
  ]
}
```

### Continue Existing Conversation

**Request**:
```bash
curl -X POST "https://api.example.com/api/user123/chat" \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"conversation_id": 1, "message": "Mark the first one done"}'
```

**Response**:
```json
{
  "conversation_id": 1,
  "response": "✅ Done! 'Buy groceries' has been marked as complete. 🎉",
  "tool_calls": [
    {
      "name": "complete_task",
      "parameters": {"task_id": 1},
      "result": {"status": "completed", "task_id": 1, "title": "Buy groceries"}
    }
  ]
}
```

### Error: Empty Message

**Request**:
```bash
curl -X POST "https://api.example.com/api/user123/chat" \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"message": ""}'
```

**Response** (400):
```json
{
  "detail": "Message cannot be empty"
}
```
