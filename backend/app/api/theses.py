"""
Thesis API - Core investment thesis management endpoints.
"""
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.models.thesis import (
    Thesis,
    ThesisCondition,
    ThesisRisk,
    ThesisAlert,
    ThesisType,
    ThesisStatus,
    ConditionStatus,
)
from app.schemas.thesis import (
    ThesisCreate,
    ThesisUpdate,
    ThesisResponse,
    ThesisListResponse,
    ConditionCreate,
    ConditionResponse,
    RiskCreate,
    RiskResponse,
    AlertResponse,
    MonitorSnapshot,
)
from app.services.thesis_monitor import thesis_monitor

router = APIRouter()


@router.post("", response_model=ThesisResponse, status_code=201)
async def create_thesis(
    body: ThesisCreate,
    session: AsyncSession = Depends(get_db),
):
    """Create a new investment thesis with conditions and risks."""
    # Create thesis
    thesis = Thesis(
        user_id=body.user_id,
        stock_id=body.stock_id,
        title=body.title,
        thesis_type=ThesisType(body.thesis_type),
        core_reason=body.core_reason,
        detailed_analysis=body.detailed_analysis,
        confidence_level=body.confidence_level,
        target_price=body.target_price,
        entry_price=body.entry_price,
        time_horizon=body.time_horizon,
    )
    session.add(thesis)

    # Add conditions
    for cond in body.conditions:
        condition = ThesisCondition(
            thesis_id=thesis.id,
            condition_type=cond.condition_type,
            condition=cond.condition,
            data_source=cond.data_source,
        )
        session.add(condition)

    # Add risks
    for risk in body.risks:
        risk_obj = ThesisRisk(
            thesis_id=thesis.id,
            risk_type=risk.risk_type,
            risk_description=risk.risk_description,
            probability=risk.probability,
            impact=risk.impact,
            mitigation=risk.mitigation,
        )
        session.add(risk_obj)

    await session.commit()
    await session.refresh(thesis)

    return _to_response(thesis)


@router.get("", response_model=List[ThesisListResponse])
async def list_theses(
    user_id: uuid.UUID = Query(...),
    status: Optional[str] = None,
    stock_id: Optional[uuid.UUID] = None,
    session: AsyncSession = Depends(get_db),
):
    """List all theses for a user, optionally filtered."""
    stmt = select(Thesis).where(Thesis.user_id == user_id)

    if status:
        stmt = stmt.where(Thesis.status == ThesisStatus(status))
    if stock_id:
        stmt = stmt.where(Thesis.stock_id == stock_id)

    stmt = stmt.order_by(Thesis.updated_at.desc()).options(
        selectinload(Thesis.conditions),
        selectinload(Thesis.risks),
    )

    result = await session.execute(stmt)
    theses = result.scalars().all()

    return [
        ThesisListResponse(
            id=t.id,
            title=t.title,
            thesis_type=t.thesis_type.value,
            core_reason=t.core_reason[:200],
            confidence_level=t.confidence_level,
            status=t.status.value,
            condition_summary=_condition_summary(t.conditions),
            updated_at=t.updated_at,
        )
        for t in theses
    ]


@router.get("/{thesis_id}", response_model=ThesisResponse)
async def get_thesis(
    thesis_id: uuid.UUID,
    session: AsyncSession = Depends(get_db),
):
    """Get full thesis details with conditions, risks, and alerts."""
    stmt = (
        select(Thesis)
        .where(Thesis.id == thesis_id)
        .options(
            selectinload(Thesis.conditions),
            selectinload(Thesis.risks),
            selectinload(Thesis.alerts),
        )
    )
    result = await session.execute(stmt)
    thesis = result.scalar_one_or_none()

    if not thesis:
        raise HTTPException(status_code=404, detail="Thesis not found")

    return _to_response(thesis)


@router.patch("/{thesis_id}", response_model=ThesisResponse)
async def update_thesis(
    thesis_id: uuid.UUID,
    body: ThesisUpdate,
    session: AsyncSession = Depends(get_db),
):
    """Update thesis details."""
    stmt = select(Thesis).where(Thesis.id == thesis_id)
    result = await session.execute(stmt)
    thesis = result.scalar_one_or_none()

    if not thesis:
        raise HTTPException(status_code=404, detail="Thesis not found")

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(thesis, key, value)

    await session.commit()
    await session.refresh(thesis)
    return _to_response(thesis)


@router.post("/{thesis_id}/close")
async def close_thesis(
    thesis_id: uuid.UUID,
    reason: str,
    pnl: Optional[float] = None,
    pnl_pct: Optional[float] = None,
    session: AsyncSession = Depends(get_db),
):
    """Close a thesis (with reasoning - for decision replay)."""
    stmt = select(Thesis).where(Thesis.id == thesis_id)
    result = await session.execute(stmt)
    thesis = result.scalar_one_or_none()

    if not thesis:
        raise HTTPException(status_code=404, detail="Thesis not found")

    thesis.status = ThesisStatus.CLOSED
    thesis.closed_at = __import__("datetime").datetime.utcnow()
    thesis.closed_reason = reason
    if pnl is not None:
        thesis.pnl = pnl
    if pnl_pct is not None:
        thesis.pnl_pct = pnl_pct

    await session.commit()
    return {"status": "closed", "thesis_id": str(thesis_id)}


@router.post("/{thesis_id}/conditions", response_model=ConditionResponse, status_code=201)
async def add_condition(
    thesis_id: uuid.UUID,
    body: ConditionCreate,
    session: AsyncSession = Depends(get_db),
):
    """Add a monitoring condition to a thesis."""
    condition = ThesisCondition(
        thesis_id=thesis_id,
        condition_type=body.condition_type,
        condition=body.condition,
        data_source=body.data_source,
    )
    session.add(condition)
    await session.commit()
    await session.refresh(condition)

    return ConditionResponse(
        id=condition.id,
        condition_type=condition.condition_type,
        condition=condition.condition,
        current_status=condition.current_status.value if condition.current_status else "valid",
    )


