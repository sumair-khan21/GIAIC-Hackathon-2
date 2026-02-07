# Dependencies

## Requirements

- Python 3.11+
- FastAPI for REST API
- SQLModel for ORM
- Neon PostgreSQL connection
- JWT verification

## requirements.txt

```
fastapi==0.109.0
sqlmodel==0.0.14
uvicorn[standard]==0.27.0
python-jose[cryptography]==3.3.0
psycopg2-binary==2.9.9
python-dotenv==1.0.0
```

## Environment Variables

```bash
# .env
NEON_DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
BETTER_AUTH_SECRET=your-32-char-secret-here
BETTER_AUTH_URL=http://localhost:3000
```

## Database Connection

```python
import os
from sqlmodel import create_engine, Session
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("NEON_DATABASE_URL")
engine = create_engine(DATABASE_URL, echo=False)

def get_db():
    with Session(engine) as session:
        yield session
```

## CORS Configuration

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Running the Server

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Security

- All secrets in environment variables
- .env file in .gitignore
- SSL required for database connection

## Acceptance Criteria

- [ ] All dependencies install successfully
- [ ] Database connects with SSL
- [ ] CORS allows frontend origin
- [ ] Server starts on port 8000
- [ ] Environment variables load correctly
