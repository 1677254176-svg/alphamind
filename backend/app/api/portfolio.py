"""Portfolio API."""
from fastapi import APIRouter
router = APIRouter()
@router.post("")
async def create_portfolio(): pass
@router.get("")
async def list_portfolios(): pass
@router.get("/{id}")
async def get_portfolio(id: str): pass
@router.post("/{id}/transactions")
async def record_transaction(id: str): pass
@router.get("/{id}/analytics")
async def analytics(id: str): pass
