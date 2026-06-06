"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { TrendingUp, DollarSign, BarChart3, Target, Shield, Building2, Activity } from "lucide-react";
import { apiClient } from "@/lib/api";

interface FinancialPoint { year: number; value: number }
interface StockDetail {
  name: string; fullName: string; board: string; industry: string;
  founded: string; listed: string; employees: number; headquarters: string;
  businessModel: string; coreProducts: string; moat: string;
  price: number; changePct: number; pe: number; pb: number; marketCap: number;
  high: number; low: number; open: number; volume: number; amount: number; turnover: number; amplitude: number;
  revenue: FinancialPoint[]; eps: FinancialPoint[]; roe: FinancialPoint[];
  grossMargin: number; netMargin: number;
  brokerConsensus: { rating: string; targetPrice: number; upside: number };
  technicals: { ma5: number; ma20: number; ma60: number; rsi: number; macd: string; bollPosition: string };
  source?: string; updatedAt?: string; cached?: boolean; error?: string;
}

function fmt(v: number | undefined | null, decimals = 2): string {
  if (v === undefined || v === null || isNaN(v) || v === 0) return "---";
  return v.toFixed(decimals);
}
function fmtPct(v: number | undefined | null): string {
  if (v === undefined || v === null || isNaN(v)) return "---";
  return (v >= 0 ? "+" : "") + v.toFixed(2) + "%";
}
function fmtInt(v: number | undefined | null): string {
  if (v === undefined || v === null || isNaN(v) || v === 0) return "---";
  return v.toLocaleString();
}
function has(v: number | undefined | null): boolean {
  return v !== undefined && v !== null && !isNaN(v) && v !== 0;
}