@router.delete("/{thesis_id}/conditions/{condition_id}", status_code=204)
async def remove_condition(
    thesis_id: uuid.UUID,
    condition_id: uuid.UUID,
    session: AsyncSession = Depends(get_db),
):
    """Remove a condition from a thesis."""
    stmt = select(ThesisCondition).where(
        ThesisCondition.id == condition_id,
        ThesisCondition.thesis_id == thesis_id,
    )
    result = await session.execute(stmt)
    condition = result.scalar_one_or_none()

    if not condition:
        raise HTTPException(status_code=404, detail="Condition not found")

    await session.delete(condition)
    await session.commit()


@router.post("/{thesis_id}/risks", response_model=RiskResponse, status_code=201)
async def add_risk(
    thesis_id: uuid.UUID,
    body: RiskCreate,
    session: AsyncSession = Depends(get_db),
):
    """Add a risk factor to a thesis."""
    risk = ThesisRisk(
        thesis_id=thesis_id,
        risk_type=body.risk_type,
        risk_description=body.risk_description,
        probability=body.probability,
        impact=body.impact,
        mitigation=body.mitigation,
    )
    session.add(risk)
    await session.commit()
    await session.refresh(risk)

    return RiskResponse(
        id=risk.id,
        risk_type=risk.risk_type,
        risk_description=risk.risk_description,
        probability=risk.probability,
        impact=risk.impact,
    )


@router.get("/monitor-snapshot", response_model=List[MonitorSnapshot])
async def get_monitor_snapshot(
    user_id: uuid.UUID = Query(...),
    session: AsyncSession = Depends(get_db),
):
    """Get current monitoring status for all active theses."""
    stmt = (
        select(Thesis)
        .where(Thesis.user_id == user_id, Thesis.status == ThesisStatus.ACTIVE)
        .options(
            selectinload(Thesis.conditions),
            selectinload(Thesis.alerts),
        )
    )
    result = await session.execute(stmt)
    theses = result.scalars().all()

    snapshots = []
    for thesis in theses:
        conditions_status = []
        for c in thesis.conditions:
            conditions_status.append({
                "condition": c.condition[:100],
                "status": c.current_status.value if c.current_status else "valid",
            })

        unread_alerts = sum(1 for a in thesis.alerts if not a.is_read)

        snapshots.append(MonitorSnapshot(
            thesis_id=thesis.id,
            title=thesis.title,
            conditions=conditions_status,
            unread_alerts=unread_alerts,
            risk_level="critical" if any(
                c.current_status == ConditionStatus.VIOLATED for c in thesis.conditions
            ) else "warning" if any(
                c.current_status == ConditionStatus.WARNING for c in thesis.conditions
            ) else "normal",
        ))

    return snapshots


@router.post("/{thesis_id}/run-monitor")
async def run_thesis_monitor_manually(
    thesis_id: uuid.UUID,
    session: AsyncSession = Depends(get_db),
):
    """Manually trigger a thesis condition check (for testing)."""
    stmt = select(Thesis).where(Thesis.id == thesis_id).options(
        selectinload(Thesis.conditions),
    )
    result = await session.execute(stmt)
    thesis = result.scalar_one_or_none()

    if not thesis:
        raise HTTPException(status_code=404, detail="Thesis not found")

    stats = {"theses_checked": 0, "conditions_checked": 0, "alerts_generated": 0, "warnings": 0, "violations": 0}
    await thesis_monitor._evaluate_thesis(session, thesis, stats)
    await session.commit()

    return {"message": "Monitor completed", "stats": stats}


def _to_response(thesis: Thesis) -> ThesisResponse:
    return ThesisResponse(
        id=thesis.id,
        user_id=thesis.user_id,
        stock_id=thesis.stock_id,
        title=thesis.title,
        thesis_type=thesis.thesis_type.value,
        core_reason=thesis.core_reason,
        detailed_analysis=thesis.detailed_analysis,
        confidence_level=thesis.confidence_level,
        target_price=thesis.target_price,
        entry_price=thesis.entry_price,
        current_price=thesis.current_price,
        time_horizon=thesis.time_horizon,
        status=thesis.status.value,
        pnl=thesis.pnl,
        pnl_pct=thesis.pnl_pct,
        conditions=[
            ConditionResponse(
                id=c.id,
                condition_type=c.condition_type,
                condition=c.condition,
                current_status=c.current_status.value if c.current_status else "valid",
            )
            for c in (thesis.conditions or [])
        ],
        risks=[
            RiskResponse(
                id=r.id,
                risk_type=r.risk_type,
                risk_description=r.risk_description,
                probability=r.probability,
                impact=r.impact,
            )
            for r in (thesis.risks or [])
        ],
        alerts=[
            AlertResponse(
                id=a.id,
                alert_level=a.alert_level,
                alert_message=a.alert_message,
                is_read=a.is_read,
                created_at=a.created_at,
            )
            for a in (thesis.alerts or [])
        ],
        created_at=thesis.created_at,
        updated_at=thesis.updated_at,
    )


def _condition_summary(conditions):
    if not conditions:
        return {"valid": 0, "warning": 0, "violated": 0}
    return {
        "valid": sum(1 for c in conditions if c.current_status == ConditionStatus.VALID),
        "warning": sum(1 for c in conditions if c.current_status == ConditionStatus.WARNING),
        "violated": sum(1 for c in conditions if c.current_status == ConditionStatus.VIOLATED),
    }
