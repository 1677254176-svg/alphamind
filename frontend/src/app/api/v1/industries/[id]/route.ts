import { NextResponse } from "next/server";
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const data: Record<string, any> = {
    "ai": {
      id: "ai", name: "AI人工智能", emoji: "🤖", description: "人工智能产业链覆盖大模型训练、AI芯片、算力基础设施到行业应用落地",
      chain: {
        upstream: { label: "上游：算力基础设施", stocks: [{ code: "688981", name: "中芯国际", role: "芯片制造", marketCap: 3650 }, { code: "300308", name: "中际旭创", role: "光模块", marketCap: 720 }, { code: "688256", name: "寒武纪", role: "AI芯片", marketCap: 580 }] },
        midstream: { label: "中游：大模型与平台", stocks: [{ code: "002230", name: "科大讯飞", role: "大模型+应用", marketCap: 980 }] },
        downstream: { label: "下游：行业应用", stocks: [{ code: "300750", name: "宁德时代", role: "AI+智造", marketCap: 8640 }, { code: "002415", name: "海康威视", role: "AI+安防", marketCap: 3200 }] },
      },
      marketSize: "2026年预计全球AI市场规模达3000亿美元", growthRate: "CAGR 37%",
      risks: ["算力芯片出口管制", "大模型商业化不及预期"], opportunities: ["国产替代加速", "AI Agent应用爆发"],
    },
  };
  return NextResponse.json(data[params.id] || { id: params.id, name: "未知产业" });
}