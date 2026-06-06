import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json([
    { date: "6月9日", type: "CPI", title: "5月CPI数据公布", importance: 4 },
    { date: "6月12日", type: "FOMC", title: "美联储6月议息会议", importance: 5 },
    { date: "6月20日", type: "LPR", title: "LPR利率公布", importance: 4 },
    { date: "7月1日", type: "中报", title: "中报预披露开始", importance: 4 },
    { date: "8月31日", type: "中报", title: "中报披露截止日", importance: 5 },
  ]);
}