import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, clearAuthSession, logoutAdminSession, setAuthSession, setUnauthorizedHandler, getAuthToken, setRememberMePreference } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const refresh = useCallback(async () => {
    const hasToken = Boolean(getAuthToken());
    if (!hasToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await apiFetch("/api/admin/me");
      setUser(data.user);
      setSessionExpired(false);
    } catch {
      clearAuthSession();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setSessionExpired(true);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email, password, rememberMe = false) => {
    const data = await apiFetch("/api/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, rememberMe }),
    });
    setRememberMePreference(rememberMe, email);
    setAuthSession({ token: data.token, refreshToken: data.refreshToken, rememberMe: data.rememberMe });
    setUser(data.user);
    setSessionExpired(false);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await logoutAdminSession();
    setUser(null);
    setSessionExpired(false);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, refresh, sessionExpired, isAdmin: user?.role === "admin" }),
    [user, loading, login, logout, refresh, sessionExpired]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
