# Technical Research: FastAPI Backend

**Feature**: 002-fastapi-backend
**Created**: 2026-01-12
**Status**: Complete

## Technology Decisions

### 1. FastAPI Framework

**Selected**: FastAPI 0.109.0

**Rationale**:
- Native async support for non-blocking I/O
- Automatic OpenAPI/Swagger documentation
- Built-in Pydantic validation
- SQLModel integration (same author)
- High performance (Starlette + Pydantic)

**Alternatives Considered**:
- Flask: Synchronous, requires extensions for validation
- Django REST: Heavy for simple API, ORM lock-in
- Starlette: Lower-level, more boilerplate

### 2. ORM/Database Layer

**Selected**: SQLModel 0.0.14

**Rationale**:
- Combines SQLAlchemy + Pydantic in one
- Type hints work for both DB and API
- Created by FastAPI author (tight integration)
- Async session support

**Alternatives Considered**:
- SQLAlchemy alone: Requires separate Pydantic models
- Tortoise ORM: Less mature ecosystem
- Prisma: Node.js focused, Python client experimental

### 3. JWT Library

**Selected**: python-jose[cryptography] 3.3.0

**Rationale**:
- Full JWT/JWS/JWE support
- HS256 algorithm for Better Auth compatibility
- Well-maintained, security-focused
- Cryptography backend for performance

**Alternatives Considered**:
- PyJWT: Simpler but fewer features
- Authlib: Heavier, OAuth-focused
- Custom: Security risk, maintenance burden

### 4. Database Driver

**Selected**: psycopg2-binary 2.9.9

**Rationale**:
- Most mature PostgreSQL driver
- SQLModel/SQLAlchemy compatibility
- Binary package for easy installation
- Neon PostgreSQL certified

**Alternatives Considered**:
- asyncpg: Async-native but requires different session handling
- psycopg3: Newer but less tested with SQLModel

### 5. ASGI Server

**Selected**: uvicorn[standard] 0.27.0

**Rationale**:
- FastAPI recommended server
- Hot reload for development
- HTTP/2 support
- Production-ready with gunicorn

## Integration Points

### Frontend Integration

| Aspect | Frontend (Next.js) | Backend (FastAPI) |
|--------|-------------------|-------------------|
| Auth | Better Auth client | JWT verification |
| Secret | BETTER_AUTH_SECRET | Same secret in .env |
| Token | httpOnly cookie | Bearer header |
| API | fetch with token | Depends(get_current_user) |

### Database Integration

| Aspect | Configuration |
|--------|---------------|
| Provider | Neon PostgreSQL (serverless) |
| Connection | NEON_DATABASE_URL env var |
| SSL | Required (sslmode=require) |
| Pooling | SQLModel connection pool |

## Security Considerations

1. **JWT Verification**: HS256 with shared secret
2. **User Isolation**: All queries filter by user_id from token
3. **CORS**: Explicit origin (http://localhost:3000)
4. **Input Validation**: Pydantic models validate all inputs
5. **SQL Injection**: SQLModel parameterized queries

## Performance Considerations

1. **Connection Pooling**: SQLModel engine with pool
2. **Async Routes**: FastAPI native async/await
3. **Response Time**: Target <500ms for all endpoints
4. **Database Indexes**: user_id indexed for fast filtering

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| JWT secret mismatch | Use same BETTER_AUTH_SECRET |
| CORS blocking | Configure exact origin |
| N+1 queries | Simple single-table design |
| Connection exhaustion | Pool size limits |

## Validation Complete

- [x] All dependencies are compatible versions
- [x] Integration points match frontend expectations
- [x] Security requirements addressed
- [x] Performance targets achievable
- [x] No blocking risks identified
