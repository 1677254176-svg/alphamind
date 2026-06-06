"""
Thesis Model - Core of AlphaMind investment logic system.
Each Thesis represents an investment conviction with monitorable conditions.
"""
import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import (
    Column, String, Integer, Float, Text, DateTime,
    ForeignKey, Boolean, JSON, Enum as SAEnum,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.db.session import Base
import enum


class ThesisType(str, enum.Enum):
    LONG = "long"
    SHORT = "short"
    HOLD = "hold"


class ThesisStatus(str, enum.Enum):
    ACTIVE = "active"
    INVALIDATED = "invalidated"
    CLOSED = "closed"
    PAUSED = "paused"


class ConditionStatus(str, enum.Enum):
    VALID = "valid"
    WARNING = "warning"
    VIOLATED = "violated"


class Thesis(Base):
    __tablename__ = "theses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    stock_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("stocks.id"), nullable=False)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    thesis_type: Mapped[ThesisType] = mapped_column(SAEnum(ThesisType), default=ThesisType.LONG)

    # Core logic
    core_reason: Mapped[str] = mapped_column(Text, nullable=False)
    detailed_analysis: Mapped[Optional[str]] = mapped_column(Text)
    confidence_level: Mapped[int] = mapped_column(Integer)

    # Price targets
    target_price: Mapped[Optional[float]] = mapped_column(Float)
    entry_price: Mapped[Optional[float]] = mapped_column(Float)
    current_price: Mapped[Optional[float]] = mapped_column(Float)
    time_horizon: Mapped[Optional[str]] = mapped_column(String(20))

    # Status
    status: Mapped[ThesisStatus] = mapped_column(SAEnum(ThesisStatus), default=ThesisStatus.ACTIVE)
    opened_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    closed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    closed_reason: Mapped[Optional[str]] = mapped_column(Text)
    pnl: Mapped[Optional[float]] = mapped_column(Float)
    pnl_pct: Mapped[Optional[float]] = mapped_column(Float)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    conditions: Mapped[List["ThesisCondition"]] = relationship(
        "ThesisCondition", back_populates="thesis", cascade="all, delete-orphan"
    )
    risks: Mapped[List["ThesisRisk"]] = relationship(
        "ThesisRisk", back_populates="thesis", cascade="all, delete-orphan"
    )
    alerts: Mapped[List["ThesisAlert"]] = relationship(
        "ThesisAlert", back_populates="thesis", cascade="all, delete-orphan"
    )


class ThesisCondition(Base):
    __tablename__ = "thesis_conditions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    thesis_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("theses.id", ondelete="CASCADE"))

    condition_type: Mapped[str] = mapped_column(String(30))
    condition: Mapped[str] = mapped_column(Text, nullable=False)
    current_status: Mapped[ConditionStatus] = mapped_column(
        SAEnum(ConditionStatus), default=ConditionStatus.VALID
    )
    data_source: Mapped[Optional[str]] = mapped_column(String(100))
    last_checked: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    thesis: Mapped["Thesis"] = relationship("Thesis", back_populates="conditions")


class ThesisRisk(Base):
    __tablename__ = "thesis_risks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    thesis_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("theses.id", ondelete="CASCADE"))

    risk_type: Mapped[str] = mapped_column(String(30))
    risk_description: Mapped[str] = mapped_column(Text, nullable=False)
    probability: Mapped[str] = mapped_column(String(15))
    impact: Mapped[str] = mapped_column(String(15))
    mitigation: Mapped[Optional[str]] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    thesis: Mapped["Thesis"] = relationship("Thesis", back_populates="risks")


class ThesisAlert(Base):
    __tablename__ = "thesis_alerts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    thesis_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("theses.id", ondelete="CASCADE"))

    alert_level: Mapped[str] = mapped_column(String(10))  # info | warning | critical
    alert_message: Mapped[str] = mapped_column(Text, nullable=False)
    condition_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("thesis_conditions.id"))
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    thesis: Mapped["Thesis"] = relationship("Thesis", back_populates="alerts")
