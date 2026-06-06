"""
A股股票研究中心 API
每只股票拥有永久研究档案：公司档案、财报、研报、龙虎榜、技术分析
"""
from fastapi import APIRouter, Query, Path
from typing import Optional

router = APIRouter()


# ─── 公司档案 ───────────────────────────────────────────

@router.get("/{ticker}")
async def get_stock_profile(ticker: str = Path(..., description="股票代码，如 300750")):
    """
    完整公司档案
    包含：公司简介、商业模式、核心产品、管理层、竞争优势、行业地位
    ⚠ A股代码说明：
    - 沪市主板: 600xxx, 601xxx, 603xxx
    - 深市主板: 000xxx, 001xxx, 002xxx
    - 创业板:   300xxx, 301xxx
    - 科创板:   688xxx, 689xxx
    - 北交所:   8xxxxx, 920xxx
    """
    pass


# ─── 财务数据 ───────────────────────────────────────────

@router.get("/{ticker}/financials")
async def get_financials(
    ticker: str,
    years: int = Query(5, description="查询年数"),
):
    """
    历年财报数据
    包含：营收、净利润、EPS、ROE、ROIC、毛利率、净利率、FCF
    支持：YoY同比、QoQ环比
    数据源：东方财富 + 巨潮资讯
    """
    pass


@router.get("/{ticker}/financials/ai-analysis")
async def get_ai_financial_analysis(ticker: str):
    """
    AI财报分析
    自动生成：营收趋势分析、盈利能力评估、现金流健康状况、风险提示
    """
    pass


# ─── 券商研报 ───────────────────────────────────────────

@router.get("/{ticker}/broker-research")
async def get_broker_research(
    ticker: str,
    limit: int = Query(20),
):
    """
    券商研报汇总
    追踪：中信证券、中金公司、国泰君安、华泰证券等主流券商
    包含：评级、目标价、目标价变动、AI摘要
    """
    pass


@router.get("/{ticker}/broker-research/summary")
async def get_broker_research_summary(ticker: str):
    """
    AI券商研报摘要
    聚合多家券商观点，统计评级分布，判断一致预期
    """
    pass


# ─── 龙虎榜 ─────────────────────────────────────────────

@router.get("/{ticker}/dragon-tiger")
async def get_stock_dragon_tiger(
    ticker: str,
    limit: int = Query(10),
):
    """
    该股票近期龙虎榜记录
    AI分析：游资倾向、机构态度、席位联动规律
    """
    pass


# ─── 北向资金(该股) ─────────────────────────────────────

@router.get("/{ticker}/northbound")
async def get_stock_northbound(ticker: str):
    """
    该股票北向资金持股变化
    持股比例走势、近期加减仓信号
    """
    pass


# ─── 所属概念板块 ───────────────────────────────────────

@router.get("/{ticker}/concepts")
async def get_stock_concepts(ticker: str):
    """
    该股票所属概念板块
    如 300750 宁德时代 → AI概念、固态电池、储能、新能源汽车
    """
    pass


# ─── 技术分析 ───────────────────────────────────────────

@router.get("/{ticker}/technicals")
async def get_technicals(
    ticker: str,
    indicators: str = Query("MA,RSI,MACD,BOLL", description="技术指标"),
):
    """
    技术分析面板
    MA均线、EMA、RSI、MACD、Bollinger Bands
    AI自动识别：突破信号、趋势反转、放量/缩量
    """
    pass


# ─── 限售股解禁 ─────────────────────────────────────────

@router.get("/{ticker}/restricted-shares")
async def get_restricted_shares(ticker: str):
    """
    该股票限售股解禁计划
    解禁日期、数量、占比、类型
    """
    pass


# ─── 搜索 ───────────────────────────────────────────────

@router.get("/search")
async def search_stocks(
    q: str = Query(..., description="搜索关键词：代码/名称/拼音", min_length=1),
    market: str = Query("A", description="市场: A | HK | US"),
):
    """
    股票搜索
    支持：代码（300750）、名称（宁德时代）、拼音首字母（NDSD）
    数据源：东方财富
    """
    pass
