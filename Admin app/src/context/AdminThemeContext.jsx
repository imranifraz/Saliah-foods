import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "saliah-admin-theme";

const AdminThemeContext = createContext(null);

function readStoredTheme() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function AdminThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme);

  const setTheme = useCallback((next) => {
    setThemeState(next === "light" ? "light" : "dark");
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === "light" ? "dark" : "light"));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
    document.documentElement.dataset.adminTheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      "content",
      theme === "light" ? "#f7f4eb" : "#0b1118"
    );
  }, [theme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, isDark: theme === "dark" }),
    [theme, setTheme, toggleTheme]
  );

  return <AdminThemeContext.Provider value={value}>{children}</AdminThemeContext.Provider>;
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (!context) throw new Error("useAdminTheme must be used within AdminThemeProvider");
  return context;
}
