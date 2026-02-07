# Implementation Plan: Kubernetes Minikube Deployment

**Branch**: `004-k8s-minikube-deploy` | **Date**: 2026-02-07 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-k8s-minikube-deploy/spec.md`

## Summary

Containerize the Phase 3 Todo Chatbot (Next.js frontend + FastAPI backend) with
multi-stage Docker builds and deploy to a local Minikube cluster using Helm 3.
All application code already exists; this plan covers only infrastructure
artifacts: Dockerfiles, .dockerignore files, Helm chart, and deployment
verification. The Neon PostgreSQL database remains external.

## Technical Context

**Language/Version**: Node.js 20 (frontend), Python 3.11 (backend)
**Primary Dependencies**: Docker, Minikube, Helm 3, kubectl, kubectl-ai
**Storage**: Neon PostgreSQL (external, unchanged)
**Testing**: Manual verification via kubectl, curl, browser
**Target Platform**: Local Minikube (Linux/macOS)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: All pods Ready within 5 minutes of Helm install
**Constraints**: Frontend image < 200MB, backend image < 500MB
**Scale/Scope**: 4 pods (2 frontend, 2 backend), single namespace

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Evidence |
|---|-----------|--------|----------|
| I | Spec-First Development | PASS | All specs created before implementation |
| II | Monorepo Architecture | PASS | frontend/, backend/, todo-chatbot-helm/ in same repo |
| III | Stateless JWT Auth | PASS | JWT auth unchanged; tokens passed via env vars |
| IV | User Data Isolation | PASS | user_id filtering unchanged in backend code |
| V | RESTful API Design | PASS | API endpoints unchanged |
| VI | Graceful Error Handling | PASS | Error codes unchanged; K8s probes added |
| VII | Container-First Deployment | PASS | Multi-stage Docker, non-root, health probes, resource limits |

All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/004-k8s-minikube-deploy/
├── spec.md                  # Feature specification
├── plan.md                  # This file
├── research.md              # Phase 0: Technical findings
├── data-model.md            # Phase 1: K8s entity model
├── quickstart.md            # Phase 1: Deployment quickstart
├── docker-frontend.md       # Sub-spec: Frontend Docker
├── docker-backend.md        # Sub-spec: Backend Docker
├── kubernetes-manifests.md  # Sub-spec: K8s resources
├── helm-chart.md            # Sub-spec: Helm chart
├── deployment-workflow.md   # Sub-spec: Deploy process
├── testing-monitoring.md    # Sub-spec: Testing & monitoring
├── checklists/
│   └── requirements.md      # Quality checklist
└── tasks.md                 # Phase 2 output (/sp.tasks)
```

### Source Code (repository root)

```text
frontend/
├── Dockerfile               # NEW: Multi-stage Next.js build
├── .dockerignore             # NEW: Exclude node_modules, .next, etc.
├── next.config.ts            # MODIFY: Add output: "standalone"
├── src/                      # UNCHANGED
├── public/                   # UNCHANGED
├── package.json              # UNCHANGED
└── package-lock.json         # UNCHANGED

backend/
├── Dockerfile                # REPLACE: Multi-stage, non-root, port 8000
├── .dockerignore             # NEW: Exclude __pycache__, venv, etc.
├── main.py                   # UNCHANGED
├── requirements.txt          # UNCHANGED
├── routes/                   # UNCHANGED
├── services/                 # UNCHANGED
└── models.py                 # UNCHANGED

todo-chatbot-helm/            # NEW: Entire directory
├── Chart.yaml
├── values.yaml
└── templates/
    ├── namespace.yaml
    ├── configmap.yaml
    ├── secret.yaml
    ├── frontend-deployment.yaml
    ├── frontend-service.yaml
    ├── backend-deployment.yaml
    └── backend-service.yaml
```

**Structure Decision**: Web application layout. Existing frontend/ and backend/
directories preserved. New todo-chatbot-helm/ directory added at project root
for Helm chart. No k8s/ directory needed since Helm templates replace raw
manifests.

## Existing State Analysis

### Backend Dockerfile (needs replacement)
The current `backend/Dockerfile` is a single-stage build that:
- Runs as root (security violation per Constitution VII)
- Exposes port 7860 (needs 8000 for K8s service mapping)
- Has no multi-stage optimization
- Has no .dockerignore

This MUST be replaced with the spec-compliant multi-stage Dockerfile.

### Frontend next.config.ts (needs modification)
The current config does NOT include `output: "standalone"` which is required for
the Next.js multi-stage Docker build to produce the standalone server.js output.
Must add `output: "standalone"` to the config object.

