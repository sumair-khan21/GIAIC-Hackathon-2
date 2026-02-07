# Chat Endpoint Specification

**Component**: chat-endpoint
**Parent Feature**: 003-cohere-chatbot

## Overview

FastAPI endpoint for processing chat messages through Cohere API with MCP tool execution.

## Endpoint Definition

**POST** `/api/{user_id}/chat`

### Request Schema

```python
from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    conversation_id: Optional[int] = None  # Omit to start new conversation
    message: str
```

### Response Schema

```python
class ChatResponse(BaseModel):
    conversation_id: int
    response: str
    tool_calls: Optional[list] = None  # Tools executed, if any
```

### Error Responses

| Status | Condition |
|--------|-----------|
| 400 | Empty message |
| 401 | Missing/invalid JWT |
| 403 | user_id mismatch with token |
| 429 | Rate limit exceeded |
| 500 | Cohere API or database error |

## Implementation

```python
# routes/chat.py
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
import cohere
import os
import json

from models import Conversation, Message, Task
from auth import get_current_user
from database import get_session
from .tools import MCP_TOOLS, execute_tool
from .prompts import SYSTEM_PROMPT

router = APIRouter()

@router.post("/api/{user_id}/chat", response_model=ChatResponse)
async def chat(
    user_id: str,
    request: ChatRequest,
    current_user = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # 1. Verify user authorization
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    # 2. Validate input
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # 3. Get or create conversation
    conversation = get_or_create_conversation(
        session, request.conversation_id, user_id
    )

    # 4. Load chat history (last 20 messages)
    chat_history = load_chat_history(session, conversation.id)

    # 5. Store user message
    store_message(session, conversation.id, user_id, "user", request.message)

    # 6. Call Cohere API
    co = cohere.Client(api_key=os.getenv("COHERE_API_KEY"))

    try:
        response = co.chat(
            model="command-r-plus",
            preamble=SYSTEM_PROMPT,
            message=request.message,
            chat_history=chat_history,
            tools=MCP_TOOLS,
            temperature=0.7
        )

        tool_calls_executed = []

        # 7. Execute tool calls if any
        if response.tool_calls:
            tool_results = []
            for tool_call in response.tool_calls:
                result = execute_tool(
                    tool_name=tool_call.name,
                    parameters=tool_call.parameters,
                    user_id=user_id,  # From JWT, not parameters
                    session=session
                )
                tool_results.append({
                    "call": tool_call,
                    "outputs": [{"result": json.dumps(result)}]
                })
                tool_calls_executed.append({
                    "name": tool_call.name,
                    "parameters": tool_call.parameters,
                    "result": result
                })

            # Get final response with tool results
            response = co.chat(
                model="command-r-plus",
                preamble=SYSTEM_PROMPT,
                message=request.message,
                chat_history=chat_history,
                tools=MCP_TOOLS,
                tool_results=tool_results,
                temperature=0.7
            )

        # 8. Store assistant message
        store_message(
            session, conversation.id, user_id, "assistant",
            response.text, tool_calls_executed
        )

        # 9. Return response
        return ChatResponse(
            conversation_id=conversation.id,
            response=response.text,
            tool_calls=tool_calls_executed if tool_calls_executed else None
        )

    except cohere.CohereAPIError as e:
        raise HTTPException(status_code=500, detail="AI service error")
```

## Helper Functions

```python
def get_or_create_conversation(session: Session, conv_id: int | None, user_id: str):
    """Get existing or create new conversation."""
    if conv_id:
        conv = session.exec(
            select(Conversation)
            .where(Conversation.id == conv_id, Conversation.user_id == user_id)
        ).first()
        if conv:
            return conv

    # Create new conversation
    conv = Conversation(user_id=user_id)
    session.add(conv)
    session.commit()
    session.refresh(conv)
    return conv


def load_chat_history(session: Session, conversation_id: int, limit: int = 20):
    """Load last N messages as Cohere chat_history format."""
    messages = session.exec(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
    ).all()

    # Reverse to chronological order
    messages = list(reversed(messages))

    return [
        {
            "role": "USER" if m.role == "user" else "CHATBOT",
            "message": m.content
        }
        for m in messages
    ]


def store_message(session: Session, conversation_id: int, user_id: str,
                  role: str, content: str, tool_calls: list = None):
    """Persist message to database."""
    message = Message(
        conversation_id=conversation_id,
        user_id=user_id,
        role=role,
        content=content,
        tool_calls=tool_calls
    )
    session.add(message)
    session.commit()
```

## Router Registration

```python
# main.py
from routes.chat import router as chat_router

app.include_router(chat_router, tags=["chat"])
```

## Rate Limiting

Apply rate limiting middleware: 100 requests/hour per user.

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/api/{user_id}/chat")
@limiter.limit("100/hour")
async def chat(...):
    ...
```
