"""Catalyst Calendar API."""
from fastapi import APIRouter
router = APIRouter()
@router.get("/calendar")
async def calendar(): pass
@router.get("/calendar/top")
async def top_catalysts(): pass
@router.post("/track")
async def track(): pass
