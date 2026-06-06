"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { GitBranch, TrendingUp, AlertTriangle, Sparkles } from "lucide-react";
import { apiClient } from "@/lib/api";

interface IndustryItem {
  id: string; name: string; emoji: string; hotLevel: number; description: string;
}

export default function IndustriesPage() {
  const [industries, setIndustries] = useState<IndustryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<IndustryItem | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    apiClient<IndustryItem[]>("/industries")
      .then(setIndustries)
      .catch(() => { setIndustries([{id:"ai",name:"AI人工智能",emoji:"🤖",hotLevel:98,description:"大模型+算力+应用"},{id:"robot",name:"机器人",emoji:"🦾",hotLevel:90,description:"人形机器人+工业自动化"},{id:"semiconductor",name:"半导体",emoji:"💾",hotLevel:85,description:"芯片设计+制造+封测"},{id:"new_energy",name:"新能源",emoji:"⚡",hotLevel:78,description:"光伏+风电+储能+锂电"},{id:"low_altitude",name:"低空经济",emoji:"🚁",hotLevel:92,description:"eVTOL+无人机+空管"}]) })
      .finally(() => setLoading(false));
  }, []);

  const selectIndustry = (ind: IndustryItem) => {
    setSelected(ind);
    setDetailLoading(true);
    apiClient(`/industries/${ind.id}`)
      .then(setDetail)
      .catch(() => { setLoading(false); })
      .finally(() => setDetailLoading(false));
  };

  if (loading) return <div className="max-w-6xl mx-auto py-20 text-center text-zinc-500">加载中...</div>;
  if (error) return <div className="max-w-6xl mx-auto py-20 text-center text-amber-400">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold">AI 产业链中心</h1>
        <p className="text-zinc-400 text-sm mt-1">上游·中游·下游全景图谱，洞悉产业格局</p>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {industries.map(ind => (
          <button key={ind.id} onClick={() => selectIndustry(ind)}
            className={`bg-zinc-900 border rounded-xl p-4 text-left transition-colors hover:border-zinc-600 ${selected?.id === ind.id ? "border-violet-500 bg-violet-500/5" : "border-zinc-800"}`}>
            <div className="text-3xl mb-2">{ind.emoji}</div>
            <p className="font-semibold text-sm">{ind.name}</p>
            <p className="text-xs text-zinc-500 mt-1">{ind.description}</p>
            <div className="mt-2 flex items-center gap-1 text-xs">
              <TrendingUp className="w-3 h-3 text-red-400" />
              <span className="text-red-400">热度 {ind.hotLevel}</span>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          {detailLoading ? (
            <div className="text-center py-10 text-zinc-500">加载产业链详情...</div>
          ) : detail ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">{detail.emoji} {detail.name}</h2>
                <p className="text-zinc-400 text-sm mt-1">{detail.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {["upstream", "midstream", "downstream"].map(level => {
                  const data = detail.chain?.[level];
                  if (!data) return null;
                  const bgColor = level === "upstream" ? "border-blue-500/30" : level === "midstream" ? "border-violet-500/30" : "border-emerald-500/30";
                  return (
                    <div key={level} className={`bg-zinc-800/50 border ${bgColor} rounded-lg p-4`}>
                      <h3 className="text-sm font-semibold mb-3">{data.label}</h3>
                      <div className="space-y-2">
                        {data.stocks?.map((s: any) => (
                          <Link key={s.code} href={`/stocks/${s.code}`} className="block p-2 rounded bg-zinc-900 hover:bg-zinc-800 transition-colors">
                            <p className="text-sm font-medium text-zinc-200">{s.name}</p>
                            <div className="flex justify-between text-xs text-zinc-500 mt-0.5">
                              <span>{s.role}</span>
                              <span>{s.marketCap}亿</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-amber-400" /><span className="font-medium">投资机会</span></div>
                  <ul className="space-y-1">{detail.opportunities?.map((o: string, i: number) => <li key={i} className="text-zinc-300">• {o}</li>)}</ul>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-red-400" /><span className="font-medium">风险提示</span></div>
                  <ul className="space-y-1">{detail.risks?.map((r: string, i: number) => <li key={i} className="text-zinc-300">• {r}</li>)}</ul>
                </div>
              </div>

              <div className="flex gap-6 text-xs text-zinc-500">
                <span>市场规模: {detail.marketSize}</span>
                <span>增长率: {detail.growthRate}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-zinc-500">暂无详情</div>
          )}
        </div>
      )}
    </div>
  );
}