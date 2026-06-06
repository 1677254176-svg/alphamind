import { NextResponse } from "next/server";
import { scoreStocks, DEFAULT_CONFIG, type ScreenerConfig, type StockMetrics } from "@/lib/scoring-engine";

function getSecid(code: string) { return (code.startsWith("6") || code.startsWith("68")) ? "1." + code : "0." + code; }
function getBoard(code: string) {
  if (code.startsWith("688") || code.startsWith("689")) return "科创板";
  if (code.startsWith("300") || code.startsWith("301")) return "创业板";
  if (code.startsWith("8") || code.startsWith("920")) return "北交所";
  if (code.startsWith("600") || code.startsWith("601") || code.startsWith("603") || code.startsWith("605")) return "沪市主板";
  if (code.startsWith("000") || code.startsWith("001") || code.startsWith("002") || code.startsWith("003")) return "深市主板";
  return "其他";
}

// In-memory cache (TTL: 5 min)
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function cacheKey(params: URLSearchParams): string {
  return JSON.stringify(Object.fromEntries(params.entries()));
}

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = cacheKey(url.searchParams);

  // Check cache
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return NextResponse.json({ ...cached.data, cached: true });
  }

  // Parse config from query params
  const config: Partial<ScreenerConfig> = {
    peMax: parseFloat(url.searchParams.get("peMax") || String(DEFAULT_CONFIG.peMax)),
    peMin: parseFloat(url.searchParams.get("peMin") || "0"),
    pbMax: parseFloat(url.searchParams.get("pbMax") || String(DEFAULT_CONFIG.pbMax)),
    marketCapMin: parseFloat(url.searchParams.get("marketCapMin") || String(DEFAULT_CONFIG.marketCapMin)),
    marketCapMax: parseFloat(url.searchParams.get("marketCapMax") || "0"),
    roeMin: parseFloat(url.searchParams.get("roeMin") || String(DEFAULT_CONFIG.roeMin)),
    revenueGrowthMin: parseFloat(url.searchParams.get("revenueGrowthMin") || "0"),
    grossMarginMin: parseFloat(url.searchParams.get("grossMarginMin") || "0"),
    board: url.searchParams.get("board") || "",
    excludeST: url.searchParams.get("excludeST") !== "false",
    weightGrowth: parseFloat(url.searchParams.get("wGrowth") || String(DEFAULT_CONFIG.weightGrowth)),
    weightValue: parseFloat(url.searchParams.get("wValue") || String(DEFAULT_CONFIG.weightValue)),
    weightQuality: parseFloat(url.searchParams.get("wQuality") || String(DEFAULT_CONFIG.weightQuality)),
    weightMomentum: parseFloat(url.searchParams.get("wMomentum") || String(DEFAULT_CONFIG.weightMomentum)),
    page: parseInt(url.searchParams.get("page") || "1"),
    pageSize: Math.min(50, parseInt(url.searchParams.get("pageSize") || "20")),
    sortBy: (url.searchParams.get("sortBy") as any) || "score",
    sortDir: (url.searchParams.get("sortDir") as any) || "desc",
  };

  try {
    // Fetch raw stocks from eastmoney (200 stocks for broader screening)
    const resp = await fetch(
      "https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=200&po=1&np=1&fields=f2,f3,f4,f8,f9,f10,f12,f14,f20,f21,f23,f115,f162,f167,f168,f169,f170&fid=f20&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23&fltt=2",
      { signal: AbortSignal.timeout(15000) }
    );
    if (!resp.ok) throw new Error("Eastmoney API unavailable");
    const json = await resp.json();
    if (!json.data?.diff) throw new Error("No stock data");

    const rawStocks: StockMetrics[] = json.data.diff.map((item: any) => ({
      code: item.f12,
      name: item.f14 || "未知",
      board: getBoard(item.f12 || ""),
      price: (item.f2 || 0) / 100,
      changePct: (item.f3 || 0) / 100,
      pe: (item.f162 || item.f9 || 0) / 100,
      pb: (item.f167 || 0) / 100,
      roe: (item.f115 || item.f173 || 0) / 100,
      marketCap: Math.round((item.f20 || 0) / 1e8),
      revenueGrowth: (item.f8 || 0) / 100,
      grossMargin: (item.f10 || 0) / 100,
      volumeRatio: (item.f168 || 0) / 100,
      turnoverRate: (item.f169 || 0) / 100,
    }));

    const { results, total, filters } = scoreStocks(rawStocks, config);

    const responseData = {
      data: results,
      total,
      page: config.page,
      pageSize: config.pageSize,
      totalPages: Math.ceil(total / (config.pageSize || 20)),
      filters,
      weights: {
        growth: config.weightGrowth,
        value: config.weightValue,
        quality: config.weightQuality,
        momentum: config.weightMomentum,
      },
      timestamp: new Date().toISOString(),
      source: "东方财富实时行情 + Multi-Factor Scoring Engine",
    };

    // Store in cache
    cache.set(key, { data: responseData, expiry: Date.now() + CACHE_TTL });
    // Clean old cache entries
    if (cache.size > 50) {
      const now = Date.now();
      for (const [k, v] of cache) { if (v.expiry < now) cache.delete(k); }
    }

    return NextResponse.json(responseData);
  } catch (e: any) {
    return NextResponse.json({
      data: [], total: 0, page: 1, pageSize: 20, totalPages: 0,
      filters: [], error: "数据源连接失败: " + (e.message || "未知错误"),
      timestamp: new Date().toISOString(),
      source: "东方财富 (连接失败)",
    }, { status: 502 });
  }
}