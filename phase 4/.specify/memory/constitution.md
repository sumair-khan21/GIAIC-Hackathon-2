<!--
Sync Impact Report
==================
Version change: 2.0.0 → 3.0.0 (MAJOR - Cloud-native deployment layer)
Modified principles:
  - None renamed; all existing principles retained
Added sections:
  - Section 13 replaced: Containerization Strategy (was Deployment Integration)
  - Section 14: Kubernetes Architecture (was Quality Gates)
  - Section 15: Helm Chart Structure (was Governance)
  - Section 16: Environment & Secrets Management
  - Section 17: Deployment Workflow
  - Section 18: Quality & Monitoring
  - Section 19: Quality Gates (renumbered)
  - Section 20: Governance (renumbered)
Removed sections:
  - Section 13 (Deployment Integration) replaced by cloud-native strategy
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (compatible - Constitution Check
    section accommodates new containerization/K8s principles)
  - .specify/templates/spec-template.md ✅ (compatible - no changes needed)
  - .specify/templates/tasks-template.md ✅ (compatible - Phase structure
    supports Docker/Helm/K8s task types)
Follow-up TODOs: None
-->

# Todo Full-Stack Application Constitution

## 1. Project Identity & Evolution

**Name**: Todo Full-Stack
**Phase**: Phase 4 - Cloud-Native Kubernetes Deployment
**Purpose**: Multi-user task management with AI interface, containerized on local Kubernetes

**Evolution**:
- Phase 2: REST API + Web UI (Next.js + FastAPI + Neon PostgreSQL)
- Phase 3: Add conversational AI interface powered by Cohere API
- Phase 4: Containerize with Docker, deploy on Minikube with Helm

**Target Users**: Individual users managing tasks via web UI or natural language chat

**Success Criteria**:
- All Phase 3 functionality preserved without breaking changes
- Frontend and backend containerized with multi-stage Docker builds
- Application deploys on Minikube via Helm chart
- Pods pass health checks and resource limits are enforced
- kubectl-ai operational for cluster management

## 2. Architecture Integration

### Existing (Unchanged)
```
Next.js → REST API (/api/{user_id}/tasks) → Neon PostgreSQL
ChatKit UI → Chat API (/api/{user_id}/chat) → Cohere API → MCP Tools → Database
```

### New Addition (Phase 4)
```
Minikube Cluster (todo-app namespace)
├── frontend-deployment (2 replicas)
│   └── todo-frontend:latest (Next.js container)
├── backend-deployment (2 replicas)
│   └── todo-backend:latest (FastAPI container)
├── frontend-service (LoadBalancer → external access)
├── backend-service (ClusterIP → internal only)
├── ConfigMap (non-sensitive config)
└── Secret (API keys, DB credentials)
```

**Key Decisions**:
- Local Minikube only (no cloud provider)
- Helm charts for declarative deployment
- LoadBalancer for frontend, ClusterIP for backend
- Neon PostgreSQL remains external (not containerized)
- Images loaded directly into Minikube (no registry)

## 3. Core Principles

### I. Spec-First Development
All code MUST be generated from specifications. No manual coding is permitted.

**Rationale**: Spec-driven development ensures consistency and AI-assisted generation.

### II. Monorepo Architecture
Frontend and backend MUST reside in a single repository with clear separation.

```
/
├── frontend/              # Next.js 16+ App Router
├── backend/               # FastAPI + SQLModel
├── todo-chatbot-helm/     # Helm chart (Phase 4)
├── specs/                 # Feature specifications
└── .specify/              # Spec-Kit Plus configuration
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

### VII. Container-First Deployment
All services MUST be containerized with production-ready Docker images.

- Multi-stage builds to minimize image size
- Non-root user execution for security
- Health checks (liveness + readiness) on every container
- Resource limits enforced via Kubernetes

**Rationale**: Containers ensure reproducible builds, isolation, and portability.

## 4. Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | Next.js 16+ (App Router) | Server Components, React 19 |
| Chat UI | OpenAI ChatKit | Pre-built chat components |
| Backend | FastAPI + SQLModel | Async Python, Pydantic validation |
| AI | Cohere API (command-r-plus) | Best reasoning model, native tool use |
| Database | Neon PostgreSQL | Serverless, auto-scaling (external) |
| Auth | Better Auth + JWT | Stateless verification |
| Containers | Docker (multi-stage) | Reproducible, minimal images |
| Orchestration | Minikube (local K8s) | Local cluster for development |
| Packaging | Helm 3 | Declarative chart-based deploys |
| Operations | kubectl-ai | AI-assisted cluster management |

## 5. Security Requirements

**MUST Have**:
- JWT verification on every request (REST and chat)
- user_id extracted from token (never from request body)
- Task ownership validation before operations
- COHERE_API_KEY in environment variables only
- Rate limit: 100 chat requests/hour per user
- Never expose API keys or system internals in responses
- Kubernetes Secrets for all sensitive values (base64 encoded)
- ConfigMaps for non-sensitive configuration only
- Non-root container execution

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
  "response": "Added 'Buy groceries' to your tasks!",
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

## 13. Containerization Strategy

### Frontend (Next.js)
- **Base**: `node:20-alpine`
- **Build**: Multi-stage (install deps → build → production)
- **Port**: 3000
- **Size target**: < 200MB
- **Runner**: Non-root `nextjs` user

### Backend (FastAPI)
- **Base**: `python:3.11-slim`
- **Install**: `requirements.txt`
- **Port**: 8000
- **Size target**: < 500MB
- **Runner**: Non-root `appuser`

### Principles
- Multi-stage builds MUST be used to minimize image size
- `.dockerignore` MUST exclude `node_modules`, `.git`, `__pycache__`, `.env`
- All containers MUST run as non-root user
- Environment variables injected via ConfigMaps and Secrets (never baked in)

## 14. Kubernetes Architecture

```
Minikube Cluster
├── Namespace: todo-app
├── Deployments
│   ├── frontend (2 replicas)
│   └── backend (2 replicas)
├── Services
│   ├── frontend-service (LoadBalancer)
│   └── backend-service (ClusterIP)
└── Config
    ├── ConfigMap (API URLs, non-sensitive)
    └── Secret (API keys, DB credentials)
