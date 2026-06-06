"""Notes API - Obsidian-style knowledge base."""
from fastapi import APIRouter
router = APIRouter()
@router.get("")
async def list_notes(): pass
@router.post("")
async def create_note(): pass
@router.get("/{id}")
async def get_note(id: str): pass
@router.get("/{id}/backlinks")
async def backlinks(id: str): pass
@router.get("/graph")
async def knowledge_graph(): pass
@router.post("/search-semantic")
async def semantic_search(): pass
