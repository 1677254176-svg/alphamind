# AlphaMind — A股优先数据库设计（新增表）

以下是需要**追加**到原有数据库设计中的A股特色表。

---

## A. 股票元数据（更新 stocks 表）

```sql
-- 在 stocks 表增加字段
ALTER TABLE stocks ADD COLUMN market VARCHAR(10) DEFAULT 'A';  -- A | HK | US
ALTER TABLE stocks ADD COLUMN board VARCHAR(20);               -- 沪市主板 | 深市主板 | 创业板 | 科创板 | 北交所
ALTER TABLE stocks ADD COLUMN concept_tags JSONB;              -- ["AI概念","华为产业链","锂电池"]
ALTER TABLE stocks ADD COLUMN margin_trading BOOLEAN DEFAULT false;  -- 是否两融标的
ALTER TABLE stocks ADD COLUMN st_flag BOOLEAN DEFAULT false;         -- 是否ST
ALTER TABLE stocks ADD COLUMN total_shares BIGINT;             -- 总股本
ALTER TABLE stocks ADD COLUMN float_shares BIGINT;             -- 流通股本
ALTER TABLE stocks ADD COLUMN limit_up_price DECIMAL(12,3);    -- 涨停价
ALTER TABLE stocks ADD COLUMN limit_down_price DECIMAL(12,3);  -- 跌停价
```

**A股代码 → 板块自动识别规则：**
```
600xxx, 601xxx, 603xxx, 605xxx  → 沪市主板  (涨跌停 ±10%)
000xxx, 001xxx, 002xxx, 003xxx  → 深市主板  (涨跌停 ±10%)
300xxx, 301xxx                   → 创业板    (涨跌停 ±20%)
688xxx, 689xxx                   → 科创板    (涨跌停 ±20%)
8xxxxx, 920xxx                   → 北交所    (涨跌停 ±30%)
```

---

## B. A股指数

```sql
CREATE TABLE a_share_indices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,          -- 000001(上证), 399001(深证)
    name VARCHAR(50) NOT NULL,                 -- 上证指数 / 深证成指 / 创业板指
    short_name VARCHAR(20),                     -- 上证 / 深证 / 创业板
    market VARCHAR(2) DEFAULT 'A',             -- A

    -- 当日行情
    current_price DECIMAL(12,3),
    change_amount DECIMAL(12,3),
    change_pct DECIMAL(6,4),
    open_price DECIMAL(12,3),
    high_price DECIMAL(12,3),
    low_price DECIMAL(12,3),
    volume BIGINT,
    turnover BIGINT,                           -- 成交额(亿)

    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 初始化核心指数
INSERT INTO a_share_indices (code, name, short_name) VALUES
('000001', '上证指数', '上证'),
('399001', '深证成指', '深证'),
('399006', '创业板指', '创业板'),
('000688', '科创50', '科创50'),
('899050', '北证50', '北证50'),
('000300', '沪深300', '沪深300'),
('000905', '中证500', '中证500');
```

---

## C. 龙虎榜（Dragon-Tiger Board）

```sql
CREATE TABLE dragon_tiger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_date DATE NOT NULL,
    stock_id UUID NOT NULL REFERENCES stocks(id),
    stock_code VARCHAR(10) NOT NULL,
    stock_name VARCHAR(100),

    -- 上榜原因
    reason VARCHAR(50),                        -- 日涨幅偏离值达7% | 连续三个交易日内涨幅偏离值累计达20%

    -- 买入前五席位
    buy_seats JSONB,                           -- [{"seat":"中信证券上海分公司","amount":53200000,"type":"游资"}]

    -- 卖出前五席位
    sell_seats JSONB,                          -- [{"seat":"机构专用","amount":28000000,"type":"机构"}]

    -- 汇总
    total_buy_amount DECIMAL(16,2),
    total_sell_amount DECIMAL(16,2),
    net_amount DECIMAL(16,2),

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(stock_id, trade_date, reason)
);

CREATE INDEX idx_dragon_tiger_date ON dragon_tiger(trade_date DESC);
```

