"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, Download, SlidersHorizontal, TrendingUp, Target, BarChart3, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { DEFAULT_CONFIG } from "@/lib/scoring-engine";

interface ScoredStock {
  code: string; name: string; board: string; price: number; changePct: number;
  pe: number; pb: number; roe: number; marketCap: number; revenueGrowth: number;
  growthScore: number; valueScore: number; qualityScore: number; momentumScore: number;
  score: number; explanation: string;
}

interface ScreenerResponse {
  data: ScoredStock[]; total: number; page: number; pageSize: number; totalPages: number;
  filters: string[]; weights: Record<string, number>; timestamp: string; source: string;
  cached?: boolean; error?: string;
}

export default function ScreenerPage() {
  const [results, setResults] = useState<ScoredStock[]>([]);
  const [meta, setMeta] = useState<{ total: number; page: number; totalPages: number; filters: string[]; weights: Record<string, number>; source: string; cached?: boolean; error?: string; timestamp: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter state
  const [peMax, setPeMax] = useState(DEFAULT_CONFIG.peMax);
  const [peMin, setPeMin] = useState(0);
  const [pbMax, setPbMax] = useState(DEFAULT_CONFIG.pbMax);
  const [marketCapMin, setMarketCapMin] = useState(DEFAULT_CONFIG.marketCapMin);
  const [roeMin, setRoeMin] = useState(DEFAULT_CONFIG.roeMin);
  const [revenueGrowthMin, setRevenueGrowthMin] = useState(0);
  const [grossMarginMin, setGrossMarginMin] = useState(0);
  const [board, setBoard] = useState("");
  const [page, setPage] = useState(1);

  // Weight state
  const [wGrowth, setWGrowth] = useState(DEFAULT_CONFIG.weightGrowth);
  const [wValue, setWValue] = useState(DEFAULT_CONFIG.weightValue);
  const [wQuality, setWQuality] = useState(DEFAULT_CONFIG.weightQuality);
  const [wMomentum, setWMomentum] = useState(DEFAULT_CONFIG.weightMomentum);

  // Advanced panel
  const [showAdvanced, setShowAdvanced] = useState(false);

  const doSearch = useCallback(async (pg = 1) => {
    setLoading(true);
    setPage(pg);
    const params = new URLSearchParams({
      peMax: String(peMax), peMin: String(peMin), pbMax: String(pbMax),
      marketCapMin: String(marketCapMin), roeMin: String(roeMin),
      revenueGrowthMin: String(revenueGrowthMin), grossMarginMin: String(grossMarginMin),
      board, page: String(pg), pageSize: "15",
      wGrowth: String(wGrowth), wValue: String(wValue), wQuality: String(wQuality), wMomentum: String(wMomentum),
    });
    try {
      const r = await fetch("/api/v1/screener/results?" + params);
      const json: ScreenerResponse = await r.json();
      setResults(json.data);
      setMeta({ total: json.total, page: json.page, totalPages: json.totalPages, filters: json.filters, weights: json.weights, source: json.source, cached: json.cached, error: json.error, timestamp: json.timestamp });
    } catch {
      setResults([]);
      setMeta({ total: 0, page: 1, totalPages: 0, filters: [], weights: {}, source: "连接失败", timestamp: "", error: "请求失败" });
    } finally {
      setLoading(false);
    }
  }, [peMax, peMin, pbMax, marketCapMin, roeMin, revenueGrowthMin, grossMarginMin, board, wGrowth, wValue, wQuality, wMomentum]);

  useEffect(() => { doSearch(1); }, []);

  const exportCSV = () => {
    const header = "代码,名称,板块,价格,涨跌幅%,PE,PB,ROE%,市值(亿),营收增长%,成长分,估值分,质量分,动量分,总分,解释";
    const rows = results.map(r =>
      [r.code, r.name, r.board, r.price, r.changePct, r.pe, r.pb, r.roe, r.marketCap, r.revenueGrowth,
       r.growthScore, r.valueScore, r.qualityScore, r.momentumScore, r.score, `"${r.explanation}"`].join(",")
    );
    const blob = new Blob(["\uFEFF" + header + "\n" + rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "alphamind_screener.csv"; a.click();
  };

  const scoreColor = (s: number) => s >= 80 ? "bg-emerald-500" : s >= 60 ? "bg-amber-500" : "bg-red-500";
  const scoreBg = (s: number) => s >= 80 ? "text-emerald-400" : s >= 60 ? "text-amber-400" : "text-red-400";

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Zap className="w-5 h-5 text-amber-400" /> AI 智能选股器</h1>
          <p className="text-zinc-400 text-sm mt-1">多因子评分 · 实时筛选 · 200只A股候选池</p>
        </div>
        {results.length > 0 && (
          <button onClick={exportCSV} className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-2 rounded-lg text-sm transition-colors">
            <Download className="w-4 h-4" /> 导出 CSV
          </button>
        )}
      </div>

      {/* Meta bar */}
      {meta && (
        <div className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap">
          <span>数据源: {meta.source}</span>
          {meta.cached && <span className="text-amber-400">缓存</span>}
          <span>更新: {new Date(meta.timestamp).toLocaleTimeString("zh-CN")}</span>
          {meta.filters.length > 0 && <span>条件: {meta.filters.join(" · ")}</span>}
          {meta.total > 0 && <span>符合: {meta.total} 只</span>}
        </div>
      )}
      {meta?.error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">{meta.error}</div>}

      {/* Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2"><label className="text-xs text-zinc-500">PE</label>
            <input type="number" value={peMin||""} onChange={e => setPeMin(Number(e.target.value))} placeholder="0" className="w-16 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-200" />
            <span className="text-zinc-600">-</span>
            <input type="number" value={peMax} onChange={e => setPeMax(Number(e.target.value))} className="w-16 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-200" />
          </div>
          <div className="flex items-center gap-2"><label className="text-xs text-zinc-500">PB≤</label>
            <input type="number" value={pbMax} onChange={e => setPbMax(Number(e.target.value))} className="w-16 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-200" />
          </div>
          <div className="flex items-center gap-2"><label className="text-xs text-zinc-500">市值≥</label>
            <input type="number" value={marketCapMin} onChange={e => setMarketCapMin(Number(e.target.value))} className="w-20 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-200" /><span className="text-xs text-zinc-600">亿</span>
          </div>
          <div className="flex items-center gap-2"><label className="text-xs text-zinc-500">ROE≥</label>
            <input type="number" value={roeMin} onChange={e => setRoeMin(Number(e.target.value))} className="w-16 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-200" /><span className="text-xs text-zinc-600">%</span>
          </div>
          <div className="flex items-center gap-2"><label className="text-xs text-zinc-500">板块</label>
            <select value={board} onChange={e => setBoard(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-200">
              <option value="">全部</option><option value="创业板">创业板</option><option value="科创板">科创板</option>
              <option value="沪市主板">沪市主板</option><option value="深市主板">深市主板</option>
            </select>
          </div>
          <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200">
            <SlidersHorizontal className="w-3.5 h-3.5" /> {showAdvanced ? "收起" : "高级"}
          </button>
          <button onClick={() => doSearch(1)} disabled={loading}
            className="bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors">
            <Search className="w-3.5 h-3.5 inline mr-1" /> {loading ? "筛选..." : "筛选"}
          </button>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-4 gap-4 pt-3 border-t border-zinc-800">
            <div>
              <label className="text-xs text-zinc-500 block mb-1">营收增长≥ (%)</label>
              <input type="number" value={revenueGrowthMin} onChange={e => setRevenueGrowthMin(Number(e.target.value))} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-200" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1">毛利率≥ (%)</label>
              <input type="number" value={grossMarginMin} onChange={e => setGrossMarginMin(Number(e.target.value))} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-200" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-zinc-500 block mb-1">评分权重 (合计应为1.0)</label>
              <div className="flex gap-2">
                {[
                  { label: "成长", val: wGrowth, set: setWGrowth },
                  { label: "估值", val: wValue, set: setWValue },
                  { label: "质量", val: wQuality, set: setWQuality },
                  { label: "动量", val: wMomentum, set: setWMomentum },
                ].map(w => (
                  <div key={w.label} className="flex items-center gap-1">
                    <span className="text-xs text-zinc-500">{w.label}</span>
                    <input type="number" step="0.05" min="0" max="1" value={w.val} onChange={e => w.set(Number(e.target.value))}
                      className="w-14 bg-zinc-800 border border-zinc-700 rounded px-1 py-1 text-xs text-zinc-200" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-20 text-zinc-500">
          <BarChart3 className="w-8 h-8 mx-auto mb-3 animate-pulse" />正在从东方财富获取200只股票并评分...
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">没有符合条件的股票，请放宽筛选条件</div>
      ) : (
        <>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-zinc-800 text-zinc-500">
                <th className="text-left px-3 py-2">代码</th><th className="text-left px-3 py-2">名称</th><th className="text-left px-3 py-2">板块</th>
                <th className="text-right px-3 py-2">价格</th><th className="text-right px-3 py-2">PE</th><th className="text-right px-3 py-2">PB</th>
                <th className="text-right px-3 py-2">ROE%</th><th className="text-right px-3 py-2">市值(亿)</th><th className="text-right px-3 py-2">增长%</th>
                <th className="text-center px-2 py-2">成长</th><th className="text-center px-2 py-2">估值</th><th className="text-center px-2 py-2">质量</th><th className="text-center px-2 py-2">动量</th>
                <th className="text-center px-3 py-2 font-bold text-violet-400">总分</th>
              </tr></thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={r.code} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 group">
                    <td className="px-3 py-2 text-zinc-400 font-mono text-xs">{r.code}</td>
                    <td className="px-3 py-2"><Link href={`/stocks/${r.code}`} className="text-zinc-200 hover:text-violet-400 font-medium">{r.name}</Link></td>
                    <td className="px-3 py-2"><span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">{r.board}</span></td>
                    <td className="px-3 py-2 text-right font-mono text-xs">{r.price.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right text-xs">{r.pe.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right text-xs">{r.pb.toFixed(1)}</td>
                    <td className={"px-3 py-2 text-right text-xs " + (r.roe >= 15 ? "text-emerald-400" : "text-zinc-400")}>{r.roe.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right text-xs">{r.marketCap.toLocaleString()}</td>
                    <td className={"px-3 py-2 text-right text-xs " + (r.revenueGrowth >= 20 ? "text-red-400" : "text-zinc-400")}>{r.revenueGrowth?.toFixed(1) || "-"}%</td>
                    {[r.growthScore, r.valueScore, r.qualityScore, r.momentumScore].map((s, j) => (
                      <td key={j} className="px-2 py-2 text-center">
                        <span className="inline-block w-10 text-xs">{s}</span>
                        <div className="w-full h-1 bg-zinc-800 rounded mt-0.5"><div className={`h-full rounded ${scoreColor(s)}`} style={{ width: s + "%" }} /></div>
                      </td>
                    ))}
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-flex items-center justify-center w-10 h-6 rounded text-xs font-bold text-white ${scoreColor(r.score)}`}>{r.score}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 text-sm">
              <button onClick={() => doSearch(page - 1)} disabled={page <= 1} className="p-2 rounded hover:bg-zinc-800 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-zinc-400">第 {meta.page} / {meta.totalPages} 页 (共 {meta.total} 只)</span>
              <button onClick={() => doSearch(page + 1)} disabled={page >= meta.totalPages} className="p-2 rounded hover:bg-zinc-800 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
          )}

          {/* Top explanations */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><Target className="w-4 h-4 text-violet-400" /> Top 5 评级解释</h3>
            <div className="space-y-1.5">
              {results.slice(0, 5).map((r, i) => (
                <div key={r.code} className="flex items-start gap-3 text-sm">
                  <span className={`font-bold w-5 ${scoreBg(r.score)}`}>#{i + 1}</span>
                  <span className="text-zinc-300">{r.name}({r.code}): {r.explanation}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}