# Database Models Specification

**Component**: database-models
**Parent Feature**: 003-cohere-chatbot

## Overview

SQLModel schemas for conversation persistence. Extends existing schema without modifying `tasks` or `users` tables.

## SQLModel Definitions

```python
# models/conversation.py
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
import json

class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)  # References users table
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to messages
    messages: List["Message"] = Relationship(back_populates="conversation")


class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", index=True)
    user_id: str = Field(index=True)  # Redundant but enables direct filtering
    role: str  # "user" or "assistant"
    content: str
    tool_calls: Optional[str] = None  # JSON string of tool calls
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to conversation
    conversation: Optional[Conversation] = Relationship(back_populates="messages")

    def get_tool_calls(self) -> list:
        """Parse tool_calls JSON to list."""
        if self.tool_calls:
            return json.loads(self.tool_calls)
        return []

    def set_tool_calls(self, calls: list):
        """Serialize tool calls to JSON."""
        self.tool_calls = json.dumps(calls) if calls else None
```

## Migration SQL

```sql
-- Run this migration on Neon PostgreSQL
-- Existing tables (tasks, users) remain unchanged

-- Create conversations table
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    tool_calls JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

## Model Registration

```python
# models/__init__.py
from .task import Task
from .user import User
from .conversation import Conversation, Message

__all__ = ["Task", "User", "Conversation", "Message"]
```

## Database Initialization

```python
# database.py
from sqlmodel import SQLModel, create_engine, Session
import os

DATABASE_URL = os.getenv("NEON_DATABASE_URL")
engine = create_engine(DATABASE_URL, echo=False)

def init_db():
    """Create all tables."""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Dependency for FastAPI routes."""
    with Session(engine) as session:
        yield session
```

## Schema Relationships

```
┌─────────────┐       ┌──────────────────┐
│   users     │       │  conversations   │
├─────────────┤       ├──────────────────┤
│ id (PK)     │◄──────│ user_id (FK)     │
│ email       │       │ id (PK)          │
│ ...         │       │ created_at       │
└─────────────┘       │ updated_at       │
                      └────────┬─────────┘
                               │
                               │ 1:N
                               ▼
                      ┌──────────────────┐
                      │    messages      │
                      ├──────────────────┤
                      │ id (PK)          │
                      │ conversation_id  │
                      │ user_id          │
                      │ role             │
                      │ content          │
                      │ tool_calls       │
                      │ created_at       │
                      └──────────────────┘

┌─────────────┐
│   tasks     │  (unchanged from Phase 2)
├─────────────┤
│ id (PK)     │
│ user_id     │
│ title       │
│ description │
│ completed   │
│ created_at  │
└─────────────┘
```

## Data Isolation

All queries MUST filter by authenticated user_id:

```python
# CORRECT: Filter by user_id
conversations = session.exec(
    select(Conversation).where(Conversation.user_id == current_user.id)
).all()

# WRONG: No user filter exposes other users' data
conversations = session.exec(select(Conversation)).all()
```
