"""AI Screener API."""
from fastapi import APIRouter
router = APIRouter()
@router.post("/run")
async def run_screener(): pass
@router.get("/presets")
async def get_presets(): pass
@router.post("/ai-score")
async def ai_score(): pass
