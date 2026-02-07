# JWT Authentication

## Requirements

- Verify JWT tokens from Better Auth frontend
- Use shared BETTER_AUTH_SECRET for verification
- Extract user_id and email from token payload
- Protect all /api routes

## Middleware Flow

```
1. Request arrives with header:
   Authorization: Bearer <jwt_token>

2. Extract token from header
   - Missing header → 401 Unauthorized

3. Verify JWT signature
   - Use BETTER_AUTH_SECRET
   - Invalid signature → 401 Unauthorized

4. Check token expiration
   - Expired → 401 Unauthorized

5. Extract payload:
   - user_id (sub claim)
   - email

6. Attach user to request state
   - request.state.user = {"id": user_id, "email": email}

7. Verify URL user_id matches token user_id
   - Mismatch → 403 Forbidden
```

## Token Structure

```json
{
  "sub": "user_abc123",
  "email": "user@example.com",
  "iat": 1704067200,
  "exp": 1704672000
}
```

## Dependency Function

```python
from fastapi import Depends, HTTPException, Request
from jose import jwt, JWTError
import os

async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")

    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(
            token,
            os.getenv("BETTER_AUTH_SECRET"),
            algorithms=["HS256"]
        )
        return {"id": payload["sub"], "email": payload.get("email")}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

## Security

- Secret stored in environment variable only
- Token expiration enforced
- URL user_id verified against token user_id

## Acceptance Criteria

- [ ] Missing Authorization header returns 401
- [ ] Invalid token returns 401
- [ ] Expired token returns 401
- [ ] URL user_id mismatch returns 403
- [ ] Valid token attaches user to request
