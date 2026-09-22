import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../../context/NotificationsContext";
import { formatNotificationTime } from "../../data/notifications";

function IconBell() {
  return (
    <svg className="h-[1.15rem] w-[1.15rem]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
      />
    </svg>
  );
}

export function HeaderNotificationsBell({ onNavigate }) {
  const { feed, unreadCount, loading, refresh, markAsRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    refresh();
    const onPointerDown = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, refresh]);

  const visibleFeed = feed.slice(0, 8);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-emerald-900/5 text-emerald-900 transition hover:bg-emerald-900/10"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <IconBell />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-gold-500 px-1 text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="header-notifications absolute right-0 z-[60] mt-2 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-cream-200/90 bg-white/95 shadow-[0_12px_40px_rgba(22,49,42,0.14)] backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 border-b border-cream-200/80 px-4 py-3">
            <p className="font-body text-sm font-semibold text-emerald-950">Notifications</p>
            <div className="flex items-center gap-2">
              {unreadCount > 0 ? (
                <button
                  type="button"
                  className="font-body text-[11px] font-semibold text-emerald-800 hover:underline"
                  onClick={() => markAllRead([])}
                >
                  Mark all read
                </button>
              ) : null}
              <Link
                to="/account?tab=notifications"
                className="font-body text-[11px] font-semibold text-emerald-900/55 hover:text-emerald-900"
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
              >
                View all
              </Link>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && visibleFeed.length === 0 ? (
              <p className="px-4 py-8 text-center font-body text-sm text-emerald-900/45">Loading…</p>
            ) : visibleFeed.length === 0 ? (
              <p className="px-4 py-8 text-center font-body text-sm text-emerald-900/45">
                No notifications yet. Order updates will appear here.
              </p>
            ) : (
              <ul className="divide-y divide-cream-200/80">
                {visibleFeed.map((item) => {
                  const unread = !item.read;
                  return (
                    <li key={item.id} className={`px-4 py-3 ${unread ? "bg-gold-500/5" : ""}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-body text-sm font-semibold text-emerald-950">{item.title}</p>
                        <time className="shrink-0 font-body text-[10px] text-emerald-900/40" dateTime={item.at}>
                          {formatNotificationTime(item.at)}
                        </time>
                      </div>
                      <p className="mt-1 font-body text-xs leading-relaxed text-emerald-900/60">{item.message}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        {item.actionHref ? (
                          <Link
                            to={item.actionHref}
                            className="font-body text-xs font-semibold text-emerald-800 hover:underline"
                            onClick={() => {
                              markAsRead(item.id);
                              setOpen(false);
                              onNavigate?.();
                            }}
                          >
                            {item.actionLabel ?? "Open"}
                          </Link>
                        ) : null}
                        {unread ? (
                          <button
                            type="button"
                            className="font-body text-xs text-emerald-900/45 hover:text-emerald-900"
                            onClick={() => markAsRead(item.id)}
                          >
                            Mark read
                          </button>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
