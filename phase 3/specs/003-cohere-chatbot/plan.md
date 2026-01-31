# Implementation Plan: AI Todo Chatbot

**Branch**: `003-cohere-chatbot` | **Date**: 2026-01-31 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-cohere-chatbot/spec.md`

## Summary

Add conversational AI interface to existing Todo application using Cohere API (`command-r-plus` model). Users can manage tasks through natural language (e.g., "Add buy milk", "Show my tasks"). Implementation adds chat endpoint to existing FastAPI backend and chat page to Next.js frontend. Stateless architecture with database-persisted conversations.

## Technical Context

**Language/Version**: Python 3.12 (backend), TypeScript/Next.js 16+ (frontend)
**Primary Dependencies**: FastAPI, SQLModel, Cohere SDK (>=5.0.0), slowapi
**Storage**: Neon PostgreSQL (existing + new conversations/messages tables)
**Testing**: Manual E2E testing (hackathon scope)
**Target Platform**: Hugging Face Spaces (backend), Vercel (frontend)
**Project Type**: Web application (monorepo)
**Performance Goals**: <3s response time for 95% of chat requests
**Constraints**: 100 req/hour rate limit, Cohere free tier (1000 calls/month)
**Scale/Scope**: Single user demo, ~50 chat messages per session

## Constitution Check

*GATE: All principles verified - no violations*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Spec-First Development | ✅ PASS | This plan follows spec.md |
| II. Monorepo Architecture | ✅ PASS | Adding to existing frontend/backend structure |
| III. Stateless JWT Auth | ✅ PASS | Chat endpoint uses same JWT verification |
| IV. User Data Isolation | ✅ PASS | All queries filter by user_id from token |
| V. RESTful API Design | ✅ PASS | POST /api/{user_id}/chat follows pattern |
| VI. Graceful Error Handling | ✅ PASS | User-friendly messages, proper status codes |

## Project Structure

### Documentation (this feature)

```text
specs/003-cohere-chatbot/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Technical decisions
├── data-model.md        # Database schema
├── quickstart.md        # Setup guide
├── contracts/
│   └── chat-api.md      # API contract
├── components/          # Component specs
│   ├── cohere-integration.md
│   ├── mcp-tools.md
│   ├── chat-endpoint.md
│   ├── database-models.md
│   ├── frontend-chat-ui.md
│   └── environment-setup.md
└── checklists/
    └── requirements.md  # Validation checklist
```

### Source Code (repository root)

```text
backend/
├── models.py            # Add Conversation, Message models
├── database.py          # Existing (unchanged)
├── routes/
│   ├── __init__.py      # Register chat router
│   ├── tasks.py         # Existing (unchanged)
│   └── chat.py          # NEW: Chat endpoint
└── services/
    ├── cohere_client.py # NEW: Cohere API wrapper
    ├── mcp_tools.py     # NEW: Tool definitions
    └── conversation.py  # NEW: DB helpers

frontend/
├── app/
│   ├── chat/
│   │   └── page.tsx     # NEW: Chat page
│   └── dashboard/
│       └── page.tsx     # Modify: Add chat button
└── components/
    └── ChatButton.tsx   # NEW: FAB component
