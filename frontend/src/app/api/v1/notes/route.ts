import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json([
    { id: "1", title: "AI算力产业链梳理", tags: ["AI", "算力", "半导体"], preview: "从GPU到光模块，AI算力产业链的核心环节分析...", updated_at: "2026-06-06", linkedStocks: ["300308", "688256"] },
    { id: "2", title: "固态电池技术路线对比", tags: ["新能源", "固态电池"], preview: "硫化物vs氧化物vs聚合物...", updated_at: "2026-06-05", linkedStocks: ["300750"] },
    { id: "3", title: "美联储加息周期回顾", tags: ["宏观", "美联储"], preview: "复盘2015-2026年加息周期对A股的影响...", updated_at: "2026-06-04", linkedStocks: [] },
    { id: "4", title: "低空经济政策汇总", tags: ["低空经济", "政策"], preview: "中央到地方的低空经济政策梳理...", updated_at: "2026-06-03", linkedStocks: ["688070"] },
  ]);
}