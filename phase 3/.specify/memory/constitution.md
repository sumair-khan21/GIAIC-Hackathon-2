<!--
Sync Impact Report
==================
Version change: 1.0.0 → 2.0.0 (MAJOR - AI Chatbot integration, new architecture layer)
Modified principles:
  - None renamed; all existing principles retained
Added sections:
  - Section 7: Cohere API Configuration
  - Section 8: MCP Tools Specification
  - Section 9: Conversation Schema Extension
  - Section 10: Stateless Chat Architecture
  - Section 11: Chat API Endpoint
  - Section 12: Agent Architecture
Removed sections: None
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (compatible - no changes needed)
  - .specify/templates/spec-template.md ✅ (compatible - no changes needed)
  - .specify/templates/tasks-template.md ✅ (compatible - no changes needed)
Follow-up TODOs: None
-->

# Todo Full-Stack Application Constitution

## 1. Project Identity & Evolution

**Name**: Todo Full-Stack
**Phase**: Phase 3 - AI Chatbot Integration
**Purpose**: Multi-user task management with natural language AI interface

**Evolution**:
- Phase 2: REST API + Web UI (Next.js + FastAPI + Neon PostgreSQL)
- Phase 3: Add conversational AI interface powered by Cohere API

**Target Users**: Individual users who manage tasks via web UI or natural language chat

**Success Criteria**:
- Seamless integration with existing Phase 2 REST API (no breaking changes)
- Natural language task management via chat interface
- All existing endpoints continue functioning unchanged
- AI powered by Cohere, UI by OpenAI ChatKit

## 2. Architecture Integration

### Existing (Unchanged)
```
Next.js → REST API (/api/{user_id}/tasks) → Neon PostgreSQL
```

### New Addition
```
ChatKit UI → Chat API (/api/{user_id}/chat) → Cohere API → MCP Tools → Database
```

**Key Decisions**:
- Single FastAPI backend serves both REST and chat endpoints
- Same JWT authentication for all endpoints
- Same user_id isolation pattern
- Cohere `command-r-plus` for AI reasoning
- Stateless: All conversation history persisted in database

## 3. Core Principles

### I. Spec-First Development
All code MUST be generated from specifications. No manual coding is permitted.

**Rationale**: Spec-driven development ensures consistency and AI-assisted generation.

### II. Monorepo Architecture
Frontend and backend MUST reside in a single repository with clear separation.

```
/
├── frontend/          # Next.js 16+ App Router
├── backend/           # FastAPI + SQLModel
├── specs/             # Feature specifications
└── .specify/          # Spec-Kit Plus configuration
```

### III. Stateless JWT Authentication
All API requests MUST include JWT token validation. No session state on server.

- Better Auth handles frontend authentication
- JWT tokens contain user_id and email
- Backend validates token on every request (including chat)
- Token expiry: 7 days

### IV. User Data Isolation
Every database query MUST filter by authenticated user_id.

- Extract user_id from JWT token (never from request body/parameters)
- Filter ALL queries (tasks AND conversations) by authenticated user_id
- Return 403 for cross-user access attempts

### V. RESTful API Design
All endpoints MUST follow REST conventions with consistent patterns.

- Pattern: `/api/{user_id}/resource[/{id}][/action]`
- Chat endpoint: `/api/{user_id}/chat`
- Consistent response format across REST and chat

### VI. Graceful Error Handling
All errors MUST be caught, logged, and returned with appropriate status codes.

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Invalid input |
| 401 | Missing/invalid token |
| 403 | Access denied |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Server error |

## 4. Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | Next.js 16+ (App Router) | Server Components, React 19 |
| Chat UI | OpenAI ChatKit | Pre-built chat components |
| Backend | FastAPI + SQLModel | Async Python, Pydantic validation |
| AI | Cohere API (command-r-plus) | Best reasoning model, native tool use |
| Database | Neon PostgreSQL | Serverless, auto-scaling |
| Auth | Better Auth + JWT | Stateless verification |

## 5. Security Requirements

**MUST Have**:
- JWT verification on every request (REST and chat)
- user_id extracted from token (never from request body)
- Task ownership validation before operations
- COHERE_API_KEY in environment variables only
- Rate limit: 100 chat requests/hour per user
- Never expose API keys or system internals in responses

**Environment Variables**:
```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=<random-32-chars>
COHERE_API_KEY=<cohere-api-key>
```

## 6. Existing API Conventions

### Task Endpoints (Unchanged)
```
GET    /api/{user_id}/tasks           # List all tasks
POST   /api/{user_id}/tasks           # Create task
GET    /api/{user_id}/tasks/{id}      # Get single task
PUT    /api/{user_id}/tasks/{id}      # Update task
DELETE /api/{user_id}/tasks/{id}      # Delete task
PATCH  /api/{user_id}/tasks/{id}/complete  # Mark complete
```

## 7. Cohere API Configuration

```python
import cohere

co = cohere.Client(api_key=COHERE_API_KEY)

response = co.chat(
    model="command-r-plus",
    message=user_message,
    chat_history=conversation_history,
    tools=mcp_tools,
    temperature=0.7
)
```

