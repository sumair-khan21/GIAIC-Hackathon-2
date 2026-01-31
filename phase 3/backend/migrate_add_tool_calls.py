"""Migration script to add tool_calls column to messages table."""

import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("NEON_DATABASE_URL")

if not DATABASE_URL:
    print("Error: NEON_DATABASE_URL not found in .env file")
    exit(1)

engine = create_engine(DATABASE_URL)

# SQL to add the tool_calls column if it doesn't exist
migration_sql = """
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS tool_calls TEXT;
"""

try:
    with engine.connect() as conn:
        conn.execute(text(migration_sql))
        conn.commit()
        print("✅ Successfully added tool_calls column to messages table")
except Exception as e:
    print(f"❌ Migration failed: {e}")
    exit(1)
