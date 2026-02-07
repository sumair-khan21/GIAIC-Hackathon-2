# Tasks: AI Todo Chatbot (Cohere Integration)

**Input**: Design documents from `/specs/003-cohere-chatbot/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/chat-api.md

**Tests**: Manual E2E testing (hackathon scope) - no automated test tasks included

**Organization**: Tasks follow the 6-phase implementation plan from plan.md, mapped to 5 user scenarios from spec.md

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user scenario this task belongs to (US1-US5)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/` (FastAPI + SQLModel)
- **Frontend**: `frontend/` (Next.js App Router)

---

## Phase 1: Setup (Backend Dependencies & Database)

**Purpose**: Install dependencies and create database persistence layer

- [x] T001 Add `cohere>=5.0.0` to backend/requirements.txt
- [x] T002 Add `slowapi>=0.1.9` to backend/requirements.txt
- [x] T003 [P] Create backend/services/ directory if not exists
- [x] T004 [P] Add Conversation model to backend/models.py with id, user_id, created_at, updated_at fields
- [x] T005 [P] Add Message model to backend/models.py with id, conversation_id, user_id, role, content, tool_calls, created_at fields
- [x] T006 Create migration SQL file at specs/003-cohere-chatbot/migration.sql
- [ ] T007 Run migration in Neon PostgreSQL console (manual step - verify tables created)

**Checkpoint**: Database tables `conversations` and `messages` exist with indexes

---

## Phase 2: Foundational (Cohere Integration & Conversation Helpers)

**Purpose**: Core infrastructure that MUST be complete before user story implementation

**⚠️ CRITICAL**: No chat functionality can work until this phase is complete

- [x] T008 Create backend/services/cohere_client.py with get_cohere_client() function
- [x] T009 Define SYSTEM_PROMPT constant in backend/services/cohere_client.py
- [x] T010 [P] Create backend/services/conversation.py with conversation helper functions
- [x] T011 Implement create_conversation(session, user_id) in backend/services/conversation.py
- [x] T012 Implement get_or_create_conversation(session, conversation_id, user_id) in backend/services/conversation.py
- [x] T013 Implement store_message(session, conversation_id, user_id, role, content, tool_calls) in backend/services/conversation.py
- [x] T014 Implement get_conversation_history(session, conversation_id, limit=20) in backend/services/conversation.py
- [x] T015 Implement format_history_for_cohere(messages) in backend/services/conversation.py
- [ ] T016 Add COHERE_API_KEY to Hugging Face Spaces secrets (manual step)
- [ ] T017 Test basic Cohere chat call without tools (manual verification)

**Checkpoint**: Foundation ready - Cohere client works, conversation CRUD functions work

---

## Phase 3: User Story 1 - Create Task via Chat (Priority: P1) 🎯 MVP

**Goal**: User types natural language like "Add buy milk" and task is created

**Independent Test**: Send `{"message": "Add buy groceries"}` → task appears in database

### MCP Tools Infrastructure

- [x] T018 Create backend/services/mcp_tools.py with MCP_TOOLS list (Cohere tool format)
- [x] T019 [US1] Define add_task tool in MCP_TOOLS with title, description parameters
- [x] T020 [US1] Implement execute_add_task(user_id, session, title, description) in backend/services/mcp_tools.py
- [x] T021 Create execute_tool(tool_name, parameters, user_id, session) router in backend/services/mcp_tools.py

### Chat Endpoint (Core)

- [x] T022 Create backend/routes/chat.py with APIRouter
- [x] T023 [P] Define ChatRequest Pydantic model in backend/routes/chat.py
- [x] T024 [P] Define ChatResponse Pydantic model in backend/routes/chat.py
- [x] T025 Implement POST /api/{user_id}/chat endpoint skeleton in backend/routes/chat.py
- [x] T026 Add JWT verification using get_current_user dependency in backend/routes/chat.py
- [x] T027 Add user_id match validation (token.id == path.user_id) in backend/routes/chat.py
- [x] T028 Implement conversation get/create logic in chat endpoint
- [x] T029 Implement history loading and formatting in chat endpoint
- [x] T030 Implement user message storage in chat endpoint
- [x] T031 Implement Cohere API call with message, history, tools in chat endpoint
- [x] T032 Implement tool call execution loop in chat endpoint
- [x] T033 Implement assistant message storage in chat endpoint
- [x] T034 Add rate limiting with slowapi @limiter.limit("100/hour") decorator
- [x] T035 Register chat router in backend/main.py using app.include_router

**Checkpoint**: User Story 1 functional - "Add X" creates task X via chat

---

