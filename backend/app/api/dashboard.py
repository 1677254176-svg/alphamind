"""Dashboard API."""
from fastapi import APIRouter
router = APIRouter()
@router.get("/market-overview")
async def market_overview(): pass
@router.get("/hot-themes")
async def hot_themes(): pass
@router.get("/my-portfolio")
async def my_portfolio(): pass
@router.get("/ai-summary")
async def ai_summary(): pass
