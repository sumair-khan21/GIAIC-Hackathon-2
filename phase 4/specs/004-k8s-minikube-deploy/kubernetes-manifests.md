# Kubernetes Manifests Specification

## Overview

All Kubernetes resource definitions for deploying the Todo Chatbot on Minikube. Resources are created in the `todo-app` namespace with ConfigMap for non-sensitive config and Secret for credentials.

## Namespace

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: todo-app
```

## ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: todo-config
  namespace: todo-app
data:
  NEXT_PUBLIC_API_URL: "http://backend-service:8000"
  BETTER_AUTH_URL: "http://frontend-service:3000"
```

## Secret

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: todo-secrets
  namespace: todo-app
type: Opaque
data:
  COHERE_API_KEY: <base64-encoded>
  NEON_DATABASE_URL: <base64-encoded>
  BETTER_AUTH_SECRET: <base64-encoded>
```

## Frontend Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: todo-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: todo-frontend:latest
        imagePullPolicy: Never
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: todo-config
        resources:
          requests:
            cpu: "250m"
            memory: "256Mi"
          limits:
            cpu: "500m"
            memory: "512Mi"
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
```

## Backend Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: todo-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: todo-backend:latest
        imagePullPolicy: Never
        ports:
        - containerPort: 8000
        envFrom:
        - configMapRef:
            name: todo-config
        env:
        - name: COHERE_API_KEY
          valueFrom:
            secretKeyRef:
              name: todo-secrets
              key: COHERE_API_KEY
        - name: NEON_DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: todo-secrets
              key: NEON_DATABASE_URL
        - name: BETTER_AUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: todo-secrets
              key: BETTER_AUTH_SECRET
        resources:
          requests:
            cpu: "500m"
            memory: "512Mi"
          limits:
            cpu: "1000m"
            memory: "1Gi"
        livenessProbe:
          httpGet:
            path: /docs
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /docs
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5
```

## Frontend Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: todo-app
spec:
  type: LoadBalancer
  selector:
    app: frontend
  ports:
  - protocol: TCP
    port: 3000
    targetPort: 3000
```

## Backend Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: todo-app
spec:
  type: ClusterIP
  selector:
    app: backend
  ports:
  - protocol: TCP
    port: 8000
    targetPort: 8000
```

## Verification

```bash
# Check all resources
kubectl get all -n todo-app

# Verify pods are running
kubectl get pods -n todo-app -o wide

# Verify services
kubectl get svc -n todo-app

# Verify configmap
kubectl describe configmap todo-config -n todo-app

# Verify secret exists (not values)
kubectl get secret todo-secrets -n todo-app
```

## Key Design Decisions

- `imagePullPolicy: Never` because images are loaded directly into Minikube (no registry).
- Frontend uses `envFrom` for ConfigMap since all values are non-sensitive.
- Backend uses individual `valueFrom` for Secrets to inject only specific keys.
- LoadBalancer for frontend works with `minikube tunnel` or `minikube service`.
- ClusterIP for backend ensures it is only reachable from within the cluster.
