# Quickstart: AI Todo Chatbot

**Feature**: 003-cohere-chatbot
**Prerequisites**: Phase 2 (REST API + Frontend) deployed

## Quick Setup Checklist

- [ ] Get Cohere API key
- [ ] Add key to Hugging Face secrets
- [ ] Run database migration
- [ ] Deploy backend changes
- [ ] Deploy frontend changes
- [ ] Test chat endpoint

## Step 1: Get Cohere API Key

1. Go to https://dashboard.cohere.com
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **Create API Key**
5. Copy the key (starts with `co-...`)

## Step 2: Configure Backend Environment

### Hugging Face Spaces

1. Go to your Space → Settings → Repository secrets
2. Add new secret:
   - Name: `COHERE_API_KEY`
   - Value: `<your-cohere-api-key>`
3. Save

### Local Development

Add to `.env`:
```
COHERE_API_KEY=your_cohere_api_key_here
```

## Step 3: Run Database Migration

Execute in Neon PostgreSQL console:

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

Verify:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('conversations', 'messages');
```

## Step 4: Install Dependencies

### Backend

```bash
cd backend
pip install cohere slowapi
# Or add to requirements.txt:
# cohere>=5.0.0
# slowapi>=0.1.9
```

### Frontend

```bash
cd frontend
# lucide-react should already be installed
# If not: npm install lucide-react
```

## Step 5: Deploy

### Backend (Hugging Face)

```bash
git add .
git commit -m "feat: add AI chatbot with Cohere integration"
git push
# Hugging Face auto-deploys
```

### Frontend (Vercel)

```bash
git push
# Vercel auto-deploys
```

## Step 6: Test

### Test Chat Endpoint

```bash
# Get JWT token (login through frontend first)
TOKEN="your_jwt_token"
USER_ID="your_user_id"

# Send test message
curl -X POST "https://your-space.hf.space/api/${USER_ID}/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, what can you help me with?"}'
```

Expected response:
```json
{
  "conversation_id": 1,
  "response": "Hi! I'm your todo assistant. I can help you...",
  "tool_calls": null
}
```

### Test Task Operations

```bash
# Add a task
curl -X POST "https://your-space.hf.space/api/${USER_ID}/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"conversation_id": 1, "message": "Add buy milk to my list"}'

# List tasks
curl -X POST "https://your-space.hf.space/api/${USER_ID}/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"conversation_id": 1, "message": "Show my tasks"}'
```

### Test Frontend

1. Open https://your-app.vercel.app
2. Sign in
3. Click the chat button (bottom right)
4. Type: "Add a task to buy groceries"
5. Verify task appears in task list

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "COHERE_API_KEY not set" | Add key to HF secrets, redeploy |
| 401 Unauthorized | Refresh JWT token, re-login |
| 403 Forbidden | Check user_id matches JWT |
| 429 Rate Limited | Wait 1 hour or upgrade Cohere plan |
| Empty response | Check Cohere API key is valid |
| Database error | Verify migration ran successfully |

## Verification Checklist

After deployment, verify:

- [ ] Chat endpoint returns 200 with valid response
- [ ] New conversations are created in database
- [ ] Messages are stored in database
- [ ] Tool calls execute (add_task, list_tasks, etc.)
- [ ] User isolation works (can't see other users' tasks)
- [ ] Existing REST API still works
- [ ] Frontend chat page loads
- [ ] Chat button visible on dashboard
