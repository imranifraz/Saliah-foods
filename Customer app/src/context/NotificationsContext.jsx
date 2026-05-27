import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { DEFAULT_NOTIFICATION_PREFS } from "../data/notifications";
import {
  dismissNotificationsApi,
  fetchNotificationPrefsApi,
  fetchNotificationsApi,
  markNotificationsReadApi,
  updateNotificationPrefsApi,
} from "../services/notificationApi";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [prefs, setPrefs] = useState({ ...DEFAULT_NOTIFICATION_PREFS });
  const [feed, setFeed] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) {
      setFeed([]);
      setUnreadCount(0);
      setPrefs({ ...DEFAULT_NOTIFICATION_PREFS });
      return;
    }

    setLoading(true);
    try {
      const [listData, prefsData] = await Promise.all([
        fetchNotificationsApi(),
        fetchNotificationPrefsApi(),
      ]);
      setFeed(listData.notifications ?? []);
      setUnreadCount(listData.unreadCount ?? 0);
      if (prefsData.prefs) {
        setPrefs({
          orderTracking: prefsData.prefs.orderTracking,
          deliveryUpdates: prefsData.prefs.deliveryUpdates,
          ratingReminders: prefsData.prefs.ratingReminders,
          orderSms: prefsData.prefs.orderSms,
        });
      }
    } catch {
      setFeed([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
    if (!userId) return undefined;
    const timer = window.setInterval(refresh, 60000);
    return () => window.clearInterval(timer);
  }, [refresh, userId]);

  const updatePref = useCallback(
    async (key, value) => {
      const next = { ...prefs, [key]: value };
      setPrefs(next);
      if (!userId) return;
      try {
        await updateNotificationPrefsApi(next);
      } catch {
        refresh();
      }
    },
    [prefs, userId, refresh]
  );

  const markAsRead = useCallback(
    async (id) => {
      setFeed((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item))
      );
      setUnreadCount((count) => Math.max(0, count - 1));
      if (!userId) return;
      try {
        await markNotificationsReadApi({ ids: [id] });
      } catch {
        refresh();
      }
    },
    [userId, refresh]
  );

  const markAllRead = useCallback(
    async (ids) => {
      setFeed((prev) => prev.map((item) => (ids.includes(item.id) ? { ...item, read: true } : item)));
      setUnreadCount(0);
      if (!userId) return;
      try {
        if (ids.length) await markNotificationsReadApi({ ids });
        else await markNotificationsReadApi({ all: true });
      } catch {
        refresh();
      }
    },
    [userId, refresh]
  );

  const clearAll = useCallback(
    async (ids) => {
      setFeed((prev) => prev.filter((item) => !ids.includes(item.id)));
      setUnreadCount(0);
      if (!userId) return;
      try {
        if (ids.length) await dismissNotificationsApi({ ids });
        else await dismissNotificationsApi({ all: true });
      } catch {
        refresh();
      }
    },
    [userId, refresh]
  );

  const isRead = useCallback((id) => feed.find((item) => item.id === id)?.read ?? true, [feed]);
  const isDismissed = useCallback(() => false, []);

  const value = useMemo(
    () => ({
      prefs,
      feed,
      unreadCount,
      loading,
      refresh,
      updatePref,
      markAsRead,
      markAllRead,
      clearAll,
      isRead,
      isDismissed,
    }),
    [
      prefs,
      feed,
      unreadCount,
      loading,
      refresh,
      updatePref,
      markAsRead,
      markAllRead,
      clearAll,
      isRead,
      isDismissed,
    ]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error("useNotifications must be used within NotificationsProvider");
  return context;
}
