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

export async function GET(_req: Request, { params }: { params: { ticker: string } }) {
  const code = params.ticker;
  try {
    const resp = await fetch(
      `https://push2.eastmoney.com/api/qt/stock/get?secid=${getSecid(code)}&fields=f43,f44,f45,f46,f47,f48,f50,f51,f52,f55,f57,f58,f60,f100,f116,f117,f162,f167,f168,f169,f170,f171`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!resp.ok) throw new Error("API error");
    const json = await resp.json();
    const d = json.data || {};
    const price = (d.f43 || 0) / 100;
    const pe = (d.f162 || 0) / 100;
    const pb = (d.f167 || 0) / 100;
    const marketCap = Math.round((d.f116 || 0) / 1e8);

    return NextResponse.json({
      name: d.f58 || code, fullName: d.f58 || code, board: getBoard(code), industry: d.f100 || "---",
      price, changePct: (d.f170 || 0) / 100, pe, pb, marketCap,
      revenue: [], eps: [], roe: [], grossMargin: 0, netMargin: 0,
      brokerConsensus: { rating: "---", targetPrice: 0, upside: 0 },
      technicals: { ma5: 0, ma20: 0, ma60: 0, rsi: 50, macd: "---", bollPosition: "---" },
      source: "东方财富实时行情", updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ name: code, error: true }, { status: 502 });
  }
}