import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json([
    { code: "300750", name: "宁德时代", board: "创业板", price: 196.50, pe: 25.6, pb: 4.2, roe: 24.0, marketCap: 8640, revenueGrowth: 17.3, score: 92 },
    { code: "300308", name: "中际旭创", board: "创业板", price: 89.20, pe: 35.1, pb: 6.8, roe: 22.5, marketCap: 720, revenueGrowth: 45.2, score: 88 },
    { code: "600519", name: "贵州茅台", board: "沪市主板", price: 1680.00, pe: 28.9, pb: 8.5, roe: 30.2, marketCap: 21100, revenueGrowth: 15.1, score: 85 },
    { code: "002230", name: "科大讯飞", board: "深市主板", price: 42.30, pe: 48.5, pb: 5.1, roe: 15.8, marketCap: 980, revenueGrowth: 28.6, score: 78 },
    { code: "688981", name: "中芯国际", board: "科创板", price: 45.80, pe: 42.3, pb: 3.8, roe: 8.5, marketCap: 3650, revenueGrowth: 11.5, score: 72 },
    { code: "688070", name: "纵横股份", board: "科创板", price: 52.40, pe: 65.2, pb: 7.2, roe: 12.3, marketCap: 280, revenueGrowth: 38.9, score: 75 },
  ]);
}