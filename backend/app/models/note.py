"""Research Note model."""
from sqlalchemy import Column, String, Text, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base
import uuid
from datetime import datetime

class Note(Base):
    __tablename__ = "research_notes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    title = Column(String(255), nullable=False)
    content = Column(Text)
    is_pinned = Column(Boolean, default=False)
    is_daily = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow)
