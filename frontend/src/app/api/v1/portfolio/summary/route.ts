import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    totalValue: 1450000, totalCost: 1350000, totalPnl: 100000, totalPnlPct: 7.41,
    dailyPnl: 12300, dailyPnlPct: 0.85, holdings: 5, cash: 500000, cashPct: 34.5,
    boardExposure: { "创业板": 32.1, "沪市主板": 23.2, "科创板": 15.8, "深市主板": 5.8 },
  });
}