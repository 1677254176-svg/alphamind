/**
 * AlphaMind Multi-Factor Scoring Engine
 * Based on serenity-stock-choke scoring methodology
 *
 * Score = w1*Growth + w2*Value + w3*Quality + w4*Momentum
 * Each sub-score is a 0-100 percentile rank within the candidate pool.
 */

export interface StockMetrics {
  code: string;
  name: string;
  board: string;
  price: number;
  changePct: number;
  pe: number;
  pb: number;
  roe: number;
  marketCap: number;
  revenueGrowth: number;
  grossMargin?: number;
  netMargin?: number;
  debtRatio?: number;
  volumeRatio?: number;    // 量比
  turnoverRate?: number;   // 换手率
}

export interface ScoredStock extends StockMetrics {
  growthScore: number;    // 0-100
  valueScore: number;     // 0-100
  qualityScore: number;   // 0-100
  momentumScore: number;  // 0-100
  score: number;          // 0-100 weighted total
  explanation: string;    // AI-friendly explanation
}

export interface ScreenerConfig {
  // Filters
  peMax: number;           // PE上限, 0=不限
  peMin: number;           // PE下限, 0=不限
  pbMax: number;           // PB上限
  marketCapMin: number;    // 市值下限(亿), 0=不限
  marketCapMax: number;    // 市值上限(亿)
  roeMin: number;          // ROE下限(%)
  revenueGrowthMin: number;// 营收增长率下限(%)
  grossMarginMin: number;  // 毛利率下限(%)
  board: string;           // 板块筛选 (空=全部)
  excludeST: boolean;      // 排除ST

  // Scoring weights (sum should = 1.0, but engine normalizes)
  weightGrowth: number;    // default 0.3
  weightValue: number;     // default 0.25
  weightQuality: number;   // default 0.3
  weightMomentum: number;  // default 0.15

  // Pagination
  page: number;
  pageSize: number;
  sortBy: "score" | "pe" | "roe" | "marketCap" | "revenueGrowth";
  sortDir: "asc" | "desc";
}

export const DEFAULT_CONFIG: ScreenerConfig = {
  peMax: 50, peMin: 0, pbMax: 10, marketCapMin: 50, marketCapMax: 0,
  roeMin: 8, revenueGrowthMin: 0, grossMarginMin: 0,
  board: "", excludeST: true,
  weightGrowth: 0.30, weightValue: 0.25, weightQuality: 0.30, weightMomentum: 0.15,
  page: 1, pageSize: 20, sortBy: "score", sortDir: "desc",
};

/**
 * Calculate percentile rank of a value within an array.
 * Returns 0-100 where higher = better.
 */
function percentileRank(values: number[], value: number, higherIsBetter = true): number {
  if (values.length === 0) return 50;
  const sorted = [...values].sort((a, b) => a - b);
  let rank = sorted.filter(v => higherIsBetter ? v <= value : v >= value).length;
  return Math.round((rank / sorted.length) * 100);
}

/**
 * Generate explanation for a scored stock.
 */
function generateExplanation(
  stock: ScoredStock,
  config: ScreenerConfig,
  rank: number,
  total: number
): string {
  const parts: string[] = [];
  parts.push(`综合排名 ${rank}/${total}`);
  if (stock.growthScore >= 70) parts.push("成长性优秀");
  if (stock.valueScore >= 70) parts.push("估值合理");
  if (stock.qualityScore >= 70) parts.push("质量指标健康");
  if (stock.momentumScore >= 60) parts.push("资金面积极");
  if (stock.pe > 0 && stock.pe < 20) parts.push("低PE");
  if (stock.roe >= 20) parts.push(`高ROE(${stock.roe.toFixed(1)}%)`);
  if (stock.revenueGrowth >= 30) parts.push(`高增长(${stock.revenueGrowth.toFixed(1)}%)`);
  return parts.join(" · ");
}

/**
 * Main scoring function.
 * Takes raw stock metrics + config, returns sorted scored results.
 */
