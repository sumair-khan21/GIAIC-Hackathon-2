---
title: Todo API Backend
emoji: ✅
colorFrom: purple
colorTo: blue
sdk: docker
pinned: false
license: mit
---

# Todo API Backend

FastAPI backend for the Todo Full-Stack application.

## Endpoints

- `GET /health` - Health check
- `GET /api/{user_id}/tasks` - List all tasks
- `POST /api/{user_id}/tasks` - Create a task
- `GET /api/{user_id}/tasks/{id}` - Get single task
- `PUT /api/{user_id}/tasks/{id}` - Update task
- `DELETE /api/{user_id}/tasks/{id}` - Delete task
- `PATCH /api/{user_id}/tasks/{id}/complete` - Toggle completion

## Authentication

All endpoints (except `/health`) require a Bearer token in the Authorization header.

## Environment Variables

Set these in Hugging Face Space settings:
- `NEON_DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Authentication secret key
