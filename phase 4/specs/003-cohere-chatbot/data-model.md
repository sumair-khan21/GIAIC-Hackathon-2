# Data Model: AI Todo Chatbot

**Feature**: 003-cohere-chatbot
**Date**: 2026-01-31

## Entity Relationship Diagram

```
┌─────────────────┐       ┌───────────────────┐
│     users       │       │   conversations   │
├─────────────────┤       ├───────────────────┤
│ id (PK)         │◄──────│ user_id (FK)      │
│ email           │       │ id (PK)           │
│ ...             │       │ created_at        │
└─────────────────┘       │ updated_at        │
                          └─────────┬─────────┘
                                    │
                                    │ 1:N
                                    ▼
                          ┌───────────────────┐
                          │     messages      │
                          ├───────────────────┤
                          │ id (PK)           │
                          │ conversation_id   │
                          │ user_id           │
                          │ role              │
                          │ content           │
                          │ tool_calls        │
                          │ created_at        │
                          └───────────────────┘

┌─────────────────┐
│     tasks       │  (unchanged from Phase 2)
├─────────────────┤
│ id (PK)         │
│ user_id         │
│ title           │
│ description     │
│ completed       │
│ created_at      │
│ updated_at      │
└─────────────────┘
```

## New Entities

### Conversation

Represents a chat session between a user and the AI assistant.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| user_id | VARCHAR(255) | NOT NULL, INDEX | Owner of conversation |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last activity time |

**Indexes**:
- `idx_conversations_user_id` on `user_id` (frequent filtering)

**Validation Rules**:
- user_id must match authenticated JWT user
- created_at immutable after creation
- updated_at auto-updates on new message

### Message

Represents a single message in a conversation (user or assistant).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| conversation_id | INTEGER | NOT NULL, FK, INDEX | Parent conversation |
| user_id | VARCHAR(255) | NOT NULL, INDEX | Message owner |
| role | VARCHAR(20) | CHECK IN ('user', 'assistant') | Sender type |
| content | TEXT | NOT NULL | Message text |
| tool_calls | JSONB | NULLABLE | Tool calls executed (assistant only) |
| created_at | TIMESTAMP | DEFAULT NOW() | Message time |

**Indexes**:
- `idx_messages_conversation` on `conversation_id` (load history)
- `idx_messages_user_id` on `user_id` (data isolation)
- `idx_messages_created_at` on `created_at` (chronological ordering)

**Validation Rules**:
- conversation_id must reference valid conversation
- user_id must match conversation's user_id
- role must be 'user' or 'assistant'
- tool_calls only populated for assistant messages

**Cascade Rules**:
- DELETE conversation → DELETE all messages (ON DELETE CASCADE)

## SQLModel Definitions

### Conversation Model

```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime

class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    messages: List["Message"] = Relationship(back_populates="conversation")
```

### Message Model

```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime
import json

class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", index=True)
    user_id: str = Field(index=True, nullable=False)
    role: str = Field(nullable=False)  # "user" or "assistant"
    content: str = Field(nullable=False)
    tool_calls: Optional[str] = Field(default=None)  # JSON string
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    conversation: Optional[Conversation] = Relationship(back_populates="messages")

    def get_tool_calls_list(self) -> list:
        """Parse tool_calls JSON to list."""
        if self.tool_calls:
            return json.loads(self.tool_calls)
        return []

    def set_tool_calls_list(self, calls: list):
        """Serialize tool calls to JSON string."""
        self.tool_calls = json.dumps(calls) if calls else None
```

## Migration SQL

```sql
-- =====================================================
-- Migration: Add Conversation and Message tables
-- Feature: 003-cohere-chatbot
-- Date: 2026-01-31
-- =====================================================

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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Verify tables created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('conversations', 'messages');
```

## State Transitions

### Conversation States

```
[New Request]
    │
    ▼
┌─────────────────┐
│  conversation   │◄──── conversation_id = null in request
│   not found     │
└────────┬────────┘
         │ create new
         ▼
┌─────────────────┐
│    active       │◄──── conversation_id exists
│  conversation   │
└────────┬────────┘
         │ each message
         ▼
┌─────────────────┐
│   updated_at    │
│   refreshed     │
└─────────────────┘
```

### Message Flow

```
User Request → Store "user" message → Call Cohere →
    │
    ├─► No tools → Store "assistant" message → Return
    │
    └─► Has tools → Execute tools → Call Cohere with results →
                    Store "assistant" message (with tool_calls) → Return
```

## Data Access Patterns

### Read Patterns

| Operation | Query | Index Used |
|-----------|-------|------------|
| Load conversation | `WHERE id = ? AND user_id = ?` | PK + user_id |
| Load history | `WHERE conversation_id = ? ORDER BY created_at` | conversation_id |
| User's conversations | `WHERE user_id = ?` | user_id |

### Write Patterns

| Operation | Action |
|-----------|--------|
| New conversation | INSERT into conversations |
| New message | INSERT into messages, UPDATE conversation.updated_at |

## Data Isolation

**Critical Security Requirement**: All queries MUST filter by authenticated user_id.

```python
# CORRECT - Filter by user_id from JWT
conversation = session.exec(
    select(Conversation)
    .where(Conversation.id == conv_id)
    .where(Conversation.user_id == current_user.id)
).first()

# WRONG - No user filter, exposes other users' data
conversation = session.exec(
    select(Conversation).where(Conversation.id == conv_id)
).first()
```