## Phase 4: User Story 2 - List Tasks via Chat (Priority: P2)

**Goal**: User asks "What tasks do I have?" and sees numbered list

**Independent Test**: Create tasks, then send `{"message": "Show my tasks"}` → list returned

- [x] T036 [US2] Define list_tasks tool in MCP_TOOLS with status parameter in backend/services/mcp_tools.py
- [x] T037 [US2] Implement execute_list_tasks(user_id, session, status) in backend/services/mcp_tools.py

**Checkpoint**: User Stories 1 AND 2 work - can add and list tasks via chat

---

## Phase 5: User Story 3 - Complete Task via Chat (Priority: P3)

**Goal**: User says "Mark task 1 as done" and task is completed

**Independent Test**: Send `{"message": "Mark task 1 done"}` → task.completed = True

- [x] T038 [US3] Define complete_task tool in MCP_TOOLS with task_id parameter in backend/services/mcp_tools.py
- [x] T039 [US3] Implement execute_complete_task(user_id, session, task_id) in backend/services/mcp_tools.py

**Checkpoint**: User Stories 1, 2, AND 3 work - can add, list, and complete tasks

---

## Phase 6: User Story 4 - Delete Task via Chat (Priority: P4)

**Goal**: User says "Delete task 2" and task is removed

**Independent Test**: Send `{"message": "Delete task 2"}` → task removed from database

- [x] T040 [US4] Define delete_task tool in MCP_TOOLS with task_id parameter in backend/services/mcp_tools.py
- [x] T041 [US4] Implement execute_delete_task(user_id, session, task_id) in backend/services/mcp_tools.py

**Checkpoint**: User Stories 1-4 work - can add, list, complete, and delete tasks

---

## Phase 7: User Story 5 - Update Task via Chat (Priority: P5)

**Goal**: User says "Change task 1 to 'Buy organic milk'" and task is updated

**Independent Test**: Send `{"message": "Change task 1 to Call mom"}` → task.title updated

- [x] T042 [US5] Define update_task tool in MCP_TOOLS with task_id, title, description parameters in backend/services/mcp_tools.py
- [x] T043 [US5] Implement execute_update_task(user_id, session, task_id, title, description) in backend/services/mcp_tools.py

**Checkpoint**: All 5 MCP tools work - full task CRUD via chat

---

## Phase 8: Frontend - Chat UI

**Purpose**: Build user-facing chat interface

**Dependencies**: Backend chat endpoint complete (Phase 3-7)

- [x] T044 Create frontend/app/chat/page.tsx as Client Component
- [x] T045 [P] Add useState hooks for messages, input, loading, conversationId in frontend/app/chat/page.tsx
- [x] T046 Implement auth check and redirect to /signin if not authenticated
- [x] T047 Build message display area with map over messages array
- [x] T048 Style user messages (right-aligned, violet gradient) in frontend/app/chat/page.tsx
- [x] T049 Style assistant messages (left-aligned, white background) in frontend/app/chat/page.tsx
- [x] T050 Build input field with onChange handler in frontend/app/chat/page.tsx
- [x] T051 Build send button with onClick handler in frontend/app/chat/page.tsx
- [x] T052 Implement handleSend function with fetch to /api/{user_id}/chat
- [x] T053 Add Enter key handler (onKeyPress) to send message
- [x] T054 Add loading indicator (typing animation) while waiting for response
- [x] T055 Add empty state message ("Start chatting to manage your tasks")
- [x] T056 Add auto-scroll to bottom on new messages using useRef
- [x] T057 [P] Create frontend/components/ChatButton.tsx as floating action button
- [x] T058 Style ChatButton with gradient, shadow, hover effects
- [x] T059 Add ChatButton to frontend/app/dashboard/page.tsx

**Checkpoint**: Frontend chat UI complete - users can interact with chatbot

---

## Phase 9: Polish & Integration Testing

**Purpose**: Verify complete functionality and deploy

