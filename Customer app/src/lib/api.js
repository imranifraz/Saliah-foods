function resolveApiBase() {
  // Dev always uses Vite proxy (/api → :3001) — avoids CORS and wrong host issues
  if (import.meta.env.DEV) return "";
  const env = import.meta.env.VITE_API_URL;
  if (env === "" || env === "/") return "";
  if (env) return String(env).replace(/\/$/, "");
  return "http://127.0.0.1:3001";
}

const API_BASE = resolveApiBase();
export const AUTH_TOKEN_KEY = "saliah-token";

export function resolveMediaUrl(path) {
  if (!path) return path;
  let value = String(path).trim();

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    try {
      const { pathname } = new URL(value);
      value = pathname || value;
    } catch {
      return value;
    }
  }

  if (!value.startsWith("/")) {
    value = value.startsWith("uploads/") || value.startsWith("assets/") ? `/${value}` : `/${value}`;
  }

  if (value.startsWith("/assets/") && /\.png$/i.test(value)) {
    value = value.replace(/\.png$/i, ".webp");
  }

  if (value.startsWith("/uploads/") || value.startsWith("/assets/")) {
    return API_BASE ? `${API_BASE}${value}` : value;
  }

  return value;
}

export function getAuthToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token) {
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  else localStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function apiFetch(path, options = {}) {
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...options.headers,
  };
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    const err = new Error("Cannot reach server. Is the backend running on port 3001?");
    err.status = 0;
    throw err;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.error ?? "Request failed");
    err.status = res.status;
    err.errors = data.errors;
    if (data.retryAfterSeconds != null) err.retryAfterSeconds = data.retryAfterSeconds;
    throw err;
  }

  return data;
}
