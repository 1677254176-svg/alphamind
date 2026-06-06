"use client";
import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Bot, User, Sparkles } from "lucide-react";
import { apiClient } from "@/lib/api";

interface Message { role: "user" | "ai"; content: string }

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "你好！我是 AlphaMind AI 投资助手。你可以问我任何关于A股投资的问题：\n\n📊 股票分析\n📈 市场趋势\n🔍 产业链研究\n⚠️ 风险评估\n💡 投资建议\n\n有什么可以帮你的？" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const data = await apiClient<{ answer: string }>("/chat/ask", { method: "POST", body: { question: input } });
      setMessages(prev => [...prev, { role: "ai", content: data.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", content: "抱歉，AI助手暂时不可用，请稍后重试。" }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="w-5 h-5 text-violet-400" /> AI 投资助手</h1>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === "user" ? "bg-violet-600" : "bg-zinc-700"}`}>
              {m.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-violet-400" />}
            </div>
            <div className={`rounded-xl px-4 py-3 max-w-[80%] text-sm ${m.role === "user" ? "bg-violet-600 text-white" : "bg-zinc-900 border border-zinc-800 text-zinc-200"}`}>
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center"><Bot className="w-4 h-4 text-violet-400" /></div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-500">
              <span className="inline-flex gap-1"><span className="animate-pulse">●</span><span className="animate-pulse" style={{animationDelay:"0.2s"}}>●</span><span className="animate-pulse" style={{animationDelay:"0.4s"}}>●</span></span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="输入你的投资问题..." disabled={loading}
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500" />
        <button onClick={send} disabled={loading || !input.trim()}
          className="bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white px-4 py-3 rounded-lg transition-colors">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}