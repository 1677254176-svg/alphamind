import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const resp = await fetch(
      "https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&fields=f2,f3,f4,f12,f14&secids=1.000001,0.399001,0.399006,1.000688,0.899050",
      { signal: AbortSignal.timeout(8000) }
    );
    if (!resp.ok) throw new Error("API error");
    const json = await resp.json();
    if (!json.data?.diff) throw new Error("No data");
    return NextResponse.json(json.data.diff.map((item: any) => ({
      code: item.f12, name: item.f14, shortName: item.f14?.replace(/指数|指/g, "") || item.f12,
      price: item.f2 / 100, change: item.f4 / 100, changePct: item.f3 / 100,
    })));
  } catch {
    return NextResponse.json([], { status: 502 });
  }
}