"""Test script to test chatbot CRUD operations."""

import os
import requests
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("NEON_DATABASE_URL")
BASE_URL = "http://localhost:8000"

# Get a valid session token from database
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    result = conn.execute(text("""
        SELECT s.token, s."userId", u.email
        FROM session s
        JOIN "user" u ON s."userId" = u.id
        WHERE s."expiresAt" > NOW()
        LIMIT 1
    """)).fetchone()

    if not result:
        print("❌ No valid session found. Please login to the app first.")
        exit(1)

    token, user_id, email = result
    print(f"✅ Found session for user: {email}")
    print(f"   User ID: {user_id}")

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

def test_chat(message: str, conversation_id: int = None):
    """Send a chat message and return the response."""
    payload = {"message": message}
    if conversation_id:
        payload["conversation_id"] = conversation_id

    print(f"\n{'='*60}")
    print(f"📤 USER: {message}")
    print(f"{'='*60}")

    response = requests.post(
        f"{BASE_URL}/api/{user_id}/chat",
        headers=headers,
        json=payload
    )

    if response.status_code == 200:
        data = response.json()
        print(f"🤖 BOT: {data['response']}")
        if data.get('tool_calls'):
            print(f"🔧 Tools used: {[tc['name'] for tc in data['tool_calls']]}")
        return data
    else:
        print(f"❌ Error {response.status_code}: {response.text}")
        return None

print("\n" + "="*60)
print("🧪 TESTING CHATBOT CRUD OPERATIONS")
print("="*60)

# Test 1: CREATE - Add tasks
print("\n\n📝 TEST 1: CREATE TASKS")
result1 = test_chat("Add a task: Buy groceries from the supermarket")
conv_id = result1['conversation_id'] if result1 else None

result2 = test_chat("Add another task called 'Call mom'", conv_id)
result3 = test_chat("Create a task: Finish the project report", conv_id)

# Test 2: LIST - Show all tasks
print("\n\n📋 TEST 2: LIST TASKS")
test_chat("Show me all my tasks", conv_id)
test_chat("What are my pending tasks?", conv_id)

# Test 3: UPDATE - Modify a task
print("\n\n✏️ TEST 3: UPDATE TASK")
test_chat("Update the groceries task to say 'Buy groceries and fruits'", conv_id)

# Test 4: COMPLETE - Mark task as done
print("\n\n✅ TEST 4: COMPLETE TASK")
test_chat("Mark the 'Call mom' task as complete", conv_id)
test_chat("Show me my completed tasks", conv_id)

# Test 5: DELETE - Remove a task
print("\n\n🗑️ TEST 5: DELETE TASK")
test_chat("Delete the project report task", conv_id)
test_chat("Show me all my tasks now", conv_id)

print("\n\n" + "="*60)
print("🎉 CHATBOT CRUD TEST COMPLETE!")
print("="*60)