- [ ] T060 E2E Test: Create task via chat ("Add buy milk" → verify task created)
- [ ] T061 E2E Test: List tasks via chat ("Show my tasks" → verify list returned)
- [ ] T062 E2E Test: Complete task via chat ("Mark task 1 done" → verify completion)
- [ ] T063 E2E Test: Delete task via chat ("Delete task 2" → verify removal)
- [ ] T064 E2E Test: Update task via chat ("Change task 1 to X" → verify update)
- [ ] T065 E2E Test: Conversation context ("Add buy milk" then "Mark it done" → verify context resolution)
- [ ] T066 Security Test: User isolation (User B cannot see User A's tasks via chat)
- [ ] T067 Security Test: JWT validation (request without token returns 401)
- [ ] T068 Security Test: User ID mismatch (wrong user_id in URL returns 403)
- [ ] T069 Error Test: Invalid task_id returns friendly error message
- [ ] T070 Error Test: Rate limit exceeded returns 429 with retry message
- [ ] T071 Regression Test: Verify existing REST API endpoints still work
- [ ] T072 Deploy backend to Hugging Face Spaces (push code)
- [ ] T073 Deploy frontend to Vercel (push code)
- [ ] T074 Verify production chat endpoint responds correctly
- [ ] T075 Verify production chat UI loads and functions

**Checkpoint**: All tests pass, production deployment verified

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ─────────────────────────────────┐
                                                  │
Phase 2 (Foundational) ◄─────────────────────────┘
         │
         │ BLOCKS all user stories
         ▼
┌────────┴────────┬────────────────┬─────────────┬─────────────┐
│                 │                │             │             │
▼                 ▼                ▼             ▼             ▼
Phase 3          Phase 4         Phase 5       Phase 6       Phase 7
(US1: Add)       (US2: List)     (US3: Done)   (US4: Delete) (US5: Update)
│                 │                │             │             │
└────────┬────────┴────────────────┴─────────────┴─────────────┘
         │
         │ All MCP tools complete
         ▼
Phase 8 (Frontend)
         │
         ▼
Phase 9 (Polish & Deploy)
```

### User Story Dependencies

- **US1 (Add Task)**: Can start after Phase 2 - Creates chat endpoint infrastructure
- **US2 (List Tasks)**: Depends on US1 (chat endpoint exists) - Adds list_tasks tool
- **US3 (Complete Task)**: Depends on US1 - Adds complete_task tool
- **US4 (Delete Task)**: Depends on US1 - Adds delete_task tool
- **US5 (Update Task)**: Depends on US1 - Adds update_task tool
- **Frontend**: Depends on all MCP tools (US1-US5) for full functionality

### Parallel Opportunities

**Phase 1**:
- T003, T004, T005 can run in parallel (different files)

**Phase 2**:
- T010 can run in parallel with T008-T009 (different files)

**Phase 3**:
- T023, T024 can run in parallel (same file but independent models)

**User Stories (after US1)**:
- US2, US3, US4, US5 can be implemented in parallel (each adds one tool)

**Phase 8**:
- T045, T057 can run in parallel (different files)

---

## Parallel Example: MCP Tools

```bash
# After Phase 3 (US1) completes, launch all remaining tools in parallel:
Task: "T036 [US2] Define list_tasks tool"
Task: "T038 [US3] Define complete_task tool"
Task: "T040 [US4] Define delete_task tool"
Task: "T042 [US5] Define update_task tool"

# Then implement executors in parallel:
Task: "T037 [US2] Implement execute_list_tasks"
Task: "T039 [US3] Implement execute_complete_task"
Task: "T041 [US4] Implement execute_delete_task"
Task: "T043 [US5] Implement execute_update_task"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: Foundational (T008-T017)
3. Complete Phase 3: User Story 1 - Add Task (T018-T035)
4. **STOP and VALIDATE**: Test "Add buy milk" creates task
5. Can demo basic chat functionality

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Add Task) → Test → **MVP Demo!**
3. Add US2 (List Tasks) → Test → Demo listing
4. Add US3-US5 (Complete/Delete/Update) → Test → Full CRUD
5. Add Frontend → Test → Production-ready chat UI
6. Polish + Deploy → **Production Launch**

---

## Summary

| Phase | Task Count | Focus |
|-------|------------|-------|
| Phase 1: Setup | 7 | Dependencies & Database |
| Phase 2: Foundational | 10 | Cohere + Conversation Helpers |
| Phase 3: US1 - Add Task | 18 | Chat Endpoint + add_task tool |
| Phase 4: US2 - List Tasks | 2 | list_tasks tool |
| Phase 5: US3 - Complete Task | 2 | complete_task tool |
| Phase 6: US4 - Delete Task | 2 | delete_task tool |
| Phase 7: US5 - Update Task | 2 | update_task tool |
| Phase 8: Frontend | 16 | Chat UI + ChatButton |
| Phase 9: Polish | 16 | E2E Tests + Deployment |
| **Total** | **75** | |

**Parallel Opportunities**: 15 tasks marked [P]
**MVP Scope**: Phases 1-3 (35 tasks) for basic add-task-via-chat

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user scenario (US1-US5)
- Manual E2E testing per hackathon scope (no automated test files)
- Commit after each task or logical group
- Stop at any checkpoint to validate independently
- Reference component specs in specs/003-cohere-chatbot/components/ for implementation details
