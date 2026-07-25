from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# Production-ready database configuration
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Verify connections before using
    pool_size=20,  # Increased from 5 for production
    max_overflow=30,  # Increased from 10 for production
    pool_recycle=3600,  # Recycle connections every hour (prevents stale connections)
    pool_timeout=30,  # Timeout after 30 seconds waiting for connection
    echo=settings.DEBUG,  # Log SQL queries in debug mode only
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
