"""
db/database.py — SQLAlchemy setup with SQLite (local) or PostgreSQL (Azure).
Switch DATABASE_URL in .env to use Postgres on Azure.
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, String, Text, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import sessionmaker, relationship, DeclarativeBase
from datetime import datetime

load_dotenv()

# SQLite by default; set DATABASE_URL=postgresql://... in .env for Azure
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./vidlearn.db")

# SQLite needs check_same_thread=False
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass


# ── ORM Models ───────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id            = Column(String, primary_key=True, index=True)   # UUID
    email         = Column(String, unique=True, index=True, nullable=False)
    username      = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at    = Column(DateTime, default=datetime.utcnow)

    sessions = relationship("VideoSession", back_populates="user", cascade="all, delete")


class VideoCache(Base):
    """
    Stores processed results keyed by youtube_url or file hash.
    Shared across all users — process once, serve to all.
    """
    __tablename__ = "video_cache"

    id             = Column(String, primary_key=True, index=True)   # SHA256 of url/file
    source_key     = Column(String, unique=True, index=True)        # youtube URL or file hash
    transcript     = Column(Text)
    notes          = Column(Text)
    summary        = Column(Text)
    quiz           = Column(JSON)
    flashcards     = Column(JSON)
    key_concepts   = Column(JSON)
    mindmap        = Column(JSON)
    word_count     = Column(Integer, default=0)
    estimated_read_time = Column(Integer, default=1)
    language_detected   = Column(String, default="English")
    created_at     = Column(DateTime, default=datetime.utcnow)

    sessions = relationship("VideoSession", back_populates="cache")


class VideoSession(Base):
    """
    Links a user to a cached result, with a user-editable title.
    This is what appears in the user's history dashboard.
    """
    __tablename__ = "video_sessions"

    id          = Column(String, primary_key=True, index=True)   # UUID
    user_id     = Column(String, ForeignKey("users.id"), nullable=False)
    cache_id    = Column(String, ForeignKey("video_cache.id"), nullable=False)
    title       = Column(String, default="Untitled Video")
    source_label= Column(String, default="")   # YouTube URL or filename
    created_at  = Column(DateTime, default=datetime.utcnow)

    user  = relationship("User", back_populates="sessions")
    cache = relationship("VideoCache", back_populates="sessions")


# ── Helpers ──────────────────────────────────────────────────────────────────

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
