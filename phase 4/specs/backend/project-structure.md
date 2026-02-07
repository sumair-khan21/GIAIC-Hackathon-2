# Project Structure

## Requirements

- Clean separation of concerns
- All backend code in /backend directory
- Environment-based configuration
- Route organization for scalability

## Directory Structure

```
backend/
├── main.py              # FastAPI app, CORS, router includes
├── models.py            # SQLModel Task class
├── schemas.py           # TaskCreate, TaskUpdate, responses
├── database.py          # Engine, session, get_db dependency
├── auth.py              # JWT verification, get_current_user
├── routes/
│   └── tasks.py         # All 6 task endpoints
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables (not committed)
└── .env.example         # Template for environment variables
```

## File Responsibilities

### main.py
- Create FastAPI application
- Configure CORS middleware
- Include routers
- Health check endpoint

### models.py
- Task SQLModel class (database table)

### schemas.py
- TaskCreate, TaskUpdate request schemas
- TaskResponse, TaskListResponse schemas
- ErrorResponse schema

### database.py
- SQLModel engine creation
- Session dependency (get_db)
- Table creation on startup

### auth.py
- get_current_user dependency
- JWT token verification
- User ID validation

### routes/tasks.py
- All 6 CRUD endpoints
- Request validation
- Response formatting

## Security

- .env excluded from git
- Secrets only in environment variables
- No hardcoded credentials

## Acceptance Criteria

- [ ] All files in correct locations
- [ ] Imports work between modules
- [ ] Environment variables loaded
- [ ] Application starts without errors
