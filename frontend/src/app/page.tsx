"use client";

import { useState, useEffect } from "react";
import {
  ArrowUp, ArrowDown, TrendingUp, DollarSign, Zap, Bell, Calendar, FileText
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useWebSocket } from "@/hooks/use-websocket";

/**
 * AlphaMind Dashboard — A股优先版
 *
 * 首页展示：
 * 1. A股市场概览（上证/深证/创业板/科创50）
 * 2. 热门概念板块
 * 3. 我的组合
 * 4. AI市场总结
 * 5. Thesis预警
 * 6. 未来催化剂
 */

// ─── 类型定义 ───────────────────────────────────
interface AShareIndex {
  code: string;
  name: string;
  shortName: string;
  price: number;
  change: number;
  changePct: number;
}

interface ConceptBoard {
  name: string;
  emoji: string;
  changePct: number;
  leaderStock: string;
  leaderChangePct: number;
  hotLevel: number;  // 0-100
}

interface PortfolioSummary {
  dailyPnl: number;
  dailyPnlPercent: number;
  weeklyPnl: number;
  monthlyPnl: number;
  totalValue: number;
  holdings: number;
  cash: number;
}

interface ThesisAlert {
  thesisId: string;
  title: string;
  level: "info" | "warning" | "critical";
  message: string;
  stockCode: string;
}

interface CatalystEvent {
  date: string;
  type: string;
  title: string;
  importance: number;  // 1-5
}

