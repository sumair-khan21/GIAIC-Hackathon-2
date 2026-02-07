---
id: 002
title: Cohere Chatbot Implementation Plan
stage: plan
date: 2026-01-31
surface: agent
model: claude-opus-4-5-20251101
feature: 003-cohere-chatbot
branch: 003-cohere-chatbot
user: sumair
command: /sp.plan
labels: ["plan", "cohere", "chatbot", "ai-integration", "phase-3", "implementation"]
links:
  spec: specs/003-cohere-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-cohere-chatbot/plan.md
  - specs/003-cohere-chatbot/research.md
  - specs/003-cohere-chatbot/data-model.md
  - specs/003-cohere-chatbot/quickstart.md
  - specs/003-cohere-chatbot/contracts/chat-api.md
tests:
  - N/A (planning phase)
---

## Prompt

You are a Technical Planning Expert creating implementation plan for AI Chatbot integration using Cohere API.

CONTEXT:
Phase 3 adds conversational AI to existing Next.js + FastAPI todo app. Backend on Hugging Face, Frontend on Vercel. Integrate seamlessly without breaking existing features.

REQUIRED READING:
- @constitution.md (architecture principles)
- @specs/phase3/*.md (all chatbot specs)

YOUR TASK:
Create step-by-step implementation plan breaking chatbot development into 6 sequential phases:
1. Backend - Database Setup
2. Backend - Cohere Integration
3. Backend - MCP Tools Implementation
4. Backend - Chat Endpoint
5. Frontend - Chat UI
6. Testing & Integration

## Response snapshot

Created comprehensive implementation plan for AI Todo Chatbot feature (003-cohere-chatbot):

**Plan Artifacts Generated**:
1. `plan.md` - Main implementation plan with 6 phases, 40+ tasks
2. `research.md` - Technical decisions and alternatives
3. `data-model.md` - Database schema for conversations/messages
4. `quickstart.md` - Setup and deployment guide
5. `contracts/chat-api.md` - API contract for POST /api/{user_id}/chat

**6 Implementation Phases**:
- Phase 1: Database Setup (5 tasks) - Conversation/Message models, migration
- Phase 2: Cohere Integration (5 tasks) - SDK setup, SYSTEM_PROMPT
- Phase 3: MCP Tools (8 tasks) - 5 tool executors + router
- Phase 4: Chat Endpoint (8 tasks) - Full endpoint with auth, rate limiting
- Phase 5: Frontend Chat UI (10 tasks) - Chat page, ChatButton
- Phase 6: Testing & Integration (10 tasks) - E2E, security, deployment

**Constitution Check**: All 6 principles verified PASS
- Spec-First Development
- Monorepo Architecture
- Stateless JWT Auth
- User Data Isolation
- RESTful API Design
- Graceful Error Handling

**Key Technical Decisions**:
- Cohere `command-r-plus` model (not OpenAI/Gemini)
- Server-side tool execution with JWT-injected user_id
- Stateless with DB-persisted conversations
- Custom React chat component (not ChatKit)
- 100 req/hour rate limiting via slowapi

## Outcome

- Branch: `003-cohere-chatbot`
- Files created: 5 planning artifacts
- Constitution check: PASS (no violations)
- Next steps: `/sp.tasks` to generate actionable task list
- Reflection: Plan provides clear phase dependencies and acceptance criteria for sequential implementation

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results: Constitution check PASS
- Prompt variant: Detailed 6-phase structure with per-task acceptance criteria
- Next experiment: Track task completion time to refine estimates
