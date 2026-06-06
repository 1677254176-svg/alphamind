import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const { question } = await req.json();
  const keywords: Record<string, string> = {
    "宁德时代": "宁德时代（300750）是全球动力电池龙头，全球市占率约37%。\n\n📊 核心逻辑：\n1. 全球电动化渗透率仍低于30%，增长空间大\n2. 储能业务高速增长，有望成为第二增长曲线\n3. 技术壁垒+规模效应+客户绑定形成护城河\n\n⚠️ 风险关注：营收增速是否保持在20%以上\n📈 券商共识：买入 | 目标价 ¥245 (+24.7%)",
  };
  for (const [k, v] of Object.entries(keywords)) {
    if (question?.includes(k)) return NextResponse.json({ answer: v });
  }
  return NextResponse.json({ answer: "这是一个很好的问题！\n\n📌 建议关注以下维度：\n1. 行业景气度趋势\n2. 公司基本面变化\n3. 资金面和技术面信号\n\n需要我深入分析哪个方面？" });
}