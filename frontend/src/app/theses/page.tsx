"use client";

import { useState, useEffect } from "react";
import { Plus, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function ThesesPage() {
  const [theses, setTheses] = useState<any[]>([]);
  useEffect(() => {
    setTheses([
      { id: "1", title: "\u5b81\u5fb7\u65f6\u4ee3\uff1a\u5168\u7403\u52a8\u529b\u7535\u6c60\u9f99\u5934", thesis_type: "long", status: "active", confidence_level: 8, condition_summary: { valid: 3, warning: 1, violated: 0 }, updated_at: "2026-06-06" },
      { id: "2", title: "\u5929\u9f50\u9502\u4e1a\uff1a\u9502\u4ef7\u89e6\u5e95\u53cd\u5f39", thesis_type: "long", status: "invalidated", confidence_level: 5, condition_summary: { valid: 0, warning: 1, violated: 2 }, updated_at: "2026-05-20" },
    ]);
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">\u6295\u8d44\u903b\u8f91</h1>
          <p className="text-zinc-400 text-sm mt-1">\u7cfb\u7edf\u6bcf\u5929\u81ea\u52a8\u76d1\u63a7\u903b\u8f91\u662f\u5426\u6210\u7acb</p>
        </div>
        <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> \u65b0\u5efa Thesis
        </button>
      </div>
      {theses.map((t) => (
        <Link key={t.id} href={`/theses/${t.id}`} className="block bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded ${t.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                  {t.status === "active" ? "\u76d1\u63a7\u4e2d" : "\u5df2\u5931\u6548"}
                </span>
                <span className="text-xs text-zinc-500">\u4fe1\u5fc3 {t.confidence_level}/10</span>
              </div>
              <h2 className="font-semibold text-lg">{t.title}</h2>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1 text-zinc-400"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {t.condition_summary.valid} \u6b63\u5e38</span>
                {t.condition_summary.warning > 0 && <span className="flex items-center gap-1 text-amber-400"><AlertTriangle className="w-3.5 h-3.5" /> {t.condition_summary.warning} \u9884\u8b66</span>}
                {t.condition_summary.violated > 0 && <span className="text-red-400">{t.condition_summary.violated} \u8fdd\u53cd</span>}
              </div>
            </div>
            <span className="text-xs text-zinc-600">{t.updated_at}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
