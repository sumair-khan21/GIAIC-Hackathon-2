# Data Model: Kubernetes Minikube Deployment

**Feature**: 004-k8s-minikube-deploy
**Date**: 2026-02-07

## Overview

This feature introduces no new application-level data models. The existing
database schema (users, tasks, conversations, messages) is unchanged. This
document describes the Kubernetes resource entities that constitute the
deployment infrastructure.

## Kubernetes Resource Entities

### Namespace

| Field | Value |
|-------|-------|
| Name | `todo-app` |
| Purpose | Isolate all Todo Chatbot resources |

### ConfigMap: todo-config

| Key | Value | Consumed By |
|-----|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://backend-service:8000` | Frontend |
| `BETTER_AUTH_URL` | `http://frontend-service:3000` | Backend |

### Secret: todo-secrets

| Key | Encoding | Consumed By |
|-----|----------|-------------|
| `COHERE_API_KEY` | Base64 | Backend |
| `NEON_DATABASE_URL` | Base64 | Backend |
| `BETTER_AUTH_SECRET` | Base64 | Backend |

### Deployment: frontend

| Field | Value |
|-------|-------|
| Replicas | 2 |
| Image | `todo-frontend:latest` |
| Port | 3000 |
| CPU request/limit | 250m / 500m |
| Memory request/limit | 256Mi / 512Mi |
| Liveness probe | HTTP GET / :3000 (30s delay, 10s period) |
| Readiness probe | HTTP GET / :3000 (10s delay, 5s period) |
| Env source | ConfigMap (todo-config) |

### Deployment: backend

| Field | Value |
|-------|-------|
| Replicas | 2 |
| Image | `todo-backend:latest` |
| Port | 8000 |
| CPU request/limit | 500m / 1000m |
| Memory request/limit | 512Mi / 1Gi |
| Liveness probe | HTTP GET /docs :8000 (30s delay, 10s period) |
| Readiness probe | HTTP GET /docs :8000 (10s delay, 5s period) |
| Env source | ConfigMap (todo-config) + Secret (todo-secrets) |

### Service: frontend-service

| Field | Value |
|-------|-------|
| Type | LoadBalancer |
| Port | 3000 → 3000 |
| Selector | `app: frontend` |

### Service: backend-service

| Field | Value |
|-------|-------|
| Type | ClusterIP |
| Port | 8000 → 8000 |
| Selector | `app: backend` |

## Entity Relationships

```
Namespace (todo-app)
├── ConfigMap (todo-config)
│   ├── → frontend Deployment (envFrom)
│   └── → backend Deployment (envFrom)
├── Secret (todo-secrets)
│   └── → backend Deployment (env valueFrom)
├── frontend Deployment
│   └── → frontend-service (selector: app=frontend)
└── backend Deployment
    └── → backend-service (selector: app=backend)

External:
  frontend pods → backend-service:8000 (in-cluster DNS)
  backend pods → Neon PostgreSQL (external)
  backend pods → Cohere API (external)
```

## Helm Chart Entity (values.yaml)

The Helm chart's `values.yaml` parameterizes all entities above. The
relationship between values.yaml keys and Kubernetes resources:

| values.yaml Path | K8s Resource | Field |
|-----------------|--------------|-------|
| `namespace` | Namespace | `metadata.name` |
| `frontend.name` | Deployment, Service | `metadata.name`, `selector` |
| `frontend.image` | Deployment | `spec.containers[0].image` |
| `frontend.replicas` | Deployment | `spec.replicas` |
| `frontend.port` | Deployment, Service | `containerPort`, `targetPort` |
| `frontend.resources` | Deployment | `spec.containers[0].resources` |
| `frontend.service.type` | Service | `spec.type` |
| `backend.*` | (same pattern as frontend) | (same fields) |
| `config.apiUrl` | ConfigMap | `data.NEXT_PUBLIC_API_URL` |
| `config.authUrl` | ConfigMap | `data.BETTER_AUTH_URL` |
| `secrets.*` | Secret | `data.*` (b64enc) |