```

**Structure Decision**: Web application (Option 2) - extends existing frontend/backend structure

## Complexity Tracking

> No constitution violations - table not required

---

## Implementation Phases

### Phase 1: Backend - Database Setup

**Goal**: Create conversation persistence layer

**Tasks**:

| ID | Task | File | Acceptance |
|----|------|------|------------|
| 1.1 | Add Conversation model | backend/models.py | Model defined with id, user_id, timestamps |
| 1.2 | Add Message model | backend/models.py | Model defined with FK to conversation |
| 1.3 | Create migration SQL | specs/003-cohere-chatbot/migration.sql | SQL creates tables and indexes |
| 1.4 | Run migration in Neon | N/A (manual) | Tables visible in Neon console |
| 1.5 | Create conversation helpers | backend/services/conversation.py | CRUD functions work |

**Deliverables**:
- `Conversation` and `Message` SQLModel classes
- Migration script executed
- Helper functions: `create_conversation`, `get_conversation`, `store_message`, `get_history`

**Acceptance Criteria**:
- [ ] `SELECT * FROM conversations` works
- [ ] `SELECT * FROM messages` works
- [ ] Indexes created on user_id, conversation_id

---

### Phase 2: Backend - Cohere Integration

**Goal**: Establish Cohere API connection

**Dependencies**: Phase 1 complete

**Tasks**:

| ID | Task | File | Acceptance |
|----|------|------|------------|
| 2.1 | Add cohere to requirements | backend/requirements.txt | `cohere>=5.0.0` added |
| 2.2 | Add slowapi to requirements | backend/requirements.txt | `slowapi>=0.1.9` added |
| 2.3 | Create Cohere client wrapper | backend/services/cohere_client.py | Client initializes with env key |
| 2.4 | Define SYSTEM_PROMPT | backend/services/cohere_client.py | Prompt defines assistant behavior |
| 2.5 | Test basic chat call | N/A (manual) | Response returns without tools |

**Deliverables**:
- `cohere_client.py` with `get_cohere_client()` and `SYSTEM_PROMPT`
- Dependencies installed

**Acceptance Criteria**:
- [ ] `import cohere` works
- [ ] Basic chat request returns text response
- [ ] COHERE_API_KEY read from environment

---

### Phase 3: Backend - MCP Tools Implementation

**Goal**: Enable AI to perform task operations

**Dependencies**: Phase 2 complete

**Tasks**:

| ID | Task | File | Acceptance |
|----|------|------|------------|
| 3.1 | Define MCP_TOOLS list | backend/services/mcp_tools.py | 5 tools in Cohere format |
| 3.2 | Implement execute_add_task | backend/services/mcp_tools.py | Creates task, returns result |
| 3.3 | Implement execute_list_tasks | backend/services/mcp_tools.py | Lists user's tasks |
| 3.4 | Implement execute_complete_task | backend/services/mcp_tools.py | Marks task complete |
| 3.5 | Implement execute_delete_task | backend/services/mcp_tools.py | Deletes task |
| 3.6 | Implement execute_update_task | backend/services/mcp_tools.py | Updates task fields |
| 3.7 | Create execute_tool router | backend/services/mcp_tools.py | Routes to correct executor |
| 3.8 | Test each tool | N/A (manual) | Tools work with mock user_id |

**Deliverables**:
- `mcp_tools.py` with `MCP_TOOLS` list and 5 executor functions
- `execute_tool(tool_name, parameters, user_id, session)` router

**Acceptance Criteria**:
- [ ] Each tool creates/reads/updates/deletes correctly
- [ ] User isolation enforced (user_id from parameter, not AI)
- [ ] Error handling for invalid task_id

---

### Phase 4: Backend - Chat Endpoint

**Goal**: Create the chat API endpoint

**Dependencies**: Phase 3 complete

**Tasks**:

| ID | Task | File | Acceptance |
|----|------|------|------------|
| 4.1 | Create chat router | backend/routes/chat.py | Router defined |
| 4.2 | Define ChatRequest schema | backend/routes/chat.py | Pydantic model |
| 4.3 | Define ChatResponse schema | backend/routes/chat.py | Pydantic model |
| 4.4 | Implement POST /api/{user_id}/chat | backend/routes/chat.py | Full endpoint logic |
| 4.5 | Add JWT verification | backend/routes/chat.py | get_current_user dependency |
| 4.6 | Add rate limiting | backend/routes/chat.py | slowapi @limiter decorator |
| 4.7 | Register router in main.py | backend/main.py | app.include_router |
| 4.8 | Test with Swagger | N/A (manual) | Endpoint shows in /docs |

**Endpoint Logic** (4.4):
1. Verify user_id matches JWT
2. Get/create conversation
3. Load history (last 20 messages)
4. Store user message
5. Call Cohere with message + history + tools
6. Execute tool calls if any
7. Store assistant response
8. Return ChatResponse

**Deliverables**:
- `backend/routes/chat.py` with complete endpoint
- Router registered in `main.py`

**Acceptance Criteria**:
- [ ] POST /api/{user_id}/chat returns 200 with response
- [ ] Conversation created/retrieved correctly
- [ ] Messages stored in database
- [ ] Tool calls execute and results returned
- [ ] Rate limiting works (429 on excess)

---

### Phase 5: Frontend - Chat UI

**Goal**: Build user-facing chat interface

**Dependencies**: Phase 4 complete

**Tasks**:

| ID | Task | File | Acceptance |
|----|------|------|------------|
| 5.1 | Create chat page | frontend/app/chat/page.tsx | Page renders |
| 5.2 | Add message state | frontend/app/chat/page.tsx | useState for messages |
| 5.3 | Build message display | frontend/app/chat/page.tsx | Bubbles render correctly |
| 5.4 | Build input component | frontend/app/chat/page.tsx | Input + send button |
| 5.5 | Implement handleSend | frontend/app/chat/page.tsx | Calls backend API |
| 5.6 | Add auth redirect | frontend/app/chat/page.tsx | Redirects if not logged in |
| 5.7 | Add loading indicator | frontend/app/chat/page.tsx | Shows while waiting |
| 5.8 | Style with Tailwind | frontend/app/chat/page.tsx | Gradient theme |
| 5.9 | Create ChatButton | frontend/components/ChatButton.tsx | FAB component |
| 5.10 | Add ChatButton to dashboard | frontend/app/dashboard/page.tsx | Button visible |

**Deliverables**:
- `frontend/app/chat/page.tsx` - Full chat page
- `frontend/components/ChatButton.tsx` - Floating button
- Dashboard updated with chat button

**Acceptance Criteria**:
- [ ] Chat page loads for authenticated users
- [ ] Messages send and receive
- [ ] UI is responsive (mobile + desktop)
- [ ] Chat button visible on dashboard
- [ ] Conversation persists across page reloads

---

### Phase 6: Testing & Integration

**Goal**: Verify complete functionality

**Dependencies**: Phase 5 complete

**Tasks**:

| ID | Task | Test Type | Pass Criteria |
|----|------|-----------|---------------|
| 6.1 | Create task via chat | E2E | "Add X" creates task X |
| 6.2 | List tasks via chat | E2E | "Show tasks" returns list |
| 6.3 | Complete task via chat | E2E | "Mark X done" completes task |
| 6.4 | Delete task via chat | E2E | "Delete X" removes task |
| 6.5 | Update task via chat | E2E | "Change X to Y" updates task |
| 6.6 | Test conversation context | E2E | "Mark it done" resolves "it" |
| 6.7 | Test user isolation | Security | User B can't see User A's tasks |
| 6.8 | Test error handling | Error | Invalid inputs return friendly messages |
| 6.9 | Test existing REST API | Regression | All Phase 2 endpoints still work |
| 6.10 | Deploy to production | Deploy | Both HF and Vercel updated |

**Deliverables**:
- All tests passing
- Production deployment verified

**Acceptance Criteria**:
- [ ] All 5 chat operations work
- [ ] User isolation verified
- [ ] No regression in REST API
- [ ] Production URLs accessible

---

## Deployment Checklist

### Backend (Hugging Face Spaces)

- [ ] Add `COHERE_API_KEY` to repository secrets
- [ ] Add `cohere>=5.0.0` to requirements.txt
- [ ] Add `slowapi>=0.1.9` to requirements.txt
- [ ] Push code → auto-deploy
- [ ] Verify /docs shows chat endpoint

### Database (Neon PostgreSQL)

- [ ] Run migration SQL in Neon console
- [ ] Verify `conversations` table exists
- [ ] Verify `messages` table exists
- [ ] Verify indexes created

### Frontend (Vercel)

- [ ] Push code → auto-deploy
- [ ] Verify /chat page loads
- [ ] Verify chat button on dashboard

---

## Testing Commands

```bash
# Test backend chat endpoint
TOKEN="your_jwt_token"
USER_ID="your_user_id"

