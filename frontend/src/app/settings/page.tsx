"use client";
import { useState, useEffect } from "react";
import { Moon, Globe, Database, Bell } from "lucide-react";

interface AppSettings {
  theme: string; language: string; defaultMarket: string;
  notifications: { thesis_alerts: boolean; catalyst_reminders: boolean; price_alerts: boolean };
  dataSources: { primary: string; backup: string };
}

const defaults: AppSettings = {
  theme: "dark", language: "zh-CN", defaultMarket: "A",
  notifications: { thesis_alerts: true, catalyst_reminders: true, price_alerts: false },
  dataSources: { primary: "eastmoney", backup: "sina" },
};

function loadSettings(): AppSettings {
  if (typeof window === "undefined") return defaults;
  try {
    const stored = localStorage.getItem("alphamind_settings");
    if (stored) return { ...defaults, ...JSON.parse(stored) };
  } catch {}
  return defaults;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaults);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setSettings(loadSettings()); }, []);

  const update = (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    localStorage.setItem("alphamind_settings", JSON.stringify(next));
  };

  const updateNotif = (key: keyof AppSettings["notifications"]) => {
    const notif = { ...settings.notifications, [key]: !settings.notifications[key] };
    update({ notifications: notif });
  };

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold">设置</h1>
        <p className="text-zinc-400 text-sm mt-1">个性化配置 AlphaMind · 自动保存到浏览器</p>
      </div>

      <div className="space-y-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4"><Moon className="w-4 h-4 text-violet-400" /><h2 className="font-semibold">外观</h2></div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm">主题</p><p className="text-xs text-zinc-500">当前：深色主题</p></div>
            <select defaultValue={settings.theme} onChange={e => update({ theme: e.target.value })} className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-200">
              <option value="dark">深色</option><option value="light">浅色 (开发中)</option>
            </select>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4"><Globe className="w-4 h-4 text-cyan-400" /><h2 className="font-semibold">市场偏好</h2></div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div><p className="text-sm">默认市场</p><p className="text-xs text-zinc-500">打开 Dashboard 时优先展示</p></div>
              <select defaultValue={settings.defaultMarket} onChange={e => update({ defaultMarket: e.target.value })} className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-200">
                <option value="A">A股</option><option value="HK">港股</option><option value="US">美股</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-sm">语言</p></div>
              <select defaultValue={settings.language} onChange={e => update({ language: e.target.value })} className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-200">
                <option value="zh-CN">简体中文</option><option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4"><Bell className="w-4 h-4 text-amber-400" /><h2 className="font-semibold">通知</h2></div>
          {[
            { key: "thesis_alerts" as const, label: "Thesis 预警通知", desc: "当投资逻辑出现风险时推送提醒" },
            { key: "catalyst_reminders" as const, label: "催化剂提醒", desc: "财报、FOMC等重要事件前一天提醒" },
            { key: "price_alerts" as const, label: "价格预警", desc: "股票达到目标价时通知" },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div><p className="text-sm">{item.label}</p><p className="text-xs text-zinc-500">{item.desc}</p></div>
              <div className={`w-10 h-5 rounded-full cursor-pointer transition-colors ${settings.notifications[item.key] ? "bg-violet-600" : "bg-zinc-700"}`}
                onClick={() => updateNotif(item.key)}>
                <div className={`w-4 h-4 rounded-full bg-white mt-0.5 transition-transform ${settings.notifications[item.key] ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4"><Database className="w-4 h-4 text-emerald-400" /><h2 className="font-semibold">数据源</h2></div>
          <div className="text-sm space-y-1">
            <p><span className="text-zinc-500">主数据源：</span>{settings.dataSources.primary} (东方财富)</p>
            <p><span className="text-zinc-500">备用数据源：</span>{settings.dataSources.backup} (新浪财经)</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-zinc-600 text-center">设置自动保存到浏览器 localStorage，无需后端</p>
    </div>
  );
}