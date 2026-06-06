"use client";
import { useState, useEffect } from "react";
import { Activity, CheckCircle2, XCircle, Clock } from "lucide-react";

interface SourceStatus { source: string; lastCheck: string; reachable: boolean }
interface HealthData { status: string; timestamp: string; sources: SourceStatus[] }

export default function HealthPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const check = async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/v1/health");
      if (!r.ok) throw new Error("Health check failed");
      setHealth(await r.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { check(); }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-violet-400" /> 数据源状态</h1>
          <p className="text-zinc-400 text-sm mt-1">实时监控所有外部数据源连接状态</p>
        </div>
        <button onClick={check} disabled={loading} className="bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          {loading ? "检测中..." : "重新检测"}
        </button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">{error}</div>}

      {health && (
        <div className={`rounded-xl p-5 border ${health.status === "healthy" ? "bg-emerald-500/5 border-emerald-500/30" : "bg-amber-500/5 border-amber-500/30"}`}>
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${health.status === "healthy" ? "bg-emerald-400" : "bg-amber-400"}`} />
            <span className="font-semibold">
              系统状态: {health.status === "healthy" ? "正常" : "部分降级"}
            </span>
          </div>
          <div className="space-y-2">
            {health.sources.map((s, i) => (
              <div key={i} className="flex items-center justify-between bg-zinc-900 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  {s.reachable ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                  <span className="text-sm">{s.source}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(s.lastCheck).toLocaleTimeString("zh-CN")}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-600 mt-4">最后更新: {new Date(health.timestamp).toLocaleString("zh-CN")}</p>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="font-semibold mb-3">数据源清单</h2>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-zinc-800 text-zinc-500">
            <th className="text-left py-2">数据源</th><th className="text-left py-2">用途</th><th className="text-left py-2">状态</th>
          </tr></thead>
          <tbody>
            <tr className="border-b border-zinc-800/50"><td className="py-2">东方财富 push2</td><td className="py-2 text-zinc-400">实时行情、指数、板块</td><td className="py-2 text-emerald-400">已接入</td></tr>
            <tr className="border-b border-zinc-800/50"><td className="py-2">东方财富 searchadapter</td><td className="py-2 text-zinc-400">股票搜索</td><td className="py-2 text-emerald-400">已接入</td></tr>
            <tr className="border-b border-zinc-800/50"><td className="py-2">东方财富 datacenter</td><td className="py-2 text-zinc-400">财务数据</td><td className="py-2 text-amber-400">待验证</td></tr>
            <tr className="border-b border-zinc-800/50"><td className="py-2">Theses / Portfolio / Notes</td><td className="py-2 text-zinc-400">用户投资数据</td><td className="py-2 text-red-400">需配置数据库</td></tr>
            <tr className="border-b border-zinc-800/50"><td className="py-2">OpenAI API</td><td className="py-2 text-zinc-400">AI 摘要和对话</td><td className="py-2 text-red-400">需配置 KEY</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}