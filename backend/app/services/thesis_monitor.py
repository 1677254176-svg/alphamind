"""
Thesis Monitor Service - The heart of AlphaMind.

Automatically monitors active investment theses by checking their validity conditions
against real-world data. This transforms investment management from "set and forget"
to proactive, data-driven conviction tracking.

Architecture:
- Scheduled worker runs every 6 hours (configurable)
- Queries active theses with their conditions
- For each condition, fetches relevant data (market data, financial metrics, news)
- Uses AI to evaluate if condition is still VALID, WARNING, or VIOLATED
- Generates alerts for the user
"""
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.thesis import Thesis, ThesisCondition, ThesisAlert, ThesisStatus, ConditionStatus
from app.services.ai_service import ai_service
from app.services.market_data import market_data_service
from app.services.notification import notification_service

logger = logging.getLogger("alphamind.thesis_monitor")


class ThesisMonitorService:
    """
    Monitors active investment theses and evaluates their conditions.

    The monitor checks each condition against real-world data, using AI to
    interpret whether the underlying logic still holds.
    """

    # Condition types and their data requirements
    CONDITION_HANDLERS = {
        "revenue_growth": "_check_revenue_growth",
        "capex_trend": "_check_capex_trend",
        "margin": "_check_margin",
        "market_share": "_check_market_share",
        "technical": "_check_technical",
        "macro_event": "_check_macro_event",
        "general": "_evaluate_with_ai",
    }

    async def run_monitor(self, session: AsyncSession) -> Dict[str, Any]:
        """
        Main monitoring loop. Runs through all active theses and validates conditions.
        Returns summary statistics.
        """
        start_time = datetime.utcnow()
        logger.info("Starting thesis monitor run...")

        # Fetch active theses with conditions
        stmt = (
            select(Thesis)
            .where(Thesis.status == ThesisStatus.ACTIVE)
            .options(selectinload(Thesis.conditions))
            .options(selectinload(Thesis.alerts))
        )
        result = await session.execute(stmt)
        active_theses = result.scalars().all()

        stats = {"theses_checked": 0, "conditions_checked": 0, "alerts_generated": 0, "warnings": 0, "violations": 0}

        for thesis in active_theses:
            stats["theses_checked"] += 1
            await self._evaluate_thesis(session, thesis, stats)

        # Auto-close theses where ALL conditions are violated
        await self._check_auto_close(session, active_theses)

        elapsed = (datetime.utcnow() - start_time).total_seconds()
        logger.info(f"Thesis monitor completed in {elapsed:.2f}s: {stats}")

        return stats

    async def _evaluate_thesis(
        self, session: AsyncSession, thesis: Thesis, stats: Dict[str, Any]
    ) -> None:
        """Evaluate all conditions for a single thesis."""
        for condition in thesis.conditions:
            stats["conditions_checked"] += 1

            # Get handler
            handler_name = self.CONDITION_HANDLERS.get(
                condition.condition_type, "_evaluate_with_ai"
            )
            handler = getattr(self, handler_name)

            # Evaluate
            new_status: ConditionStatus = await handler(thesis, condition, session)
            old_status = condition.current_status

            if new_status != old_status:
                condition.current_status = new_status
                condition.last_checked = datetime.utcnow()

                # Generate alert on status change
                alert = await self._create_alert(thesis, condition, new_status, old_status)
                session.add(alert)
                stats["alerts_generated"] += 1

                if new_status == ConditionStatus.WARNING:
                    stats["warnings"] += 1
                elif new_status == ConditionStatus.VIOLATED:
                    stats["violations"] += 1

        thesis.updated_at = datetime.utcnow()
        await session.commit()

    async def _evaluate_with_ai(
        self, thesis: Thesis, condition: ThesisCondition, session: AsyncSession
    ) -> ConditionStatus:
        """
        Fallback: Use AI to evaluate complex or custom conditions.

        The AI receives:
        1. The thesis core reason
        2. The specific condition text
        3. Recent relevant data (news, financials, market data)
        And determines if the condition still holds.
        """
        # Gather context for AI evaluation
        context = await self._gather_condition_context(thesis, condition, session)

        prompt = f"""
You are an investment analyst evaluating if a thesis condition still holds.

**Thesis**: {thesis.core_reason}
**Condition to check**: {condition.condition}
**Condition type**: {condition.condition_type}

**Recent relevant data**:
{context}

**Instructions**:
Return exactly ONE word: VALID, WARNING, or VIOLATED.

- VALID: The condition is clearly still true.
- WARNING: There are concerning signals but not definitive.
- VIOLATED: The condition has been clearly broken by recent data.

Return only the word, nothing else.
"""

        response = await ai_service.complete(prompt, max_tokens=10, temperature=0)
        result = response.strip().upper()

        status_map = {
            "VALID": ConditionStatus.VALID,
            "WARNING": ConditionStatus.WARNING,
            "VIOLATED": ConditionStatus.VIOLATED,
        }
        return status_map.get(result, ConditionStatus.VALID)

    async def _gather_condition_context(
        self, thesis: Thesis, condition: ThesisCondition, session: AsyncSession
    ) -> str:
        """Gather relevant data for AI condition evaluation."""
        parts = []

        # Get recent financials if available
        try:
            financials = await market_data_service.get_recent_financials(thesis.stock_id, quarters=4)
            if financials:
                parts.append(f"Recent financials: {financials}")
        except Exception as e:
            logger.warning(f"Could not fetch financials: {e}")

        # Get recent news
        try:
            news = await market_data_service.get_recent_news(thesis.stock_id, days=7)
            if news:
                parts.append(f"Recent news: {news}")
        except Exception as e:
            logger.warning(f"Could not fetch news: {e}")

        # Get price action
        try:
            price_data = await market_data_service.get_recent_prices(thesis.stock_id, days=30)
            if price_data:
                parts.append(f"Recent price action: {price_data}")
        except Exception as e:
            logger.warning(f"Could not fetch prices: {e}")

        return "\n".join(parts) if parts else "No recent data available."

    async def _create_alert(
        self,
        thesis: Thesis,
        condition: ThesisCondition,
        new_status: ConditionStatus,
        old_status: ConditionStatus,
    ) -> ThesisAlert:
        """Create an alert when a condition status changes."""
        level_map = {
            ConditionStatus.VALID: "info",
            ConditionStatus.WARNING: "warning",
            ConditionStatus.VIOLATED: "critical",
        }

        alert = ThesisAlert(
            thesis_id=thesis.id,
            alert_level=level_map[new_status],
            alert_message=(
                f"{'⚠' if new_status == ConditionStatus.WARNING else '🚨' if new_status == ConditionStatus.VIOLATED else '✅'} "
                f"Thesis condition changed: {condition.condition}\n"
                f"Status: {old_status.value} → {new_status.value}"
            ),
            condition_id=condition.id,
        )

        # Push notification
        await notification_service.send_alert(alert)

        return alert

    async def _check_auto_close(self, session, active_theses):
        """Check if any thesis should be auto-closed (all conditions violated)."""
        for thesis in active_theses:
            if not thesis.conditions:
                continue
            all_violated = all(
                c.current_status == ConditionStatus.VIOLATED for c in thesis.conditions
            )
            if all_violated:
                thesis.status = ThesisStatus.INVALIDATED
                thesis.closed_at = datetime.utcnow()
                thesis.closed_reason = "All conditions violated — auto-invalidated by Thesis Monitor"
                logger.info(f"Thesis {thesis.id} ({thesis.title}) auto-invalidated")
                await session.commit()


# Singleton
thesis_monitor = ThesisMonitorService()