```

**Resource Limits**:

| Service | CPU Request | CPU Limit | Memory Request | Memory Limit |
|---------|-------------|-----------|----------------|--------------|
| Frontend | 250m | 500m | 256Mi | 512Mi |
| Backend | 500m | 1000m | 512Mi | 1Gi |

**Networking**:
- Frontend: External access via Minikube LoadBalancer
- Backend: Internal only (ClusterIP at `backend-service:8000`)
- Frontend → Backend: `http://backend-service:8000`

## 15. Helm Chart Structure

```
todo-chatbot-helm/
├── Chart.yaml              # name, version, appVersion
├── values.yaml             # All configurable values
└── templates/
    ├── namespace.yaml
    ├── frontend-deployment.yaml
    ├── frontend-service.yaml
    ├── backend-deployment.yaml
    ├── backend-service.yaml
    ├── configmap.yaml
    └── secret.yaml
```

**values.yaml** MUST expose:
- Image names and tags
- Replica counts
- Resource requests and limits
- All environment variable values
- Service types and ports

## 16. Environment & Secrets Management

**ConfigMap (non-sensitive)**:
```yaml
NEXT_PUBLIC_API_URL: "http://backend-service:8000"
BETTER_AUTH_URL: "http://frontend-service:3000"
```

**Secret (sensitive, base64 encoded)**:
```yaml
COHERE_API_KEY: (base64)
NEON_DATABASE_URL: (base64)
BETTER_AUTH_SECRET: (base64)
```

**Rules**:
- Secrets MUST never appear in source code or values.yaml defaults
- ConfigMaps for non-sensitive configuration only
- All sensitive values injected at deploy time

## 17. Deployment Workflow

### Build & Deploy
```bash
# 1. Build Docker images
docker build -t todo-frontend:latest ./frontend
docker build -t todo-backend:latest ./backend

# 2. Load images into Minikube
minikube image load todo-frontend:latest
minikube image load todo-backend:latest

# 3. Deploy with Helm
helm install todo-chatbot ./todo-chatbot-helm

# 4. Verify
kubectl get all -n todo-app

# 5. Access
minikube service frontend-service -n todo-app
```

### kubectl-ai Operations
```bash
kubectl ai "scale frontend to 3 replicas"
kubectl ai "check pod health in todo-app namespace"
kubectl ai "show logs for backend pods"
```

### Rollback
```bash
helm rollback todo-chatbot
```

## 18. Quality & Monitoring

**Health Checks** (MUST be configured on all deployments):
- **Liveness probe**: HTTP GET on health endpoint; restart if unhealthy
- **Readiness probe**: HTTP GET on health endpoint; route traffic only when ready

**Logging**:
```bash
kubectl logs -f deployment/backend -n todo-app
kubectl logs -f deployment/frontend -n todo-app
```

**Monitoring**:
```bash
kubectl top pods -n todo-app
kubectl describe pod <pod-name> -n todo-app
```

## 19. Quality Gates

All implementations MUST pass:

- [ ] JWT verification on every endpoint (REST and chat)
- [ ] Every database query filters by user_id from token
- [ ] Chat rate limiting enforced (100 req/hour/user)
- [ ] Tool calls validated for user ownership before execution
- [ ] Cohere API key never exposed in responses
- [ ] Conversation history properly persisted
- [ ] Error responses include helpful messages
- [ ] Docker images build successfully with multi-stage
- [ ] Images run as non-root user
- [ ] Helm chart installs without errors on Minikube
- [ ] All pods reach Ready state with health checks passing
- [ ] Resource limits enforced on all deployments
- [ ] Secrets not exposed in ConfigMaps or image layers

## 20. Governance

This constitution is the authoritative source for all architectural decisions.

**Amendment Process**:
1. Propose change with rationale
2. Document in ADR if architecturally significant
3. Update constitution version
4. Propagate changes to dependent specs

**Compliance**: All PRs must verify alignment with constitution principles.

**Version**: 3.0.0 | **Ratified**: 2026-01-11 | **Last Amended**: 2026-02-06
