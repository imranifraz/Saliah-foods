import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const AdminToastContext = createContext(null);

let toastSeq = 0;

export function AdminToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const dismissToast = useCallback((id) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    ({ type = "success", title, message = "", durationMs } = {}) => {
      const id = `toast-${Date.now()}-${++toastSeq}`;
      const resolvedDuration =
        durationMs ?? (type === "error" ? 5600 : type === "info" ? 4500 : 4200);
      const next = {
        id,
        type: type === "error" ? "error" : type === "info" ? "info" : "success",
        title: title || (type === "error" ? "Something went wrong" : "Done"),
        message: String(message || ""),
      };

      setToasts((current) => [...current, next].slice(-4));

      if (resolvedDuration > 0) {
        const timer = setTimeout(() => dismissToast(id), resolvedDuration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({
      toasts,
      pushToast,
      dismissToast,
      success: (title, message) => pushToast({ type: "success", title, message }),
      error: (title, message) => pushToast({ type: "error", title, message }),
      info: (title, message) => pushToast({ type: "info", title, message }),
    }),
    [toasts, pushToast, dismissToast]
  );

  return <AdminToastContext.Provider value={value}>{children}</AdminToastContext.Provider>;
}

export function useAdminToast() {
  const ctx = useContext(AdminToastContext);
  if (!ctx) throw new Error("useAdminToast must be used within AdminToastProvider");
  return ctx;
}
