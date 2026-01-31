# Environment Setup Specification

**Component**: environment-setup
**Parent Feature**: 003-cohere-chatbot

## Overview

Configuration guide for Cohere API integration across backend and frontend deployments.

## Backend Environment (Hugging Face Spaces)

### Required Secrets

Add to Hugging Face Space settings → Repository secrets:

```
COHERE_API_KEY=your_cohere_api_key_here
NEON_DATABASE_URL=postgresql://user:pass@host/db  # Existing
BETTER_AUTH_SECRET=your_secret_here               # Existing
```

### Python Dependencies

Add to `requirements.txt`:

```
cohere>=5.0.0
slowapi>=0.1.9  # For rate limiting
```

### Accessing in Code

```python
import os

COHERE_API_KEY = os.getenv("COHERE_API_KEY")
if not COHERE_API_KEY:
    raise ValueError("COHERE_API_KEY environment variable not set")
```

## Frontend Environment (Vercel)

### Required Variables

Add to Vercel project settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://your-space.hf.space  # Existing
BETTER_AUTH_SECRET=your_secret_here              # Existing (same as backend)
```

No new frontend environment variables needed for Cohere (API calls go through backend).

## Getting Cohere API Key

1. Go to https://dashboard.cohere.com
2. Sign up or log in
3. Navigate to API Keys section
4. Click "Create API Key"
5. Copy the generated key
6. Add to Hugging Face secrets

### Cohere Free Tier Limits

- 1,000 API calls per month
- Rate limit: 5 calls per minute (free tier)
- For production: Consider paid plan

## Database Migration

Run on Neon PostgreSQL console or via migration script:

```sql
-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    tool_calls JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
```

## Testing the Setup

### 1. Verify Cohere Connection

```bash
# Test Cohere API directly
curl -X POST "https://api.cohere.ai/v1/chat" \
  -H "Authorization: Bearer $COHERE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "command-r-plus", "message": "Hello"}'
```

### 2. Test Chat Endpoint

```bash
# Get JWT token first (login through frontend)
TOKEN="your_jwt_token"

# Test chat endpoint
curl -X POST "https://your-space.hf.space/api/user123/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add buy milk to my list"}'
```

Expected response:
```json
{
  "conversation_id": 1,
  "response": "✅ Added 'Buy milk' to your tasks!",
  "tool_calls": [
    {
      "name": "add_task",
      "parameters": {"title": "Buy milk"},
      "result": {"status": "created", "task_id": 42}
    }
  ]
}
```

### 3. Verify Database Tables

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('conversations', 'messages');

-- Check conversation count
SELECT COUNT(*) FROM conversations;
```

## Deployment Checklist

### Backend (Hugging Face)

- [ ] Add `COHERE_API_KEY` to secrets
- [ ] Add `cohere` to requirements.txt
- [ ] Add `slowapi` to requirements.txt
- [ ] Deploy updated code
- [ ] Verify endpoint responds

### Database (Neon)

- [ ] Run migration SQL
- [ ] Verify tables created
- [ ] Verify indexes created

### Frontend (Vercel)

- [ ] Add `/chat` route
- [ ] Add ChatButton component
- [ ] Add navigation link
- [ ] Deploy and test

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "COHERE_API_KEY not set" | Add key to HF secrets, redeploy |
| 401 Unauthorized | Check JWT token is valid |
| 403 Forbidden | user_id in URL must match JWT |
| 429 Rate Limited | Wait or upgrade Cohere plan |
| 500 Server Error | Check HF logs for stack trace |
| Empty response | Verify Cohere API key is valid |
