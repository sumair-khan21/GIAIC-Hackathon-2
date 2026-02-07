# Research: Kubernetes Minikube Deployment

**Feature**: 004-k8s-minikube-deploy
**Date**: 2026-02-07

## R1: Next.js Standalone Output with TypeScript Config

**Context**: The frontend uses `next.config.ts` (TypeScript), not `.js`. The
Docker multi-stage build requires `output: "standalone"` to produce a
self-contained `server.js` with all dependencies bundled.

**Decision**: Add `output: "standalone"` to the existing NextConfig object in
`next.config.ts`.

**Rationale**: The `output` property is part of the `NextConfig` TypeScript type
and is fully supported in .ts config files. No conversion to .js is needed.

**Alternatives considered**:
- Convert to `next.config.js` — rejected: unnecessary file churn, .ts works.
- Use `next export` (static) — rejected: requires `output: "export"` which
  disables API routes and server components.

**Verification**: After adding the property, `npm run build` must produce a
`.next/standalone/` directory containing `server.js`.

---

## R2: Backend Dockerfile Port Change (7860 → 8000)

**Context**: The existing `backend/Dockerfile` uses port 7860 (Hugging Face
Spaces convention). The Kubernetes backend-service spec maps to port 8000.

**Decision**: Replace the entire Dockerfile with the spec-compliant version
using port 8000.

**Rationale**: The Kubernetes backend-service targets port 8000. Keeping 7860
and remapping in the K8s service would create a confusing mismatch between
the container's actual port and the documented port. The constitution
(Section 14) standardizes backend on port 8000.

**Alternatives considered**:
- Remap 7860→8000 in K8s service `targetPort` — rejected: adds confusion.
- Keep 7860 everywhere — rejected: violates constitution port standard.

---

## R3: Helm-Only Deployment (No Separate k8s/ Directory)

**Context**: The spec mentions both raw `kubectl apply` and Helm as deployment
options. Maintaining both a `k8s/` directory and a `todo-chatbot-helm/`
directory would create duplication.

**Decision**: Create only the Helm chart directory. No separate `k8s/` dir.

**Rationale**: Helm templates serve as the single source of truth for all
Kubernetes manifests. Raw YAML can be generated on demand with
`helm template`. Maintaining two sets of manifests invites drift.

**Alternatives considered**:
- Both `k8s/` and Helm — rejected: duplication risk, maintenance burden.
- Only `k8s/`, no Helm — rejected: loses parameterization, upgrade, rollback.

---

## R4: imagePullPolicy: Never

**Context**: Docker images are built locally and loaded into Minikube via
`minikube image load`. There is no container registry.

**Decision**: Set `imagePullPolicy: Never` on all container specs.

**Rationale**: With no registry, Kubernetes would default to attempting a pull
from Docker Hub, which would fail. "Never" tells Kubernetes to only use
locally available images, which matches our `minikube image load` workflow.

**Alternatives considered**:
- `eval $(minikube docker-env)` to build inside Minikube — rejected: more
  complex workflow, not portable.
- Local registry addon — rejected: adds infrastructure complexity for no
  benefit in local dev.

---

## R5: Secret Handling via Helm --set Flags

**Context**: Secrets (COHERE_API_KEY, NEON_DATABASE_URL, BETTER_AUTH_SECRET)
must be injected at deploy time without being committed to source.

**Decision**: Pass secrets via `helm install --set` flags. Helm template uses
`b64enc` to base64-encode values for the K8s Secret resource.

**Rationale**: This is the simplest approach for local development that keeps
secrets out of version control. The values.yaml defaults are empty strings.

**Alternatives considered**:
- External Secrets Operator — rejected: overkill for local Minikube.
- helm-secrets plugin with SOPS — rejected: adds dependency chain.
- Manually create K8s secret before helm install — rejected: extra step,
  not managed by Helm lifecycle.

---

## R6: Health Probe Endpoints

**Context**: Each deployment needs liveness and readiness probes. The probe
endpoint must exist and return 200 OK when the application is healthy.

**Decision**:
- Frontend: `GET /` on port 3000 (Next.js serves the home page)
- Backend: `GET /docs` on port 8000 (FastAPI Swagger UI endpoint)

**Rationale**: Both endpoints are built-in, require no additional code, and
accurately reflect application health. If the app crashes, these endpoints
stop responding, triggering probe failure.

**Alternatives considered**:
- Custom `/health` endpoint — rejected: requires code changes to existing
  application (this is infra-only).
- TCP probe — rejected: less reliable, only checks port is open, not app health.
