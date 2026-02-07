"""Chat endpoint for AI-powered task management using Cohere."""

import json
from typing import Optional, List, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from database import get_db
from auth import get_current_user, verify_user_access
from services.cohere_client import get_cohere_client, SYSTEM_PROMPT
from services.conversation import (
    get_or_create_conversation,
    store_message,
    get_conversation_history,
    format_history_for_cohere
)
from services.mcp_tools import MCP_TOOLS, execute_tool


# Rate limiter - 100 requests per hour per IP
limiter = Limiter(key_func=get_remote_address)

router = APIRouter()


class ChatRequest(BaseModel):
    """Request body for chat endpoint."""
    conversation_id: Optional[int] = Field(
        default=None,
        description="Existing conversation ID. Omit to start new conversation."
    )
    message: str = Field(
        min_length=1,
        max_length=2000,
        description="User's message text"
    )


class ToolCallResult(BaseModel):
    """Result of a single tool call."""
    name: str
    parameters: dict
    result: dict


class ChatResponse(BaseModel):
    """Response body for chat endpoint."""
    conversation_id: int
    response: str
    tool_calls: Optional[List[ToolCallResult]] = None


@router.post("/api/{user_id}/chat", response_model=ChatResponse)
@limiter.limit("100/hour")
async def chat(
    request: Request,
    user_id: str,
    chat_request: ChatRequest,
    session: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Process a chat message and return AI response.

    This endpoint:
    1. Verifies user authorization
    2. Gets or creates a conversation
    3. Loads conversation history
    4. Stores the user message
    5. Calls Cohere API with message, history, and tools
    6. Executes any tool calls
    7. Stores and returns the assistant response

    Args:
        request: FastAPI request (for rate limiting)
        user_id: User ID from URL path
        chat_request: Chat message and optional conversation ID
        session: Database session
        current_user: Authenticated user from JWT

    Returns:
        ChatResponse: Conversation ID, AI response, and tool calls

    Raises:
        HTTPException: 400 for empty message, 401 for auth errors,
                      403 for access denied, 429 for rate limit
    """
    # 1. Verify user authorization
    verify_user_access(user_id, current_user)

    # 2. Validate message
    if not chat_request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # 3. Get or create conversation
    conversation = get_or_create_conversation(
        session,
        chat_request.conversation_id,
        user_id
    )

    # 4. Load conversation history (last 20 messages)
    history_messages = get_conversation_history(session, conversation.id)
    chat_history = format_history_for_cohere(history_messages)

    # 5. Store user message
    store_message(
        session,
        conversation.id,
        user_id,
        "user",
        chat_request.message
    )

    # 6. Call Cohere API
    try:
        co = get_cohere_client()

        response = co.chat(
            model="command-r-08-2024",
            preamble=SYSTEM_PROMPT,
            message=chat_request.message,
            chat_history=chat_history,
            tools=MCP_TOOLS,
            temperature=0.7
        )

        tool_calls_executed: List[ToolCallResult] = []

        # 7. Execute tool calls if any
        if response.tool_calls:
            tool_results = []

            for tool_call in response.tool_calls:
                # Execute the tool with user_id from JWT (not from parameters)
                result = execute_tool(
                    tool_name=tool_call.name,
                    parameters=tool_call.parameters,
                    user_id=user_id,
                    session=session
                )

                tool_results.append({
                    "call": tool_call,
                    "outputs": [{"result": json.dumps(result)}]
                })

                tool_calls_executed.append(ToolCallResult(
                    name=tool_call.name,
                    parameters=tool_call.parameters,
                    result=result
                ))

            # Get final response with tool results
            # Note: force_single_step=True allows both message and tool_results
            response = co.chat(
                model="command-r-08-2024",
                preamble=SYSTEM_PROMPT,
                message=chat_request.message,
                chat_history=chat_history,
                tools=MCP_TOOLS,
                tool_results=tool_results,
                force_single_step=True,
                temperature=0.7
            )

        # 8. Store assistant message
        store_message(
            session,
            conversation.id,
            user_id,
            "assistant",
            response.text,
            [tc.model_dump() for tc in tool_calls_executed] if tool_calls_executed else None
        )

        # 9. Return response
        return ChatResponse(
            conversation_id=conversation.id,
            response=response.text,
            tool_calls=tool_calls_executed if tool_calls_executed else None
        )

    except ValueError as e:
        # COHERE_API_KEY not set
        raise HTTPException(
            status_code=500,
            detail="AI service not configured"
        )
    except Exception as e:
        # Log error for debugging
        print(f"Cohere API error: {e}")
        raise HTTPException(
            status_code=500,
            detail="I'm having trouble thinking right now. Please try again."
        )
