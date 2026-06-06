import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const data: Record<string, any> = {
    "1": {
      id: "1", title: "宁德时代：全球动力电池龙头", thesis_type: "long", status: "active",
      confidence_level: 8, stockCode: "300750", stockName: "宁德时代",
      core_reason: "全球电动化趋势持续，宁德时代技术+规模双轮驱动",
      detailed_analysis: "1. 全球新能源汽车渗透率仍低于30%，增长空间大\n2. 宁德时代全球市占率37%\n3. 麒麟电池、钠离子电池技术领先\n4. 与特斯拉、宝马深度绑定",
      target_price: 245.00, entry_price: 185.00, time_horizon: "12个月",
      conditions: [
        { condition: "全球新能源汽车销量同比增长>15%", current_status: "valid", last_check: "2026-06-06" },
        { condition: "宁德时代全球市占率>30%", current_status: "valid", last_check: "2026-06-06" },
        { condition: "营收增速>20%", current_status: "warning", last_check: "2026-06-05" },
        { condition: "毛利率>20%", current_status: "valid", last_check: "2026-06-06" },
      ],
      risks: [
        { risk_description: "新能源汽车销量增速放缓", probability: "中等", impact: "高", mitigation: "关注储能业务增长" },
        { risk_description: "技术路线变革（固态电池）", probability: "低", impact: "极高", mitigation: "宁德也在布局固态电池" },
      ],
      alerts: [{ message: "营收增速降至12%，接近失效条件", severity: "warning", created_at: "2026-06-05" }],
      created_at: "2026-01-15", updated_at: "2026-06-06",
    },
    "2": {
      id: "2", title: "天齐锂业：锂价触底反弹", thesis_type: "long", status: "invalidated",
      confidence_level: 5, stockCode: "002466", stockName: "天齐锂业",
      core_reason: "碳酸锂价格跌破成本线后反弹",
      detailed_analysis: "1. 碳酸锂价格在7万/吨附近获得支撑\n2. 格林布什矿成本优势显著\n3. 下游需求有回暖迹象",
      target_price: 95.00, entry_price: 78.00, time_horizon: "6个月",
      conditions: [
        { condition: "碳酸锂价格>8万/吨", current_status: "violated", last_check: "2026-06-06" },
        { condition: "下游补库需求回暖", current_status: "warning", last_check: "2026-06-06" },
        { condition: "公司产能利用率>80%", current_status: "violated", last_check: "2026-06-05" },
      ],
      risks: [
        { risk_description: "锂价持续低迷", probability: "高", impact: "极高", mitigation: "关注减产信号" },
        { risk_description: "海外矿山政策风险", probability: "低", impact: "中", mitigation: "多元化布局" },
      ],
      alerts: [{ message: "碳酸锂跌破7万/吨，逻辑已失效", severity: "critical", created_at: "2026-05-20" }],
      created_at: "2026-03-01", updated_at: "2026-05-20",
    },
    "3": {
      id: "3", title: "中际旭创：AI光模块龙头", thesis_type: "long", status: "active",
      confidence_level: 9, stockCode: "300308", stockName: "中际旭创",
      core_reason: "AI算力需求爆发，800G光模块出货量全球第一",
      detailed_analysis: "1. 全球AI资本开支持续增长\n2. 800G光模块全球市占率第一\n3. 1.6T光模块研发领先\n4. 客户包括英伟达、谷歌、微软",
      target_price: 120.00, entry_price: 72.00, time_horizon: "12个月",
      conditions: [
        { condition: "全球AI算力资本开支同比增长>30%", current_status: "valid", last_check: "2026-06-06" },
        { condition: "800G出货量环比增长>15%", current_status: "valid", last_check: "2026-06-06" },
        { condition: "毛利率>30%", current_status: "valid", last_check: "2026-06-05" },
        { condition: "北美客户订单持续增长", current_status: "valid", last_check: "2026-06-06" },
      ],
      risks: [
        { risk_description: "AI资本开支放缓", probability: "低", impact: "高", mitigation: "多元化客户结构" },
        { risk_description: "光模块竞争加剧", probability: "中等", impact: "中", mitigation: "技术领先保持壁垒" },
      ],
      alerts: [],
      created_at: "2026-02-10", updated_at: "2026-06-05",
    },
  };
  return NextResponse.json(data[params.id] || { id: params.id, title: "未知", status: "unknown" });
}