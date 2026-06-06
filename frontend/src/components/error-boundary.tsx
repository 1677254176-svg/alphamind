"use client";
import { Component, ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-400 text-2xl">!</span>
            </div>
            <h1 className="text-xl font-bold text-zinc-200 mb-2">页面加载异常</h1>
            <p className="text-zinc-400 text-sm mb-4">{this.state.error?.message || "发生了未知错误"}</p>
            <button onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded-lg text-sm transition-colors">
              重新加载
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}