---

## D. 北向资金（Northbound Flow）

```sql
CREATE TABLE northbound_flow (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_date DATE NOT NULL,

    -- 沪股通
    sh_buy DECIMAL(16,2),                      -- 沪股通买入
    sh_sell DECIMAL(16,2),                     -- 沪股通卖出
    sh_net DECIMAL(16,2),                      -- 沪股通净买入

    -- 深股通
    sz_buy DECIMAL(16,2),
    sz_sell DECIMAL(16,2),
    sz_net DECIMAL(16,2),

    -- 合计
    total_net DECIMAL(16,2),
    cumulative_net DECIMAL(16,2),              -- 累计净买入

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(trade_date)
);

-- 北向资金个股持仓
CREATE TABLE northbound_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_date DATE NOT NULL,
    stock_id UUID NOT NULL REFERENCES stocks(id),

    holding_shares BIGINT,                     -- 持股数量
    holding_ratio DECIMAL(6,4),                -- 持股比例
    market_value DECIMAL(16,2),                -- 持股市值
    change_shares BIGINT,                      -- 变动数量

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(stock_id, trade_date)
);
```

---

## E. 融资融券

```sql
CREATE TABLE margin_trading (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_date DATE NOT NULL,
    stock_id UUID REFERENCES stocks(id),       -- NULL表示全市场
    stock_code VARCHAR(10),

    -- 融资
    margin_buy DECIMAL(16,2),                  -- 融资买入额
    margin_repay DECIMAL(16,2),                -- 融资偿还额
    margin_balance DECIMAL(16,2),              -- 融资余额

    -- 融券
    short_sell DECIMAL(16,2),                  -- 融券卖出量
    short_repay DECIMAL(16,2),                 -- 融券偿还量
    short_balance DECIMAL(16,2),               -- 融券余量

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(trade_date, stock_code)
);
```

---

## F. 概念板块（A股独有）

```sql
CREATE TABLE concept_boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,          -- AI概念 / 华为产业链 / 低空经济
    description TEXT,
    category VARCHAR(30),                      -- 科技 | 新能源 | 消费 | 周期
    hot_level INT DEFAULT 0,                   -- 热度值

    -- 当日表现
    change_pct DECIMAL(6,4),                   -- 板块涨跌幅
    leader_stock VARCHAR(10),                  -- 领涨股
    leader_change_pct DECIMAL(6,4),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 概念-股票关联
CREATE TABLE concept_stocks (
    concept_id UUID REFERENCES concept_boards(id) ON DELETE CASCADE,
    stock_id UUID REFERENCES stocks(id) ON DELETE CASCADE,
    relevance VARCHAR(10) DEFAULT '普通',      -- 核心 | 普通 | 边缘
    PRIMARY KEY (concept_id, stock_id)
);
```

---

## G. 限售股解禁

```sql
CREATE TABLE restricted_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_id UUID NOT NULL REFERENCES stocks(id),
    stock_code VARCHAR(10) NOT NULL,
    stock_name VARCHAR(100),

    unlock_date DATE NOT NULL,                 -- 解禁日期
    unlock_shares BIGINT,                      -- 解禁数量
    unlock_ratio DECIMAL(6,4),                 -- 占总股本比例
    unlock_type VARCHAR(30),                   -- 首发原股东 | 定向增发 | 股权激励

    market_value DECIMAL(16,2),                -- 解禁市值
    is_reminded BOOLEAN DEFAULT false,         -- 是否已提醒用户

    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## H. 政策事件日历

```sql
-- 在 catalyst_events 表增加A股特有事件类型
-- event_type 新增: lpr | politburo | nsfc | two_sessions | dividend | ex_rights

