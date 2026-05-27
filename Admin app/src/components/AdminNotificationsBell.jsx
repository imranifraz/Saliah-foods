import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  dismissAdminNotificationsApi,
  fetchAdminNotificationsApi,
  markAdminNotificationsReadApi,
} from "../lib/notificationsApi.js";

function formatTime(iso) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 0) {
      return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
    }
    if (diffDays === 1) return "Yesterday";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

export function AdminNotificationsBell() {
  const [open, setOpen] = useState(false);
  const [feed, setFeed] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminNotificationsApi();
      setFeed(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      setFeed([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 60000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  async function handleMarkRead(id) {
    setFeed((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
    setUnreadCount((count) => Math.max(0, count - 1));
    try {
      await markAdminNotificationsReadApi({ ids: [id] });
    } catch {
      refresh();
    }
  }

  async function handleMarkAllRead() {
    setFeed((prev) => prev.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);
    try {
      await markAdminNotificationsReadApi({ all: true });
    } catch {
      refresh();
    }
  }

  async function handleClearAll() {
    const ids = feed.map((item) => item.id);
    setFeed([]);
    setUnreadCount(0);
    try {
      await dismissAdminNotificationsApi({ ids });
    } catch {
      refresh();
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        className="relative rounded-lg p-2 text-[var(--admin-fg-muted)] transition hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--admin-accent)] px-1 text-[10px] font-bold text-[var(--admin-accent-fg)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-2xl">
          <div className="flex items-center justify-between border-b border-[var(--admin-border)] px-4 py-3">
            <p className="text-sm font-semibold text-[var(--admin-fg)]">Notifications</p>
            <div className="flex gap-2">
              {feed.length > 0 ? (
                <>
                  <button
                    type="button"
                    className="admin-link text-[11px]"
                    onClick={handleMarkAllRead}
                  >
                    Mark all read
                  </button>
                  <button
                    type="button"
                    className="text-[11px] font-medium text-[var(--admin-fg-subtle)] hover:text-[var(--admin-fg)]"
                    onClick={handleClearAll}
                  >
                    Clear
                  </button>
                </>
              ) : null}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && feed.length === 0 ? (
              <p className="admin-muted px-4 py-6 text-center text-sm">Loading…</p>
            ) : feed.length === 0 ? (
              <p className="admin-muted px-4 py-6 text-center text-sm">No new notifications</p>
            ) : (
              <ul className="divide-y divide-[var(--admin-border)]">
                {feed.map((item) => (
                  <li
                    key={item.id}
                    className={`px-4 py-3 ${item.read ? "" : "bg-[var(--admin-hover)]"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-[var(--admin-fg)]">{item.title}</p>
                      <time className="admin-subtle shrink-0 text-[10px]">{formatTime(item.at)}</time>
                    </div>
                    <p className="admin-muted mt-1 text-xs leading-relaxed">{item.message}</p>
                    <div className="mt-2 flex items-center gap-3">
                      {item.actionHref ? (
                        <Link
                          to={item.actionHref}
                          className="admin-link text-xs"
                          onClick={() => {
                            handleMarkRead(item.id);
                            setOpen(false);
                          }}
                        >
                          {item.actionLabel ?? "Open"}
                        </Link>
                      ) : null}
                      {!item.read ? (
                        <button
                          type="button"
                          className="text-xs text-[var(--admin-fg-subtle)] hover:text-[var(--admin-fg)]"
                          onClick={() => handleMarkRead(item.id)}
                        >
                          Mark read
                        </button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
