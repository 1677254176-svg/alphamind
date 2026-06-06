import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json([
    { code: "300750", name: "宁德时代", board: "创业板", shares: 1000, cost: 185.00, price: 196.50, pnl: 11500, pnlPct: 6.22, weight: 13.6 },
    { code: "300308", name: "中际旭创", board: "创业板", shares: 3000, cost: 72.00, price: 89.20, pnl: 51600, pnlPct: 23.89, weight: 18.5 },
    { code: "600519", name: "贵州茅台", board: "沪市主板", shares: 200, cost: 1620.00, price: 1680.00, pnl: 12000, pnlPct: 3.70, weight: 23.2 },
    { code: "688981", name: "中芯国际", board: "科创板", shares: 5000, cost: 42.00, price: 45.80, pnl: 19000, pnlPct: 9.05, weight: 15.8 },
    { code: "002230", name: "科大讯飞", board: "深市主板", shares: 2000, cost: 38.50, price: 42.30, pnl: 7600, pnlPct: 9.87, weight: 5.8 },
  ]);
}