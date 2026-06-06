"use client";
import { useState, useEffect } from "react";
import { StickyNote, Tag, Link2, Plus } from "lucide-react";
import { apiClient } from "@/lib/api";

interface Note { id: string; title: string; tags: string[]; preview: string; updated_at: string; linkedStocks: string[] }

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    apiClient<Note[]>(`/notes${tagFilter ? "?tag=" + tagFilter : ""}`)
      .then(setNotes)
      .catch(() => { setNotes([{id:"1",title:"AI算力产业链梳理",tags:["AI","算力","半导体"],preview:"从GPU到光模块，AI算力产业链的核心环节分析...",updated_at:"2026-06-06",linkedStocks:["300308","688256"]},{id:"2",title:"固态电池技术路线对比",tags:["新能源","固态电池"],preview:"硫化物vs氧化物vs聚合物，三种技术路线的优劣势分析...",updated_at:"2026-06-05",linkedStocks:["300750"]},{id:"3",title:"美联储加息周期回顾",tags:["宏观","美联储"],preview:"复盘2015-2026年加息周期对A股的影响...",updated_at:"2026-06-04",linkedStocks:[]},{id:"4",title:"低空经济政策汇总",tags:["低空经济","政策"],preview:"中央到地方的低空经济政策梳理与投资机会...",updated_at:"2026-06-03",linkedStocks:["688070"]}]) })
      .finally(() => setLoading(false));
  }, [tagFilter]);

  const allTags = [...new Set(notes.flatMap(n => n.tags))];

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">研究笔记</h1>
          <p className="text-zinc-400 text-sm mt-1">Obsidian风格 · Markdown · 双向链接 · AI整理</p>
        </div>
        <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> 新建笔记
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setTagFilter("")} className={`text-xs px-3 py-1 rounded-full transition-colors ${!tagFilter ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>全部</button>
        {allTags.map(t => (
          <button key={t} onClick={() => setTagFilter(t === tagFilter ? "" : t)} className={`text-xs px-3 py-1 rounded-full transition-colors ${tagFilter === t ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{t}</button>
        ))}
      </div>

      {loading && <div className="text-center py-20 text-zinc-500">加载中...</div>}
      {error && <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-400">{error}</div>}
      <div className="grid grid-cols-2 gap-4">
        {notes.map(n => (
          <div key={n.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2"><StickyNote className="w-4 h-4 text-violet-400" /><h2 className="font-semibold">{n.title}</h2></div>
              <span className="text-xs text-zinc-600">{n.updated_at}</span>
            </div>
            <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{n.preview}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {n.tags.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded bg-violet-500/10 text-violet-400">{t}</span>)}
              {n.linkedStocks.map(s => <span key={s} className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 flex items-center gap-1"><Link2 className="w-3 h-3" />{s}</span>)}
            </div>
          </div>
        ))}
      </div>
      {notes.length === 0 && !loading && <div className="text-center py-20 text-zinc-500">暂无笔记</div>}
    </div>
  );
}