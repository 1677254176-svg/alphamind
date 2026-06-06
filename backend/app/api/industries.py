"""Industry Chain API."""
from fastapi import APIRouter
router = APIRouter()
@router.get("")
async def list_industries(): pass
@router.get("/{id}/chain")
async def industry_chain(id: str): pass
@router.get("/{id}/outlook")
async def outlook(id: str): pass
