"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { apiClient } from "@/lib/api";

interface StockItem {
  code: string; name: string; board: string; price: number;
  changePct: number; pe: number; marketCap: number; concept: string; brokerRating: string;
}

export default function StocksPage() {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    apiClient<StockItem[]>("/stocks")
      .then(setStocks)
      .catch(() => { setError("后端未连接，显示默认数据"); setStocks([{code:"300750",name:"宁德时代",board:"创业板",price:196.50,changePct:2.35,pe:25.6,marketCap:8640,concept:"固态电池",brokerRating:"买入"},{code:"688981",name:"中芯国际",board:"科创板",price:45.80,changePct:-1.20,pe:42.3,marketCap:3650,concept:"半导体",brokerRating:"增持"},{code:"002466",name:"天齐锂业",board:"深市主板",price:68.30,changePct:-3.45,pe:18.7,marketCap:1120,concept:"锂矿",brokerRating:"中性"},{code:"300308",name:"中际旭创",board:"创业板",price:89.20,changePct:5.67,pe:35.1,marketCap:720,concept:"AI概念",brokerRating:"买入"},{code:"600519",name:"贵州茅台",board:"沪市主板",price:1680.00,changePct:0.15,pe:28.9,marketCap:21100,concept:"白酒",brokerRating:"买入"},{code:"688070",name:"纵横股份",board:"科创板",price:52.40,changePct:8.90,pe:65.2,marketCap:280,concept:"低空经济",brokerRating:"增持"}]) })
      .finally(() => setLoading(false));
  }, []);

  const filtered = stocks.filter(s =>
    !search || s.code.includes(search) || s.name.includes(search) || s.concept.includes(search)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold">股票研究中心</h1>
        <p className="text-zinc-400 text-sm mt-1">A股全市场实时数据 · 公司档案 · 财务分析 · 券商研报</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input type="text" placeholder="搜索代码/名称/概念..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500" />
        </div>
      </div>
      {loading ? (
        <div className="text-center py-20 text-zinc-500">加载中...</div>
      ) : error ? (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-sm text-amber-400">{error}</div>
      ) : null}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500">
              <th className="text-left px-4 py-3 font-medium">代码</th>
              <th className="text-left px-4 py-3 font-medium">名称</th>
              <th className="text-left px-4 py-3 font-medium">板块</th>
              <th className="text-right px-4 py-3 font-medium">最新价</th>
              <th className="text-right px-4 py-3 font-medium">涨跌幅</th>
              <th className="text-right px-4 py-3 font-medium">PE</th>
              <th className="text-right px-4 py-3 font-medium">市值(亿)</th>
              <th className="text-left px-4 py-3 font-medium">概念</th>
              <th className="text-left px-4 py-3 font-medium">评级</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.code} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{s.code}</td>
                <td className="px-4 py-3">
                  <Link href={`/stocks/${s.code}`} className="text-zinc-200 hover:text-violet-400 font-medium transition-colors">
                    {s.name}
                  </Link>
                </td>
                <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">{s.board}</span></td>
                <td className="px-4 py-3 text-right font-mono text-xs">{s.price.toFixed(2)}</td>
                <td className={`px-4 py-3 text-right font-mono text-xs ${s.changePct >= 0 ? "text-red-400" : "text-green-400"}`}>
                  {s.changePct >= 0 ? "+" : ""}{s.changePct.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-right text-zinc-400 text-xs">{s.pe.toFixed(1)}</td>
                <td className="px-4 py-3 text-right text-zinc-400 text-xs">{s.marketCap.toLocaleString()}</td>
                <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded bg-violet-500/10 text-violet-400">{s.concept}</span></td>
                <td className="px-4 py-3 text-xs">{s.brokerRating}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && !loading && (
          <div className="text-center py-12 text-zinc-500">没有匹配的股票</div>
        )}
      </div>
    </div>
  );
}