# Basic chat
curl -X POST "https://your-space.hf.space/api/${USER_ID}/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, what can you do?"}'

# Add task
curl -X POST "https://your-space.hf.space/api/${USER_ID}/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add buy milk to my list"}'

# List tasks
curl -X POST "https://your-space.hf.space/api/${USER_ID}/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"conversation_id": 1, "message": "Show my tasks"}'
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Cohere API down | Return "AI unavailable" message, log error |
| Rate limit hit | User-friendly 429 message with retry time |
| Tool execution fails | Return error message, don't crash endpoint |
| Invalid conversation_id | Create new conversation, ignore bad ID |

---

## Related Artifacts

| Artifact | Path | Description |
|----------|------|-------------|
| Specification | [spec.md](spec.md) | Feature requirements |
| Research | [research.md](research.md) | Technical decisions |
| Data Model | [data-model.md](data-model.md) | Database schema |
| API Contract | [contracts/chat-api.md](contracts/chat-api.md) | Endpoint specification |
| Quickstart | [quickstart.md](quickstart.md) | Setup guide |
| Cohere Integration | [components/cohere-integration.md](components/cohere-integration.md) | AI setup details |
| MCP Tools | [components/mcp-tools.md](components/mcp-tools.md) | Tool specifications |
| Chat Endpoint | [components/chat-endpoint.md](components/chat-endpoint.md) | Endpoint details |
| Database Models | [components/database-models.md](components/database-models.md) | SQLModel schemas |
| Frontend UI | [components/frontend-chat-ui.md](components/frontend-chat-ui.md) | React components |
| Environment | [components/environment-setup.md](components/environment-setup.md) | Configuration |

---

**Next Step**: Run `/sp.tasks` to generate actionable task list from this plan.
