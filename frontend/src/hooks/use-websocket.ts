"use client";

import { useEffect, useRef, useCallback, useState } from "react";

/**
 * useWebSocket - Real-time data hook for AlphaMind.
 *
 * Channels: "market" | "portfolio" | "alerts"
 */
type WSChannel = "market" | "portfolio" | "alerts";
type WSMessage = {
  type: string;
  [key: string]: unknown;
};

interface UseWebSocketOptions {
  channels: WSChannel[];
  onMessage?: (msg: WSMessage) => void;
  enabled?: boolean;
}

export function useWebSocket({
  channels,
  onMessage,
  enabled = true,
}: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    if (!enabled) return;

    const token = localStorage.getItem("auth_token");
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";
    const url = token ? `${wsUrl}?token=${token}` : wsUrl;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      ws.send(
        JSON.stringify({
          type: "subscribe",
          channels,
        }),
      );
    };

    ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);
        onMessage?.(msg);
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      // Auto-reconnect after 3 seconds
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [channels, onMessage, enabled]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { isConnected };
}
