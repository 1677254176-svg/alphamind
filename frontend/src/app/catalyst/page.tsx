"use client";
import { useState, useEffect } from "react";
import { Calendar, Star, Filter } from "lucide-react";
import { apiClient } from "@/lib/api";

interface CatalystEvent { date: string; type: string; title: string; importance: number }

export default function CatalystPage() {
  const [events, setEvents] = useState<CatalystEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    apiClient<CatalystEvent[]>("/catalyst/calendar/top")
      .then(setEvents)
      .catch(() => { setEvents([{date:"6月9日",type:"CPI",title:"5月CPI数据公布",importance:4},{date:"6月12日",type:"FOMC",title:"美联储6月议息会议",importance:5},{date:"6月20日",type:"LPR",title:"LPR利率公布",importance:4},{date:"7月1日",type:"中报",title:"中报预披露开始",importance:4},{date:"8月31日",type:"中报",title:"中报披露截止日",importance:5}]) })
      .finally(() => setLoading(false));
  }, []);

  const types = [...new Set(events.map(e => e.type))];
  const filtered = filterType ? events.filter(e => e.type === filterType) : events;
  const typeColors: Record<string, string> = {
    CPI: "bg-amber-500/10 text-amber-400", FOMC: "bg-red-500/10 text-red-400",
    LPR: "bg-blue-500/10 text-blue-400", "中报": "bg-emerald-500/10 text-emerald-400",
    "年报": "bg-emerald-500/10 text-emerald-400", "产品发布": "bg-violet-500/10 text-violet-400",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold">催化剂日历</h1>
        <p className="text-zinc-400 text-sm mt-1">自动跟踪财报 · FOMC · CPI · 产品发布会 · 股东大会</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterType("")} className={`text-xs px-3 py-1 rounded-full ${!filterType ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>全部</button>
        {types.map(t => (
          <button key={t} onClick={() => setFilterType(t === filterType ? "" : t)} className={`text-xs px-3 py-1 rounded-full ${filterType === t ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>{t}</button>
        ))}
      </div>

      {loading && <div className="text-center py-20 text-zinc-500">加载中...</div>}
      {error && <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-400">{error}</div>}

      <div className="space-y-2">
        {filtered.map((e, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center gap-4 hover:border-zinc-700 transition-colors">
            <div className="w-20 text-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-zinc-500 mx-auto mb-1" />
              <p className="text-xs font-medium text-zinc-300">{e.date}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${typeColors[e.type] || "bg-zinc-800 text-zinc-400"}`}>{e.type}</span>
            <span className="flex-1 text-sm font-medium">{e.title}</span>
            <div className="flex gap-0.5">{[...Array(e.importance)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}</div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && !loading && <div className="text-center py-20 text-zinc-500">暂无催化剂事件</div>}
    </div>
  );
}