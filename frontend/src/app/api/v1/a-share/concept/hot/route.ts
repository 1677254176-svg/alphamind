import { NextResponse } from "next/server";

const EMOJIS = ["🤖","🚁","📱","🦾","🔋","💾","⚡","🛰️","🧬","🚗"];

export async function GET() {
  try {
    const resp = await fetch(
      "https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=10&po=1&np=1&fields=f2,f3,f4,f12,f14,f104,f105,f128&fid=f3&fs=m:90+t:3&fltt=2",
      { signal: AbortSignal.timeout(8000) }
    );
    if (!resp.ok) throw new Error("API error");
    const json = await resp.json();
    if (!json.data?.diff) throw new Error("No data");
    return NextResponse.json({
      data: json.data.diff.map((item: any, i: number) => ({
        name: item.f14 || "未知", emoji: EMOJIS[i % EMOJIS.length],
        changePct: (item.f3 || 0) / 100, leaderStock: item.f128 || "---",
        leaderChangePct: (item.f104 || 0) / 100,
        hotLevel: Math.min(99, Math.max(50, Math.abs((item.f3 || 0) / 100 * 20) + 60)),
      })),
      source: "东方财富概念板块",
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ data: [], source: "东方财富概念板块 (连接失败)", updatedAt: new Date().toISOString() }, { status: 502 });
  }
}