### No Frontend Dockerfile
Must be created from scratch per docker-frontend.md spec.

---

## Phase 0: Research & Decisions

### R1: Next.js Standalone Output with TypeScript Config

**Decision**: Add `output: "standalone"` to existing `next.config.ts`
**Rationale**: Next.js standalone output is required for the 3-stage Docker
build. The config file is TypeScript (.ts), so the spec's .js example must be
adapted. The `output` property is supported in the NextConfig type.
**Alternatives**: Convert to next.config.js (rejected: unnecessary churn)

### R2: Backend Dockerfile Port Change

**Decision**: Replace existing Dockerfile; change port from 7860 to 8000
**Rationale**: The existing Dockerfile was built for Hugging Face Spaces
(port 7860). Kubernetes backend-service maps to port 8000. The uvicorn CMD
must use `--port 8000` and EXPOSE must be 8000.
**Alternatives**: Keep 7860 and remap in K8s service (rejected: adds confusion,
violates constitution's port 8000 standard)

### R3: Helm-Only Deployment (No Raw k8s/ Directory)

**Decision**: Create only the Helm chart; skip separate k8s/ manifest directory
**Rationale**: The Helm chart templates serve the same purpose as raw manifests
but with parameterization. Maintaining both creates duplication and drift risk.
`helm template` can render raw YAML if needed.
**Alternatives**: Create both k8s/ and todo-chatbot-helm/ (rejected: duplication)

### R4: imagePullPolicy: Never

**Decision**: Set `imagePullPolicy: Never` on all container specs
**Rationale**: Images are loaded directly into Minikube via `minikube image load`.
There is no container registry. Setting "Never" prevents Kubernetes from
attempting to pull from Docker Hub and failing.
**Alternatives**: Use Minikube's Docker daemon (`eval $(minikube docker-env)`)
(rejected: requires rebuilding inside Minikube context, more complex workflow)

### R5: Secret Handling via Helm --set

**Decision**: Pass secrets at `helm install` time via `--set` flags
**Rationale**: Secrets MUST never be committed to source. Helm's `b64enc`
function handles base64 encoding in the template. Using `--set` at CLI keeps
values out of values.yaml and version control.
**Alternatives**: External secrets operator (rejected: overkill for local dev),
.env file with helm-secrets plugin (rejected: adds dependency)

---

## Phase 1: Docker Image Creation

### Files to Create/Modify

| Action | File | Spec Reference |
|--------|------|----------------|
| CREATE | `frontend/Dockerfile` | docker-frontend.md |
| CREATE | `frontend/.dockerignore` | docker-frontend.md |
| MODIFY | `frontend/next.config.ts` | docker-frontend.md (add standalone output) |
| REPLACE | `backend/Dockerfile` | docker-backend.md |
| CREATE | `backend/.dockerignore` | docker-backend.md |

### 1.1 Frontend Dockerfile

3-stage build: deps → builder → runner

- Stage 1 (deps): `node:20-alpine`, `npm ci --only=production`
- Stage 2 (builder): `node:20-alpine`, `npm ci`, `npm run build`
- Stage 3 (runner): `node:20-alpine`, non-root `nextjs` user (UID 1001),
  copy standalone + static, expose 3000

### 1.2 Frontend .dockerignore

Exclude: `node_modules`, `.next`, `.git`, `.gitignore`, `.env*`, `*.md`,
`Dockerfile`, `.dockerignore`

### 1.3 Frontend next.config.ts Modification

Add `output: "standalone"` to existing NextConfig object. Keep existing
`reactCompiler: true`.

### 1.4 Backend Dockerfile (Replace)

2-stage build: builder → runner

- Stage 1 (builder): `python:3.11-slim`, `pip install --user --no-cache-dir`
- Stage 2 (runner): `python:3.11-slim`, non-root `appuser` (UID 1001),
  copy deps from builder, expose 8000, uvicorn on port 8000

### 1.5 Backend .dockerignore

Exclude: `__pycache__`, `*.pyc`, `*.pyo`, `venv`, `.venv`, `.git`,
`.gitignore`, `.env*`, `*.md`, `Dockerfile`, `.dockerignore`

### Verification

```bash
docker build -t todo-frontend:latest ./frontend
docker build -t todo-backend:latest ./backend
docker images | grep todo  # Check sizes
```

---

## Phase 2: Helm Chart Creation

### Files to Create

| File | Purpose |
|------|---------|
| `todo-chatbot-helm/Chart.yaml` | Chart metadata |
| `todo-chatbot-helm/values.yaml` | Configuration values |
| `todo-chatbot-helm/templates/namespace.yaml` | todo-app namespace |
| `todo-chatbot-helm/templates/configmap.yaml` | Non-sensitive env vars |
| `todo-chatbot-helm/templates/secret.yaml` | Sensitive credentials |
| `todo-chatbot-helm/templates/frontend-deployment.yaml` | Frontend pods |
| `todo-chatbot-helm/templates/frontend-service.yaml` | Frontend LB |
| `todo-chatbot-helm/templates/backend-deployment.yaml` | Backend pods |
| `todo-chatbot-helm/templates/backend-service.yaml` | Backend ClusterIP |

### Key Templating Patterns

- All hardcoded values replaced with `{{ .Values.* }}` references
- Resources use `toYaml | nindent` for clean YAML output
- Secrets use `b64enc | quote` for base64 encoding
- `imagePullPolicy: Never` hardcoded (Minikube-specific)

### Verification

```bash
helm lint ./todo-chatbot-helm
helm template todo-chatbot ./todo-chatbot-helm \
  --set secrets.cohereApiKey="test" \
  --set secrets.neonDbUrl="test" \
  --set secrets.authSecret="test"
```

---

## Phase 3: Deploy to Minikube

### Prerequisites

```bash
minikube start
minikube status  # Must show Running
```

### Deploy Steps

```bash
# Load images
minikube image load todo-frontend:latest
minikube image load todo-backend:latest

# Install Helm chart
helm install todo-chatbot ./todo-chatbot-helm \
  --set secrets.cohereApiKey="$COHERE_API_KEY" \
  --set secrets.neonDbUrl="$NEON_DATABASE_URL" \
  --set secrets.authSecret="$BETTER_AUTH_SECRET"

# Wait for readiness
kubectl wait --for=condition=ready pod -l app=frontend -n todo-app --timeout=300s
kubectl wait --for=condition=ready pod -l app=backend -n todo-app --timeout=300s
```

### Verification

```bash
kubectl get all -n todo-app
minikube service frontend-service -n todo-app --url
```

---

## Phase 4: End-to-End Testing

### Test Matrix

| Test | Command/Action | Expected |
|------|---------------|----------|
| Pods running | `kubectl get pods -n todo-app` | 4 pods Running (2+2) |
| Services exist | `kubectl get svc -n todo-app` | frontend (LB), backend (CIP) |
| Frontend loads | Open Minikube URL in browser | UI renders |
| Backend API | Port-forward + curl /docs | Swagger UI |
| Task create | Create task via frontend | Persists in DB |
| Chat works | Send chat message | AI response returned |
| Non-root | `kubectl exec` + `whoami` | nextjs / appuser |
| Scaling | Scale frontend to 3 | 3 frontend pods |
| Rollback | `helm rollback` | Previous state restored |

---

## Phase 5: kubectl-ai Operations

```bash
kubectl ai "show all resources in todo-app namespace"
kubectl ai "scale frontend to 3 replicas in todo-app"
kubectl ai "check pod health in todo-app namespace"
kubectl ai "show logs for backend pods with errors"
kubectl ai "describe frontend deployment in todo-app"
```

---

## Critical Path

```
next.config.ts mod ─┐
Frontend Dockerfile ─┤
Frontend .dockerignore ─┤─→ Build frontend image ─┐
                        │                          │
Backend Dockerfile ─────┤─→ Build backend image ───┤
Backend .dockerignore ──┘                          │
                                                   ├─→ Load into Minikube ─→ Helm install ─→ Verify
Chart.yaml ─────────────┐                          │
values.yaml ────────────┤─→ Helm chart ────────────┘
7 template files ───────┘
```

**Parallelizable**: Frontend Docker (1.1-1.3) and Backend Docker (1.4-1.5) can
be done in parallel. Helm chart (Phase 2) can start after Phase 1 since it only
needs image names (not built images).

## Risks

1. **Next.js standalone build failure**: If the Next.js version or config
   doesn't support standalone output, the Docker build fails. Mitigation: verify
   Next.js version >= 12 in package.json before starting.
2. **Minikube network access**: Backend pods need to reach external Neon
   PostgreSQL and Cohere API. Minikube may have network restrictions. Mitigation:
   test with `kubectl exec -- curl https://api.cohere.ai` from a pod.
3. **Image load time**: Large images take minutes to load into Minikube via
   `minikube image load`. Mitigation: keep images minimal per size targets.
