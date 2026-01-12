"""Database connection and session management for Neon PostgreSQL."""

import os
from sqlmodel import SQLModel, Session, create_engine
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("NEON_DATABASE_URL")

if DATABASE_URL:
    engine = create_engine(DATABASE_URL, echo=False)
else:
    engine = None


def get_db():
    """Dependency that provides a database session."""
    if engine is None:
        raise RuntimeError("Database URL not configured")
    with Session(engine) as session:
        yield session


def create_tables():
    """Create all database tables on startup."""
    if engine is None:
        raise RuntimeError("Database URL not configured")
    SQLModel.metadata.create_all(engine)
