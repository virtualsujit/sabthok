// Client-side: use relative path so it always matches the current origin (http or https)
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

// Server-side fetches use the internal Docker network URL
const INTERNAL_API_BASE =
  process.env.INTERNAL_API_URL || "http://backend:8000/api";

function getBaseUrl(isServer: boolean): string {
  return isServer ? INTERNAL_API_BASE : API_BASE;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface FetchOptions extends RequestInit {
  token?: string;
}

async function tryRefreshToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      return null;
    }
    const data = await res.json();
    localStorage.setItem("access_token", data.access);
    return data.access;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
  isServer = false
): Promise<T> {
  const { token, ...init } = options;
  const base = getBaseUrl(isServer);
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Only set Content-Type for non-FormData requests
  if (!(init.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${base}${path}`, {
    ...init,
    headers,
  });

  if (!res.ok) {
    // Auto-refresh on 401 for client-side requests
    if (res.status === 401 && token && !isServer) {
      const newToken = await tryRefreshToken();
      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`;
        const retryRes = await fetch(`${base}${path}`, {
          ...init,
          headers,
        });
        if (retryRes.ok) {
          if (retryRes.status === 204) return {} as T;
          return retryRes.json();
        }
      }
    }

    const message =
      res.status === 401
        ? "Authentication required. Please log in."
        : res.status === 403
          ? "You don't have permission for this action."
          : res.status === 404
            ? "The requested resource was not found."
            : res.status === 429
              ? "Too many requests. Please try again later."
              : "Something went wrong. Please try again.";
    throw new ApiError(res.status, message);
  }

  // Handle 204 No Content (for DELETE)
  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}
