# Quickstart: Deploy Todo Chatbot on Minikube

## Prerequisites

Ensure these tools are installed:

```bash
docker --version        # Docker 20+
minikube version        # Minikube 1.30+
helm version            # Helm 3.x
kubectl version --client # kubectl 1.27+
```

## Step 1: Start Minikube

```bash
minikube start
minikube status
```

## Step 2: Build Docker Images

```bash
# From project root
docker build -t todo-frontend:latest ./frontend
docker build -t todo-backend:latest ./backend
```

Verify sizes:
```bash
docker images | grep todo
# todo-frontend   latest   ...   < 200MB
# todo-backend    latest   ...   < 500MB
```

## Step 3: Load Images into Minikube

```bash
minikube image load todo-frontend:latest
minikube image load todo-backend:latest

# Verify
minikube image ls | grep todo
```

## Step 4: Deploy with Helm

```bash
helm install todo-chatbot ./todo-chatbot-helm \
  --set secrets.cohereApiKey="YOUR_COHERE_API_KEY" \
  --set secrets.neonDbUrl="YOUR_NEON_DATABASE_URL" \
  --set secrets.authSecret="YOUR_BETTER_AUTH_SECRET"
```

## Step 5: Wait for Pods

```bash
kubectl wait --for=condition=ready pod \
  -l app=frontend -n todo-app --timeout=300s

kubectl wait --for=condition=ready pod \
  -l app=backend -n todo-app --timeout=300s
```

## Step 6: Access the Application

```bash
minikube service frontend-service -n todo-app --url
```

Open the URL in your browser.

## Verify Deployment

```bash
# All resources
kubectl get all -n todo-app

# Expected: 2 frontend pods, 2 backend pods (all Running)
# Expected: frontend-service (LoadBalancer), backend-service (ClusterIP)
```

## Teardown

```bash
helm uninstall todo-chatbot -n todo-app
kubectl delete namespace todo-app
minikube stop
```

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Pods in ImagePullBackOff | Re-run `minikube image load` for both images |
| Pods in CrashLoopBackOff | Check logs: `kubectl logs <pod> -n todo-app` |
| Frontend can't reach backend | Verify ConfigMap: `kubectl describe cm todo-config -n todo-app` |
| Service stuck on `<pending>` | Run `minikube tunnel` in separate terminal |
| Helm install fails | Check: `minikube status`, `helm lint ./todo-chatbot-helm` |
