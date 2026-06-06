"use client";
import { useState, useEffect } from "react";
import { Briefcase, TrendingUp, TrendingDown, PieChart } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api";

interface Holding { code: string; name: string; board: string; shares: number; cost: number; price: number; pnl: number; pnlPct: number; weight: number }
interface Summary { totalValue: number; totalCost: number; totalPnl: number; totalPnlPct: number; dailyPnl: number; dailyPnlPct: number; holdings: number; cash: number; cashPct: number; boardExposure: Record<string, number> }

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiClient<Holding[]>("/portfolio/holdings"),
      apiClient<Summary>("/portfolio/summary"),
    ]).then(([h, s]) => { setHoldings(h); setSummary(s); })
      .catch(() => setError("数据加载失败"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="max-w-5xl mx-auto py-20 text-center text-zinc-500">加载中...</div>;
  if (error) return <div className="max-w-5xl mx-auto py-20 text-center text-amber-400">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold">我的组合</h1>
        <p className="text-zinc-400 text-sm mt-1">持仓管理 · 盈亏统计 · 仓位分析</p>
      </div>

      {summary && (
        <div className="grid grid-cols-6 gap-3">
          {[
            { label: "总市值", value: "¥" + summary.totalValue.toLocaleString() },
            { label: "总盈亏", value: (summary.totalPnl >= 0 ? "+" : "") + "¥" + summary.totalPnl.toLocaleString(), cls: summary.totalPnl >= 0 ? "text-red-400" : "text-green-400" },
            { label: "收益率", value: (summary.totalPnlPct >= 0 ? "+" : "") + summary.totalPnlPct + "%", cls: summary.totalPnlPct >= 0 ? "text-red-400" : "text-green-400" },
            { label: "今日盈亏", value: (summary.dailyPnl >= 0 ? "+" : "") + "¥" + summary.dailyPnl.toLocaleString(), cls: summary.dailyPnl >= 0 ? "text-red-400" : "text-green-400" },
            { label: "持仓数", value: summary.holdings + " 只" },
            { label: "现金", value: "¥" + summary.cash.toLocaleString() + " (" + summary.cashPct + "%)" },
          ].map(m => (
            <div key={m.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
              <p className="text-xs text-zinc-500 mb-1">{m.label}</p>
              <p className={"text-sm font-bold " + (m.cls || "")}>{m.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-zinc-800 text-zinc-500">
            <th className="text-left px-4 py-3">代码</th><th className="text-left px-4 py-3">名称</th><th className="text-left px-4 py-3">板块</th>
            <th className="text-right px-4 py-3">持仓(股)</th><th className="text-right px-4 py-3">成本</th><th className="text-right px-4 py-3">现价</th>
            <th className="text-right px-4 py-3">盈亏</th><th className="text-right px-4 py-3">盈亏%</th><th className="text-right px-4 py-3">仓位</th>
          </tr></thead>
          <tbody>
            {holdings.map(h => (
              <tr key={h.code} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{h.code}</td>
                <td className="px-4 py-3"><Link href={`/stocks/${h.code}`} className="text-zinc-200 hover:text-violet-400">{h.name}</Link></td>
                <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">{h.board}</span></td>
                <td className="px-4 py-3 text-right text-xs">{h.shares.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-xs">¥{h.cost.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-xs">¥{h.price.toFixed(2)}</td>
                <td className={"px-4 py-3 text-right text-xs font-bold " + (h.pnl >= 0 ? "text-red-400" : "text-green-400")}>{h.pnl >= 0 ? "+" : ""}¥{h.pnl.toLocaleString()}</td>
                <td className={"px-4 py-3 text-right text-xs " + (h.pnlPct >= 0 ? "text-red-400" : "text-green-400")}>{h.pnlPct >= 0 ? "+" : ""}{h.pnlPct}%</td>
                <td className="px-4 py-3 text-right text-xs">{h.weight}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}