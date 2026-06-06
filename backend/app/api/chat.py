"""AI Chat API - SSE streaming."""
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
router = APIRouter()
@router.post("")
async def chat(message: str):
    async def stream():
        yield "data: " + '{"type":"done"}' + "\n\n"
    return StreamingResponse(stream(), media_type="text/event-stream")
@router.get("/history")
async def history(): pass
