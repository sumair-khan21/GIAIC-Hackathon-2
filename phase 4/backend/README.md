---
title: Todo API Backend
emoji: ✅
colorFrom: purple
colorTo: blue
sdk: docker
pinned: false
license: mit
app_port: 7860
---

# Todo API Backend

FastAPI backend for the Todo Full-Stack application with AI chatbot.

## Endpoints

### Tasks
- `GET /api/{user_id}/tasks` - List all tasks
- `POST /api/{user_id}/tasks` - Create a task
- `GET /api/{user_id}/tasks/{id}` - Get single task
- `PUT /api/{user_id}/tasks/{id}` - Update task
- `DELETE /api/{user_id}/tasks/{id}` - Delete task
- `PATCH /api/{user_id}/tasks/{id}/complete` - Toggle completion

### Chat (AI Chatbot)
- `POST /api/{user_id}/chat` - Send message to AI chatbot

## Authentication

All endpoints require a Bearer token in the Authorization header.

## Environment Variables

Set these in Hugging Face Space settings → Secrets:
- `NEON_DATABASE_URL` - PostgreSQL connection string (from Neon)
- `COHERE_API_KEY` - Cohere API key for AI chatbot
- `FRONTEND_URL` - Frontend URL for CORS (e.g., https://your-app.vercel.app)

## API Documentation

Visit `/docs` for interactive Swagger documentation.
