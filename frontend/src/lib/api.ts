/**
 * API Client - Type-safe fetch wrapper for AlphaMind backend.
 *
 * Features:
 * - Automatic JWT token injection
 * - Token refresh on 401
 * - Request/response type safety
 * - Rate limit handling
 * - Streaming support (SSE)
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

type RequestConfig = Omit<RequestInit, "body"> & {
  params?: Record<string, string>;
  body?: unknown;
  timeout?: number;
};

class ApiError extends Error {
  constructor(
    public status: number,
    public errorCode: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function getAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

async function refreshToken(): Promise<boolean> {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    localStorage.setItem("auth_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

async function apiClient<T>(
  endpoint: string,
  config: RequestConfig = {},
): Promise<T> {
  const { params, body, timeout = 15000, ...init } = config;

  // Build URL with query params
  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  // Build headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };

  const token = await getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Timeout via AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    let res = await fetch(url, {
      ...init,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    // Auto-refresh token on 401
    if (res.status === 401 && token) {
      const refreshed = await refreshToken();
      if (refreshed) {
        headers["Authorization"] = `Bearer ${localStorage.getItem("auth_token")}`;
        res = await fetch(url, {
          ...init,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });
      }
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Request failed" }));
      throw new ApiError(res.status, error.error_code || "UNKNOWN", error.detail);
    }

    return await res.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(408, "TIMEOUT", "Request timed out");
    }
    throw new ApiError(0, "NETWORK_ERROR", String(error));
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Server-Sent Events stream reader for AI chat.
 */
async function* streamApiClient(
  endpoint: string,
  body: unknown,
): AsyncGenerator<string, void, unknown> {
  const url = `${API_BASE}${endpoint}`;
  const token = await getAuthToken();

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok || !res.body) {
    throw new ApiError(res.status, "STREAM_ERROR", "Failed to start stream");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        yield line.slice(6);
      }
    }
  }
}

export { apiClient, streamApiClient, ApiError };
export type { RequestConfig };
