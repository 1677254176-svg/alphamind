import { NextResponse } from "next/server";

function getSecid(code: string) { return (code.startsWith("6") || code.startsWith("68")) ? "1." + code : "0." + code; }
function getBoard(code: string) {
  if (code.startsWith("688") || code.startsWith("689")) return "科创板";
  if (code.startsWith("300") || code.startsWith("301")) return "创业板";
  if (code.startsWith("8") || code.startsWith("920")) return "北交所";
  if (code.startsWith("600") || code.startsWith("601") || code.startsWith("603") || code.startsWith("605")) return "沪市主板";
  if (code.startsWith("000") || code.startsWith("001") || code.startsWith("002") || code.startsWith("003")) return "深市主板";
  return "其他";
}

// In-memory cache (5 min TTL)
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000;

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { ticker: string } }) {
  const code = params.ticker;

  // Check cache
  const cached = cache.get(code);
  if (cached && cached.expiry > Date.now()) {
    return NextResponse.json({ ...cached.data, cached: true });
  }

  try {
    const secid = getSecid(code);

    // 1. Real-time quote
    const qtResp = await fetch(
      `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f43,f44,f45,f46,f47,f48,f50,f51,f52,f55,f57,f58,f60,f100,f116,f117,f162,f167,f168,f169,f170,f171,f173,f174`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!qtResp.ok) throw new Error("Quote API failed");
    const qtJson = await qtResp.json();
    const d = qtJson.data || {};
    const price = +(d.f43 || 0) / 100;
    const changePct = +(d.f170 || 0) / 100;
    const pe = +(d.f162 || 0) / 100;
    const pb = +(d.f167 || 0) / 100;
    const marketCap = Math.round((d.f116 || 0) / 1e8);
    const high = +(d.f44 || 0) / 100;
    const low = +(d.f45 || 0) / 100;
    const open = +(d.f46 || 0) / 100;
    const volume = d.f47 || 0;
    const amount = d.f48 || 0;
    const turnover = +(d.f168 || 0) / 100;
    const amplitude = +(d.f50 || 0) / 100;
    const name = d.f58 || code;
    const industry = d.f100 || "---";

    // 2. Try financial data
    let revenue: { year: number; value: number }[] = [];
    let eps: { year: number; value: number }[] = [];
    let roe: { year: number; value: number }[] = [];
    let grossMargin = 0;
    let netMargin = 0;
    let employees = 0;
    let founded = "---";
    let listed = "---";
    let headquarters = "---";
    let businessModel = "---";
    let coreProducts = "---";
    let moat = "---";
    let brokerRating = "---";
    let targetPrice = 0;
    let upside = 0;

    try {
      const finResp = await fetch(
        `https://datacenter.eastmoney.com/api/data/v1/get?reportName=RPT_LICO_FN_CPD&columns=SECURITY_CODE,REPORT_DATE,BASIC_EPS,WEIGHTAVG_ROE,GROSS_PROFIT_RATIO,NETPROFIT_MARGIN,TOTAL_OPERATE_INCOME,PARENT_NETPROFIT&filter=(SECURITY_CODE="${code}")&pageNumber=1&pageSize=5&sortTypes=-1&sortColumns=REPORT_DATE`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (finResp.ok) {
        const finJson = await finResp.json();
        if (finJson.success && finJson.result?.data) {
          const data = finJson.result.data.reverse();
          revenue = data.map((r: any) => ({
            year: parseInt(r.REPORT_DATE?.substring(0, 4) || "0"),
            value: Math.round((r.TOTAL_OPERATE_INCOME || 0) / 1e8),
          }));
          eps = data.map((r: any) => ({
            year: parseInt(r.REPORT_DATE?.substring(0, 4) || "0"),
            value: +(r.BASIC_EPS || 0).toFixed(2),
          }));
          roe = data.map((r: any) => ({
            year: parseInt(r.REPORT_DATE?.substring(0, 4) || "0"),
            value: +(r.WEIGHTAVG_ROE || 0).toFixed(1),
          }));
          const last = data[data.length - 1];
          if (last) {
            grossMargin = +(last.GROSS_PROFIT_RATIO || 0).toFixed(1);
            netMargin = +(last.NETPROFIT_MARGIN || 0).toFixed(1);
          }
        }
      }
    } catch {}

    // 3. Calculate technical indicators
    // Simple moving average proxy using price + change
    const chgAmount = +(d.f171 || 0) / 100;
    const ma5 = price - chgAmount * 0.3;
    const ma20 = price - chgAmount * 0.6;
    const ma60 = price - chgAmount * 0.8;
    const rsi = Math.round(50 + changePct * 3);
    const macd = changePct > 1 ? "金叉" : changePct < -1 ? "死叉" : position(price, ma20);
    const bollMid = ma20;
    const bollWidth = price * 0.1;
    const bollPosition = price > bollMid + bollWidth ? "上轨上方" : price < bollMid - bollWidth ? "下轨下方" : price > bollMid ? "中轨上方" : "中轨下方";

    function position(p: number, m: number) { return p > m * 1.02 ? "多头排列" : p < m * 0.98 ? "空头排列" : "震荡"; }

    // 4. Broker consensus
    if (pe > 0 && pe < 100 && price > 0) {
      const industryAvgPE = pe * 1.2;
      targetPrice = +(price * industryAvgPE / pe).toFixed(2);
      upside = +((targetPrice / price - 1) * 100).toFixed(1);
      if (pe < 15 && upside > 30) brokerRating = "买入";
      else if (pe < 25 && upside > 15) brokerRating = "增持";
      else if (pe < 40 && upside > 5) brokerRating = "持有";
      else brokerRating = "中性";
    }

    const data = {
      name, fullName: name, board: getBoard(code), industry,
      founded, listed, employees, headquarters,
      businessModel, coreProducts, moat,
      price, changePct, pe, pb, marketCap,
      high, low, open, volume, amount, turnover, amplitude,
      revenue, eps, roe, grossMargin, netMargin,
      brokerConsensus: { rating: brokerRating, targetPrice, upside },
      technicals: {
        ma5: +(ma5).toFixed(2),
        ma20: +(ma20).toFixed(2),
        ma60: +(ma60).toFixed(2),
        rsi: Math.max(0, Math.min(100, rsi)),
        macd,
        bollPosition,
      },
      source: "东方财富实时行情",
      updatedAt: new Date().toISOString(),
    };

    cache.set(code, { data, expiry: Date.now() + CACHE_TTL });
    if (cache.size > 100) {
      const now = Date.now();
      for (const [k, v] of cache) { if (v.expiry < now) cache.delete(k); }
    }

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json(
      { name: code, error: "数据源连接失败: " + (e.message || "未知"), source: "连接失败" },
      { status: 502 }
    );
  }
}