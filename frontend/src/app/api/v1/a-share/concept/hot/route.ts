import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json([
    { name: "AI概念", emoji: "🤖", changePct: 3.25, leaderStock: "300308", leaderChangePct: 9.98, hotLevel: 95 },
    { name: "低空经济", emoji: "🚁", changePct: 2.80, leaderStock: "688070", leaderChangePct: 12.50, hotLevel: 88 },
    { name: "华为产业链", emoji: "📱", changePct: 1.95, leaderStock: "002855", leaderChangePct: 7.20, hotLevel: 82 },
    { name: "机器人概念", emoji: "🦾", changePct: 2.10, leaderStock: "300024", leaderChangePct: 10.05, hotLevel: 90 },
    { name: "固态电池", emoji: "🔋", changePct: 1.50, leaderStock: "688005", leaderChangePct: 6.80, hotLevel: 75 },
  ]);
}