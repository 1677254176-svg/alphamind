import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json([
    { id: "1", stockCode: "300308", stockName: "中际旭创", action: "买入", date: "2026-04-15", price: 72.00, reason: "AI光模块需求爆发，800G出货量超预期", result: { pnlPct: 23.89, outcome: "成功", review: "逻辑验证正确，AI算力投资持续增长" } },
    { id: "2", stockCode: "002466", stockName: "天齐锂业", action: "买入", date: "2026-03-10", price: 78.00, reason: "锂价触底反弹预期", result: { pnlPct: -12.44, outcome: "失败", review: "锂价反弹不及预期，产能过剩局面未改善" } },
    { id: "3", stockCode: "600519", stockName: "贵州茅台", action: "买入", date: "2026-01-20", price: 1620.00, reason: "估值回归合理区间，防御性配置", result: { pnlPct: 3.70, outcome: "进行中", review: "稳健持有，等待消费复苏信号" } },
    { id: "4", stockCode: "300750", stockName: "宁德时代", action: "加仓", date: "2026-05-08", price: 190.00, reason: "Q1业绩超预期，储能业务高增长", result: { pnlPct: 3.42, outcome: "进行中", review: "逻辑持续验证，关注Q2营收增速" } },
  ]);
}