import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger("app.database")

def get_engine():
    # Try PostgreSQL first if specified
    db_url = settings.DATABASE_URL
    try:
        if "postgresql" in db_url:
            test_engine = create_engine(db_url, connect_args={"connect_timeout": 3})
            with test_engine.connect() as conn:
                logger.info("Successfully connected to PostgreSQL database.")
                return test_engine
    except Exception as e:
        logger.warning(f"PostgreSQL connection failed ({e}). Falling back to SQLite database for zero-downtime operation.")
    
    # Fallback to SQLite
    return create_engine(
        settings.SQLITE_URL,
        connect_args={"check_same_thread": False}
    )

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
