# AlphaMind

> 个人版 Bloomberg + Notion + Obsidian + AI Analyst

AI-powered investment research platform for building long-term investment knowledge, industry understanding, and decision-making systems.

## Architecture

```
alphamind/
├── frontend/    ← Next.js 14 + TypeScript + TailwindCSS + shadcn/ui
├── backend/     ← FastAPI + Python + PostgreSQL + Redis
└── docker/      ← Docker Compose for local dev
```

## Quick Start

```bash
# 1. Clone
git clone <repo-url> && cd alphamind

# 2. Environment
cp .env.example .env
# Edit .env with your API keys

# 3. Start services
docker compose -f docker/docker-compose.yml up -d

# 4. Frontend
cd frontend && npm install && npm run dev
# → http://localhost:3000

# 5. Backend API docs
# → http://localhost:8000/api/docs
```

## Core Features

| Module | Description |
|--------|-------------|
| **Thesis Monitor** | Auto-validate investment theses against real-world data |
| **Stock Research** | Company profiles, financials, news, technical analysis |
| **AI Screener** | Multi-dimensional scoring (0-100) with explainable rankings |
| **Sentiment Engine** | Aggregated market sentiment from news, social, and analyst data |
| **Research Notes** | Obsidian-style markdown with bidirectional links and knowledge graph |
| **Decision Replay** | Record buy/sell decisions and learn from outcomes |
| **Catalyst Calendar** | Track earnings, FOMC, CPI, product launches |
| **AI Chat Assistant** | RAG-enhanced Q&A using your research notes and data |

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, shadcn/ui, ECharts
- **Backend**: FastAPI, SQLAlchemy 2.0, Pydantic v2, Alembic
- **Database**: PostgreSQL + TimescaleDB + pgvector
- **Cache**: Redis
- **AI**: OpenAI API (GPT-4o, text-embedding-3-small)
- **Workers**: Celery + Redis
- **Deploy**: Docker, Vercel, Railway
