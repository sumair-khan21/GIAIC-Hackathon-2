# Helm Chart Specification

## Overview

Helm 3 chart that packages all Kubernetes resources for the Todo Chatbot. All configuration is parameterized through `values.yaml`. Secrets are passed at install time via `--set` flags and MUST never be committed to source.

## Chart Structure

```
todo-chatbot-helm/
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

## Chart.yaml

```yaml
apiVersion: v2
name: todo-chatbot
description: AI-powered Todo Chatbot on Kubernetes
type: application
version: 1.0.0
appVersion: "4.0"
```

## values.yaml

```yaml
namespace: todo-app

frontend:
  name: frontend
  image: todo-frontend:latest
  replicas: 2
  port: 3000
  service:
    type: LoadBalancer
  resources:
    requests:
      cpu: 250m
      memory: 256Mi
    limits:
      cpu: 500m
      memory: 512Mi
  probes:
    path: /
    livenessDelay: 30
    readinessDelay: 10

backend:
  name: backend
  image: todo-backend:latest
  replicas: 2
  port: 8000
  service:
    type: ClusterIP
  resources:
    requests:
      cpu: 500m
      memory: 512Mi
    limits:
      cpu: 1000m
      memory: 1Gi
  probes:
    path: /docs
    livenessDelay: 30
    readinessDelay: 10

config:
  apiUrl: "http://backend-service:8000"
  authUrl: "http://frontend-service:3000"

secrets:
  cohereApiKey: ""
  neonDbUrl: ""
  authSecret: ""
```

## Template Examples

### templates/namespace.yaml

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: {{ .Values.namespace }}
```

### templates/frontend-deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Values.frontend.name }}
  namespace: {{ .Values.namespace }}
spec:
  replicas: {{ .Values.frontend.replicas }}
  selector:
    matchLabels:
      app: {{ .Values.frontend.name }}
  template:
    metadata:
      labels:
        app: {{ .Values.frontend.name }}
    spec:
      containers:
      - name: {{ .Values.frontend.name }}
        image: {{ .Values.frontend.image }}
        imagePullPolicy: Never
        ports:
        - containerPort: {{ .Values.frontend.port }}
        envFrom:
        - configMapRef:
            name: todo-config
        resources:
          {{- toYaml .Values.frontend.resources | nindent 10 }}
        livenessProbe:
          httpGet:
            path: {{ .Values.frontend.probes.path }}
            port: {{ .Values.frontend.port }}
          initialDelaySeconds: {{ .Values.frontend.probes.livenessDelay }}
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: {{ .Values.frontend.probes.path }}
            port: {{ .Values.frontend.port }}
          initialDelaySeconds: {{ .Values.frontend.probes.readinessDelay }}
          periodSeconds: 5
```

### templates/secret.yaml

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: todo-secrets
  namespace: {{ .Values.namespace }}
type: Opaque
data:
  COHERE_API_KEY: {{ .Values.secrets.cohereApiKey | b64enc | quote }}
  NEON_DATABASE_URL: {{ .Values.secrets.neonDbUrl | b64enc | quote }}
  BETTER_AUTH_SECRET: {{ .Values.secrets.authSecret | b64enc | quote }}
```

## Commands

```bash
# Install with secrets
helm install todo-chatbot ./todo-chatbot-helm \
  --set secrets.cohereApiKey="your_key" \
  --set secrets.neonDbUrl="your_db_url" \
  --set secrets.authSecret="your_secret"

# Upgrade after changes
helm upgrade todo-chatbot ./todo-chatbot-helm

# Rollback to previous release
helm rollback todo-chatbot

# Check release status
helm status todo-chatbot

# Uninstall
helm uninstall todo-chatbot -n todo-app

# Dry run to validate templates
helm install todo-chatbot ./todo-chatbot-helm --dry-run --debug \
  --set secrets.cohereApiKey="test" \
  --set secrets.neonDbUrl="test" \
  --set secrets.authSecret="test"
```

## Verification

1. `helm lint ./todo-chatbot-helm` passes with no errors
2. `helm install --dry-run` renders valid YAML
3. `helm install` creates all resources in `todo-app` namespace
4. `helm list` shows the release as deployed
5. `helm upgrade` performs rolling update without downtime
