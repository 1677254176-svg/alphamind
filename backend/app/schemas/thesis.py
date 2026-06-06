"""Thesis Pydantic schemas for request/response validation."""
import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class ConditionCreate(BaseModel):
    condition_type: str = Field(..., max_length=30)
    condition: str = Field(..., description="Human-readable condition description")
    data_source: Optional[str] = None


class ConditionResponse(BaseModel):
    id: uuid.UUID
    condition_type: str
    condition: str
    current_status: str = "valid"

    class Config:
        from_attributes = True


class RiskCreate(BaseModel):
    risk_type: str = Field(..., max_length=30)
    risk_description: str
    probability: str = "medium"  # low | medium | high
    impact: str = "medium"
    mitigation: Optional[str] = None


class RiskResponse(BaseModel):
    id: uuid.UUID
    risk_type: str
    risk_description: str
    probability: str
    impact: str

    class Config:
        from_attributes = True


class AlertResponse(BaseModel):
    id: uuid.UUID
    alert_level: str
    alert_message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ThesisCreate(BaseModel):
    user_id: uuid.UUID
    stock_id: uuid.UUID
    title: str = Field(..., max_length=255)
    thesis_type: str = "long"
    core_reason: str
    detailed_analysis: Optional[str] = None
    confidence_level: int = Field(..., ge=1, le=10)
    target_price: Optional[float] = None
    entry_price: Optional[float] = None
    time_horizon: Optional[str] = None
    conditions: List[ConditionCreate] = []
    risks: List[RiskCreate] = []


class ThesisUpdate(BaseModel):
    title: Optional[str] = None
    core_reason: Optional[str] = None
    detailed_analysis: Optional[str] = None
    confidence_level: Optional[int] = Field(None, ge=1, le=10)
    target_price: Optional[float] = None
    current_price: Optional[float] = None
    status: Optional[str] = None


class ThesisResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    stock_id: uuid.UUID
    title: str
    thesis_type: str
    core_reason: str
    detailed_analysis: Optional[str] = None
    confidence_level: int
    target_price: Optional[float] = None
    entry_price: Optional[float] = None
    current_price: Optional[float] = None
    time_horizon: Optional[str] = None
    status: str
    pnl: Optional[float] = None
    pnl_pct: Optional[float] = None
    conditions: List[ConditionResponse] = []
    risks: List[RiskResponse] = []
    alerts: List[AlertResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ThesisListResponse(BaseModel):
    id: uuid.UUID
    title: str
    thesis_type: str
    core_reason: str
    confidence_level: int
    status: str
    condition_summary: dict
    updated_at: datetime

    class Config:
        from_attributes = True


class MonitorSnapshot(BaseModel):
    thesis_id: uuid.UUID
    title: str
    conditions: list
    unread_alerts: int
    risk_level: str  # normal | warning | critical
