"""AlphaMind - A-share AI Investment Research Platform (Dev Mode)"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AlphaMind", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PREFIX = "/api/v1"

@app.get("/health")
def health():
    return {"status": "healthy", "app": "AlphaMind", "market": "A-share"}


# ═══════════════════════════════════════════════════════════
# Dashboard
# ═══════════════════════════════════════════════════════════

@app.get(f"{PREFIX}/a-share/market/indices")
def market_indices():
    return [
        {"code": "000001", "name": "上证指数", "shortName": "上证", "price": 3380.50, "change": 12.30, "changePct": 0.36},
        {"code": "399001", "name": "深证成指", "shortName": "深证", "price": 10782.30, "change": -25.60, "changePct": -0.24},
        {"code": "399006", "name": "创业板指", "shortName": "创业板", "price": 2189.10, "change": -15.20, "changePct": -0.69},
        {"code": "000688", "name": "科创50", "shortName": "科创50", "price": 987.50, "change": 8.40, "changePct": 0.86},
        {"code": "899050", "name": "北证50", "shortName": "北证50", "price": 1253.80, "change": 5.60, "changePct": 0.45},
    ]

@app.get(f"{PREFIX}/a-share/concept/hot")
def hot_concepts():
    return [
        {"name": "AI概念", "emoji": "🤖", "changePct": 3.25, "leaderStock": "300308", "leaderChangePct": 9.98, "hotLevel": 95},
        {"name": "低空经济", "emoji": "🚁", "changePct": 2.80, "leaderStock": "688070", "leaderChangePct": 12.50, "hotLevel": 88},
        {"name": "华为产业链", "emoji": "📱", "changePct": 1.95, "leaderStock": "002855", "leaderChangePct": 7.20, "hotLevel": 82},
        {"name": "机器人概念", "emoji": "🦾", "changePct": 2.10, "leaderStock": "300024", "leaderChangePct": 10.05, "hotLevel": 90},
        {"name": "固态电池", "emoji": "🔋", "changePct": 1.50, "leaderStock": "688005", "leaderChangePct": 6.80, "hotLevel": 75},
    ]

@app.get(f"{PREFIX}/dashboard/my-portfolio")
def my_portfolio():
    return {
        "dailyPnl": 12300, "dailyPnlPercent": 2.1,
        "weeklyPnl": 58000, "monthlyPnl": 230000,
        "totalValue": 1450000, "holdings": 8, "cash": 500000,
    }

@app.get(f"{PREFIX}/dashboard/ai-summary")
def ai_summary():
    return {
        "recap": (
            "📊 今日A股三大指数走势分化。上证微涨0.36%报3380点，两市成交额约1.2万亿。\n\n"
            "🔥 AI概念板块继续活跃，多股涨停。北向资金今日净流入58亿，连续3日净流入。\n\n"
            "📌 重点关注：\n"
            "• 美联储6月议息会议临近\n"
            "• 中报预披露窗口即将开启\n"
            "• 科创50表现强势，资金持续流入"
        )
    }

@app.get(f"{PREFIX}/theses/monitor-snapshot")
def thesis_monitor_snapshot():
    return [
        {"thesisId": "1", "title": "宁德时代：全球市占率", "level": "warning",
         "message": "营收增速降至12%，接近失效条件(10%)", "stockCode": "300750"},
        {"thesisId": "2", "title": "天齐锂业：锂价反弹", "level": "critical",
         "message": "碳酸锂跌破7万/吨，逻辑已失效", "stockCode": "002466"},
    ]

@app.get(f"{PREFIX}/catalyst/calendar/top")
def top_catalysts():
    return [
        {"date": "6月9日", "type": "CPI", "title": "5月CPI数据公布", "importance": 4},
        {"date": "6月12日", "type": "FOMC", "title": "美联储6月议息会议", "importance": 5},
        {"date": "6月20日", "type": "LPR", "title": "LPR利率公布", "importance": 4},
        {"date": "7月1日", "type": "中报", "title": "中报预披露开始", "importance": 4},
        {"date": "8月31日", "type": "中报", "title": "中报披露截止日", "importance": 5},
    ]


# ═══════════════════════════════════════════════════════════
# Stocks - 股票研究中心
# ═══════════════════════════════════════════════════════════

@app.get(f"{PREFIX}/stocks")
def stock_list(market: str = "A"):
    return [
        {"code": "300750", "name": "宁德时代", "board": "创业板", "price": 196.50, "changePct": 2.35,
         "pe": 25.6, "marketCap": 8640, "concept": "固态电池", "brokerRating": "买入"},
        {"code": "688981", "name": "中芯国际", "board": "科创板", "price": 45.80, "changePct": -1.20,
         "pe": 42.3, "marketCap": 3650, "concept": "半导体", "brokerRating": "增持"},
        {"code": "002466", "name": "天齐锂业", "board": "深市主板", "price": 68.30, "changePct": -3.45,
         "pe": 18.7, "marketCap": 1120, "concept": "锂矿", "brokerRating": "中性"},
        {"code": "300308", "name": "中际旭创", "board": "创业板", "price": 89.20, "changePct": 5.67,
         "pe": 35.1, "marketCap": 720, "concept": "AI概念", "brokerRating": "买入"},
        {"code": "600519", "name": "贵州茅台", "board": "沪市主板", "price": 1680.00, "changePct": 0.15,
         "pe": 28.9, "marketCap": 21100, "concept": "白酒", "brokerRating": "买入"},
        {"code": "688070", "name": "纵横股份", "board": "科创板", "price": 52.40, "changePct": 8.90,
         "pe": 65.2, "marketCap": 280, "concept": "低空经济", "brokerRating": "增持"},
        {"code": "000858", "name": "五粮液", "board": "深市主板", "price": 152.00, "changePct": -0.85,
         "pe": 22.3, "marketCap": 5900, "concept": "白酒", "brokerRating": "买入"},
        {"code": "002230", "name": "科大讯飞", "board": "深市主板", "price": 42.30, "changePct": 1.80,
         "pe": 48.5, "marketCap": 980, "concept": "AI概念", "brokerRating": "买入"},
    ]

@app.get(f"{PREFIX}/stocks/{'{ticker}'}")
def stock_profile(ticker: str):
    stocks = {
        "300750": {"name": "宁德时代", "fullName": "宁德时代新能源科技股份有限公司", "board": "创业板", "industry": "电力设备",
                   "founded": "2011", "listed": "2018", "employees": 110000, "headquarters": "福建宁德",
                   "businessModel": "全球领先的新能源创新科技公司，专注动力电池和储能电池的研发、生产及销售。",
                   "coreProducts": "麒麟电池、钠离子电池、凝聚态电池、储能系统",
                   "moat": "技术领先+规模效应+客户绑定，全球市占率约37%",
                   "price": 196.50, "changePct": 2.35, "pe": 25.6, "pb": 4.2, "marketCap": 8640,
                   "revenue": [{"year": 2021, "value": 1304}, {"year": 2022, "value": 3286}, {"year": 2023, "value": 4020}, {"year": 2024, "value": 3580}, {"year": 2025, "value": 4200}],
                   "eps": [{"year": 2021, "value": 6.88}, {"year": 2022, "value": 12.92}, {"year": 2023, "value": 15.79}, {"year": 2024, "value": 14.20}, {"year": 2025, "value": 16.50}],
                   "roe": [{"year": 2021, "value": 24.5}, {"year": 2022, "value": 28.3}, {"year": 2023, "value": 26.1}, {"year": 2024, "value": 22.8}, {"year": 2025, "value": 24.0}],
                   "grossMargin": 22.5, "netMargin": 10.2,
                   "brokerConsensus": {"rating": "买入", "targetPrice": 245.00, "upside": 24.7},
                   "technicals": {"ma5": 190.20, "ma20": 185.60, "ma60": 178.40, "rsi": 62.5, "macd": "金叉", "bollPosition": "中轨上方"}},
        "688981": {"name": "中芯国际", "fullName": "中芯国际集成电路制造有限公司", "board": "科创板", "industry": "半导体",
                   "founded": "2000", "listed": "2020", "employees": 21000, "headquarters": "上海",
                   "businessModel": "中国大陆技术最先进、规模最大的集成电路晶圆代工企业。",
                   "coreProducts": "14nm/28nm/55nm制程晶圆代工、BCD工艺平台",
                   "moat": "国内唯一先进制程制造能力+政策扶持，成熟制程全球竞争力强",
                   "price": 45.80, "changePct": -1.20, "pe": 42.3, "pb": 3.8, "marketCap": 3650,
                   "revenue": [{"year": 2021, "value": 545}, {"year": 2022, "value": 495}, {"year": 2023, "value": 452}, {"year": 2024, "value": 520}, {"year": 2025, "value": 580}],
                   "eps": [{"year": 2021, "value": 1.36}, {"year": 2022, "value": 1.24}, {"year": 2023, "value": 1.08}, {"year": 2024, "value": 1.30}, {"year": 2025, "value": 1.45}],
                   "roe": [{"year": 2021, "value": 8.2}, {"year": 2022, "value": 7.5}, {"year": 2023, "value": 6.3}, {"year": 2024, "value": 7.8}, {"year": 2025, "value": 8.5}],
                   "grossMargin": 20.8, "netMargin": 8.5,
                   "brokerConsensus": {"rating": "增持", "targetPrice": 52.00, "upside": 13.5},
                   "technicals": {"ma5": 46.30, "ma20": 47.10, "ma60": 44.20, "rsi": 42.8, "macd": "死叉", "bollPosition": "中轨下方"}},
    }
    default = {"name": ticker, "fullName": f"股票 {ticker}", "board": "主板", "industry": "未知",
               "founded": "--", "listed": "--", "employees": 0, "headquarters": "--",
               "businessModel": "暂无数据，请通过东方财富API获取",
               "coreProducts": "--", "moat": "--",
               "price": 0, "changePct": 0, "pe": 0, "pb": 0, "marketCap": 0,
               "revenue": [], "eps": [], "roe": [],
               "grossMargin": 0, "netMargin": 0,
               "brokerConsensus": {"rating": "--", "targetPrice": 0, "upside": 0},
               "technicals": {"ma5": 0, "ma20": 0, "ma60": 0, "rsi": 50, "macd": "--", "bollPosition": "--"}}
    return stocks.get(ticker, default)


# ═══════════════════════════════════════════════════════════
# Theses
# ═══════════════════════════════════════════════════════════

@app.get(f"{PREFIX}/theses")
def list_theses():
    return [
        {"id": "1", "title": "宁德时代：全球动力电池龙头", "thesis_type": "long", "status": "active",
         "confidence_level": 8, "condition_summary": {"valid": 3, "warning": 1, "violated": 0},
         "updated_at": "2026-06-06", "stockCode": "300750", "stockName": "宁德时代",
         "core_reason": "全球电动化趋势持续，宁德时代技术+规模双轮驱动，市占率稳居第一"},
        {"id": "2", "title": "天齐锂业：锂价触底反弹", "thesis_type": "long", "status": "invalidated",
         "confidence_level": 5, "condition_summary": {"valid": 0, "warning": 1, "violated": 2},
         "updated_at": "2026-05-20", "stockCode": "002466", "stockName": "天齐锂业",
         "core_reason": "碳酸锂价格跌破成本线后反弹，格林布什矿低成本优势"},
        {"id": "3", "title": "中际旭创：AI光模块龙头", "thesis_type": "long", "status": "active",
         "confidence_level": 9, "condition_summary": {"valid": 4, "warning": 0, "violated": 0},
         "updated_at": "2026-06-05", "stockCode": "300308", "stockName": "中际旭创",
         "core_reason": "AI算力需求爆发，800G光模块出货量全球第一，业绩持续超预期"},
    ]

@app.get(f"{PREFIX}/theses/{'{thesis_id}'}")
def get_thesis(thesis_id: str):
    theses = {
        "1": {
            "id": "1", "title": "宁德时代：全球动力电池龙头", "thesis_type": "long", "status": "active",
            "confidence_level": 8, "core_reason": "全球电动化趋势持续，宁德时代技术+规模双轮驱动，市占率稳居第一",
            "detailed_analysis": "1. 全球新能源汽车渗透率仍低于30%，增长空间大\n2. 宁德时代全球市占率37%，第二名仅15%\n3. 麒麟电池、钠离子电池技术领先\n4. 与特斯拉、宝马、奔驰等深度绑定",
            "target_price": 245.00, "entry_price": 185.00, "time_horizon": "12个月",
            "stockCode": "300750", "stockName": "宁德时代",
            "conditions": [
                {"condition": "全球新能源汽车销量同比增长>15%", "current_status": "valid", "last_check": "2026-06-06"},
                {"condition": "宁德时代全球市占率>30%", "current_status": "valid", "last_check": "2026-06-06"},
                {"condition": "营收增速>20%", "current_status": "warning", "last_check": "2026-06-05"},
                {"condition": "毛利率>20%", "current_status": "valid", "last_check": "2026-06-06"},
            ],
            "risks": [
                {"risk_description": "新能源汽车销量增速放缓", "probability": "中等", "impact": "高", "mitigation": "关注储能业务增长"},
                {"risk_description": "技术路线变革（固态电池）", "probability": "低", "impact": "极高", "mitigation": "宁德也在布局固态电池"},
                {"risk_description": "原材料价格上涨", "probability": "中等", "impact": "中", "mitigation": "长期合同锁定价格"},
            ],
            "alerts": [
                {"message": "营收增速降至12%，接近失效条件", "severity": "warning", "created_at": "2026-06-05"},
            ],
            "created_at": "2026-01-15", "updated_at": "2026-06-06",
        }
    }
    return theses.get(thesis_id, {"id": thesis_id, "title": "未知 Thesis", "status": "unknown"})


# ═══════════════════════════════════════════════════════════
# Industries - 产业链中心
# ═══════════════════════════════════════════════════════════

@app.get(f"{PREFIX}/industries")
def list_industries():
    return [
        {"id": "ai", "name": "AI人工智能", "emoji": "🤖", "hotLevel": 98, "description": "大模型+算力+应用"},
        {"id": "robot", "name": "机器人", "emoji": "🦾", "hotLevel": 90, "description": "人形机器人+工业自动化"},
        {"id": "semiconductor", "name": "半导体", "emoji": "💾", "hotLevel": 85, "description": "芯片设计+制造+封测"},
        {"id": "new_energy", "name": "新能源", "emoji": "⚡", "hotLevel": 78, "description": "光伏+风电+储能+锂电"},
        {"id": "low_altitude", "name": "低空经济", "emoji": "🚁", "hotLevel": 92, "description": "eVTOL+无人机+空管"},
    ]

@app.get(f"{PREFIX}/industries/{'{industry_id}'}")
def get_industry(industry_id: str):
    industries = {
        "ai": {
            "id": "ai", "name": "AI人工智能", "emoji": "🤖",
            "description": "人工智能产业链覆盖大模型训练、AI芯片、算力基础设施到行业应用落地",
            "chain": {
                "upstream": {"label": "上游：算力基础设施", "stocks": [
                    {"code": "688981", "name": "中芯国际", "role": "芯片制造", "marketCap": 3650},
                    {"code": "300308", "name": "中际旭创", "role": "光模块", "marketCap": 720},
                    {"code": "688256", "name": "寒武纪", "role": "AI芯片", "marketCap": 580},
                ]},
                "midstream": {"label": "中游：大模型与平台", "stocks": [
                    {"code": "002230", "name": "科大讯飞", "role": "大模型+应用", "marketCap": 980},
                    {"code": "300033", "name": "同花顺", "role": "AI+金融", "marketCap": 680},
                ]},
                "downstream": {"label": "下游：行业应用", "stocks": [
                    {"code": "300750", "name": "宁德时代", "role": "AI+智造", "marketCap": 8640},
                    {"code": "002415", "name": "海康威视", "role": "AI+安防", "marketCap": 3200},
                ]},
            },
            "marketSize": "2026年预计全球AI市场规模达3000亿美元",
            "growthRate": "CAGR 37%",
            "risks": ["算力芯片出口管制", "大模型商业化不及预期", "数据安全和隐私监管"],
            "opportunities": ["国产替代加速", "AI Agent应用爆发", "AI+行业渗透率提升"],
        }
    }
    default = {"id": industry_id, "name": "未知产业", "description": "暂无数据", "chain": {},
               "marketSize": "--", "growthRate": "--", "risks": [], "opportunities": []}
    return industries.get(industry_id, default)


# ═══════════════════════════════════════════════════════════
# Screener - 选股器
# ═══════════════════════════════════════════════════════════

@app.get(f"{PREFIX}/screener/results")
def screener_results(peMin: float = 0, peMax: float = 200, marketCapMin: float = 0,
                     roeMin: float = 0, board: str = "", concept: str = ""):
    results = [
        {"code": "300750", "name": "宁德时代", "board": "创业板", "price": 196.50, "pe": 25.6, "pb": 4.2,
         "roe": 24.0, "marketCap": 8640, "revenueGrowth": 17.3, "score": 92},
        {"code": "300308", "name": "中际旭创", "board": "创业板", "price": 89.20, "pe": 35.1, "pb": 6.8,
         "roe": 22.5, "marketCap": 720, "revenueGrowth": 45.2, "score": 88},
        {"code": "600519", "name": "贵州茅台", "board": "沪市主板", "price": 1680.00, "pe": 28.9, "pb": 8.5,
         "roe": 30.2, "marketCap": 21100, "revenueGrowth": 15.1, "score": 85},
        {"code": "002230", "name": "科大讯飞", "board": "深市主板", "price": 42.30, "pe": 48.5, "pb": 5.1,
         "roe": 15.8, "marketCap": 980, "revenueGrowth": 28.6, "score": 78},
        {"code": "688981", "name": "中芯国际", "board": "科创板", "price": 45.80, "pe": 42.3, "pb": 3.8,
         "roe": 8.5, "marketCap": 3650, "revenueGrowth": 11.5, "score": 72},
        {"code": "688070", "name": "纵横股份", "board": "科创板", "price": 52.40, "pe": 65.2, "pb": 7.2,
         "roe": 12.3, "marketCap": 280, "revenueGrowth": 38.9, "score": 75},
    ]
    filtered = [r for r in results
                if (not peMin or r["pe"] >= peMin) and (not peMax or r["pe"] <= peMax)
                and (not marketCapMin or r["marketCap"] >= marketCapMin)
                and (not roeMin or r["roe"] >= roeMin)
                and (not board or r["board"] == board)
                and (not concept or concept in r.get("concept", ""))]
    return filtered or results


# ═══════════════════════════════════════════════════════════
# Portfolio - 持仓管理
# ═══════════════════════════════════════════════════════════

@app.get(f"{PREFIX}/portfolio/holdings")
def portfolio_holdings():
    return [
        {"code": "300750", "name": "宁德时代", "board": "创业板", "shares": 1000, "cost": 185.00,
         "price": 196.50, "pnl": 11500, "pnlPct": 6.22, "weight": 13.6},
        {"code": "300308", "name": "中际旭创", "board": "创业板", "shares": 3000, "cost": 72.00,
         "price": 89.20, "pnl": 51600, "pnlPct": 23.89, "weight": 18.5},
        {"code": "600519", "name": "贵州茅台", "board": "沪市主板", "shares": 200, "cost": 1620.00,
         "price": 1680.00, "pnl": 12000, "pnlPct": 3.70, "weight": 23.2},
        {"code": "688981", "name": "中芯国际", "board": "科创板", "shares": 5000, "cost": 42.00,
         "price": 45.80, "pnl": 19000, "pnlPct": 9.05, "weight": 15.8},
        {"code": "002230", "name": "科大讯飞", "board": "深市主板", "shares": 2000, "cost": 38.50,
         "price": 42.30, "pnl": 7600, "pnlPct": 9.87, "weight": 5.8},
    ]

@app.get(f"{PREFIX}/portfolio/summary")
def portfolio_summary():
    return {
        "totalValue": 1450000, "totalCost": 1350000, "totalPnl": 100000, "totalPnlPct": 7.41,
        "dailyPnl": 12300, "dailyPnlPct": 0.85,
        "holdings": 5, "cash": 500000, "cashPct": 34.5,
        "boardExposure": {"创业板": 32.1, "沪市主板": 23.2, "科创板": 15.8, "深市主板": 5.8},
    }


# ═══════════════════════════════════════════════════════════
# Notes - 研究笔记
# ═══════════════════════════════════════════════════════════

@app.get(f"{PREFIX}/notes")
def list_notes(tag: str = ""):
    notes = [
        {"id": "1", "title": "AI算力产业链梳理", "tags": ["AI", "算力", "半导体"],
         "preview": "从GPU到光模块，AI算力产业链的核心环节分析...", "updated_at": "2026-06-06", "linkedStocks": ["300308", "688256"]},
        {"id": "2", "title": "固态电池技术路线对比", "tags": ["新能源", "固态电池"],
         "preview": "硫化物vs氧化物vs聚合物，三种技术路线的优劣势分析...", "updated_at": "2026-06-05", "linkedStocks": ["300750"]},
        {"id": "3", "title": "美联储加息周期回顾", "tags": ["宏观", "美联储"],
         "preview": "复盘2015-2026年加息周期对A股的影响...", "updated_at": "2026-06-04", "linkedStocks": []},
        {"id": "4", "title": "低空经济政策汇总", "tags": ["低空经济", "政策"],
         "preview": "中央到地方的低空经济政策梳理与投资机会...", "updated_at": "2026-06-03", "linkedStocks": ["688070"]},
    ]
    if tag:
        notes = [n for n in notes if tag in n["tags"]]
    return notes


# ═══════════════════════════════════════════════════════════
# Decisions - 决策回放
# ═══════════════════════════════════════════════════════════

@app.get(f"{PREFIX}/decisions")
def list_decisions():
    return [
        {"id": "1", "stockCode": "300308", "stockName": "中际旭创", "action": "买入",
         "date": "2026-04-15", "price": 72.00, "reason": "AI光模块需求爆发，800G出货量超预期",
         "result": {"pnlPct": 23.89, "outcome": "成功", "review": "逻辑验证正确，AI算力投资持续增长"}},
        {"id": "2", "stockCode": "002466", "stockName": "天齐锂业", "action": "买入",
         "date": "2026-03-10", "price": 78.00, "reason": "锂价触底反弹预期",
         "result": {"pnlPct": -12.44, "outcome": "失败", "review": "锂价反弹不及预期，产能过剩局面未改善"}},
        {"id": "3", "stockCode": "600519", "stockName": "贵州茅台", "action": "买入",
         "date": "2026-01-20", "price": 1620.00, "reason": "估值回归合理区间，防御性配置",
         "result": {"pnlPct": 3.70, "outcome": "进行中", "review": "稳健持有，等待消费复苏信号"}},
        {"id": "4", "stockCode": "300750", "stockName": "宁德时代", "action": "加仓",
         "date": "2026-05-08", "price": 190.00, "reason": "Q1业绩超预期，储能业务高增长",
         "result": {"pnlPct": 3.42, "outcome": "进行中", "review": "逻辑持续验证，关注Q2营收增速"}},
    ]


# ═══════════════════════════════════════════════════════════
# Chat - AI投资助手
# ═══════════════════════════════════════════════════════════

from pydantic import BaseModel

class ChatRequest(BaseModel):
    question: str

@app.post(f"{PREFIX}/chat/ask")
def chat_ask(req: ChatRequest):
    answers = {
        "宁德时代": "宁德时代（300750）是全球动力电池龙头，全球市占率约37%。\n\n"
                    "📊 核心逻辑：\n"
                    "1. 全球电动化渗透率仍低于30%，增长空间大\n"
                    "2. 储能业务高速增长，有望成为第二增长曲线\n"
                    "3. 技术壁垒+规模效应+客户绑定形成护城河\n\n"
                    "⚠️ 风险关注：营收增速是否保持在20%以上\n"
                    "📈 券商共识：买入 | 目标价 ¥245 (+24.7%)",
        "default": "这是一个很好的问题！基于当前市场数据和你的研究记录，我来分析：\n\n"
                   "📌 建议关注以下几个维度：\n"
                   "1. 行业景气度趋势\n"
                   "2. 公司基本面变化\n"
                   "3. 资金面和技术面信号\n\n"
                   "🔍 你可以继续问我具体股票的分析，比如"宁德时代怎么样？"\n"
                   "需要我深入分析哪个方面？",
    }
    for keyword, answer in answers.items():
        if keyword in req.question:
            return {"answer": answer}
    return {"answer": answers["default"]}


# ═══════════════════════════════════════════════════════════
# Settings
# ═══════════════════════════════════════════════════════════

@app.get(f"{PREFIX}/settings")
def get_settings():
    return {
        "theme": "dark",
        "language": "zh-CN",
        "defaultMarket": "A",
        "notifications": {"thesis_alerts": True, "catalyst_reminders": True, "price_alerts": False},
        "dataSources": {"primary": "eastmoney", "backup": "sina"},
    }