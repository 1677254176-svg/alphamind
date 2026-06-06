"""
A股概念板块 API
"""
from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/hot")
async def get_hot_concepts():
    """
    热门概念板块
    返回：AI概念、低空经济、华为产业链等热门概念
    每个概念包含：涨跌幅、领涨股、热度值
    """
    pass


@router.get("/{concept_name}/stocks")
async def get_concept_stocks(concept_name: str):
    """
    概念板块下所有股票
    按关联度排序（核心 > 普通 > 边缘）
    """
    pass


@router.get("/{concept_name}/analysis")
async def analyze_concept(concept_name: str):
    """
    AI概念板块分析
    板块走势、核心逻辑、投资机会、风险提示
    """
    pass
