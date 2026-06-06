"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Shield, Target, Calendar } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api";

interface ThesisDetail {
  id: string; title: string; thesis_type: string; status: string;
  confidence_level: number; core_reason: string; detailed_analysis: string;
  target_price: number; entry_price: number; time_horizon: string;
  stockCode: string; stockName: string;
  conditions: { condition: string; current_status: string; last_check: string }[];
  risks: { risk_description: string; probability: string; impact: string; mitigation: string }[];
  alerts: { message: string; severity: string; created_at: string }[];
  created_at: string; updated_at: string;
}

export default function ThesisDetailPage() {
  const { id } = useParams();
  const [thesis, setThesis] = useState<ThesisDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient<ThesisDetail>(`/theses/${id}`)
      .then(setThesis)
      .catch(() => { setThesis({id:id as string,title:"Thesis #"+id,thesis_type:"long",status:"active",confidence_level:5,core_reason:"请连接后端获取完整数据",detailed_analysis:"请启动后端服务查看详细分析",target_price:0,entry_price:0,time_horizon:"--",stockCode:"--",stockName:"--",conditions:[],risks:[],alerts:[],created_at:"--",updated_at:"--"}) })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-4xl mx-auto py-20 text-center text-zinc-500">加载中...</div>;
  if (error) return <div className="max-w-4xl mx-auto py-20 text-center text-amber-400">{error}</div>;
  if (!thesis) return <div className="max-w-4xl mx-auto py-20 text-center text-zinc-500">未找到</div>;

  const statusColors: Record<string, string> = { valid: "text-emerald-400", warning: "text-amber-400", violated: "text-red-400" };
  const statusIcons: Record<string, any> = { valid: CheckCircle2, warning: AlertTriangle, violated: XCircle };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/theses" className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-200 transition-colors">
        <ArrowLeft className="w-4 h-4" /> 返回列表
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded ${thesis.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
              {thesis.status === "active" ? "监控中" : "已失效"}
            </span>
            <span className="text-xs text-zinc-500">信心 {thesis.confidence_level}/10</span>
          </div>
          <h1 className="text-2xl font-bold">{thesis.title}</h1>
          <p className="text-zinc-400 text-sm mt-1">{thesis.stockName} · {thesis.stockCode} · 周期: {thesis.time_horizon}</p>
        </div>
        <div className="text-right text-sm">
          <p className="text-zinc-500">目标价: <span className="text-emerald-400 font-bold">¥{thesis.target_price.toFixed(2)}</span></p>
          <p className="text-zinc-500">入场价: ¥{thesis.entry_price.toFixed(2)}</p>
        </div>
      </div>

      {/* Core Reason */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3"><Target className="w-4 h-4 text-violet-400" /><h2 className="font-semibold">投资逻辑</h2></div>
        <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{thesis.detailed_analysis}</p>
      </div>

      {/* Conditions */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><h2 className="font-semibold">验证条件 ({thesis.conditions.length})</h2></div>
        <div className="space-y-2">
          {thesis.conditions.map((c, i) => {
            const Icon = statusIcons[c.current_status] || CheckCircle2;
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
                <Icon className={`w-4 h-4 ${statusColors[c.current_status] || "text-zinc-400"}`} />
                <span className="text-sm flex-1">{c.condition}</span>
                <span className="text-xs text-zinc-500">{c.last_check}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Risks */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3"><Shield className="w-4 h-4 text-amber-400" /><h2 className="font-semibold">风险因素 ({thesis.risks.length})</h2></div>
        <div className="space-y-2">
          {thesis.risks.map((r, i) => (
            <div key={i} className="p-3 rounded-lg bg-zinc-800/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{r.risk_description}</span>
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-zinc-700 text-zinc-400">概率: {r.probability}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-zinc-700 text-zinc-400">影响: {r.impact}</span>
                </div>
              </div>
              <p className="text-xs text-zinc-500">应对: {r.mitigation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {thesis.alerts.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4 text-amber-400" /><h2 className="font-semibold text-amber-400">预警记录</h2></div>
          {thesis.alerts.map((a, i) => (
            <div key={i} className="flex items-center justify-between py-1 text-sm"><span>{a.message}</span><span className="text-xs text-zinc-500">{a.created_at}</span></div>
          ))}
        </div>
      )}

      <div className="flex gap-2 text-xs text-zinc-600">
        <span>创建: {thesis.created_at}</span><span>更新: {thesis.updated_at}</span>
      </div>
    </div>
  );
}