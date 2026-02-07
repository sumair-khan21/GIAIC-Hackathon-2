# Research: AI Todo Chatbot (Cohere Integration)

**Feature**: 003-cohere-chatbot
**Date**: 2026-01-31
**Status**: Complete

## Technical Decisions

### 1. AI Provider: Cohere API

**Decision**: Use Cohere API with `command-r-plus` model

**Rationale**:
- Native tool calling support with `parameter_definitions` format
- High-quality reasoning for task management intents
- Competitive pricing for hackathon scope
- Chat history support via `chat_history` parameter

**Alternatives Considered**:
- OpenAI GPT-4: Better known but more expensive, different tool format
- Gemini: Different API structure, less tool calling documentation
- Local LLM: Too complex for hackathon timeline

**Integration Pattern**:
```python
import cohere
co = cohere.Client(api_key=os.getenv("COHERE_API_KEY"))
response = co.chat(
    model="command-r-plus",
    preamble=SYSTEM_PROMPT,
    message=user_message,
    chat_history=history,
    tools=MCP_TOOLS,
    temperature=0.7
)
```

### 2. Tool Execution Architecture

**Decision**: Server-side tool execution with JWT-injected user_id

**Rationale**:
- Security: Never trust user_id from AI parameters
- Simplicity: All tool functions access existing Task model
- Consistency: Same database operations as REST API

**Alternatives Considered**:
- Client-side tool execution: Security risk, exposes API
- Separate tool microservice: Over-engineering for hackathon

**Implementation**:
```python
def execute_tool(tool_name: str, parameters: dict, user_id: str, session: Session):
    # user_id comes from JWT, NOT from parameters
    executors = {
        "add_task": execute_add_task,
        "list_tasks": execute_list_tasks,
        # ...
    }
    return executors[tool_name](user_id=user_id, session=session, **parameters)
```

### 3. Conversation Persistence

**Decision**: Stateless server with database-persisted conversations

**Rationale**:
- Server restarts don't lose conversations
- Horizontal scaling: any server instance can handle any request
- Existing pattern: matches REST API statelessness

**Alternatives Considered**:
- In-memory sessions: Lost on restart, doesn't scale
- Redis cache: Additional infrastructure complexity
- Client-side history: Security risk, larger requests

**Schema Design**:
- `conversations` table: id, user_id, timestamps
- `messages` table: id, conversation_id, user_id, role, content, tool_calls
- Load last 20 messages for context window

### 4. Frontend Implementation

**Decision**: Custom React chat component (not ChatKit)

**Rationale**:
- ChatKit requires OpenAI-specific integration
- Custom component gives full control over styling
- Matches existing Tailwind/gradient theme
- Simpler authentication integration

**Alternatives Considered**:
- OpenAI ChatKit: Requires OpenAI API key, different auth model
- Third-party chat libraries: Dependency bloat

**Component Structure**:
- `/app/chat/page.tsx`: Main chat page (Client Component)
- `/components/ChatButton.tsx`: Floating action button
- Uses existing auth hooks and API client patterns

### 5. Rate Limiting Strategy

**Decision**: 100 requests/hour per user using slowapi

**Rationale**:
- Prevents abuse of Cohere API (cost control)
- Cohere free tier: 1000 calls/month total
- Allows reasonable usage for demo purposes

**Alternatives Considered**:
- No rate limiting: Risk of runaway costs
- Stricter limits: Poor user experience

**Implementation**:
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/api/{user_id}/chat")
@limiter.limit("100/hour")
async def chat(...):
    ...
```

### 6. Error Handling Strategy

**Decision**: Graceful degradation with user-friendly messages

**Rationale**:
- Never expose API errors or stack traces to users
- Provide actionable feedback when possible
- Log errors server-side for debugging

**Error Responses**:
| Condition | User Message |
|-----------|--------------|
| Cohere API down | "I'm having trouble thinking right now. Please try again." |
| Invalid task_id | "I couldn't find that task. Can you check the task number?" |
| Rate limited | "You're chatting too fast! Please wait a moment." |
| Auth failure | "Please sign in again to continue chatting." |

## Dependency Verification

### Backend Dependencies

| Package | Version | Purpose | Verified |
|---------|---------|---------|----------|
| cohere | >=5.0.0 | Cohere API SDK | Yes - PyPI |
| slowapi | >=0.1.9 | Rate limiting | Yes - PyPI |
| SQLModel | existing | ORM models | Existing |
| FastAPI | existing | Web framework | Existing |

### Frontend Dependencies

| Package | Version | Purpose | Verified |
|---------|---------|---------|----------|
| lucide-react | existing | Icons (MessageCircle) | Check package.json |
| next | existing | React framework | Existing |

## Integration Points

### Existing Code to Modify

1. `backend/models.py`: Add Conversation, Message classes
2. `backend/routes/__init__.py`: Register chat router
3. `frontend/app/layout.tsx`: May need navigation update

### New Files to Create

**Backend**:
- `backend/routes/chat.py`: Chat endpoint
- `backend/services/cohere_client.py`: Cohere integration
- `backend/services/mcp_tools.py`: Tool definitions and executors
- `backend/services/conversation.py`: Conversation helpers

**Frontend**:
- `frontend/app/chat/page.tsx`: Chat page
- `frontend/components/ChatButton.tsx`: FAB component

### Database Migration

```sql
-- Run in Neon PostgreSQL console
CREATE TABLE conversations (...);
CREATE TABLE messages (...);
CREATE INDEX ...;
```

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Cohere API changes | Low | High | Pin SDK version, monitor changelog |
| Rate limit exceeded | Medium | Low | User messaging, upgrade plan if needed |
| Tool execution errors | Medium | Medium | Comprehensive error handling |
| Auth token issues | Low | High | Use existing patterns, test thoroughly |

## Resolved Clarifications

All technical unknowns have been resolved through research:

1. **Cohere tool format**: Confirmed `parameter_definitions` with type/required/description
2. **Chat history format**: Confirmed `{"role": "USER"/"CHATBOT", "message": "..."}` array
3. **Tool results format**: Confirmed `{"call": tool_call, "outputs": [{"result": "..."}]}`
4. **Existing Task model**: Confirmed has user_id field for filtering
5. **JWT structure**: Use existing get_current_user dependency
