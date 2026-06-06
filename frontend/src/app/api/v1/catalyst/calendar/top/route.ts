import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json([
    { date: "6月9日", type: "CPI", title: "5月CPI数据公布", importance: 4 },
    { date: "6月12日", type: "FOMC", title: "美联储6月议息会议", importance: 5 },
    { date: "6月20日", type: "LPR", title: "LPR利率公布", importance: 4 },
  ]);
}