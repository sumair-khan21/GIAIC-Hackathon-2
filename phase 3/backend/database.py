"""Database connection and session management for Neon PostgreSQL."""

import os
from sqlmodel import SQLModel, Session, create_engine
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("NEON_DATABASE_URL")

if DATABASE_URL:
    # Add connection pooling for better performance
    engine = create_engine(
        DATABASE_URL,
        echo=False,
        pool_pre_ping=True,  # Verify connections before using
        pool_size=10,  # Number of connections to maintain
        max_overflow=20,  # Additional connections when pool is full
        pool_recycle=3600,  # Recycle connections after 1 hour
    )
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
