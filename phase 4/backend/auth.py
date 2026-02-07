"""Authentication and user verification using Better Auth session tokens."""

import os
from datetime import datetime
from fastapi import Request, HTTPException
from sqlalchemy import text
from dotenv import load_dotenv
from functools import lru_cache

from database import engine

load_dotenv()

# Simple in-memory cache for token validation (60 second TTL)
# This reduces database queries for frequently accessed tokens
_token_cache = {}
_cache_ttl = 60  # seconds


async def get_current_user(request: Request) -> dict:
    """
    Dependency to extract and verify Better Auth session token from Authorization header.

    Verifies the token against the session table in the database.
    Uses simple in-memory caching to reduce database load.

    Returns:
        dict: User information with 'id' and 'email' keys

    Raises:
        HTTPException: 401 if token is missing or invalid
    """
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid authorization header"
        )

    token = auth_header.split(" ")[1]

    # Check cache first
    now = datetime.utcnow()
    if token in _token_cache:
        cached_data, cached_time = _token_cache[token]
        if (now - cached_time).total_seconds() < _cache_ttl:
            # Verify expiration even from cache
            if cached_data['expires_at'] and cached_data['expires_at'] < now:
                del _token_cache[token]
            else:
                return {
                    "id": cached_data['user_id'],
                    "email": cached_data['email'],
                    "name": cached_data['name']
                }

    try:
        # Query session and user from database using raw connection
        with engine.connect() as conn:
            query = text("""
                SELECT s."userId", u.email, u.name, s."expiresAt"
                FROM session s
                JOIN "user" u ON s."userId" = u.id
                WHERE s.token = :token
            """)

            result = conn.execute(query, {"token": token}).fetchone()

            if not result:
                raise HTTPException(
                    status_code=401,
                    detail="Invalid or expired token"
                )

            user_id, email, name, expires_at = result

            # Check if session has expired
            if expires_at and expires_at < datetime.utcnow():
                raise HTTPException(
                    status_code=401,
                    detail="Session expired"
                )

            # Cache the result
            _token_cache[token] = ({
                'user_id': user_id,
                'email': email,
                'name': name,
                'expires_at': expires_at
            }, datetime.utcnow())

            return {
                "id": user_id,
                "email": email,
                "name": name
            }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Auth error: {e}")
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )


def verify_user_access(user_id: str, current_user: dict) -> None:
    """
    Verify that the URL user_id matches the authenticated user's ID.

    Args:
        user_id: The user_id from the URL path
        current_user: The authenticated user from session token

    Raises:
        HTTPException: 403 if user_id doesn't match
    """
    if user_id != current_user["id"]:
        raise HTTPException(
            status_code=403,
            detail="Access denied to this resource"
        )
