"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { TrendingUp, DollarSign, BarChart3, Target, Shield } from "lucide-react";
import { apiClient } from "@/lib/api";

interface FinancialPoint { year: number; value: number }
interface StockDetail {
  name: string; fullName: string; board: string; industry: string;
  founded: string; listed: string; employees: number; headquarters: string;
  businessModel: string; coreProducts: string; moat: string;
  price: number; changePct: number; pe: number; pb: number; marketCap: number;
  revenue: FinancialPoint[]; eps: FinancialPoint[]; roe: FinancialPoint[];
  grossMargin: number; netMargin: number;
  brokerConsensus: { rating: string; targetPrice: number; upside: number };
  technicals: { ma5: number; ma20: number; ma60: number; rsi: number; macd: string; bollPosition: string };
}

export default function StockDetailPage() {
  const { ticker } = useParams();
  const [stock, setStock] = useState<StockDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ticker) return;
    setLoading(true);
    apiClient<StockDetail>(`/stocks/${ticker}`)
      .then(setStock)
      .catch(() => { setError("后端未连接，显示默认数据"); setStock({name:ticker as string,fullName:"股票 "+ticker,board:"主板",industry:"未知",founded:"--",listed:"--",employees:0,headquarters:"--",businessModel:"暂无数据，请连接后端获取",coreProducts:"--",moat:"--",price:0,changePct:0,pe:0,pb:0,marketCap:0,revenue:[],eps:[],roe:[],grossMargin:0,netMargin:0,brokerConsensus:{rating:"--",targetPrice:0,upside:0},technicals:{ma5:0,ma20:0,ma60:0,rsi:50,macd:"--",bollPosition:"--"}}) })
      .finally(() => setLoading(false));
  }, [ticker]);

  if (loading) return <div className="max-w-5xl mx-auto py-20 text-center text-zinc-500">加载中...</div>;
  if (error) return <div className="max-w-5xl mx-auto py-20 text-center text-amber-400">{error}</div>;
  if (!stock) return <div className="max-w-5xl mx-auto py-20 text-center text-zinc-500">未找到股票数据</div>;

  const maxRevenue = Math.max(...stock.revenue.map(r => r.value), 1);
  const maxEps = Math.max(...stock.eps.map(r => r.value), 1);
  const maxRoe = Math.max(...stock.roe.map(r => r.value), 1);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">{stock.board}</span>
            <span className="text-xs text-zinc-500">{stock.industry}</span>
          </div>
          <h1 className="text-3xl font-bold">{stock.name}</h1>
          <p className="text-zinc-500 text-sm mt-1">{stock.fullName}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold font-mono">¥{stock.price.toFixed(2)}</p>
          <p className={`text-sm font-bold ${stock.changePct >= 0 ? "text-red-400" : "text-green-400"}`}>
            {stock.changePct >= 0 ? "+" : ""}{stock.changePct.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-6 gap-3">
        {[
          { label: "PE", value: stock.pe.toFixed(1) },
          { label: "PB", value: stock.pb.toFixed(1) },
          { label: "市值(亿)", value: stock.marketCap.toLocaleString() },
          { label: "毛利率", value: stock.grossMargin + "%" },
          { label: "净利率", value: stock.netMargin + "%" },
          { label: "员工", value: (stock.employees / 10000).toFixed(1) + "万" },
        ].map(m => (
          <div key={m.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
            <p className="text-xs text-zinc-500 mb-1">{m.label}</p>
            <p className="text-sm font-bold">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Company Profile */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3"><Target className="w-4 h-4 text-violet-400" /><h2 className="font-semibold">公司档案</h2></div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-zinc-500">成立：</span>{stock.founded}年</div>
          <div><span className="text-zinc-500">上市：</span>{stock.listed}年</div>
          <div><span className="text-zinc-500">总部：</span>{stock.headquarters}</div>
          <div className="col-span-2"><span className="text-zinc-500">商业模式：</span>{stock.businessModel}</div>
          <div className="col-span-2"><span className="text-zinc-500">核心产品：</span>{stock.coreProducts}</div>
          <div className="col-span-2"><span className="text-zinc-500">护城河：</span>{stock.moat}</div>
        </div>
      </div>

      {/* Financial Charts */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { title: "营收(亿)", data: stock.revenue, max: maxRevenue, color: "bg-violet-500" },
          { title: "EPS", data: stock.eps, max: maxEps, color: "bg-cyan-500" },
          { title: "ROE(%)", data: stock.roe, max: maxRoe, color: "bg-emerald-500" },
        ].map(chart => (
          <div key={chart.title} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3"><BarChart3 className="w-4 h-4 text-zinc-400" /><h3 className="text-sm font-medium">{chart.title}</h3></div>
            <div className="space-y-1.5">
              {chart.data.map(d => (
                <div key={d.year} className="flex items-center gap-2 text-xs">
                  <span className="text-zinc-500 w-10">{d.year}</span>
                  <div className="flex-1 bg-zinc-800 rounded h-4 overflow-hidden">
                    <div className={chart.color + " h-full rounded"} style={{ width: (d.value / chart.max * 100).toFixed(0) + "%" }} />
                  </div>
                  <span className="text-zinc-300 w-14 text-right">{d.value.toFixed(chart.title.includes("ROE") ? 1 : 0)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Broker + Technicals */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3"><DollarSign className="w-4 h-4 text-amber-400" /><h2 className="font-semibold">券商共识</h2></div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-zinc-500">评级</span><span className="text-red-400 font-bold">{stock.brokerConsensus.rating}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">目标价</span><span className="font-bold">¥{stock.brokerConsensus.targetPrice.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-zinc-500">上涨空间</span><span className="text-emerald-400 font-bold">+{stock.brokerConsensus.upside}%</span></div>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-blue-400" /><h2 className="font-semibold">技术指标</h2></div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              { label: "MA5", value: stock.technicals.ma5.toFixed(2) },
              { label: "MA20", value: stock.technicals.ma20.toFixed(2) },
              { label: "MA60", value: stock.technicals.ma60.toFixed(2) },
              { label: "RSI(14)", value: stock.technicals.rsi.toFixed(1) },
              { label: "MACD", value: stock.technicals.macd },
              { label: "布林带", value: stock.technicals.bollPosition },
            ].map(t => (
              <div key={t.label} className="bg-zinc-800/50 rounded-lg p-2 text-center">
                <p className="text-xs text-zinc-500">{t.label}</p>
                <p className="font-bold">{t.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}