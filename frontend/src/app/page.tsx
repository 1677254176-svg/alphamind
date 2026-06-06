"use client";
import { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, TrendingUp, DollarSign, Zap, Bell, Calendar } from "lucide-react";
import { apiClient } from "@/lib/api";

interface AShareIndex { code: string; name: string; shortName: string; price: number; change: number; changePct: number }
interface ConceptBoard { name: string; emoji: string; changePct: number; leaderStock: string; leaderChangePct: number; hotLevel: number }
interface PortfolioSummary { dailyPnl: number; dailyPnlPercent: number; weeklyPnl: number; monthlyPnl: number; totalValue: number; holdings: number; cash: number }
interface ThesisAlert { thesisId: string; title: string; level: "info" | "warning" | "critical"; message: string; stockCode: string }
interface CatalystEvent { date: string; type: string; title: string; importance: number }

export default function DashboardPage() {
  const [indices, setIndices] = useState<AShareIndex[]>([]);
  const [concepts, setConcepts] = useState<ConceptBoard[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [aiSummary, setAiSummary] = useState("");
  const [alerts, setAlerts] = useState<ThesisAlert[]>([]);
  const [catalysts, setCatalysts] = useState<CatalystEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const errs: string[] = [];
    const load = async () => {
      await Promise.allSettled([
        apiClient<AShareIndex[]>("/a-share/market/indices").then(setIndices).catch(() => errs.push("指数")),
        apiClient<ConceptBoard[]>("/a-share/concept/hot").then(setConcepts).catch(() => errs.push("概念")),
        apiClient<PortfolioSummary>("/dashboard/my-portfolio").then(setPortfolio).catch(() => errs.push("组合")),
        apiClient<{ recap: string }>("/dashboard/ai-summary").then(d => setAiSummary(d.recap)).catch(() => errs.push("AI总结")),
        apiClient<ThesisAlert[]>("/theses/monitor-snapshot").then(setAlerts).catch(() => errs.push("预警")),
        apiClient<CatalystEvent[]>("/catalyst/calendar/top").then(setCatalysts).catch(() => errs.push("催化剂")),
      ]);
      setErrors(errs);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="max-w-6xl mx-auto py-20 text-center text-zinc-500">加载中...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {errors.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2 text-xs text-amber-400">
          ⚠ 部分数据加载失败: {errors.join("、")}（来自东方财富实时行情）
        </div>
      )}

      <div className="grid grid-cols-5 gap-3">
        {indices.map(idx => (
          <div key={idx.code} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-1">{idx.shortName}</p>
            <p className="text-xl font-bold font-mono">{idx.price.toFixed(2)}</p>
            <p className={`text-sm font-bold mt-1 ${idx.changePct >= 0 ? "text-red-400" : "text-green-400"}`}>
              {idx.changePct >= 0 ? <ArrowUp className="w-3 h-3 inline" /> : <ArrowDown className="w-3 h-3 inline" />}
              {idx.changePct >= 0 ? "+" : ""}{idx.changePct.toFixed(2)}%
            </p>
          </div>
        ))}
        {indices.length === 0 && <div className="col-span-5 text-center py-8 text-zinc-500">指数数据加载中，请确保网络连接</div>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3"><Zap className="w-4 h-4 text-cyan-400" /><h2 className="font-semibold">AI 市场总结</h2></div>
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{aiSummary || "AI 分析生成中..."}</p>
        </div>
        {portfolio && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3"><DollarSign className="w-4 h-4 text-emerald-400" /><h2 className="font-semibold">我的组合</h2></div>
            <div className="space-y-2 text-sm">
              <div><p className="text-xs text-zinc-500">今日</p><p className={`text-lg font-bold ${portfolio.dailyPnl >= 0 ? "text-red-400" : "text-green-400"}`}>{portfolio.dailyPnl >= 0 ? "+" : ""}¥{portfolio.dailyPnl.toLocaleString()}</p></div>
              <div className="flex gap-4">
                <div><p className="text-xs text-zinc-500">本周</p><p className="font-bold">¥{portfolio.weeklyPnl.toLocaleString()}</p></div>
                <div><p className="text-xs text-zinc-500">本月</p><p className="font-bold">¥{portfolio.monthlyPnl.toLocaleString()}</p></div>
              </div>
              <div className="pt-2 border-t border-zinc-800 flex justify-between">
                <span className="text-xs text-zinc-500">总市值 ¥{portfolio.totalValue.toLocaleString()}</span>
                <span className="text-xs text-zinc-500">{portfolio.holdings} 只</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-purple-400" /><h2 className="font-semibold">热门概念板块</h2></div>
        <div className="grid grid-cols-5 gap-3">
          {concepts.map(c => (
            <div key={c.name} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors cursor-pointer">
              <div className="text-2xl mb-1">{c.emoji}</div>
              <p className="font-medium text-sm">{c.name}</p>
              <p className={`text-sm font-bold mt-1 ${c.changePct >= 0 ? "text-red-400" : "text-green-400"}`}>{c.changePct >= 0 ? "+" : ""}{c.changePct}%</p>
              <p className="text-xs text-zinc-500 mt-1">领涨: {c.leaderStock}</p>
            </div>
          ))}
          {concepts.length === 0 && <div className="col-span-5 text-center py-8 text-zinc-500">概念板块数据加载中</div>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3"><Bell className="w-4 h-4 text-amber-400" /><h2 className="font-semibold">⚠ Thesis 预警</h2></div>
          {alerts.length === 0 ? <p className="text-zinc-500 text-sm">暂无预警</p> : (
            <div className="space-y-2">{alerts.map(a => (
              <div key={a.thesisId} className="flex items-start gap-2 p-2 rounded-lg bg-zinc-800/50">
                <span className="text-sm mt-0.5">{a.level === "critical" ? "🔴" : a.level === "warning" ? "⚠" : "ℹ"}</span>
                <div><p className="text-sm font-medium">{a.stockCode} · {a.title}</p><p className="text-xs text-zinc-400">{a.message}</p></div>
              </div>
            ))}</div>
          )}
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3"><Calendar className="w-4 h-4 text-blue-400" /><h2 className="font-semibold">📅 未来催化剂</h2></div>
          <div className="space-y-2">
            {catalysts.map((e, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-zinc-800/50">
                <span className="text-xs text-zinc-400 w-16">{e.date}</span>
                <span className="text-xs bg-zinc-700 px-2 py-0.5 rounded">{e.type}</span>
                <span className="text-sm flex-1">{e.title}</span>
                <span className="text-xs text-zinc-500">{"★".repeat(e.importance)}</span>
              </div>
            ))}
          </div>
          {catalysts.length === 0 && <p className="text-zinc-500 text-sm">暂无催化剂</p>}
        </div>
      </div>
    </div>
  );
}