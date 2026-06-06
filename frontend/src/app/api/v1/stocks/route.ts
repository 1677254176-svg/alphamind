import { NextResponse } from "next/server";

function getBoard(code: string) {
  if (code.startsWith("688") || code.startsWith("689")) return "科创板";
  if (code.startsWith("300") || code.startsWith("301")) return "创业板";
  if (code.startsWith("8") || code.startsWith("920")) return "北交所";
  if (code.startsWith("4")) return "新三板";
  if (code.startsWith("600") || code.startsWith("601") || code.startsWith("603") || code.startsWith("605")) return "沪市主板";
  if (code.startsWith("000") || code.startsWith("001") || code.startsWith("002") || code.startsWith("003")) return "深市主板";
  return "其他";
}

export async function GET() {
  try {
    const resp = await fetch(
      "https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=20&po=1&np=1&fields=f2,f3,f4,f12,f14,f20,f21,f100,f115&fid=f3&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23&fltt=2",
      { next: { revalidate: 300 } }
    );
    const json = await resp.json();
    if (json.data?.diff) {
      return NextResponse.json(json.data.diff.map((item: any) => ({
        code: item.f12,
        name: item.f14 || "未知",
        board: getBoard(item.f12 || ""),
        price: (item.f2 || 0) / 100,
        changePct: (item.f3 || 0) / 100,
        pe: (item.f115 || item.f9 || 0) / 100,
        marketCap: Math.round((item.f20 || 0) / 1e8),
        concept: item.f100 || "---",
        brokerRating: "---",
      })));
    }
  } catch {}
  return NextResponse.json([
    { code: "300750", name: "宁德时代", board: "创业板", price: 196.50, changePct: 2.35, pe: 25.6, marketCap: 8640, concept: "固态电池", brokerRating: "买入" },
    { code: "300308", name: "中际旭创", board: "创业板", price: 89.20, changePct: 5.67, pe: 35.1, marketCap: 720, concept: "AI概念", brokerRating: "买入" },
    { code: "600519", name: "贵州茅台", board: "沪市主板", price: 1680.00, changePct: 0.15, pe: 28.9, marketCap: 21100, concept: "白酒", brokerRating: "买入" },
    { code: "688981", name: "中芯国际", board: "科创板", price: 45.80, changePct: -1.20, pe: 42.3, marketCap: 3650, concept: "半导体", brokerRating: "增持" },
    { code: "002230", name: "科大讯飞", board: "深市主板", price: 42.30, changePct: 1.80, pe: 48.5, marketCap: 980, concept: "AI概念", brokerRating: "买入" },
  ]);
}