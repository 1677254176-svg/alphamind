import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json([
    { thesisId: "1", title: "宁德时代：全球市占率", level: "warning", message: "营收增速降至12%，接近失效条件(10%)", stockCode: "300750" },
    { thesisId: "2", title: "天齐锂业：锂价反弹", level: "critical", message: "碳酸锂跌破7万/吨，逻辑已失效", stockCode: "002466" },
  ]);
}