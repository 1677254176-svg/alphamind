import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { id: "1", title: "宁德时代：全球动力电池龙头", thesis_type: "long", status: "active",
      confidence_level: 8, stockCode: "300750", stockName: "宁德时代",
      condition_summary: { valid: 3, warning: 1, violated: 0 },
      updated_at: "2026-06-06", core_reason: "全球电动化趋势持续，宁德时代技术+规模双轮驱动，市占率稳居第一" },
    { id: "2", title: "天齐锂业：锂价触底反弹", thesis_type: "long", status: "invalidated",
      confidence_level: 5, stockCode: "002466", stockName: "天齐锂业",
      condition_summary: { valid: 0, warning: 1, violated: 2 },
      updated_at: "2026-05-20", core_reason: "碳酸锂价格跌破成本线后反弹，格林布什矿低成本优势" },
    { id: "3", title: "中际旭创：AI光模块龙头", thesis_type: "long", status: "active",
      confidence_level: 9, stockCode: "300308", stockName: "中际旭创",
      condition_summary: { valid: 4, warning: 0, violated: 0 },
      updated_at: "2026-06-05", core_reason: "AI算力需求爆发，800G光模块出货量全球第一，业绩持续超预期" },
  ]);
}