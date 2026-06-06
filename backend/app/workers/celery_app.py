"""
Celery application setup with scheduled tasks for AlphaMind.

Scheduled tasks:
- Thesis Monitor: runs every 6 hours
- Market Data Sync: runs every 5 minutes (weekdays)
- News Crawler: runs every 30 minutes
- Daily AI Recap: runs at market close (4:30 PM ET)
"""
from celery import Celery
from celery.schedules import crontab
from app.config import settings

celery_app = Celery(
    "alphamind",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="US/Eastern",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=600,  # 10 min max
    task_soft_time_limit=540,  # 9 min soft limit
)

# Periodic task schedule
celery_app.conf.beat_schedule = {
    "thesis-monitor": {
        "task": "app.workers.tasks.run_thesis_monitor",
        "schedule": crontab(hour="*/6"),  # Every 6 hours
    },
    "market-data-sync": {
        "task": "app.workers.tasks.sync_market_data",
        "schedule": crontab(minute="*/5", day_of_week="1-5"),  # Weekdays every 5 min
    },
    "daily-ai-recap": {
        "task": "app.workers.tasks.generate_daily_recap",
        "schedule": crontab(hour=16, minute=30, day_of_week="1-5"),  # 4:30 PM ET weekdays
    },
    "news-crawler": {
        "task": "app.workers.tasks.crawl_news",
        "schedule": crontab(minute="*/30"),  # Every 30 min
    },
}

# Import tasks so they're registered
import app.workers.tasks  # noqa
