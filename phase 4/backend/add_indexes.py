"""Script to add database indexes for performance optimization."""

import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("NEON_DATABASE_URL")

if not DATABASE_URL:
    print("Error: NEON_DATABASE_URL not found")
    exit(1)

engine = create_engine(DATABASE_URL)

# Add indexes for frequently queried columns
indexes = [
    # Index on tasks.user_id for faster task queries per user
    "CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);",

    # Composite index on tasks for common queries (user_id + completed)
    "CREATE INDEX IF NOT EXISTS idx_tasks_user_completed ON tasks(user_id, completed);",

    # Index on tasks.created_at for ordering
    "CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);",

    # Index on messages.conversation_id for chat history
    "CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);",

    # Index on messages.created_at for ordering
    "CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);",

    # Index on conversations.user_id
    "CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);",

    # Index on session.token for auth lookups
    'CREATE INDEX IF NOT EXISTS idx_session_token ON session(token);',
]

try:
    with engine.connect() as conn:
        for idx_sql in indexes:
            print(f"Creating index: {idx_sql[:60]}...")
            conn.execute(text(idx_sql))
            conn.commit()
        print("\n✅ All indexes created successfully!")
except Exception as e:
    print(f"❌ Error creating indexes: {e}")
    exit(1)
