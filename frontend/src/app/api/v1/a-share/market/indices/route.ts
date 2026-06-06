import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json([
    { code: "000001", name: "上证指数", shortName: "上证", price: 3380.50, change: 12.30, changePct: 0.36 },
    { code: "399001", name: "深证成指", shortName: "深证", price: 10782.30, change: -25.60, changePct: -0.24 },
    { code: "399006", name: "创业板指", shortName: "创业板", price: 2189.10, change: -15.20, changePct: -0.69 },
    { code: "000688", name: "科创50", shortName: "科创50", price: 987.50, change: 8.40, changePct: 0.86 },
    { code: "899050", name: "北证50", shortName: "北证50", price: 1253.80, change: 5.60, changePct: 0.45 },
  ]);
}