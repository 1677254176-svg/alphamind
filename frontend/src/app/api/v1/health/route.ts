import { NextResponse } from "next/server";

const STATUS: Record<string, { source: string; lastCheck: string; reachable: boolean }> = {};

function record(source: string, reachable: boolean) {
  STATUS[source] = { source, lastCheck: new Date().toISOString(), reachable };
}

export async function GET() {
  // 检查各数据源可达性
  try {
    const r = await fetch("https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&fields=f2&secids=1.000001", { signal: AbortSignal.timeout(5000) });
    record("东方财富实时行情", r.ok);
  } catch { record("东方财富实时行情", false); }

  try {
    const r = await fetch("https://searchadapter.eastmoney.com/api/suggest/get?input=300750&type=14", { signal: AbortSignal.timeout(5000) });
    record("东方财富搜索", r.ok);
  } catch { record("东方财富搜索", false); }

  try {
    const r = await fetch("https://datacenter.eastmoney.com/api/data/v1/get?reportName=RPT_LICO_FN_CPD&columns=SECURITY_CODE&pageSize=1", { signal: AbortSignal.timeout(5000) });
    record("东方财富财务数据", r.ok);
  } catch { record("东方财富财务数据", false); }

  return NextResponse.json({
    status: Object.values(STATUS).some(s => s.reachable) ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    sources: Object.values(STATUS),
  });
}

export { record };