// ─── Dashboard 页面 ────────────────────────────
export default function DashboardPage() {
  const [indices, setIndices] = useState<AShareIndex[]>([]);
  const [concepts, setConcepts] = useState<ConceptBoard[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [aiSummary, setAiSummary] = useState("");
  const [alerts, setAlerts] = useState<ThesisAlert[]>([]);
  const [catalysts, setCatalysts] = useState<CatalystEvent[]>([]);

  // 实时行情推送
  useWebSocket({
    channels: ["market", "portfolio", "alerts"],
    onMessage: (msg) => {
      if (msg.type === "index_update") {
        setIndices((prev) =>
          prev.map((idx) =>
            idx.code === msg.code
              ? { ...idx, price: msg.price as number, change: msg.change as number, changePct: msg.changePct as number }
              : idx
          )
        );
      }
    },
  });

  // 初始数据加载
  useEffect(() => {
    // A股指数
    apiClient<AShareIndex[]>("/a-share/market/indices").then(setIndices).catch(() => {
      // 默认数据(上证/深证/创业板/科创50)
      setIndices([
        { code: "000001", name: "上证指数", shortName: "上证", price: 3380.50, change: 12.30, changePct: 0.36 },
        { code: "399001", name: "深证成指", shortName: "深证", price: 10782.30, change: -25.60, changePct: -0.24 },
        { code: "399006", name: "创业板指", shortName: "创业板", price: 2189.10, change: -15.20, changePct: -0.69 },
        { code: "000688", name: "科创50", shortName: "科创50", price: 987.50, change: 8.40, changePct: 0.86 },
      ]);
    });

    // 热门概念
    apiClient<ConceptBoard[]>("/a-share/concept/hot").then(setConcepts).catch(() => {
      setConcepts([
        { name: "AI概念", emoji: "", changePct: 3.25, leaderStock: "300xxx", leaderChangePct: 9.98, hotLevel: 95 },
        { name: "低空经济", emoji: "", changePct: 2.80, leaderStock: "688xxx", leaderChangePct: 12.50, hotLevel: 88 },
        { name: "华为产业链", emoji: "", changePct: 1.95, leaderStock: "002xxx", leaderChangePct: 7.20, hotLevel: 82 },
        { name: "机器人概念", emoji: "", changePct: 2.10, leaderStock: "300xxx", leaderChangePct: 10.05, hotLevel: 90 },
        { name: "固态电池", emoji: "", changePct: 1.50, leaderStock: "688xxx", leaderChangePct: 6.80, hotLevel: 75 },
      ]);
    });

    // 我的组合
    apiClient<PortfolioSummary>("/dashboard/my-portfolio").then(setPortfolio).catch(() => {
      setPortfolio({ dailyPnl: 12300, dailyPnlPercent: 2.1, weeklyPnl: 58000, monthlyPnl: 230000, totalValue: 1450000, holdings: 8, cash: 500000 });
    });

    // AI市场总结
    apiClient<{ recap: string }>("/dashboard/ai-summary").then((d) => setAiSummary(d.recap)).catch(() => {
      setAiSummary(` 今日A股三大指数走势分化。上证微涨0.36%报3380点，两市成交额约1.2万亿。\n\n  AI概念板块继续活跃，多股涨停。北向资金今日净流入58亿，连续3日净流入。\n\n  重点关注：\n• 美联储6月议息会议临近\n• 中报预披露窗口即将开启\n• 科创50表现强势，资金持续流入`);
    });

    // Thesis预警
    apiClient<ThesisAlert[]>("/theses/monitor-snapshot").then(setAlerts).catch(() => {
      setAlerts([
        { thesisId: "1", title: "宁德时代：全球市占率", level: "warning", message: "营收增速降至12%，接近失效条件(10%)", stockCode: "300750" },
        { thesisId: "2", title: "天齐锂业：锂价反弹", level: "critical", message: "碳酸锂跌破7万元/吨，逻辑已失效", stockCode: "002466" },
      ]);
    });

    // 催化剂日历
    apiClient<CatalystEvent[]>("/catalyst/calendar/top").then(setCatalysts).catch(() => {
      setCatalysts([
        { date: "6月9日", type: "CPI", title: "5月CPI数据公布", importance: 4 },
        { date: "6月12日", type: "FOMC", title: "美联储6月议息会议", importance: 5 },
        { date: "6月20日", type: "LPR", title: "LPR利率公布", importance: 4 },
        { date: "7月1日", type: "中报", title: "中报预披露开始", importance: 4 },
        { date: "7月15日", type: "中报", title: "中报预披露截止", importance: 3 },
      ]);
    });
  }, []);

  // ─── 渲染 ──────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* 标题 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-zinc-400 text-sm mt-1">
          {new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
        </p>
      </div>

      {/* ===== A股市场概览 ===== */}
      <div className="grid grid-cols-4 gap-3">
        {indices.map((idx) => (
          <div key={idx.code} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400 text-sm">{idx.shortName}</span>
              <span className="text-xs text-zinc-600 font-mono">{idx.code}</span>
            </div>
            <div className="text-xl font-bold font-mono tracking-tight">{idx.price.toLocaleString("zh-CN")}</div>
            <div className={`flex items-center gap-1 mt-1 text-sm ${idx.change >= 0 ? "text-red-400" : "text-green-400"}`}>
              {idx.change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {idx.change >= 0 ? "+" : ""}{idx.change.toFixed(2)} ({idx.changePct >= 0 ? "+" : ""}{idx.changePct.toFixed(2)}%)
            </div>
          </div>
        ))}
      </div>

      {/* ===== 两栏布局 ===== */}
      <div className="grid grid-cols-2 gap-4">
        {/* 我的组合 */}
        {portfolio && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <h2 className="font-semibold">我的组合</h2>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <p className="text-xs text-zinc-500 mb-1">今日收益</p>
                <p className={`text-lg font-bold ${portfolio.dailyPnl >= 0 ? "text-red-400" : "text-green-400"}`}>
                  {portfolio.dailyPnl >= 0 ? "+" : ""}¥{portfolio.dailyPnl.toLocaleString()}
                </p>
                <p className="text-xs text-zinc-500">{portfolio.dailyPnlPercent >= 0 ? "+" : ""}{portfolio.dailyPnlPercent}%</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">本周</p>
                <p className="text-lg font-bold">¥{portfolio.weeklyPnl.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">本月</p>
                <p className="text-lg font-bold">¥{portfolio.monthlyPnl.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">总市值</p>
                <p className="text-lg font-bold">¥{portfolio.totalValue.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-zinc-800">
              <div><p className="text-xs text-zinc-500">持仓</p><p className="font-bold">{portfolio.holdings} 只</p></div>
              <div><p className="text-xs text-zinc-500">现金</p><p className="font-bold">¥{portfolio.cash.toLocaleString()}</p></div>
            </div>
          </div>
        )}

        {/* AI市场总结 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h2 className="font-semibold">AI 市场总结</h2>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{aiSummary || "正在生成AI分析..."}</p>
        </div>
      </div>

      {/* ===== 热门概念板块 ===== */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <h2 className="font-semibold">热门概念板块</h2>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {concepts.map((concept) => (
            <div key={concept.name} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors cursor-pointer">
              <div className="text-2xl mb-1">{concept.emoji}</div>
              <p className="font-medium text-sm">{concept.name}</p>
              <p className={`text-sm font-bold mt-1 ${concept.changePct >= 0 ? "text-red-400" : "text-green-400"}`}>
                {concept.changePct >= 0 ? "+" : ""}{concept.changePct}%
              </p>
              <p className="text-xs text-zinc-500 mt-1">领涨: {concept.leaderStock} {concept.leaderChangePct >= 0 ? "+" : ""}{concept.leaderChangePct}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== 底部：Thesis预警 + 催化剂日历 ===== */}
      <div className="grid grid-cols-2 gap-4">
        {/* Thesis预警 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-amber-400" />
            <h2 className="font-semibold">⚠ Thesis 预警</h2>
          </div>
          {alerts.length === 0 ? (
            <p className="text-zinc-500 text-sm">暂无预警，投资逻辑一切正常</p>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.thesisId} className="flex items-start gap-2 p-2 rounded-lg bg-zinc-800/50">
                  <span className="text-sm mt-0.5">
                    {alert.level === "critical" ? "" : alert.level === "warning" ? "⚠" : "ℹ"}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{alert.stockCode} · {alert.title}</p>
                    <p className="text-xs text-zinc-400">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 催化剂日历 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-blue-400" />
            <h2 className="font-semibold"> 未来催化剂</h2>
          </div>
          <div className="space-y-2">
            {catalysts.map((event, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-zinc-800/50">
                <span className="text-xs text-zinc-400 w-16">{event.date}</span>
                <span className="text-xs bg-zinc-700 px-2 py-0.5 rounded">{event.type}</span>
                <span className="text-sm flex-1">{event.title}</span>
                <span className="text-xs text-zinc-500">{"★".repeat(event.importance)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
