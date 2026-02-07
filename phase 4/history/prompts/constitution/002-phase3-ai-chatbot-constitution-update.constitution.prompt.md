---
id: 002
title: Phase 3 AI Chatbot Constitution Update
stage: constitution
date: 2026-01-27
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: main
user: sumair
command: /sp.constitution
labels: ["constitution", "architecture", "phase-3", "cohere", "chatbot", "ai-integration"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A
---

## Prompt

You are an expert system architect creating the constitutional document for AI Chatbot integration into an existing Full-Stack Todo Application.

CONTEXT:
Phase 3 adds AI conversational interface to existing Next.js + FastAPI todo app. Uses Cohere API (NOT OpenAI) for AI, with OpenAI ChatKit for UI only.

EXISTING SYSTEM (Phase 2):
- Frontend: Next.js on Vercel, Better Auth JWT
- Backend: FastAPI on Hugging Face Spaces (port 7860)
- Database: Neon PostgreSQL (tasks, users tables)

NEW ADDITIONS (Phase 3):
- ChatKit UI for chat interface
- Cohere API for AI responses
- MCP tools for task operations
- Stateless chat with database conversations
- New endpoint: POST /api/{user_id}/chat

YOUR TASK:
Create constitution.md covering these 10 core sections:
1. PROJECT IDENTITY & EVOLUTION
2. ARCHITECTURE INTEGRATION
3. COHERE API CONFIGURATION
4. MCP TOOLS SPECIFICATION
5. DATABASE SCHEMA EXTENSION
6. STATELESS CHAT ARCHITECTURE
7. CHAT API ENDPOINT
8. AGENT ARCHITECTURE
9. SECURITY & AUTHENTICATION
10. DEPLOYMENT INTEGRATION

## Response snapshot

Updated constitution from v1.0.0 to v2.0.0 (MAJOR version bump) at `.specify/memory/constitution.md` with comprehensive AI chatbot integration specifications.

**Version Change**: 1.0.0 → 2.0.0 (MAJOR - new architecture layer)

**Added Sections (6 new)**:
- Section 7: Cohere API Configuration (command-r-plus model, tool use)
- Section 8: MCP Tools Specification (5 tools: add_task, list_tasks, complete_task, delete_task, update_task)
- Section 9: Database Schema Extension (conversations, messages tables)
- Section 10: Stateless Chat Architecture (9-step request cycle)
- Section 11: Chat API Endpoint (POST /api/{user_id}/chat)
- Section 12: Agent Architecture (Master Orchestrator with sub-agents)

**Updated Sections**:
- Project Identity: Phase 2 → Phase 3, added evolution history
- Architecture Integration: Added chat flow alongside REST flow
- Technology Stack: Added Cohere API, ChatKit
- Security Requirements: Added rate limiting (100 req/hour), COHERE_API_KEY
- Error Handling: Added 429 status code for rate limits

**Key Decisions**:
- Cohere API (not OpenAI) for AI logic
- ChatKit for UI only
- Stateless architecture with DB persistence
- Same JWT auth for REST and chat
- user_id ALWAYS from token, never from parameters

## Outcome

- ✅ Impact: Extended architecture for Phase 3 AI chatbot integration with Cohere API
- 🧪 Tests: N/A (constitution document)
- 📁 Files: 1 modified (.specify/memory/constitution.md)
- 🔁 Next prompts: /sp.specify for chat feature spec, /sp.plan for implementation planning
- 🧠 Reflection: Constitution now covers both REST API and conversational AI patterns with clear security boundaries

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): Detailed 10-section prompt with code examples
- Next experiment (smallest change to try): Validate Cohere tool format during chat endpoint implementation
