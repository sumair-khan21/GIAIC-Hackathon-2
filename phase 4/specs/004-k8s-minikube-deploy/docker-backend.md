# Backend Docker Specification

## Overview

Multi-stage Docker build for the FastAPI backend application. Uses `python:3.11-slim` base, installs dependencies in a builder stage, and copies them to a clean production image with a non-root user.

## Dockerfile

```dockerfile
# Stage 1: Install dependencies
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Production runner
FROM python:3.11-slim
WORKDIR /app

RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --gid 1001 appuser

COPY --from=builder /root/.local /home/appuser/.local
COPY . .
RUN chown -R appuser:appgroup /app

USER appuser
ENV PATH=/home/appuser/.local/bin:$PATH
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## .dockerignore

```
__pycache__
*.pyc
*.pyo
venv
.venv
.git
.gitignore
.env*
*.md
Dockerfile
.dockerignore
```

## Commands

```bash
# Build image
docker build -t todo-backend:latest ./backend

# Test locally
docker run -p 8000:8000 \
  -e COHERE_API_KEY=your_key \
  -e NEON_DATABASE_URL=your_db_url \
  -e BETTER_AUTH_SECRET=your_secret \
  todo-backend:latest

# Check image size
docker images todo-backend:latest --format "{{.Size}}"

# Load into Minikube
minikube image load todo-backend:latest
```

## Verification

1. Image builds without errors
2. Image size is under 500MB
3. Container starts and serves on port 8000
4. Process runs as UID 1001 (appuser)
5. `curl http://localhost:8000/docs` returns FastAPI Swagger UI

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Build fails at pip install | Missing/invalid requirements.txt | Verify requirements.txt exists and has valid packages |
| Module not found on start | Dependencies not in PATH | Verify `ENV PATH=/home/appuser/.local/bin:$PATH` |
| Permission denied | Files owned by root | Verify `chown -R appuser:appgroup /app` |
| Can't connect to database | Missing env vars | Pass `-e NEON_DATABASE_URL=...` at runtime |
| uvicorn not found | Not in requirements.txt | Add `uvicorn[standard]` to requirements.txt |