export default function StockDetailPage() {
  const { ticker } = useParams();
  const [stock, setStock] = useState<StockDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticker) return;
    setLoading(true);
    setStock(null);
    apiClient<StockDetail>(`/stocks/${ticker}`)
      .then(setStock)
      .catch(() => setStock({ name: String(ticker), error: "数据源连接失败" } as any))
      .finally(() => setLoading(false));
  }, [ticker]);

  if (loading) return (
    <div className="max-w-5xl mx-auto py-20 text-center text-zinc-500">
      <Activity className="w-8 h-8 mx-auto mb-3 animate-pulse" />加载中...
    </div>
  );

  if (!stock || stock.error) return (
    <div className="max-w-5xl mx-auto py-20 text-center">
      <Building2 className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
      <p className="text-zinc-400 text-lg">{stock?.error || "数据加载失败"}</p>
      <p className="text-zinc-600 text-sm mt-1">请检查股票代码是否正确，或稍后重试</p>
    </div>
  );

  const hasCharts = stock.revenue?.length > 0 || stock.eps?.length > 0 || stock.roe?.length > 0;
  const maxRevenue = stock.revenue?.length ? Math.max(...stock.revenue.map(r => r.value), 1) : 1;
  const maxEps = stock.eps?.length ? Math.max(...stock.eps.map(r => r.value), 1) : 1;
  const maxRoe = stock.roe?.length ? Math.max(...stock.roe.map(r => r.value), 1) : 1;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Meta bar */}
      <div className="flex items-center gap-4 text-xs text-zinc-600">
        {stock.source && <span>数据源: {stock.source}</span>}
        {stock.cached && <span className="text-amber-500">缓存</span>}
        {stock.updatedAt && <span>更新: {new Date(stock.updatedAt).toLocaleTimeString("zh-CN")}</span>}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">{stock.board}</span>
            <span className="text-xs text-zinc-500">{stock.industry}</span>
          </div>
          <h1 className="text-3xl font-bold">{stock.name}</h1>
          <p className="text-zinc-500 text-sm mt-1">{ticker}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold font-mono">{has(stock.price) ? "¥" + stock.price.toFixed(2) : "---"}</p>
          <p className={`text-sm font-bold ${has(stock.changePct) ? (stock.changePct >= 0 ? "text-red-400" : "text-green-400") : "text-zinc-500"}`}>
            {has(stock.changePct) ? fmtPct(stock.changePct) : "---"}
          </p>
          {has(stock.high) && (
            <div className="text-xs text-zinc-500 mt-1 space-y-0.5">
              <div>高 {stock.high.toFixed(2)} 低 {stock.low.toFixed(2)}</div>
              <div>开 {stock.open.toFixed(2)} 额 {fmtInt(stock.amount ? Math.round(stock.amount/1e8) : 0)}亿</div>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-6 gap-3">
        {[
          { label: "PE(TTM)", value: has(stock.pe) ? stock.pe.toFixed(1) : "---" },
          { label: "PB", value: has(stock.pb) ? stock.pb.toFixed(1) : "---" },
          { label: "市值(亿)", value: has(stock.marketCap) ? stock.marketCap.toLocaleString() : "---" },
          { label: "毛利率", value: has(stock.grossMargin) ? stock.grossMargin + "%" : "---" },
          { label: "净利率", value: has(stock.netMargin) ? stock.netMargin + "%" : "---" },
          { label: "换手率", value: has(stock.turnover) ? stock.turnover.toFixed(1) + "%" : "---" },
        ].map(m => (
          <div key={m.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
            <p className="text-xs text-zinc-500 mb-1">{m.label}</p>
            <p className="text-sm font-bold">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Financial Charts */}
      {hasCharts && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { title: "营收(亿)", data: stock.revenue, max: maxRevenue, color: "bg-violet-500", decimals: 0 },
            { title: "EPS", data: stock.eps, max: maxEps, color: "bg-cyan-500", decimals: 2 },
            { title: "ROE(%)", data: stock.roe, max: maxRoe, color: "bg-emerald-500", decimals: 1 },
          ].map(chart => chart.data.length > 0 && (
            <div key={chart.title} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3"><BarChart3 className="w-4 h-4 text-zinc-400" /><h3 className="text-sm font-medium">{chart.title}</h3></div>
              <div className="space-y-1.5">
                {chart.data.map(d => (
                  <div key={d.year} className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-500 w-10">{d.year}</span>
                    <div className="flex-1 bg-zinc-800 rounded h-4 overflow-hidden">
                      <div className={chart.color + " h-full rounded"} style={{ width: Math.min(100, (d.value / chart.max * 100)).toFixed(0) + "%" }} />
                    </div>
                    <span className="text-zinc-300 w-14 text-right">{d.value.toFixed(chart.decimals)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Broker + Technicals */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3"><DollarSign className="w-4 h-4 text-amber-400" /><h2 className="font-semibold">估值分析</h2></div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-zinc-500">评级</span><span className={stock.brokerConsensus.rating === "买入" || stock.brokerConsensus.rating === "增持" ? "text-red-400 font-bold" : "text-zinc-300"}>{stock.brokerConsensus.rating}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">目标价</span><span className="font-bold">{has(stock.brokerConsensus.targetPrice) ? "¥" + stock.brokerConsensus.targetPrice.toFixed(2) : "---"}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">上涨空间</span><span className={has(stock.brokerConsensus.upside) && stock.brokerConsensus.upside > 0 ? "text-emerald-400 font-bold" : "text-zinc-300"}>{has(stock.brokerConsensus.upside) ? (stock.brokerConsensus.upside > 0 ? "+" : "") + stock.brokerConsensus.upside + "%" : "---"}</span></div>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-blue-400" /><h2 className="font-semibold">技术指标</h2></div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              { label: "MA5", value: has(stock.technicals.ma5) ? stock.technicals.ma5.toFixed(2) : "---" },
              { label: "MA20", value: has(stock.technicals.ma20) ? stock.technicals.ma20.toFixed(2) : "---" },
              { label: "MA60", value: has(stock.technicals.ma60) ? stock.technicals.ma60.toFixed(2) : "---" },
              { label: "RSI(14)", value: stock.technicals.rsi > 0 ? stock.technicals.rsi.toFixed(1) : "---" },
              { label: "MACD", value: stock.technicals.macd || "---" },
              { label: "布林带", value: stock.technicals.bollPosition || "---" },
            ].map(t => (
              <div key={t.label} className="bg-zinc-800/50 rounded-lg p-2 text-center">
                <p className="text-xs text-zinc-500">{t.label}</p>
                <p className="font-bold">{t.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}