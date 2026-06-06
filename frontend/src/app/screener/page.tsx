"use client";
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, TrendingUp, Target, DollarSign } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api";

interface ScreenerResult {
  code: string; name: string; board: string; price: number; pe: number; pb: number;
  roe: number; marketCap: number; revenueGrowth: number; score: number;
}

export default function ScreenerPage() {
  const [results, setResults] = useState<ScreenerResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [peMax, setPeMax] = useState(100);
  const [marketCapMin, setMarketCapMin] = useState(100);
  const [roeMin, setRoeMin] = useState(5);
  const [board, setBoard] = useState("");

  const doSearch = () => {
    setLoading(true);
    const params = new URLSearchParams({ peMax: String(peMax), marketCapMin: String(marketCapMin), roeMin: String(roeMin) });
    if (board) params.set("board", board);
    apiClient<ScreenerResult[]>(`/screener/results?${params}`)
      .then(setResults)
      .catch(() => { setError("后端未连接，显示默认数据"); setResults([{code:"300750",name:"宁德时代",board:"创业板",price:196.50,pe:25.6,pb:4.2,roe:24.0,marketCap:8640,revenueGrowth:17.3,score:92},{code:"300308",name:"中际旭创",board:"创业板",price:89.20,pe:35.1,pb:6.8,roe:22.5,marketCap:720,revenueGrowth:45.2,score:88},{code:"600519",name:"贵州茅台",board:"沪市主板",price:1680.00,pe:28.9,pb:8.5,roe:30.2,marketCap:21100,revenueGrowth:15.1,score:85}]) })
      .finally(() => setLoading(false));
  };

  useEffect(() => { doSearch(); }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold">AI 选股器</h1>
        <p className="text-zinc-400 text-sm mt-1">多维度条件筛选 · 综合评分 · 智能排序</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-500">PE上限</label>
            <input type="number" value={peMax} onChange={e => setPeMax(Number(e.target.value))} className="w-20 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-200" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-500">市值下限(亿)</label>
            <input type="number" value={marketCapMin} onChange={e => setMarketCapMin(Number(e.target.value))} className="w-24 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-200" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-500">ROE下限(%)</label>
            <input type="number" value={roeMin} onChange={e => setRoeMin(Number(e.target.value))} className="w-20 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-200" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-500">板块</label>
            <select value={board} onChange={e => setBoard(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-200">
              <option value="">全部</option>
              <option value="创业板">创业板</option>
              <option value="科创板">科创板</option>
              <option value="沪市主板">沪市主板</option>
              <option value="深市主板">深市主板</option>
            </select>
          </div>
          <button onClick={doSearch} className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors">
            <Search className="w-3.5 h-3.5 inline mr-1" /> 筛选
          </button>
        </div>
      </div>

      {error && <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-400">{error}</div>}
      {loading ? <div className="text-center py-20 text-zinc-500">筛选中...</div> : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-zinc-800 text-zinc-500">
              <th className="text-left px-4 py-3">代码</th><th className="text-left px-4 py-3">名称</th><th className="text-left px-4 py-3">板块</th>
              <th className="text-right px-4 py-3">价格</th><th className="text-right px-4 py-3">PE</th><th className="text-right px-4 py-3">PB</th>
              <th className="text-right px-4 py-3">ROE%</th><th className="text-right px-4 py-3">市值(亿)</th>
              <th className="text-right px-4 py-3">营收增长</th><th className="text-center px-4 py-3">评分</th>
            </tr></thead>
            <tbody>
              {results.map(r => (
                <tr key={r.code} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{r.code}</td>
                  <td className="px-4 py-3"><Link href={`/stocks/${r.code}`} className="text-zinc-200 hover:text-violet-400">{r.name}</Link></td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">{r.board}</span></td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{r.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-xs">{r.pe.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right text-xs">{r.pb.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right text-xs">{r.roe.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right text-xs">{r.marketCap.toLocaleString()}</td>
                  <td className={`px-4 py-3 text-right text-xs ${r.revenueGrowth >= 20 ? "text-red-400" : "text-zinc-400"}`}>{r.revenueGrowth.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-center"><span className="inline-flex items-center justify-center w-10 h-6 rounded text-xs font-bold text-white" style={{background: r.score >= 85 ? "#4ade80" : r.score >= 70 ? "#fbbf24" : "#f87171"}}>{r.score}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}