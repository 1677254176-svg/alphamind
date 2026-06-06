import { NextResponse } from "next/server";

function getBoard(code: string) {
  if (code.startsWith("688") || code.startsWith("689")) return "科创板";
  if (code.startsWith("300") || code.startsWith("301")) return "创业板";
  if (code.startsWith("8") || code.startsWith("920")) return "北交所";
  if (code.startsWith("600") || code.startsWith("601") || code.startsWith("603") || code.startsWith("605")) return "沪市主板";
  if (code.startsWith("000") || code.startsWith("001") || code.startsWith("002") || code.startsWith("003")) return "深市主板";
  return "其他";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const peMax = parseFloat(url.searchParams.get("peMax") || "200");
  const marketCapMin = parseFloat(url.searchParams.get("marketCapMin") || "0");
  try {
    const resp = await fetch(
      "https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=40&po=1&np=1&fields=f2,f3,f4,f12,f14,f20,f21,f23,f115,f162&fid=f20&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23&fltt=2",
      { signal: AbortSignal.timeout(10000) }
    );
    if (!resp.ok) throw new Error("API error");
    const json = await resp.json();
    if (!json.data?.diff) throw new Error("No data");
    const filtered = json.data.diff
      .map((item: any) => {
        const pe = (item.f162 || 0) / 100;
        const mc = Math.round((item.f20 || 0) / 1e8);
        const roe = (item.f115 || 0) / 100;
        if (pe > peMax || mc < marketCapMin) return null;
        return {
          code: item.f12, name: item.f14 || "未知", board: getBoard(item.f12 || ""),
          price: (item.f2 || 0) / 100, pe, pb: (item.f23 || 0) / 100, roe,
          marketCap: mc, revenueGrowth: 0,
          score: Math.round(Math.min(99, Math.max(30, 60 + (pe < 30 ? 10 : pe < 50 ? 5 : -5) + (roe > 15 ? 10 : 5)))),
        };
      })
      .filter(Boolean);
    return NextResponse.json(filtered);
  } catch {
    return NextResponse.json([], { status: 502 });
  }
}