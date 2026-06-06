"""Portfolio models."""
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base
import uuid
from datetime import datetime

class Portfolio(Base):
    __tablename__ = "portfolios"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    name = Column(String(100))
    initial_capital = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolios.id"))
    stock_id = Column(UUID(as_uuid=True), ForeignKey("stocks.id"))
    type = Column(String(4))
    quantity = Column(Float)
    price = Column(Float)
    total_amount = Column(Float)
    reason = Column(Text, nullable=True)
    thesis_id = Column(UUID(as_uuid=True), ForeignKey("theses.id"), nullable=True)
    emotion = Column(String(20), nullable=True)
    executed_at = Column(DateTime(timezone=True), nullable=False)
