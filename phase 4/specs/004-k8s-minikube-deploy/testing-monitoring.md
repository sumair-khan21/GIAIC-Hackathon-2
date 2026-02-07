# Testing & Monitoring Specification

## Overview

Health check configuration, monitoring commands, and troubleshooting procedures for the Todo Chatbot running on Minikube. All commands target the `todo-app` namespace.

## Health Checks

### Pod Status

```bash
kubectl get pods -n todo-app
kubectl get pods -n todo-app -o wide
```

### Pod Details

```bash
kubectl describe pod <pod-name> -n todo-app
```

### Logs

```bash
# Stream frontend logs
kubectl logs -f deployment/frontend -n todo-app

# Stream backend logs
kubectl logs -f deployment/backend -n todo-app

# Logs from a specific pod
kubectl logs <pod-name> -n todo-app

# Previous container logs (after crash)
kubectl logs <pod-name> -n todo-app --previous
```

### Port Forwarding for Manual Testing

```bash
# Frontend
kubectl port-forward svc/frontend-service 3000:3000 -n todo-app

# Backend (for API testing)
kubectl port-forward svc/backend-service 8000:8000 -n todo-app
```

## Resource Monitoring

```bash
# Enable metrics (required once)
minikube addons enable metrics-server

# Pod resource usage
kubectl top pods -n todo-app

# Node resource usage
kubectl top nodes

# Cluster events (sorted by time)
kubectl get events -n todo-app --sort-by='.lastTimestamp'
```

## Troubleshooting Guide

### Pod Not Starting (Pending/CrashLoopBackOff)

```bash
# Check pod events
kubectl describe pod <pod-name> -n todo-app

# Check container logs
kubectl logs <pod-name> -n todo-app

# Common causes:
# - Missing env vars → check Secret/ConfigMap
# - Image not found → check minikube image ls
# - Resource limits → check kubectl top
```

### Image Pull Issues

```bash
# Verify images in Minikube
minikube image ls | grep todo

# Reload if missing
minikube image load todo-frontend:latest
minikube image load todo-backend:latest
```

### Service Not Accessible

```bash
# Check services exist
kubectl get svc -n todo-app

# List all Minikube services
minikube service list

# Get frontend URL
minikube service frontend-service -n todo-app --url

# If LoadBalancer stuck on <pending>, use:
minikube tunnel
```

### Frontend Cannot Reach Backend

```bash
# Verify backend service exists
kubectl get svc backend-service -n todo-app

# Test from within a pod
kubectl exec -it <frontend-pod> -n todo-app -- \
  wget -qO- http://backend-service:8000/docs

# Check ConfigMap has correct API URL
kubectl describe configmap todo-config -n todo-app
```

### Delete and Recreate

```bash
# Delete a specific pod (auto-recreated by deployment)
kubectl delete pod <pod-name> -n todo-app

# Restart all pods in a deployment
kubectl rollout restart deployment/backend -n todo-app

# Full teardown and redeploy
helm uninstall todo-chatbot -n todo-app
helm install todo-chatbot ./todo-chatbot-helm \
  --set secrets.cohereApiKey="key" \
  --set secrets.neonDbUrl="url" \
  --set secrets.authSecret="secret"
```

## Testing Checklist

- [ ] Pods running: 2 frontend, 2 backend (all in Ready state)
- [ ] Services created: frontend-service (LoadBalancer), backend-service (ClusterIP)
- [ ] Frontend loads in browser via Minikube URL
- [ ] Backend /docs endpoint accessible via port-forward
- [ ] Frontend can communicate with backend (create a task)
- [ ] Database connection works (task persists after page reload)
- [ ] Cohere API integration works (send a chat message)
- [ ] Chat functionality returns AI response
- [ ] Task CRUD operations work end-to-end
- [ ] User authentication works (login/register)
- [ ] Containers run as non-root (verify with kubectl exec)
- [ ] Resource limits are enforced (check kubectl describe pod)
- [ ] Liveness probes pass (pods not restarting unexpectedly)
- [ ] Readiness probes pass (pods show Ready)
- [ ] Helm rollback restores previous state
