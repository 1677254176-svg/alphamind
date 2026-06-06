import { NextResponse } from "next/server";

const EMOJIS = ["🤖", "🚁", "📱", "🦾", "🔋", "💾", "⚡", "🛰️", "🧬", "🚗"];

export async function GET() {
  try {
    const resp = await fetch(
      "https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=10&po=1&np=1&fields=f2,f3,f4,f12,f14,f104,f105,f128&fid=f3&fs=m:90+t:3&fltt=2",
      { next: { revalidate: 120 } }
    );
    const json = await resp.json();
    if (json.data?.diff) {
      return NextResponse.json(json.data.diff.map((item: any, i: number) => ({
        name: item.f14 || "未知板块",
        emoji: EMOJIS[i % EMOJIS.length],
        changePct: (item.f3 || 0) / 100,
        leaderStock: item.f128 || "---",
        leaderChangePct: (item.f104 || 0) / 100,
        hotLevel: Math.min(99, Math.max(50, Math.abs((item.f3 || 0) / 100 * 20) + 60)),
      })));
    }
  } catch {}
  return NextResponse.json([
    { name: "AI概念", emoji: "🤖", changePct: 3.25, leaderStock: "300308", leaderChangePct: 9.98, hotLevel: 95 },
    { name: "低空经济", emoji: "🚁", changePct: 2.80, leaderStock: "688070", leaderChangePct: 12.50, hotLevel: 88 },
    { name: "华为产业链", emoji: "📱", changePct: 1.95, leaderStock: "002855", leaderChangePct: 7.20, hotLevel: 82 },
    { name: "机器人概念", emoji: "🦾", changePct: 2.10, leaderStock: "300024", leaderChangePct: 10.05, hotLevel: 90 },
    { name: "固态电池", emoji: "🔋", changePct: 1.50, leaderStock: "688005", leaderChangePct: 6.80, hotLevel: 75 },
  ]);
}