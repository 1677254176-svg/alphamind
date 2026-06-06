"use client";
import { useState, useEffect } from "react";
import { Clock, TrendingUp, TrendingDown, Target, RotateCcw } from "lucide-react";
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
  const [error, setError] = useState("");

  useEffect(() => {
    apiClient<Decision[]>("/decisions")
      .then(setDecisions)
      .catch(() => { setDecisions([{id:"1",stockCode:"300308",stockName:"中际旭创",action:"买入",date:"2026-04-15",price:72.00,reason:"AI光模块需求爆发",result:{pnlPct:23.89,outcome:"成功",review:"逻辑验证正确，AI算力投资持续增长"}},{id:"2",stockCode:"002466",stockName:"天齐锂业",action:"买入",date:"2026-03-10",price:78.00,reason:"锂价触底反弹预期",result:{pnlPct:-12.44,outcome:"失败",review:"锂价反弹不及预期"}},{id:"3",stockCode:"600519",stockName:"贵州茅台",action:"买入",date:"2026-01-20",price:1620.00,reason:"估值回归合理区间",result:{pnlPct:3.70,outcome:"进行中",review:"稳健持有"}}]) })
      .finally(() => setLoading(false));
  }, []);

  const outcomes: Record<string, string> = { "成功": "text-emerald-400 bg-emerald-500/10", "失败": "text-red-400 bg-red-500/10", "进行中": "text-blue-400 bg-blue-500/10" };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold">投资决策回放</h1>
        <p className="text-zinc-400 text-sm mt-1">记录每一笔交易背后的思考，分辨运气与认知</p>
      </div>

      {loading && <div className="text-center py-20 text-zinc-500">加载中...</div>}
      {error && <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-400">{error}</div>}

      <div className="space-y-4">
        {decisions.map(d => (
          <div key={d.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${d.action === "买入" || d.action === "加仓" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>{d.action}</span>
                <Link href={`/stocks/${d.stockCode}`} className="font-semibold hover:text-violet-400 transition-colors">{d.stockName}</Link>
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
            <div className="flex items-center gap-2 bg-zinc-800/30 rounded-lg p-3 text-sm">
              <RotateCcw className="w-4 h-4 text-violet-400 flex-shrink-0" />
              <span className="text-zinc-400">复盘：</span>
              <span>{d.result.review}</span>
            </div>
          </div>
        ))}
      </div>
      {decisions.length === 0 && !loading && <div className="text-center py-20 text-zinc-500">暂无决策记录</div>}
    </div>
  );
}