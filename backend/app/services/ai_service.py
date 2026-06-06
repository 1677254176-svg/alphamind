"""
AI Service - OpenAI integration with RAG capabilities.

Handles:
- Text completion (GPT-4o)
- Embedding generation (text-embedding-3-small)
- RAG-enhanced chat responses
- Financial analysis prompts
"""
import logging
from typing import List, Dict, Optional, AsyncIterator
from openai import AsyncOpenAI
from app.config import settings

logger = logging.getLogger("alphamind.ai_service")


class AIService:
    """Centralized AI service for all AlphaMind AI features."""

    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model
        self.embedding_model = getattr(settings, "openai_embedding_model", "text-embedding-3-small")

    async def complete(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 2048,
        temperature: float = 0.3,
    ) -> str:
        """Simple text completion."""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
        )
        return response.choices[0].message.content or ""

    async def stream_complete(
        self, messages: List[Dict], max_tokens: int = 2048, temperature: float = 0.3
    ) -> AsyncIterator[str]:
        """Streaming text completion for chat interface."""
        stream = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
            stream=True,
        )
        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def embed(self, text: str) -> List[float]:
        """Generate embedding vector for semantic search."""
        response = await self.client.embeddings.create(
            model=self.embedding_model,
            input=text,
        )
        return response.data[0].embedding

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts."""
        response = await self.client.embeddings.create(
            model=self.embedding_model,
            input=texts,
        )
        return [d.embedding for d in response.data]

    async def analyze_financials(self, stock_name: str, financial_data: Dict) -> str:
        """Generate AI analysis of financial statements."""
        prompt = f"""
You are a senior equity research analyst. Analyze the following financial data for {stock_name}.

Financial Data:
{financial_data}

Provide:
1. Revenue trend analysis (YoY and QoQ)
2. Profitability assessment (margins, ROE, ROIC)
3. Cash flow health
4. Key strengths and concerns
5. Overall assessment (Bullish / Neutral / Bearish) with brief reasoning
"""
        return await self.complete(prompt, max_tokens=1024, temperature=0.2)

    async def summarize_news(self, stock_name: str, news_articles: List[Dict]) -> str:
        """Summarize recent news with sentiment classification."""
        articles_text = "\n".join(
            f"- [{a.get('date', 'N/A')}] {a.get('title', '')}: {a.get('summary', '')[:200]}"
            for a in news_articles[:10]
        )

        prompt = f"""
Summarize recent news sentiment for {stock_name}.

Articles:
{articles_text}

Provide:
1. Key themes across news
2. Bullish signals (with specific examples)
3. Bearish signals (with specific examples)
4. Overall sentiment score (0-100 where 50 is neutral)
"""
        return await self.complete(prompt, max_tokens=1024, temperature=0.2)

    async def daily_market_recap(self, market_data: Dict) -> str:
        """Generate daily market recap with AI analysis."""
        prompt = f"""
You are a senior market strategist. Write today's market recap.

Market Data:
{market_data}

Structure:
1. What happened today (1-2 sentences on major moves)
2. Most impactful events (top 3 with brief explanation)
3. Sector performance highlights
4. Key things to watch tomorrow
5. One actionable insight

Keep it concise and data-driven. Avoid vague language.
"""
        return await self.complete(prompt, max_tokens=1500, temperature=0.3)

    async def evaluate_thesis_condition(
        self, thesis_reason: str, condition: str, context: str
    ) -> str:
        """Evaluate if a thesis condition is still valid (returns VALID/WARNING/VIOLATED)."""
        prompt = f"""
**Thesis**: {thesis_reason}
**Condition**: {condition}
**Recent Context**: {context}

Return exactly one word: VALID, WARNING, or VIOLATED.
"""
        return await self.complete(prompt, max_tokens=5, temperature=0)


# Singleton
ai_service = AIService()

