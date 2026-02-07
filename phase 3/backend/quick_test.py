"""Quick test script for chatbot CRUD."""

import os
import requests
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("NEON_DATABASE_URL")
BASE_URL = "http://localhost:8000"

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
        print("No valid session. Login first.")
        exit(1)

    token, user_id, email = result
    print(f"User: {email}, ID: {user_id}")

headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
conv_id = None

def chat(msg):
    global conv_id
    payload = {"message": msg}
    if conv_id:
        payload["conversation_id"] = conv_id

    r = requests.post(f"{BASE_URL}/api/{user_id}/chat", headers=headers, json=payload, timeout=60)

    if r.status_code == 200:
        data = r.json()
        conv_id = data['conversation_id']
        tools = [tc['name'] for tc in data.get('tool_calls', [])]
        print(f"\n>> {msg}")
        print(f"<< {data['response']}")
        if tools:
            print(f"   [Tools: {tools}]")
    else:
        print(f"Error: {r.status_code} - {r.text}")

print("\n=== CHATBOT CRUD TEST ===\n")

# CREATE
print("--- CREATE ---")
chat("Add task: Buy milk")

# LIST
print("\n--- LIST ---")
chat("Show all my tasks")

# UPDATE
print("\n--- UPDATE ---")
chat("Update the milk task to 'Buy milk and bread'")

# COMPLETE
print("\n--- COMPLETE ---")
chat("Mark the milk task as done")

# DELETE
print("\n--- DELETE ---")
chat("Delete the milk task")

# Final LIST
print("\n--- FINAL LIST ---")
chat("Show all tasks")

print("\n=== TEST COMPLETE ===")
