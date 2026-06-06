"""A-share market data service (EastMoney + CNINFO)."""
class MarketDataService:
    async def get_indices(self): pass
    async def get_dragon_tiger(self, date=None): pass
    async def get_northbound(self, days=30): pass
    async def get_stock_profile(self, ticker): pass
    async def get_financials(self, ticker, years=5): pass
    async def get_concept_boards(self): pass
    async def get_broker_research(self, ticker): pass
market_data_service = MarketDataService()
