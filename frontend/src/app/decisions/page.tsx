"use client";
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api";

interface Decision {
  id: string; stockCode: string; stockName: string; action: string; date: string;
  price: number; reason: string;
  result: { pnlPct: number; outcome: string; review: string };
}

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient<Decision[]>("/decisions")
      .then(setDecisions)
      .catch(() => { setLoading(false); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="max-w-4xl mx-auto py-20 text-center text-zinc-500">加载中...</div>;
  if (decisions.length === 0) return (
    <div className="max-w-4xl mx-auto py-20 text-center">
      <Clock className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
      <p className="text-zinc-400 text-lg">暂无决策记录</p>
      <p className="text-zinc-600 text-sm mt-1">记录你的每笔交易和背后的思考</p>
    </div>
  );

  const outcomes: Record<string, string> = { "成功": "text-emerald-400 bg-emerald-500/10", "失败": "text-red-400 bg-red-500/10", "进行中": "text-blue-400 bg-blue-500/10" };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold">投资决策回放</h1>
        <p className="text-zinc-400 text-sm mt-1">记录每一笔交易背后的思考，分辨运气与认知</p>
      </div>
      <div className="space-y-4">
        {decisions.map(d => (
          <div key={d.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${d.action === "买入" || d.action === "加仓" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>{d.action}</span>
                <Link href={`/stocks/${d.stockCode}`} className="font-semibold hover:text-violet-400">{d.stockName}</Link>
                <span className="text-xs text-zinc-500 font-mono">{d.stockCode}</span>
                <span className="text-xs text-zinc-600">{d.date}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${outcomes[d.result.outcome] || "text-zinc-400 bg-zinc-800"}`}>{d.result.outcome}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="bg-zinc-800/50 rounded-lg p-3"><p className="text-xs text-zinc-500 mb-1">买入价</p><p className="font-bold">¥{d.price.toFixed(2)}</p></div>
              <div className={`bg-zinc-800/50 rounded-lg p-3 ${d.result.pnlPct >= 0 ? "text-red-400" : "text-green-400"}`}>
                <p className="text-xs text-zinc-500 mb-1">收益率</p><p className="font-bold">{d.result.pnlPct >= 0 ? "+" : ""}{d.result.pnlPct}%</p>
              </div>
              <div className="bg-zinc-800/50 rounded-lg p-3"><p className="text-xs text-zinc-500 mb-1">买入原因</p><p className="text-sm">{d.reason}</p></div>
            </div>
            <div className="bg-zinc-800/30 rounded-lg p-3 text-sm"><span className="text-zinc-500">复盘：</span>{d.result.review}</div>
          </div>
        ))}
      </div>
    </div>
  );
}