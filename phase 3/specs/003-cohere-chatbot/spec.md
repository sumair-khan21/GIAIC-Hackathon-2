# Feature Specification: AI Todo Chatbot

**Feature ID**: 003-cohere-chatbot
**Status**: Draft
**Created**: 2026-01-31
**Last Updated**: 2026-01-31

## Overview

### Problem Statement

Users currently manage tasks through a traditional REST API interface with forms and buttons. This requires explicit navigation and multiple clicks to perform simple operations like adding a task or checking completion status.

### Proposed Solution

Add a conversational AI interface powered by Cohere API that allows users to manage tasks through natural language. Users can type "Add buy groceries" or "What tasks do I have?" and receive intelligent responses with automatic task operations.

### Success Criteria

| Criterion | Target | Measurement |
|-----------|--------|-------------|
| Task creation via chat | Users can create tasks by typing natural phrases | Manual testing: "Add X" creates task X |
| Task listing via chat | Users can view tasks by asking | Manual testing: "Show tasks" returns list |
| Response time | Chat responses appear within 3 seconds | Stopwatch measurement |
| Conversation context | Bot remembers previous messages in session | Test multi-turn conversations |
| Zero downtime | Existing REST API continues working | All Phase 2 endpoints unchanged |

## User Scenarios & Testing

### Scenario 1: Create Task via Chat

**Actor**: Authenticated user
**Goal**: Add a new task using natural language

**Flow**:
1. User navigates to chat interface
2. User types "Remind me to call the dentist"
3. System confirms: "Added 'Call the dentist' to your tasks!"
4. Task appears in user's task list

**Acceptance Criteria**:
- [ ] Natural language input creates task
- [ ] Confirmation message displays
- [ ] Task persists in database

### Scenario 2: List Tasks via Chat

**Actor**: Authenticated user
**Goal**: View current tasks through conversation

**Flow**:
1. User types "What do I need to do today?"
2. System lists pending tasks with numbers
3. User can reference tasks by number in follow-up

**Acceptance Criteria**:
- [ ] Bot returns numbered task list
- [ ] Only user's own tasks shown
- [ ] Completed/pending status indicated

### Scenario 3: Complete Task via Chat

**Actor**: Authenticated user
**Goal**: Mark a task as done through chat

**Flow**:
1. User types "Mark task 3 as done" or "I finished buying groceries"
2. System confirms completion
3. Task status updates in database

**Acceptance Criteria**:
- [ ] Task marked complete by ID or title match
- [ ] Confirmation message shown
- [ ] Database reflects change

### Scenario 4: Delete Task via Chat

**Actor**: Authenticated user
**Goal**: Remove a task through conversation

**Flow**:
1. User types "Delete the dentist task"
2. System confirms deletion
3. Task removed from database

**Acceptance Criteria**:
- [ ] Task deleted by title match or ID
- [ ] Confirmation before permanent deletion
- [ ] Database reflects removal

### Scenario 5: Update Task via Chat

**Actor**: Authenticated user
**Goal**: Modify an existing task

**Flow**:
1. User types "Change task 2 to 'Buy organic milk'"
2. System confirms update
3. Task title/description updated

**Acceptance Criteria**:
- [ ] Task updated by reference
- [ ] Confirmation shows old → new
- [ ] Database reflects changes

## Functional Requirements

### FR-1: Cohere API Integration

The system MUST use Cohere API (not OpenAI/Gemini) for AI responses.

- Model: `command-r-plus` for best reasoning
- Temperature: 0.7 for balanced creativity
- Tools: 5 MCP tools for task operations
- Preamble: System prompt defining assistant behavior

### FR-2: MCP Tools

The system MUST implement 5 tools in Cohere format:

| Tool | Description | Required Parameters |
|------|-------------|---------------------|
| add_task | Create new task | title (required), description (optional) |
| list_tasks | View tasks | status filter (optional) |
| complete_task | Mark task done | task_id (required) |
| delete_task | Remove task | task_id (required) |
| update_task | Modify task | task_id (required), title/description |

### FR-3: Chat Endpoint

The system MUST provide a chat endpoint at `/api/{user_id}/chat`:

- Method: POST
- Authentication: JWT token required
- Request: `{conversation_id?, message}`
- Response: `{conversation_id, response, tool_calls?}`

### FR-4: Conversation Persistence

The system MUST store conversation history in database:

- Conversations table: id, user_id, timestamps
- Messages table: id, conversation_id, role, content, tool_calls
- Load last 20 messages for context
- Stateless server: all state from database

### FR-5: Frontend Chat UI

The system MUST provide a chat interface:

- Dedicated `/chat` route
- Message bubbles (user right, assistant left)
- Input field with Enter-to-send
- Floating chat button on dashboard
- Gradient styling matching existing theme

### FR-6: Security Requirements

The system MUST enforce security:

- JWT verification on every chat request
- user_id extracted from token (never from request body)
- Task operations filtered by authenticated user_id
- Rate limiting: 100 requests/hour per user
- API keys in environment variables only

## Non-Functional Requirements

### Performance

- Chat response time: < 3 seconds for 95% of requests
- Message history load: < 500ms
- Support 100 concurrent chat sessions

### Reliability

- Graceful degradation if Cohere API unavailable
- Retry logic for transient failures
- Error messages user-friendly (no stack traces)

### Scalability

- Stateless architecture enables horizontal scaling
- Database connection pooling
- No server-side session storage

## Scope

### In Scope

- Cohere API integration with tool use
- 5 MCP tools for task CRUD operations
- Chat endpoint in existing FastAPI backend
- Conversation/Message database models
- Frontend chat page with message UI
- Floating chat button on dashboard

### Out of Scope

- Voice input/output
- Multi-language support
- File attachments in chat
- Real-time typing indicators
- Chat history export
- Custom AI personalities

## Dependencies

### External Dependencies

| Dependency | Purpose | Risk |
|------------|---------|------|
| Cohere API | AI responses and tool calling | API downtime, rate limits |
| Neon PostgreSQL | Conversation storage | Existing dependency |
| Hugging Face Spaces | Backend hosting | Existing dependency |

### Internal Dependencies

- Phase 2 REST API (tasks endpoints)
- Phase 2 Authentication (Better Auth JWT)
- Phase 2 Database schema (tasks, users tables)

## Assumptions

1. Cohere API supports tool calling with parameter_definitions format
2. Existing Task model has user_id foreign key for filtering
3. Better Auth JWT contains user_id claim
4. Frontend can access JWT token for API calls
5. Hugging Face Spaces allows adding COHERE_API_KEY secret

## Component Specifications

Detailed specifications for each component are in the `components/` subdirectory:

1. [cohere-integration.md](components/cohere-integration.md) - Cohere API setup
2. [mcp-tools.md](components/mcp-tools.md) - Tool definitions and executors
3. [chat-endpoint.md](components/chat-endpoint.md) - FastAPI endpoint
4. [database-models.md](components/database-models.md) - SQLModel schemas
5. [frontend-chat-ui.md](components/frontend-chat-ui.md) - React components
6. [environment-setup.md](components/environment-setup.md) - Configuration guide
