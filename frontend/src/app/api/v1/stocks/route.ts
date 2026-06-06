import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json([
    { code: "300750", name: "宁德时代", board: "创业板", price: 196.50, changePct: 2.35, pe: 25.6, marketCap: 8640, concept: "固态电池", brokerRating: "买入" },
    { code: "688981", name: "中芯国际", board: "科创板", price: 45.80, changePct: -1.20, pe: 42.3, marketCap: 3650, concept: "半导体", brokerRating: "增持" },
    { code: "002466", name: "天齐锂业", board: "深市主板", price: 68.30, changePct: -3.45, pe: 18.7, marketCap: 1120, concept: "锂矿", brokerRating: "中性" },
    { code: "300308", name: "中际旭创", board: "创业板", price: 89.20, changePct: 5.67, pe: 35.1, marketCap: 720, concept: "AI概念", brokerRating: "买入" },
    { code: "600519", name: "贵州茅台", board: "沪市主板", price: 1680.00, changePct: 0.15, pe: 28.9, marketCap: 21100, concept: "白酒", brokerRating: "买入" },
    { code: "688070", name: "纵横股份", board: "科创板", price: 52.40, changePct: 8.90, pe: 65.2, marketCap: 280, concept: "低空经济", brokerRating: "增持" },
    { code: "000858", name: "五粮液", board: "深市主板", price: 152.00, changePct: -0.85, pe: 22.3, marketCap: 5900, concept: "白酒", brokerRating: "买入" },
    { code: "002230", name: "科大讯飞", board: "深市主板", price: 42.30, changePct: 1.80, pe: 48.5, marketCap: 980, concept: "AI概念", brokerRating: "买入" },
  ]);
}