CREATE TABLE policy_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_date DATE NOT NULL,
    event_type VARCHAR(30) NOT NULL,           -- lpr | cpi | pmi | politburo | two_sessions
    title VARCHAR(255) NOT NULL,
    description TEXT,
    importance INT DEFAULT 3 CHECK (importance BETWEEN 1 AND 5),
    expected_impact TEXT,                      -- AI预测影响
    actual_outcome TEXT,
    related_sectors JSONB,                     -- ["银行","地产","新能源"]

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- A股年度重要事件预设
INSERT INTO policy_calendar (event_date, event_type, title, importance) VALUES
('2026-03-05', 'two_sessions', '全国两会开幕', 5),
('2026-04-30', 'annual_report', '年报披露截止日', 5),
('2026-06-20', 'lpr', 'LPR利率公布', 4),
('2026-07-15', 'semi_report', '中报预披露截止', 4),
('2026-10-01', 'golden_week', '国庆假期', 3),
('2026-12-15', 'central_economic', '中央经济工作会议', 5);
```

---

## I. 券商研报

```sql
CREATE TABLE broker_research (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_id UUID NOT NULL REFERENCES stocks(id),

    broker VARCHAR(100) NOT NULL,              -- 中信证券 | 中金公司 | 国泰君安
    analyst VARCHAR(100),
    report_date DATE NOT NULL,
    report_title TEXT,
    report_url TEXT,

    rating VARCHAR(20),                        -- 买入 | 增持 | 中性 | 减持 | 卖出
    target_price DECIMAL(12,2),
    previous_target DECIMAL(12,2),
    target_change VARCHAR(5),                  -- 上调 | 下调 | 维持

    -- AI提取的关键信息
    ai_summary TEXT,                           -- AI研报摘要
    ai_key_points JSONB,                       -- ["核心逻辑1","核心逻辑2"]
    ai_risk_factors JSONB,

    -- 盈利预测
    eps_forecast JSONB,                        -- {"2025":2.50,"2026":3.20,"2027":4.10}
    revenue_forecast JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(broker, stock_id, report_date)
);
```

---

## J. 更新后的 ER 图

```
users ──┬── theses ──┬── thesis_conditions
        │            ├── thesis_risks
        │            └── thesis_alerts
        │
        ├── portfolios ──┬── holdings
        │                └── transactions
        │
        ├── research_notes ──┬── note_links
        │                    └── note_attachments
        │
        ├── decision_logs
        ├── watchlists ── watchlist_items
        └── screener_presets

stocks ──┬── stock_prices (TimescaleDB)
         ├── financials
         ├── dragon_tiger          ← NEW
         ├── northbound_holdings   ← NEW
         ├── margin_trading        ← NEW
         ├── concept_stocks        ← NEW
         │     └── concept_boards  ← NEW
         ├── restricted_shares     ← NEW
         ├── broker_research       ← NEW
         ├── analyst_ratings (now: broker_research)
         ├── sentiment_snapshots
         └── catalyst_events

market-level:
a_share_indices        ← NEW
northbound_flow        ← NEW
policy_calendar        ← NEW
news ── news_stock_tags ── stocks
```

## 数据库迁移总结

在原15张表基础上**新增 9 张 A股特色表**：

| # | 表名 | 数据源 | 说明 |
|---|------|--------|------|
| 1 | `a_share_indices` | 东方财富 | 上证/深证/创业板/科创50 等 |
| 2 | `dragon_tiger` | 东方财富龙虎榜 | 每日龙虎榜数据 |
| 3 | `northbound_flow` | 沪深港通 | 北向资金每日流向 |
| 4 | `northbound_holdings` | 沪深港通 | 北向资金个股持仓 |
| 5 | `margin_trading` | 交易所 | 融资融券余额 |
| 6 | `concept_boards` | 东方财富 | 概念板块（AI概念等） |
| 7 | `concept_stocks` | 东方财富 | 概念-股票关联 |
| 8 | `restricted_shares` | 交易所公告 | 限售股解禁 |
| 9 | `broker_research` | 券商研报 | 中信/中金/国泰君安研报 |
| 10 | `policy_calendar` | 手动/AI | 政策事件日历 |

