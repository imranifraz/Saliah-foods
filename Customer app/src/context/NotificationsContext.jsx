import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  DEFAULT_NOTIFICATION_PREFS,
  loadDismissedNotificationIds,
  loadNotificationPrefs,
  loadNotificationReadIds,
  saveDismissedNotificationIds,
  saveNotificationPrefs,
  saveNotificationReadIds,
} from "../data/notifications";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [prefs, setPrefs] = useState({ ...DEFAULT_NOTIFICATION_PREFS });
  const [readIds, setReadIds] = useState([]);
  const [dismissedIds, setDismissedIds] = useState([]);

  useEffect(() => {
    setPrefs(userId ? loadNotificationPrefs(userId) : { ...DEFAULT_NOTIFICATION_PREFS });
    setReadIds(userId ? loadNotificationReadIds(userId) : []);
    setDismissedIds(userId ? loadDismissedNotificationIds(userId) : []);
  }, [userId]);

  useEffect(() => {
    if (userId) saveNotificationPrefs(userId, prefs);
  }, [userId, prefs]);

  useEffect(() => {
    if (userId) saveNotificationReadIds(userId, readIds);
  }, [userId, readIds]);

  useEffect(() => {
    if (userId) saveDismissedNotificationIds(userId, dismissedIds);
  }, [userId, dismissedIds]);

  const updatePref = useCallback((key, value) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const markAsRead = useCallback((id) => {
    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const markAllRead = useCallback((ids) => {
    setReadIds((prev) => [...new Set([...prev, ...ids])]);
  }, []);

  const clearAll = useCallback((ids) => {
    setDismissedIds((prev) => [...new Set([...prev, ...ids])]);
  }, []);

  const isRead = useCallback((id) => readIds.includes(id), [readIds]);

  const isDismissed = useCallback((id) => dismissedIds.includes(id), [dismissedIds]);

  const value = useMemo(
    () => ({
      prefs,
      updatePref,
      markAsRead,
      markAllRead,
      clearAll,
      isRead,
      isDismissed,
    }),
    [prefs, updatePref, markAsRead, markAllRead, clearAll, isRead, isDismissed]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error("useNotifications must be used within NotificationsProvider");
  return context;
}
