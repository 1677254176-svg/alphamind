"""AlphaMind - A-share AI Investment Research Platform (Dev Mode)"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import engine, Base

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AlphaMind", version="0.2.0")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.get("/health")
def health():
    return {"status": "healthy", "app": "AlphaMind", "market": "A-share"}

# API v1 routes
PREFIX = "/api/v1"

from app.api import theses, dashboard
app.include_router(theses.router, prefix=f"{PREFIX}/theses", tags=["Thesis"])
app.include_router(dashboard.router, prefix=f"{PREFIX}/dashboard", tags=["Dashboard"])

@app.get("/api/v1/a-share/market/indices")
def default_indices():
    return [
        {"code": "000001", "name": "上证指数", "shortName": "上证", "price": 3380.50, "change": 12.30, "changePct": 0.36},
        {"code": "399001", "name": "深证成指", "shortName": "深证", "price": 10782.30, "change": -25.60, "changePct": -0.24},
        {"code": "399006", "name": "创业板指", "shortName": "创业板", "price": 2189.10, "change": -15.20, "changePct": -0.69},
        {"code": "000688", "name": "科创50", "shortName": "科创50", "price": 987.50, "change": 8.40, "changePct": 0.86},
    ]

@app.get("/api/v1/a-share/concept/hot")
def default_concepts():
    return [
        {"name": "AI概念", "emoji": "", "changePct": 3.25, "leaderStock": "300xxx", "leaderChangePct": 9.98, "hotLevel": 95},
        {"name": "低空经济", "emoji": "", "changePct": 2.80, "leaderStock": "688xxx", "leaderChangePct": 12.50, "hotLevel": 88},
        {"name": "华为产业链", "emoji": "", "changePct": 1.95, "leaderStock": "002xxx", "leaderChangePct": 7.20, "hotLevel": 82},
        {"name": "机器人概念", "emoji": "", "changePct": 2.10, "leaderStock": "300xxx", "leaderChangePct": 10.05, "hotLevel": 90},
        {"name": "固态电池", "emoji": "", "changePct": 1.50, "leaderStock": "688xxx", "leaderChangePct": 6.80, "hotLevel": 75},
    ]

@app.get("/api/v1/dashboard/my-portfolio")
def my_portfolio():
    return {"dailyPnl": 12300, "dailyPnlPercent": 2.1, "weeklyPnl": 58000, "monthlyPnl": 230000, "totalValue": 1450000, "holdings": 8, "cash": 500000}

@app.get("/api/v1/dashboard/ai-summary")
def ai_summary():
    return {"recap": "今日A股三大指数走势分化。上证微涨0.36%报3380点，两市成交额约1.2万亿。\n\nAI概念板块继续活跃，多股涨停。北向资金今日净流入58亿，连续3日净流入。\n\n重点关注：\n美联储6月议息会议临近\n中报预披露窗口即将开启\n科创50表现强势"}

@app.get("/api/v1/catalyst/calendar/top")
def top_catalysts():
    return [
        {"date": "6月9日", "type": "CPI", "title": "5月CPI数据公布", "importance": 4},
        {"date": "6月12日", "type": "FOMC", "title": "美联储6月议息会议", "importance": 5},
        {"date": "6月20日", "type": "LPR", "title": "LPR利率公布", "importance": 4},
        {"date": "7月1日", "type": "中报", "title": "中报预披露开始", "importance": 4},
        {"date": "8月31日", "type": "中报", "title": "中报披露截止日", "importance": 5},
    ]
