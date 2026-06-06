"""RAG service with pgvector."""
class RAGService:
    async def embed_and_store(self, note_id, content): pass
    async def search_similar(self, query): pass
    async def answer_with_context(self, question, stock_code=None): pass
rag_service = RAGService()
