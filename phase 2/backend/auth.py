"""JWT authentication and user verification."""

import os
from fastapi import Request, HTTPException
from jose import jwt, JWTError
from dotenv import load_dotenv

load_dotenv()


async def get_current_user(request: Request) -> dict:
    """
    Dependency to extract and verify JWT token from Authorization header.

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

    try:
        secret = os.getenv("BETTER_AUTH_SECRET")
        if not secret:
            raise HTTPException(
                status_code=500,
                detail="Server configuration error"
            )

        payload = jwt.decode(
            token,
            secret,
            algorithms=["HS256"]
        )

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid token payload"
            )

        return {
            "id": user_id,
            "email": payload.get("email")
        }

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )


def verify_user_access(user_id: str, current_user: dict) -> None:
    """
    Verify that the URL user_id matches the authenticated user's ID.

    Args:
        user_id: The user_id from the URL path
        current_user: The authenticated user from JWT token

    Raises:
        HTTPException: 403 if user_id doesn't match
    """
    if user_id != current_user["id"]:
        raise HTTPException(
            status_code=403,
            detail="Access denied to this resource"
        )
