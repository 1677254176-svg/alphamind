"use client";
import { useState, useEffect } from "react";
import { StickyNote, Tag, Link2, Plus } from "lucide-react";
import { apiClient } from "@/lib/api";

interface Note { id: string; title: string; tags: string[]; preview: string; updated_at: string; linkedStocks: string[] }

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient<Note[]>("/notes")
      .then(setNotes)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const allTags = [...new Set(notes.flatMap(n => n.tags))];

  if (loading) return <div className="max-w-4xl mx-auto py-20 text-center text-zinc-500">加载中...</div>;
  if (notes.length === 0) return (
    <div className="max-w-4xl mx-auto py-20 text-center">
      <StickyNote className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
      <p className="text-zinc-400 text-lg">暂无研究笔记</p>
      <p className="text-zinc-600 text-sm mt-1">创建你的第一篇投资研究笔记</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">研究笔记</h1><p className="text-zinc-400 text-sm mt-1">Obsidian风格 · Markdown · 双向链接</p></div>
        <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"><Plus className="w-4 h-4" /> 新建笔记</button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {allTags.map(t => <span key={t} className="text-xs px-3 py-1 rounded-full bg-zinc-800 text-zinc-400">{t}</span>)}
      </div>
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
    </div>
  );
}