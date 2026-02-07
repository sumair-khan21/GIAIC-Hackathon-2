"""Conversation helper functions for chat persistence."""

import json
from datetime import datetime
from typing import Optional, List
from sqlmodel import Session, select

from models import Conversation, Message


def create_conversation(session: Session, user_id: str) -> Conversation:
    """
    Create a new conversation for a user.

    Args:
        session: Database session
        user_id: The authenticated user's ID

    Returns:
        Conversation: The newly created conversation
    """
    conversation = Conversation(user_id=user_id)
    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    return conversation


def get_or_create_conversation(
    session: Session,
    conversation_id: Optional[int],
    user_id: str
) -> Conversation:
    """
    Get an existing conversation or create a new one.

    Args:
        session: Database session
        conversation_id: Optional conversation ID to retrieve
        user_id: The authenticated user's ID

    Returns:
        Conversation: Existing or new conversation
    """
    if conversation_id:
        # Try to find existing conversation owned by this user
        conversation = session.exec(
            select(Conversation)
            .where(Conversation.id == conversation_id)
            .where(Conversation.user_id == user_id)
        ).first()

        if conversation:
            # Update the updated_at timestamp
            conversation.updated_at = datetime.utcnow()
            session.add(conversation)
            session.commit()
            session.refresh(conversation)
            return conversation

    # Create new conversation if not found or not provided
    return create_conversation(session, user_id)


def store_message(
    session: Session,
    conversation_id: int,
    user_id: str,
    role: str,
    content: str,
    tool_calls: Optional[List[dict]] = None
) -> Message:
    """
    Store a message in the database.

    Args:
        session: Database session
        conversation_id: ID of the conversation
        user_id: The user's ID
        role: "user" or "assistant"
        content: The message text
        tool_calls: Optional list of tool calls (for assistant messages)

    Returns:
        Message: The stored message
    """
    message = Message(
        conversation_id=conversation_id,
        user_id=user_id,
        role=role,
        content=content,
        tool_calls=json.dumps(tool_calls) if tool_calls else None
    )
    session.add(message)
    session.commit()
    session.refresh(message)
    return message


def get_conversation_history(
    session: Session,
    conversation_id: int,
    limit: int = 20
) -> List[Message]:
    """
    Get the conversation history for a conversation.

    Args:
        session: Database session
        conversation_id: ID of the conversation
        limit: Maximum number of messages to retrieve (default 20)

    Returns:
        List[Message]: Messages in chronological order
    """
    messages = session.exec(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
    ).all()

    # Reverse to get chronological order (oldest first)
    return list(reversed(messages))


def format_history_for_cohere(messages: List[Message]) -> List[dict]:
    """
    Format message history for Cohere chat API.

    Args:
        messages: List of Message objects

    Returns:
        List[dict]: Formatted history for Cohere's chat_history parameter
    """
    return [
        {
            "role": "USER" if msg.role == "user" else "CHATBOT",
            "message": msg.content
        }
        for msg in messages
    ]
