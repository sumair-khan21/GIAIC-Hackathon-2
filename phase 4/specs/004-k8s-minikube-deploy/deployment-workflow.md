# Deployment Workflow Specification

## Overview

Step-by-step process to build, deploy, and access the Todo Chatbot on a local Minikube cluster. Covers both raw kubectl and Helm deployment paths.

## Prerequisites

- Docker daemon running
- Minikube installed and started
- Helm 3 installed
- kubectl configured for Minikube

## Step-by-Step Deployment

### 1. Start Minikube

```bash
minikube start
minikube status
```

### 2. Build Docker Images

```bash
# Build frontend
docker build -t todo-frontend:latest ./frontend

# Build backend
docker build -t todo-backend:latest ./backend

# Verify images
docker images | grep todo
```

### 3. Load Images into Minikube

```bash
minikube image load todo-frontend:latest
minikube image load todo-backend:latest

# Verify images in Minikube
minikube image ls | grep todo
```

### 4. Deploy with Helm (Recommended)

```bash
helm install todo-chatbot ./todo-chatbot-helm \
  --set secrets.cohereApiKey="your_cohere_key" \
  --set secrets.neonDbUrl="your_neon_url" \
  --set secrets.authSecret="your_auth_secret"
```

### 5. Verify Deployment

```bash
# Check all resources
kubectl get all -n todo-app

# Wait for pods to be ready
kubectl wait --for=condition=ready pod \
  -l app=frontend -n todo-app --timeout=300s
kubectl wait --for=condition=ready pod \
  -l app=backend -n todo-app --timeout=300s
```

### 6. Access Application

```bash
# Get frontend URL via Minikube
minikube service frontend-service -n todo-app --url

# Or use port-forward
kubectl port-forward svc/frontend-service 3000:3000 -n todo-app
```

## Alternative: kubectl Apply (Without Helm)

```bash
# Create namespace
kubectl create namespace todo-app

# Create secrets
kubectl create secret generic todo-secrets \
  --from-literal=COHERE_API_KEY="your_key" \
  --from-literal=NEON_DATABASE_URL="your_url" \
  --from-literal=BETTER_AUTH_SECRET="your_secret" \
  -n todo-app

# Apply manifests in order
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

## kubectl-ai Operations

```bash
kubectl ai "show all resources in todo-app namespace"
kubectl ai "scale frontend to 3 replicas in todo-app"
kubectl ai "check pod health in todo-app namespace"
kubectl ai "show logs for backend pods with errors"
kubectl ai "describe frontend deployment in todo-app"
```

## Update Workflow

```bash
# After code changes, rebuild and reload
docker build -t todo-frontend:latest ./frontend
minikube image load todo-frontend:latest

# Restart deployment to pick up new image
kubectl rollout restart deployment/frontend -n todo-app

# Or upgrade via Helm
helm upgrade todo-chatbot ./todo-chatbot-helm
```

## Rollback

```bash
# Helm rollback
helm rollback todo-chatbot

# Check rollback
helm history todo-chatbot
```

## Teardown

```bash
# Remove Helm release
helm uninstall todo-chatbot -n todo-app

# Delete namespace (removes everything)
kubectl delete namespace todo-app

# Stop Minikube
minikube stop
```

## Verification Checklist

1. `minikube status` shows Running
2. `docker images | grep todo` shows both images
3. `minikube image ls | grep todo` shows both images loaded
4. `kubectl get pods -n todo-app` shows 4 pods (2+2) in Running state
5. `kubectl get svc -n todo-app` shows frontend (LoadBalancer) and backend (ClusterIP)
6. Frontend URL loads in browser
7. Backend `/docs` accessible via port-forward
