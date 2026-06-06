import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    theme: "dark", language: "zh-CN", defaultMarket: "A",
    notifications: { thesis_alerts: true, catalyst_reminders: true, price_alerts: false },
    dataSources: { primary: "eastmoney", backup: "sina" },
  });
}