"""
A股券商研报 API
"""
from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/target-changes")
async def get_target_price_changes(
    days: int = Query(7, description="最近N天"),
):
    """
    近期目标价变动的股票
    AI筛选：目标价上调/下调的股票，按变动幅度排序
    """
    pass


@router.get("/consensus/{ticker}")
async def get_consensus(ticker: str):
    """
    机构一致预期
    综合多家券商评级、目标价、盈利预测
    输出：一致预期目标价、评级分布、预测区间
    """
    pass
