---
id: 003
title: Phase 4 Kubernetes Constitution Update
stage: constitution
date: 2026-02-06
surface: agent
model: claude-opus-4-6
feature: none
branch: main
user: sumair-khan21
command: /sp.constitution
labels: ["constitution", "kubernetes", "docker", "helm", "minikube", "phase4"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - n/a
---

## Prompt

You are a Cloud-Native Architecture Expert creating the constitutional document for deploying Todo Chatbot on local Kubernetes (Minikube).

CONTEXT:
Phase 4 containerizes Phase 3 Todo Chatbot (Next.js + FastAPI + Cohere) and deploys on local Kubernetes using Minikube and Helm.

EXISTING SYSTEM (Phase 3):
- Frontend: Next.js
- Backend: FastAPI + Cohere API
- Database: Neon PostgreSQL (external)
- Auth: Better Auth JWT

NEW REQUIREMENTS (Phase 4):
- Containerize with Docker (multi-stage builds)
- Deploy on Minikube (local Kubernetes)
- Use Helm charts for packaging
- Use kubectl-ai for operations
- Production-ready cloud-native setup

YOUR TASK:
Create constitution.md with these 6 core sections:

1. CONTAINERIZATION STRATEGY - Docker images for frontend (node:20-alpine, <200MB) and backend (python:3.11-slim, <500MB) with multi-stage builds, non-root user, .dockerignore, env via ConfigMaps/Secrets.

2. KUBERNETES ARCHITECTURE - Minikube cluster with todo-app namespace, frontend (2 replicas, LoadBalancer) and backend (2 replicas, ClusterIP) deployments, ConfigMap and Secret resources, resource limits.

3. HELM CHART STRUCTURE - todo-chatbot-helm/ with Chart.yaml, values.yaml, and templates for all deployments, services, configmap, and secret.

4. ENVIRONMENT VARIABLES - Frontend gets NEXT_PUBLIC_API_URL, backend gets COHERE_API_KEY, NEON_DATABASE_URL, BETTER_AUTH_SECRET from Secrets, BETTER_AUTH_URL from ConfigMap.

5. DEPLOYMENT WORKFLOW - Build images, load into Minikube, helm install, verify with kubectl, access via minikube service, kubectl-ai operations.

6. QUALITY & MONITORING - Liveness/readiness probes, kubectl logs, kubectl top, helm rollback.

CONSTRAINTS: Under 1000 words, local Minikube only, imperative language, skip optional tools.

## Response snapshot

Updated constitution from v2.0.0 to v3.0.0 (MAJOR bump). Retained all Phase 2/3 sections (principles I-VI, tech stack, security, API conventions, Cohere config, MCP tools, DB schema, chat architecture, agent architecture). Added new Principle VII (Container-First Deployment). Replaced old Section 13 (Deployment Integration) with 6 new cloud-native sections: Containerization Strategy (13), Kubernetes Architecture (14), Helm Chart Structure (15), Environment & Secrets Management (16), Deployment Workflow (17), Quality & Monitoring (18). Renumbered Quality Gates to 19 and Governance to 20. All templates validated as compatible.

## Outcome

- Impact: MAJOR version bump (2.0.0 → 3.0.0), new deployment architecture layer
- Tests: n/a (constitution document, no code)
- Files: .specify/memory/constitution.md (overwritten)
- Next prompts: /sp.specify for Phase 4 feature spec, /sp.plan for implementation plan
- Reflection: Clean evolution from Phase 3; all existing sections preserved, new cloud-native layer added as additive sections

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Manual validation PASS - no unresolved placeholders, version matches report, dates ISO format
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): n/a
