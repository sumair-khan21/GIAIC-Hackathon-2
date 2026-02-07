# Tasks: Kubernetes Minikube Deployment

**Input**: Design documents from `/specs/004-k8s-minikube-deploy/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Tests are not explicitly requested. Verification is done via manual kubectl/docker commands embedded in task descriptions.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Verify prerequisites and prepare project structure

- [x] T001 Verify Docker, Minikube, Helm, and kubectl are installed by running version checks
- [x] T002 Start Minikube cluster with `minikube start` and verify status
- [x] T003 Create Helm chart directory structure at `todo-chatbot-helm/templates/`

**Checkpoint**: Development environment ready, Minikube running, Helm chart directory exists

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Configuration changes to existing code that MUST be complete before any Docker builds

**CRITICAL**: No Docker builds can succeed until this phase is complete

- [x] T004 Add `output: "standalone"` to `frontend/next.config.ts` NextConfig object (keep existing `reactCompiler: true`)
- [x] T005 [P] Create `frontend/.dockerignore` excluding node_modules, .next, .git, .gitignore, .env*, *.md, Dockerfile, .dockerignore
- [x] T006 [P] Create `backend/.dockerignore` excluding __pycache__, *.pyc, *.pyo, venv, .venv, .git, .gitignore, .env*, *.md, Dockerfile, .dockerignore

**Checkpoint**: Frontend configured for standalone output, both .dockerignore files in place

---

## Phase 3: User Story 1 - Containerize Applications (Priority: P1)

**Goal**: Build Docker images for frontend and backend with multi-stage builds, non-root users, and size targets met

**Independent Test**: Run `docker build` for both images, then `docker run` each and verify they serve on ports 3000 and 8000 respectively

### Implementation for User Story 1

- [x] T007 [P] [US1] Create multi-stage Dockerfile at `frontend/Dockerfile` with 3 stages (deps → builder → runner) using node:20-alpine, non-root nextjs user (UID 1001), exposing port 3000 per specs/004-k8s-minikube-deploy/docker-frontend.md
- [x] T008 [P] [US1] Replace single-stage Dockerfile at `backend/Dockerfile` with multi-stage 2-stage build (builder → runner) using python:3.11-slim, non-root appuser (UID 1001), port 8000, uvicorn CMD per specs/004-k8s-minikube-deploy/docker-backend.md
- [x] T009 [US1] Build frontend Docker image with `docker build -t todo-frontend:latest ./frontend` and verify image size < 200MB
- [x] T010 [US1] Build backend Docker image with `docker build -t todo-backend:latest ./backend` and verify image size < 500MB
- [x] T011 [US1] Verify frontend container runs correctly with `docker run -p 3000:3000 todo-frontend:latest` and confirm port 3000 responds
- [x] T012 [US1] Verify backend container runs correctly with `docker run -p 8000:8000 -e COHERE_API_KEY=test -e NEON_DATABASE_URL=test todo-backend:latest` and confirm /docs endpoint responds
- [x] T013 [US1] Load both images into Minikube with `minikube image load todo-frontend:latest` and `minikube image load todo-backend:latest`, verify with `minikube image ls | grep todo`

**Checkpoint**: Both Docker images built, tested locally, and loaded into Minikube. Size targets met. Non-root users verified.

---

## Phase 4: User Story 2 - Deploy on Minikube with Helm (Priority: P2)

**Goal**: Create a complete Helm chart and deploy all resources to Minikube in the todo-app namespace

**Independent Test**: Run `helm install todo-chatbot ./todo-chatbot-helm` and verify all 4 pods reach Ready state

### Implementation for User Story 2

- [x] T014 [P] [US2] Create `todo-chatbot-helm/Chart.yaml` with name: todo-chatbot, version: 1.0.0, appVersion: "4.0" per specs/004-k8s-minikube-deploy/helm-chart.md
- [x] T015 [P] [US2] Create `todo-chatbot-helm/values.yaml` with frontend config (image, 2 replicas, port 3000, resources 250m-500m CPU / 256Mi-512Mi mem), backend config (image, 2 replicas, port 8000, resources 500m-1000m CPU / 512Mi-1Gi mem), config URLs, and empty secret placeholders per specs/004-k8s-minikube-deploy/helm-chart.md
- [x] T016 [P] [US2] Create `todo-chatbot-helm/templates/namespace.yaml` with namespace from values per specs/004-k8s-minikube-deploy/kubernetes-manifests.md
- [x] T017 [P] [US2] Create `todo-chatbot-helm/templates/configmap.yaml` with NEXT_PUBLIC_API_URL and BETTER_AUTH_URL from values.config per specs/004-k8s-minikube-deploy/kubernetes-manifests.md
- [x] T018 [P] [US2] Create `todo-chatbot-helm/templates/secret.yaml` with COHERE_API_KEY, NEON_DATABASE_URL, BETTER_AUTH_SECRET using b64enc from values.secrets per specs/004-k8s-minikube-deploy/helm-chart.md
- [x] T019 [P] [US2] Create `todo-chatbot-helm/templates/frontend-deployment.yaml` with 2 replicas, imagePullPolicy: Never, envFrom configmap, resource limits, liveness probe (GET / :3000, 30s delay), readiness probe (GET / :3000, 10s delay) per specs/004-k8s-minikube-deploy/kubernetes-manifests.md
- [x] T020 [P] [US2] Create `todo-chatbot-helm/templates/frontend-service.yaml` with type LoadBalancer, port 3000, selector app: frontend per specs/004-k8s-minikube-deploy/kubernetes-manifests.md
- [x] T021 [P] [US2] Create `todo-chatbot-helm/templates/backend-deployment.yaml` with 2 replicas, imagePullPolicy: Never, envFrom configmap, env from secret (3 keys), resource limits, liveness probe (GET /docs :8000, 30s delay), readiness probe (GET /docs :8000, 10s delay) per specs/004-k8s-minikube-deploy/kubernetes-manifests.md
- [x] T022 [P] [US2] Create `todo-chatbot-helm/templates/backend-service.yaml` with type ClusterIP, port 8000, selector app: backend per specs/004-k8s-minikube-deploy/kubernetes-manifests.md
- [x] T023 [US2] Validate Helm chart with `helm lint ./todo-chatbot-helm` and `helm template todo-chatbot ./todo-chatbot-helm --set secrets.cohereApiKey=test --set secrets.neonDbUrl=test --set secrets.authSecret=test`
- [x] T024 [US2] Deploy to Minikube with `helm install todo-chatbot ./todo-chatbot-helm --set secrets.cohereApiKey="$COHERE_API_KEY" --set secrets.neonDbUrl="$NEON_DATABASE_URL" --set secrets.authSecret="$BETTER_AUTH_SECRET"`
- [x] T025 [US2] Wait for all pods to reach Ready state with `kubectl wait --for=condition=ready pod -l app=frontend -n todo-app --timeout=300s` and `kubectl wait --for=condition=ready pod -l app=backend -n todo-app --timeout=300s`
- [x] T026 [US2] Verify deployment: `kubectl get all -n todo-app` shows 4 pods Running, 2 services, 2 deployments

**Checkpoint**: Helm chart created, validated, deployed. All 4 pods Running. Services accessible.

---

## Phase 5: User Story 3 - Frontend-Backend Communication in Cluster (Priority: P3)

**Goal**: Verify end-to-end functionality: frontend accessible externally, backend internal only, data flows through entire stack

**Independent Test**: Access frontend URL, create a task, send a chat message, verify responses

### Implementation for User Story 3

- [x] T027 [US3] Get frontend URL with `minikube service frontend-service -n todo-app --url` and verify page loads in browser
- [x] T028 [US3] Verify backend is accessible via port-forward with `kubectl port-forward svc/backend-service 8000:8000 -n todo-app` and confirm /docs endpoint responds
- [ ] T029 [US3] Test frontend-to-backend communication by creating a task through the frontend UI and verifying it persists in the database
- [ ] T030 [US3] Test chat functionality by sending a chat message through the frontend and verifying AI response is returned via Cohere API
- [x] T031 [US3] Verify containers run as non-root with `kubectl exec <frontend-pod> -n todo-app -- whoami` (expect: nextjs) and `kubectl exec <backend-pod> -n todo-app -- whoami` (expect: appuser)
- [x] T032 [US3] Verify backend ClusterIP is not accessible from outside the cluster (direct external access should be refused)

**Checkpoint**: All user stories verified. End-to-end flow works. Security constraints met.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Operations verification, scaling, rollback, and monitoring

- [x] T033 [P] Enable metrics-server with `minikube addons enable metrics-server` and check resource usage with `kubectl top pods -n todo-app`
- [x] T034 Test scaling with `kubectl scale deployment/frontend --replicas=3 -n todo-app` and verify 3 frontend pods running
- [x] T035 Test Helm upgrade by modifying values.yaml (e.g., change frontend replicas to 3), running `helm upgrade todo-chatbot ./todo-chatbot-helm`, and verifying change applied
- [x] T036 Test Helm rollback with `helm rollback todo-chatbot` and verify previous state restored
- [ ] T037 [P] Test kubectl-ai operations: `kubectl ai "show all resources in todo-app namespace"` and `kubectl ai "check pod health in todo-app namespace"`
- [x] T038 Verify pod logs are clean with `kubectl logs deployment/frontend -n todo-app` and `kubectl logs deployment/backend -n todo-app` (no error-level messages)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 - BLOCKS all Docker builds
- **US1 Containerize (Phase 3)**: Depends on Phase 2 completion
- **US2 Helm Deploy (Phase 4)**: Depends on Phase 3 (needs built images loaded in Minikube)
- **US3 E2E Verification (Phase 5)**: Depends on Phase 4 (needs running deployment)
- **Polish (Phase 6)**: Depends on Phase 5

### User Story Dependencies

- **US1 (P1)**: Independent after Foundational - containerization only
- **US2 (P2)**: Depends on US1 - needs Docker images loaded in Minikube
- **US3 (P3)**: Depends on US2 - needs running deployment to test

### Within Each User Story

- US1: Dockerfiles (T007, T008) [P] → Build images (T009, T010) → Verify (T011, T012) → Load (T013)
- US2: Chart + values + all templates (T014-T022) [P] → Lint (T023) → Deploy (T024) → Wait (T025) → Verify (T026)
- US3: Frontend access (T027) → Backend access (T028) → E2E tests (T029-T032) sequential

### Parallel Opportunities

- **Phase 2**: T005 and T006 (.dockerignore files) are parallelizable
- **Phase 3**: T007 and T008 (Dockerfiles) are parallelizable
- **Phase 4**: T014-T022 (all Helm chart files) are parallelizable - they are independent files
- **Phase 6**: T033 and T037 are parallelizable

---

## Parallel Example: User Story 2

```bash
# Launch all Helm chart template files together (all independent):
Task: "Create todo-chatbot-helm/Chart.yaml"
Task: "Create todo-chatbot-helm/values.yaml"
Task: "Create todo-chatbot-helm/templates/namespace.yaml"
Task: "Create todo-chatbot-helm/templates/configmap.yaml"
Task: "Create todo-chatbot-helm/templates/secret.yaml"
Task: "Create todo-chatbot-helm/templates/frontend-deployment.yaml"
Task: "Create todo-chatbot-helm/templates/frontend-service.yaml"
Task: "Create todo-chatbot-helm/templates/backend-deployment.yaml"
Task: "Create todo-chatbot-helm/templates/backend-service.yaml"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (next.config.ts + .dockerignore files)
3. Complete Phase 3: User Story 1 (Docker images)
4. **STOP and VALIDATE**: Both images build, run locally, meet size targets
5. Images loaded into Minikube

### Incremental Delivery

1. Phase 1 + 2: Environment ready
2. Phase 3 (US1): Docker images built and loaded (MVP!)
3. Phase 4 (US2): Helm chart + deployment on Minikube
4. Phase 5 (US3): End-to-end verification complete
5. Phase 6: Operations and monitoring verified

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- This feature is strictly sequential: US1 → US2 → US3 (each depends on previous)
- No application code changes - only infrastructure files
- All verification is manual (kubectl, docker, browser)
- Commit after each phase completes
