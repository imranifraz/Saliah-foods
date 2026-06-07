export const AUTH_TOKEN_KEY = "saliah-admin-token";
export const AUTH_REFRESH_KEY = "saliah-admin-refresh";
export const AUTH_REMEMBER_KEY = "saliah-admin-remember-me";
export const AUTH_EMAIL_KEY = "saliah-admin-remember-email";
export const AUTH_PASSWORD_KEY = "saliah-admin-remember-password";

function encodeRememberedPassword(password) {
  try {
    return btoa(unescape(encodeURIComponent(password)));
  } catch {
    return "";
  }
}

function decodeRememberedPassword(encoded) {
  try {
    return decodeURIComponent(escape(atob(encoded)));
  } catch {
    return "";
  }
}

function readStoredValue(key) {
  try {
    return sessionStorage.getItem(key) ?? localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function getRememberMePreference() {
  return readStoredValue(AUTH_REMEMBER_KEY) !== "0";
}

export function getRememberedEmail() {
  return getRememberedCredentials().email;
}

export function getRememberedCredentials() {
  if (!getRememberMePreference()) {
    return { email: "", password: "" };
  }

  try {
    const email = localStorage.getItem(AUTH_EMAIL_KEY) ?? "";
    const encodedPassword = localStorage.getItem(AUTH_PASSWORD_KEY);
    const password = encodedPassword ? decodeRememberedPassword(encodedPassword) : "";
    return { email, password };
  } catch {
    return { email: "", password: "" };
  }
}

export function setRememberMePreference(rememberMe, email = "", password = "") {
  try {
    if (rememberMe) {
      localStorage.setItem(AUTH_REMEMBER_KEY, "1");
      if (email) localStorage.setItem(AUTH_EMAIL_KEY, email.trim().toLowerCase());
      if (password) localStorage.setItem(AUTH_PASSWORD_KEY, encodeRememberedPassword(password));
    } else {
      clearRememberedCredentials();
    }
  } catch {
    /* ignore storage errors */
  }
}

export function clearRememberedCredentials() {
  try {
    localStorage.setItem(AUTH_REMEMBER_KEY, "0");
    localStorage.removeItem(AUTH_EMAIL_KEY);
    localStorage.removeItem(AUTH_PASSWORD_KEY);
  } catch {
    /* ignore storage errors */
  }
}

export function validatePasswordStrength(password) {
  const value = String(password ?? "");
  const MIN_LENGTH = 8;

  if (value.length < MIN_LENGTH) {
    return { ok: false, error: `Password must be at least ${MIN_LENGTH} characters` };
  }
  if (!/[A-Za-z]/.test(value)) {
    return { ok: false, error: "Password must include at least one letter" };
  }
  if (!/\d/.test(value)) {
    return { ok: false, error: "Password must include at least one number" };
  }

  return { ok: true };
}

function resolveApiBase() {
  const env = import.meta.env.VITE_API_URL;
  if (env === "" || env === "/") return "";
  if (env) return String(env).replace(/\/$/, "");
  if (import.meta.env.DEV) return "";
  return "http://127.0.0.1:3001";
}

const API_BASE = resolveApiBase();

let onUnauthorized = null;
let refreshPromise = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

export function getAuthToken() {
  return readStoredValue(AUTH_TOKEN_KEY);
}

export function getRefreshToken() {
  return readStoredValue(AUTH_REFRESH_KEY);
}

export function setAuthSession({ token, refreshToken, rememberMe = getRememberMePreference() }) {
  try {
    const persistent = Boolean(rememberMe);
    const primary = persistent ? localStorage : sessionStorage;
    const secondary = persistent ? sessionStorage : localStorage;

    secondary.removeItem(AUTH_TOKEN_KEY);
    secondary.removeItem(AUTH_REFRESH_KEY);

    if (token) primary.setItem(AUTH_TOKEN_KEY, token);
    else primary.removeItem(AUTH_TOKEN_KEY);

    if (refreshToken) primary.setItem(AUTH_REFRESH_KEY, refreshToken);
    else primary.removeItem(AUTH_REFRESH_KEY);

    setRememberMePreference(persistent);
  } catch {
    /* ignore storage errors */
  }
}

export function clearAuthSession() {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_REFRESH_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_REFRESH_KEY);
  } catch {
    /* ignore storage errors */
  }
}

/** @deprecated use setAuthSession */
export function setAuthToken(token) {
  setAuthSession({ token, refreshToken: getRefreshToken() });
}

async function refreshAdminSession() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch(`${API_BASE}/api/admin/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) return null;

  setAuthSession({ token: data.token, refreshToken: data.refreshToken, rememberMe: data.rememberMe });
  return data;
}

async function refreshAdminSessionOnce() {
  if (!refreshPromise) {
    refreshPromise = refreshAdminSession().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiFetch(path, options = {}, retry = true) {
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
    const err = new Error("Cannot reach server. Is the backend running?");
    err.status = 0;
    throw err;
  }

  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && retry && !path.includes("/api/admin/auth/login") && !path.includes("/api/admin/auth/refresh")) {
    const refreshed = await refreshAdminSessionOnce();
    if (refreshed?.token) {
      return apiFetch(path, options, false);
    }
    clearAuthSession();
    onUnauthorized?.();
  }

  if (!res.ok) {
    const err = new Error(data.error ?? "Request failed");
    err.status = res.status;
    if (data.retryAfterSeconds != null) err.retryAfterSeconds = data.retryAfterSeconds;
    throw err;
  }

  return data;
}

export async function logoutAdminSession() {
  try {
    await apiFetch("/api/admin/auth/logout", { method: "POST" }, false);
  } catch {
    /* still clear local session */
  } finally {
    clearAuthSession();
  }
}
