"""
Background worker tasks for AlphaMind.
"""
import asyncio
import logging
from celery import shared_task
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.services.thesis_monitor import thesis_monitor

logger = logging.getLogger("alphamind.workers")

# Worker-specific DB engine
engine = create_async_engine(settings.database_url)


@shared_task(name="app.workers.tasks.run_thesis_monitor")
def run_thesis_monitor():
    """Run thesis condition validation across all active theses."""
    async def _run():
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        async with async_session() as session:
            stats = await thesis_monitor.run_monitor(session)
            logger.info(f"Thesis monitor completed: {stats}")

    asyncio.run(_run())


@shared_task(name="app.workers.tasks.sync_market_data")
def sync_market_data():
    """Sync latest market prices and indices."""
    # Implementation would call market_data_service.sync_all()
    logger.info("Market data sync started")


@shared_task(name="app.workers.tasks.generate_daily_recap")
def generate_daily_recap():
    """Generate AI daily market recap."""
    logger.info("Daily AI recap generation started")


@shared_task(name="app.workers.tasks.crawl_news")
def crawl_news():
    """Crawl news from configured sources."""
    logger.info("News crawl started")
