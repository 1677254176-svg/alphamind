"use client";
import { useState, useEffect } from "react";
import { Plus, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api";

interface ThesisItem {
  id: string; title: string; thesis_type: string; status: string;
  confidence_level: number; stockCode: string; stockName: string;
  condition_summary: { valid: number; warning: number; violated: number };
  core_reason: string; updated_at: string;
}

export default function ThesesPage() {
  const [theses, setTheses] = useState<ThesisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    apiClient<ThesisItem[]>("/theses")
      .then(setTheses)
      .catch(() => { setError("后端未连接，显示默认数据"); setTheses([{id:"1",title:"宁德时代：全球动力电池龙头",thesis_type:"long",status:"active",confidence_level:8,condition_summary:{valid:3,warning:1,violated:0},updated_at:"2026-06-06",stockCode:"300750",stockName:"宁德时代",core_reason:"全球电动化趋势持续，宁德时代技术+规模双轮驱动"},{id:"2",title:"天齐锂业：锂价触底反弹",thesis_type:"long",status:"invalidated",confidence_level:5,condition_summary:{valid:0,warning:1,violated:2},updated_at:"2026-05-20",stockCode:"002466",stockName:"天齐锂业",core_reason:"碳酸锂价格跌破成本线后反弹"},{id:"3",title:"中际旭创：AI光模块龙头",thesis_type:"long",status:"active",confidence_level:9,condition_summary:{valid:4,warning:0,violated:0},updated_at:"2026-06-05",stockCode:"300308",stockName:"中际旭创",core_reason:"AI算力需求爆发，800G光模块出货量全球第一"}]) })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">投资逻辑</h1>
          <p className="text-zinc-400 text-sm mt-1">系统每天自动监控逻辑是否成立</p>
        </div>
        <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> 新建 Thesis
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-zinc-500">加载中...</div>
      ) : error ? (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-400">{error}</div>
      ) : null}

      {theses.map(t => (
        <Link key={t.id} href={`/theses/${t.id}`}
          className="block bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded ${t.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                  {t.status === "active" ? "监控中" : "已失效"}
                </span>
                <span className="text-xs text-zinc-500">信心 {t.confidence_level}/10</span>
                <span className="text-xs text-zinc-600">{t.stockName} · {t.stockCode}</span>
              </div>
              <h2 className="font-semibold text-lg">{t.title}</h2>
              <p className="text-sm text-zinc-500 mt-1 line-clamp-1">{t.core_reason}</p>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1 text-zinc-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {t.condition_summary.valid} 正常
                </span>
                {t.condition_summary.warning > 0 && (
                  <span className="flex items-center gap-1 text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5" /> {t.condition_summary.warning} 预警
                  </span>
                )}
                {t.condition_summary.violated > 0 && (
                  <span className="text-red-400">{t.condition_summary.violated} 违反</span>
                )}
              </div>
            </div>
            <span className="text-xs text-zinc-600">{t.updated_at}</span>
          </div>
        </Link>
      ))}
      {theses.length === 0 && !loading && (
        <div className="text-center py-20 text-zinc-500">暂无 Thesis，点击上方按钮创建第一个</div>
      )}
    </div>
  );
}