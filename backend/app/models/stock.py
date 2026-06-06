"""Stock model for A-share/HK/US stocks."""
from sqlalchemy import Column, String, BigInteger, Float, Text, DateTime, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base
import uuid
from datetime import datetime

class Stock(Base):
    __tablename__ = "stocks"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticker = Column(String(10), unique=True, nullable=False)
    exchange = Column(String(10))
    company_name = Column(String(255))
    market = Column(String(5), default="A")
    board = Column(String(20))
    sector = Column(String(100))
    industry = Column(String(100))
    concept_tags = Column(JSON, default=[])
    market_cap = Column(BigInteger)
    pe = Column(Float, nullable=True)
    pb = Column(Float, nullable=True)
    employees = Column(BigInteger, nullable=True)
    founded_year = Column(BigInteger, nullable=True)
    headquarters = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    business_model = Column(Text, nullable=True)
    core_products = Column(JSON, nullable=True)
    management = Column(JSON, nullable=True)
    margin_trading = Column(Boolean, default=False)
    st_flag = Column(Boolean, default=False)
    total_shares = Column(BigInteger, nullable=True)
    float_shares = Column(BigInteger, nullable=True)
