"""Decision Replay API."""
from fastapi import APIRouter
router = APIRouter()
@router.post("")
async def log_decision(): pass
@router.get("")
async def list_decisions(): pass
@router.get("/analytics")
async def analytics(): pass
