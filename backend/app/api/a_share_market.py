"""
A股市场数据 API — 龙虎榜、北向资金、融资融券、指数行情
"""
from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()


# ─── 指数行情 ───────────────────────────────────────────

@router.get("/indices")
async def get_a_share_indices():
    """
    上证指数、深证成指、创业板指、科创50、北证50 实时行情
    数据源：东方财富
    示例返回：
    [
      {"code":"000001","name":"上证指数","price":3380.50,"change":12.30,"change_pct":0.36},
      {"code":"399006","name":"创业板指","price":2189.10,"change":-15.20,"change_pct":-0.69}
    ]
    """
    pass


# ─── 龙虎榜 ─────────────────────────────────────────────

@router.get("/dragon-tiger/daily")
async def get_dragon_tiger_daily(
    date: Optional[str] = Query(None, description="日期 YYYY-MM-DD，默认今天"),
    board: Optional[str] = Query(None, description="板块筛选: 沪市主板|深市主板|创业板|科创板"),
):
    """
    每日龙虎榜数据
    包含：上榜股票、上榜原因、买入/卖出前五席位、净买额
    数据源：东方财富龙虎榜
    """
    pass


@router.get("/dragon-tiger/analysis/{stock_code}")
async def analyze_dragon_tiger(stock_code: str):
    """
    某只股票近期龙虎榜分析
    AI分析：游资风格、机构参与度、席位联动
    """
    pass


# ─── 北向资金 ───────────────────────────────────────────

@router.get("/northbound/daily")
async def get_northbound_daily(
    days: int = Query(30, description="查询天数")
):
    """
    北向资金每日净流向（沪股通+深股通）
    包含：买入额、卖出额、净买入、累计净买入
    """
    pass


@router.get("/northbound/top-holdings")
async def get_northbound_top_holdings(
    limit: int = Query(20, description="返回前N只")
):
    """
    北向资金重仓股排行
    按持股比例排序
    """
    pass


@router.get("/northbound/flow-changes")
async def get_northbound_flow_changes():
    """
    北向资金近期加仓/减仓最多的股票
    AI 判断：外资动向信号
    """
    pass


# ─── 融资融券 ───────────────────────────────────────────

@router.get("/margin/summary")
async def get_margin_summary():
    """
    全市场两融余额概况
    融资余额、融券余额走势
    """
    pass


@router.get("/margin/stock/{stock_code}")
async def get_margin_stock(stock_code: str):
    """
    个股融资融券数据
    融资买入额、融资余额变化
    """
    pass


# ─── 涨跌停板 ───────────────────────────────────────────

@router.get("/limit-up-down")
async def get_limit_up_down(
    date: Optional[str] = None,
    type: str = "up",  # up | down
):
    """
    今日涨停/跌停股票列表
    AI分析：连板高度、板块效应、封板力度
    """
    pass


# ─── 限售股解禁 ─────────────────────────────────────────

@router.get("/restricted-shares/upcoming")
async def get_upcoming_unlocks(
    days: int = Query(30, description="未来N天")
):
    """
    未来限售股解禁提醒
    AI分析：解禁压力、对股价影响预判
    """
    pass
