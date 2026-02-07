# Frontend Docker Specification

## Overview

Multi-stage Docker build for the Next.js frontend application. Produces a minimal production image using `node:20-alpine` with standalone output mode, non-root user, and optimized layer caching.

## Dockerfile

```dockerfile
# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Build application
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

## .dockerignore

```
node_modules
.next
.git
.gitignore
.env*
*.md
Dockerfile
.dockerignore
```

## next.config.js Requirement

The Next.js config MUST enable standalone output for the multi-stage build to work:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
};
module.exports = nextConfig;
```

## Commands

```bash
# Build image
docker build -t todo-frontend:latest ./frontend

# Test locally
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8000 \
  todo-frontend:latest

# Check image size
docker images todo-frontend:latest --format "{{.Size}}"

# Load into Minikube
minikube image load todo-frontend:latest
```

## Verification

1. Image builds without errors
2. Image size is under 200MB
3. Container starts and serves on port 3000
4. Process runs as UID 1001 (nextjs user)
5. `curl http://localhost:3000` returns HTML

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Build fails at `npm run build` | Missing standalone output config | Add `output: "standalone"` to next.config.js |
| `.next/standalone` not found | Build did not produce standalone | Verify next.config.js and Next.js version >= 12 |
| Permission denied on start | Files owned by root | Verify `--chown=nextjs:nodejs` in COPY |
| Port not accessible | Container not exposing 3000 | Check EXPOSE and PORT env |
