# Feature Specification: Kubernetes Minikube Deployment

**Feature Branch**: `004-k8s-minikube-deploy`
**Created**: 2026-02-06
**Status**: Draft
**Input**: Containerize Phase 3 Todo Chatbot (Next.js + FastAPI + Cohere) and deploy on local Kubernetes using Docker, Minikube, and Helm charts.

## User Scenarios & Testing

### User Story 1 - Containerize Applications (Priority: P1)

A developer builds Docker images for the frontend (Next.js) and backend (FastAPI) applications using multi-stage builds that produce minimal, production-ready containers.

**Why this priority**: Without container images, no Kubernetes deployment is possible. This is the foundational step.

**Independent Test**: Build both Docker images locally, run each container independently, and verify the applications respond on their respective ports (3000 and 8000).

**Acceptance Scenarios**:

1. **Given** the frontend source code, **When** `docker build -t todo-frontend:latest ./frontend` is run, **Then** a Docker image under 200MB is produced that serves the Next.js application on port 3000.
2. **Given** the backend source code, **When** `docker build -t todo-backend:latest ./backend` is run, **Then** a Docker image under 500MB is produced that serves the FastAPI application on port 8000.
3. **Given** either container, **When** inspected, **Then** the process runs as a non-root user.

---

### User Story 2 - Deploy on Minikube with Helm (Priority: P2)

A developer deploys both containerized applications to a local Minikube cluster using a Helm chart, with all configuration managed through values.yaml and secrets passed at install time.

**Why this priority**: Helm-based deployment is the primary delivery mechanism and depends on working container images from US1.

**Independent Test**: Run `helm install todo-chatbot ./todo-chatbot-helm` on a running Minikube cluster and verify all pods reach Ready state within 5 minutes.

**Acceptance Scenarios**:

1. **Given** a running Minikube cluster and built images loaded into Minikube, **When** `helm install todo-chatbot ./todo-chatbot-helm` is run with secret values, **Then** the `todo-app` namespace is created with 2 frontend pods and 2 backend pods, all in Ready state.
2. **Given** a deployed Helm release, **When** `kubectl get svc -n todo-app` is run, **Then** a LoadBalancer service for frontend and a ClusterIP service for backend are listed.
3. **Given** a deployed Helm release, **When** `minikube service frontend-service -n todo-app` is run, **Then** the application opens in a browser and is accessible.

---

### User Story 3 - Frontend-Backend Communication in Cluster (Priority: P3)

A user accesses the frontend through the Minikube LoadBalancer and the frontend communicates with the backend via the internal Kubernetes ClusterIP service.

**Why this priority**: End-to-end connectivity validates that the deployment is functionally complete.

**Independent Test**: Access the frontend URL, perform a task CRUD operation, and verify data round-trips through the backend to the Neon database and back.

**Acceptance Scenarios**:

1. **Given** a fully deployed cluster, **When** a user accesses the frontend and creates a task, **Then** the task is persisted in Neon PostgreSQL via the backend service.
2. **Given** a fully deployed cluster, **When** a user sends a chat message, **Then** the Cohere API processes it and returns a response through the backend.
3. **Given** the backend service is internal only (ClusterIP), **When** accessed from outside the cluster directly, **Then** the connection is refused (only frontend is externally accessible).

---

### Edge Cases

- What happens when Minikube is not started before deployment? Helm install fails with a clear connection error.
- What happens when Docker images are not loaded into Minikube? Pods enter ImagePullBackOff state since `imagePullPolicy: Never` is set.
- What happens when secret values are empty or missing? Backend pods fail readiness probes and remain in CrashLoopBackOff.
- What happens when resource limits are exceeded? Kubernetes OOMKills the pod and restarts it per liveness probe configuration.

## Requirements

### Functional Requirements

- **FR-001**: System MUST produce Docker images via multi-stage builds (frontend < 200MB, backend < 500MB).
- **FR-002**: All containers MUST run as non-root users (nextjs:1001 for frontend, appuser:1001 for backend).
- **FR-003**: System MUST deploy to a `todo-app` namespace on Minikube via a single Helm chart.
- **FR-004**: Frontend MUST be externally accessible via a LoadBalancer service on port 3000.
- **FR-005**: Backend MUST be internally accessible only via ClusterIP service on port 8000.
- **FR-006**: All sensitive values (API keys, database URL, auth secret) MUST be stored in Kubernetes Secrets.
- **FR-007**: All non-sensitive configuration (API URLs) MUST be stored in a ConfigMap.
- **FR-008**: Each deployment MUST have liveness and readiness probes configured.
- **FR-009**: Resource requests and limits MUST be set on all containers (frontend: 250m-500m CPU, 256Mi-512Mi RAM; backend: 500m-1000m CPU, 512Mi-1Gi RAM).
- **FR-010**: Helm chart MUST support `helm upgrade` and `helm rollback` operations.
- **FR-011**: Frontend pods MUST be able to reach backend pods at `http://backend-service:8000`.
- **FR-012**: System MUST support kubectl-ai commands for cluster operations.

### Key Entities

- **Docker Image**: Container artifact with application code, dependencies, and runtime configuration.
- **Helm Chart**: Packaging unit containing all Kubernetes manifests parameterized via values.yaml.
- **Deployment**: Kubernetes workload managing pod replicas with rolling update strategy.
- **Service**: Kubernetes networking abstraction exposing pods (LoadBalancer or ClusterIP).
- **ConfigMap/Secret**: Kubernetes configuration objects injecting environment variables into pods.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Both Docker images build successfully from source in under 5 minutes each.
- **SC-002**: All 4 pods (2 frontend, 2 backend) reach Ready state within 5 minutes of Helm install.
- **SC-003**: Frontend is accessible via browser through Minikube service URL.
- **SC-004**: Backend /docs endpoint responds when port-forwarded for debugging.
- **SC-005**: End-to-end task creation works: user creates a task via frontend, it persists in the database.
- **SC-006**: Chat functionality works: user sends a message, receives an AI-generated response.
- **SC-007**: `helm rollback todo-chatbot` restores the previous deployment state successfully.
- **SC-008**: No container runs as root (verified via `kubectl exec` or image inspection).

## Assumptions

- Minikube is installed and configured on the developer machine.
- Docker is installed and the daemon is running.
- Helm 3 is installed.
- kubectl is installed and configured to connect to Minikube.
- The Neon PostgreSQL database is already provisioned and accessible from the Minikube cluster (external network access available).
- The Phase 3 frontend and backend source code is functional and ready for containerization.
- kubectl-ai plugin is installed separately by the developer.

## Sub-Specifications

Detailed implementation specifications are provided in separate files:

1. [docker-frontend.md](docker-frontend.md) - Frontend Dockerfile and build process
2. [docker-backend.md](docker-backend.md) - Backend Dockerfile and build process
3. [kubernetes-manifests.md](kubernetes-manifests.md) - All Kubernetes resource definitions
4. [helm-chart.md](helm-chart.md) - Helm chart structure and templates
5. [deployment-workflow.md](deployment-workflow.md) - Step-by-step deployment process
6. [testing-monitoring.md](testing-monitoring.md) - Health checks, monitoring, and troubleshooting
