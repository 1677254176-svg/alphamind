import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ dailyPnl: 12300, dailyPnlPercent: 2.1, weeklyPnl: 58000, monthlyPnl: 230000, totalValue: 1450000, holdings: 8, cash: 500000 });
}