export function scoreStocks(
  rawStocks: StockMetrics[],
  config: Partial<ScreenerConfig> = {}
): { results: ScoredStock[]; total: number; filters: string[] } {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const activeFilters: string[] = [];

  // ── Step 1: Apply filters ──
  let filtered = rawStocks.filter(s => {
    // Basic validity
    if (!s.code || s.price <= 0) return false;

    // PE filter
    if (cfg.peMax > 0 && s.pe > cfg.peMax) { return false; }
    if (cfg.peMin > 0 && s.pe < cfg.peMin) { return false; }

    // PB filter
    if (cfg.pbMax > 0 && s.pb > cfg.pbMax) return false;

    // Market cap filter
    if (cfg.marketCapMin > 0 && s.marketCap < cfg.marketCapMin) return false;
    if (cfg.marketCapMax > 0 && s.marketCap > cfg.marketCapMax) return false;

    // ROE filter
    if (cfg.roeMin > 0 && s.roe < cfg.roeMin) return false;

    // Revenue growth filter
    if (cfg.revenueGrowthMin > 0 && s.revenueGrowth < cfg.revenueGrowthMin) return false;

    // Gross margin filter
    if (cfg.grossMarginMin > 0 && (s.grossMargin || 0) < cfg.grossMarginMin) return false;

    // Board filter
    if (cfg.board && s.board !== cfg.board) return false;

    return true;
  });

  // Record active filters for display
  if (cfg.peMax > 0 && cfg.peMax < 200) activeFilters.push(`PE≤${cfg.peMax}`);
  if (cfg.peMin > 0) activeFilters.push(`PE≥${cfg.peMin}`);
  if (cfg.pbMax > 0 && cfg.pbMax < 20) activeFilters.push(`PB≤${cfg.pbMax}`);
  if (cfg.marketCapMin > 0) activeFilters.push(`市值≥${cfg.marketCapMin}亿`);
  if (cfg.roeMin > 0) activeFilters.push(`ROE≥${cfg.roeMin}%`);
  if (cfg.revenueGrowthMin > 0) activeFilters.push(`营收增长≥${cfg.revenueGrowthMin}%`);
  if (cfg.grossMarginMin > 0) activeFilters.push(`毛利率≥${cfg.grossMarginMin}%`);
  if (cfg.board) activeFilters.push(cfg.board);
  if (cfg.excludeST) activeFilters.push("排除ST");

  const total = filtered.length;

  if (filtered.length === 0) {
    return { results: [], total: 0, filters: activeFilters };
  }

  // ── Step 2: Calculate raw sub-scores ──

  // Growth Score: revenueGrowth (higher=better), ROE change proxy
  const growthRaw = filtered.map(s => {
    let g = 0;
    // Revenue growth: 0-30%+ maps to 0-100
    g += Math.min(100, Math.max(0, (s.revenueGrowth || 0) * 3.33));
    return g;
  });

  // Value Score: lower PE + lower PB = better value
  const valueRaw = filtered.map(s => {
    let v = 0;
    // PE: 0-50 maps to 100-0 (lower is better)
    if (s.pe > 0) v += Math.min(100, Math.max(0, 100 - s.pe * 2));
    // PB: 0-10 maps to 100-0
    if (s.pb > 0) v += Math.min(100, Math.max(0, 100 - s.pb * 10));
    return v / 2; // average of PE + PB components
  });

  // Quality Score: ROE + margins
  const qualityRaw = filtered.map(s => {
    let q = 0;
    // ROE: 0-30% maps to 0-100
    q += Math.min(100, Math.max(0, (s.roe || 0) * 3.33));
    // Gross margin bonus
    if (s.grossMargin) q += Math.min(30, Math.max(0, (s.grossMargin - 15) * 2));
    return Math.min(100, q);
  });

  // Momentum Score: price change + volume
  const momentumRaw = filtered.map(s => {
    let m = 0;
    // Price change: -5 to +5 maps to 0-100
    m += Math.min(100, Math.max(0, 50 + (s.changePct || 0) * 10));
    // Volume ratio bonus
    if (s.volumeRatio) m += Math.min(20, Math.max(0, (s.volumeRatio - 0.5) * 20));
    return Math.min(100, m);
  });

  // ── Step 3: Convert to percentile ranks ──
  const scored: ScoredStock[] = filtered.map((stock, i) => {
    const growthScore = percentileRank(growthRaw, growthRaw[i], true);
    const valueScore = percentileRank(valueRaw, valueRaw[i], true);
    const qualityScore = percentileRank(qualityRaw, qualityRaw[i], true);
    const momentumScore = percentileRank(momentumRaw, momentumRaw[i], true);

    // Normalize weights
    const wSum = cfg.weightGrowth + cfg.weightValue + cfg.weightQuality + cfg.weightMomentum || 1;
    const score = Math.round(
      (growthScore * cfg.weightGrowth +
       valueScore * cfg.weightValue +
       qualityScore * cfg.weightQuality +
       momentumScore * cfg.weightMomentum) / wSum
    );

    return { ...stock, growthScore, valueScore, qualityScore, momentumScore, score, explanation: "" };
  });

  // ── Step 4: Sort by score ──
  scored.sort((a, b) => b.score - a.score);

  // Add explanation
  scored.forEach((s, i) => {
    s.explanation = generateExplanation(s, cfg, i + 1, scored.length);
  });

  // ── Step 5: Paginate ──
  const start = (cfg.page - 1) * cfg.pageSize;
  const paged = scored.slice(start, start + cfg.pageSize);

  return { results: paged, total, filters: activeFilters };
}