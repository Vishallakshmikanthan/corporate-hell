"""
SQLAlchemy ORM model for game save files.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from app.db.database import Base


class SaveRecord(Base):
    __tablename__ = "save_records"

    id = Column(Integer, primary_key=True, index=True)
    slot = Column(String(64), index=True, nullable=False)
    company_name = Column(String(128), nullable=False)
    day = Column(Integer, default=1)
    mode = Column(String(32), default="sandbox")
    state_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
