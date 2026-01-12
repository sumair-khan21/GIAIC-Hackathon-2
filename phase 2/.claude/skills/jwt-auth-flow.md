# JWT Authentication Flow Skill

Implement JWT authentication flow for Next.js + FastAPI stack.

## Frontend (Better Auth)

1. Configure Better Auth with JWT plugin
2. On login success, receive JWT token
3. Store in httpOnly cookie or secure storage
4. Include in every API call:
   ```
   Authorization: Bearer <token>
   ```

## Backend (FastAPI)

1. Create middleware to extract Authorization header
2. Verify JWT signature using `BETTER_AUTH_SECRET`
3. Decode token to get `user_id` and `email`
4. Attach user info to request context
5. Return 401 if token invalid/missing

## Token Structure

```json
{
  "user_id": "user_123",
  "email": "user@example.com",
  "exp": 1234567890
}
```

## Security Requirements

| Requirement | Implementation |
|-------------|----------------|
| Secret key | Never expose; use environment variable |
| Token expiry | Set reasonable expiry (7 days) |
| Validation | Validate token on every request |
| User matching | Match `user_id` from token with URL parameter |

## Implementation Checklist

- [ ] Configure Better Auth JWT plugin on frontend
- [ ] Create FastAPI middleware for token extraction
- [ ] Implement JWT verification with secret
- [ ] Add user context to requests
- [ ] Return proper 401 responses
- [ ] Validate user_id matches URL parameter
