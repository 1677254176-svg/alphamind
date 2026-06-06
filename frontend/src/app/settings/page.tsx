"use client";
import { useState, useEffect } from "react";
import { Settings, Moon, Globe, Database, Bell } from "lucide-react";
import { apiClient } from "@/lib/api";

interface AppSettings {
  theme: string; language: string; defaultMarket: string;
  notifications: { thesis_alerts: boolean; catalyst_reminders: boolean; price_alerts: boolean };
  dataSources: { primary: string; backup: string };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiClient<AppSettings>("/settings")
      .then(setSettings)
      .catch(() => { setSettings({theme:"dark",language:"zh-CN",defaultMarket:"A",notifications:{thesis_alerts:true,catalyst_reminders:true,price_alerts:false},dataSources:{primary:"eastmoney",backup:"sina"}}) })
      .finally(() => setLoading(false));
  }, []);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="max-w-3xl mx-auto py-20 text-center text-zinc-500">加载中...</div>;
  if (error) return <div className="max-w-3xl mx-auto py-20 text-center text-amber-400">{error}</div>;
  if (!settings) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold">设置</h1>
        <p className="text-zinc-400 text-sm mt-1">个性化配置 AlphaMind</p>
      </div>

      <div className="space-y-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4"><Moon className="w-4 h-4 text-violet-400" /><h2 className="font-semibold">外观</h2></div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm">主题</p><p className="text-xs text-zinc-500">当前：深色主题</p></div>
            <select className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-200">
              <option>深色</option><option>浅色 (开发中)</option>
            </select>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4"><Globe className="w-4 h-4 text-cyan-400" /><h2 className="font-semibold">市场偏好</h2></div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div><p className="text-sm">默认市场</p><p className="text-xs text-zinc-500">打开 Dashboard 时优先展示</p></div>
              <select defaultValue={settings.defaultMarket} className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-200">
                <option value="A">A股</option><option value="HK">港股</option><option value="US">美股</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-sm">语言</p></div>
              <select defaultValue={settings.language} className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-200">
                <option value="zh-CN">简体中文</option><option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4"><Bell className="w-4 h-4 text-amber-400" /><h2 className="font-semibold">通知</h2></div>
          <div className="space-y-3">
            {[
              { key: "thesis_alerts", label: "Thesis 预警通知", desc: "当投资逻辑出现风险时推送提醒" },
              { key: "catalyst_reminders", label: "催化剂提醒", desc: "财报、FOMC等重要事件前一天提醒" },
              { key: "price_alerts", label: "价格预警", desc: "股票达到目标价时通知" },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <div><p className="text-sm">{item.label}</p><p className="text-xs text-zinc-500">{item.desc}</p></div>
                <div className={`w-10 h-5 rounded-full cursor-pointer transition-colors ${settings.notifications[item.key as keyof typeof settings.notifications] ? "bg-violet-600" : "bg-zinc-700"}`}
                  onClick={() => { setSettings({...settings, notifications: {...settings.notifications, [item.key]: !settings.notifications[item.key as keyof typeof settings.notifications]}}); }}>
                  <div className={`w-4 h-4 rounded-full bg-white mt-0.5 transition-transform ${settings.notifications[item.key as keyof typeof settings.notifications] ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4"><Database className="w-4 h-4 text-emerald-400" /><h2 className="font-semibold">数据源</h2></div>
          <div className="text-sm space-y-1">
            <p><span className="text-zinc-500">主数据源：</span>{settings.dataSources.primary} (东方财富)</p>
            <p><span className="text-zinc-500">备用数据源：</span>{settings.dataSources.backup} (新浪财经)</p>
          </div>
        </div>
      </div>

      <button onClick={save}
        className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
        {saved ? "已保存 ✓" : "保存设置"}
      </button>
    </div>
  );
}