**Critical Requirements**:
- Use Cohere SDK (not OpenAI SDK)
- Tools in Cohere parameter_definitions format
- chat_history array for conversation context
- Use `command-r-plus` model for best reasoning

## 8. MCP Tools Specification

Five required tools in Cohere tool format:

```python
tools = [
    {
        "name": "add_task",
        "description": "Create a new task for the user",
        "parameter_definitions": {
            "title": {"type": "str", "required": True, "description": "Task title"},
            "description": {"type": "str", "required": False, "description": "Task details"}
        }
    },
    {
        "name": "list_tasks",
        "description": "List all tasks, optionally filtered by completion status",
        "parameter_definitions": {
            "completed": {"type": "bool", "required": False, "description": "Filter by status"}
        }
    },
    {
        "name": "complete_task",
        "description": "Mark a task as completed",
        "parameter_definitions": {
            "task_id": {"type": "int", "required": True, "description": "Task ID to complete"}
        }
    },
    {
        "name": "delete_task",
        "description": "Delete a task permanently",
        "parameter_definitions": {
            "task_id": {"type": "int", "required": True, "description": "Task ID to delete"}
        }
    },
    {
        "name": "update_task",
        "description": "Update task title or description",
        "parameter_definitions": {
            "task_id": {"type": "int", "required": True, "description": "Task ID to update"},
            "title": {"type": "str", "required": False, "description": "New title"},
            "description": {"type": "str", "required": False, "description": "New description"}
        }
    }
]
```

**Security**: user_id is ALWAYS injected from JWT token, never passed as tool parameter.

## 9. Database Schema Extension

Add to existing schema (existing `tasks` and `users` tables unchanged):

```sql
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id),
    user_id VARCHAR NOT NULL,
    role VARCHAR(20) CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    tool_calls JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
```

## 10. Stateless Chat Architecture

**Request Cycle (No Server Memory)**:
1. Receive: `{conversation_id?, message}`
2. Load: History from database (last 20 messages)
3. Format: Cohere chat_history array
4. Store: User message in DB
5. Call: Cohere API with message + history + tools
6. Execute: Tool calls if any (filtered by user_id)
7. Store: Assistant response in DB
8. Return: `{conversation_id, response, tool_calls?}`
9. Forget: All in-memory state discarded

**Benefits**: Server restarts cause no data loss, horizontally scalable.

## 11. Chat API Endpoint

**POST /api/{user_id}/chat**

Request:
```json
{
  "conversation_id": 123,
  "message": "Add buy groceries to my list"
}
```

Response:
```json
{
  "conversation_id": 123,
  "response": "✅ Added 'Buy groceries' to your tasks!",
  "tool_calls": [{"name": "add_task", "parameters": {"title": "Buy groceries"}}]
}
```

**Auth**: JWT required, user_id from token MUST match URL parameter.

## 12. Agent Architecture

```
Master Orchestrator (Cohere-powered)
├── Task Manager (MCP tool executor)
├── User Info (Database queries)
└── Conversation Manager (DB state)
```

**System Prompt**:
```
You are a helpful todo assistant. Help users manage tasks through natural language.

TOOLS: add_task, list_tasks, complete_task, delete_task, update_task

BEHAVIOR:
- Friendly and concise, use emojis (✅⏳🎉✏️🗑️)
- Confirm actions clearly
- Ask for clarification if unclear
- Format task lists with numbers
- Use conversation context for references like "that one"

CONSTRAINTS:
- Only access authenticated user's tasks
- Never fabricate task information
- Handle errors gracefully with helpful messages
```

## 13. Deployment Integration

**Backend (Hugging Face Spaces)**:
- Add: `/api/{user_id}/chat` endpoint
- Add: Cohere SDK integration
- Add: MCP tools functions
- Add: Conversation/Message SQLModel models
- Keep: All existing REST endpoints unchanged
- Env: Add `COHERE_API_KEY` to secrets

**Frontend (Vercel)**:
- Add: `/chat` route with ChatKit component
- Add: Navigation link to chat
- Keep: All existing pages unchanged
- Env: Add `NEXT_PUBLIC_OPENAI_DOMAIN_KEY` (ChatKit only)

**Database (Neon)**:
- Run migration: Create `conversations` and `messages` tables
- Existing `tasks` and `users` tables unchanged

**Zero Downtime**: New features added alongside existing; no breaking changes.

## 14. Quality Gates

All implementations MUST pass:

- [ ] JWT verification on every endpoint (REST and chat)
- [ ] Every database query filters by user_id from token
- [ ] Chat rate limiting enforced (100 req/hour/user)
- [ ] Tool calls validated for user ownership before execution
- [ ] Cohere API key never exposed in responses
- [ ] Conversation history properly persisted
- [ ] Error responses include helpful messages

## 15. Governance

This constitution is the authoritative source for all architectural decisions.

**Amendment Process**:
1. Propose change with rationale
2. Document in ADR if architecturally significant
3. Update constitution version
4. Propagate changes to dependent specs

**Compliance**: All PRs must verify alignment with constitution principles.

**Version**: 2.0.0 | **Ratified**: 2026-01-11 | **Last Amended**: 2026-01-27
