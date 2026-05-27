import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../../context/NotificationsContext";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_OPTIONS,
  formatNotificationTime,
} from "../../data/notifications";
import {
  AccountBtn,
  AccountCard,
  AccountEmptyState,
  AccountSectionHeader,
} from "./AccountUI";

function NotificationIcon({ type }) {
  const base = "account-notification-item__icon";
  if (type === "rating") {
    return (
      <span className={`${base} bg-gold-500/12 text-gold-600`} aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 7.1-1.01L12 2z" />
        </svg>
      </span>
    );
  }
  if (type === "review_approved" || type === "review_rejected") {
    return (
      <span className={`${base} bg-emerald-800/10 text-emerald-800`} aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 7.1-1.01L12 2z" />
        </svg>
      </span>
    );
  }
  if (type === "order_cancelled") {
    return (
      <span className={`${base} bg-red-500/10 text-red-700`} aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </span>
    );
  }
  if (type === "delivery") {
    return (
      <span className={base} aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7V10zM6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
        </svg>
      </span>
    );
  }
  return (
    <span className={base} aria-hidden>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
      </svg>
    </span>
  );
}

export function AccountNotificationsSection() {
  const { prefs, feed: allFeed, updatePref, markAsRead, markAllRead, clearAll, isRead, loading } =
    useNotifications();
  const [category, setCategory] = useState("all");

  const feed = useMemo(() => {
    if (category === "all") return allFeed;
    return allFeed.filter((item) => item.category === category);
  }, [allFeed, category]);

  const unreadCount = feed.filter((item) => !isRead(item.id)).length;

  return (
    <div className="space-y-6">
      <AccountSectionHeader
        title="Notifications"
        description="Order tracking, delivery updates, and reminders to rate your purchases."
        action={
          feed.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              <AccountBtn
                variant="ghost"
                className="account-btn--sm"
                onClick={() => markAllRead(feed.map((f) => f.id))}
              >
                Mark all read
              </AccountBtn>
              <AccountBtn
                variant="ghost"
                className="account-btn--sm"
                onClick={() => clearAll(allFeed.map((f) => f.id))}
              >
                Clear all
              </AccountBtn>
            </div>
          ) : null
        }
      />

      <AccountCard>
        <div className="account-filter-pills">
          {NOTIFICATION_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`account-filter-pill ${category === cat.id ? "account-filter-pill--active" : ""}`}
              onClick={() => setCategory(cat.id)}
            >
              {cat.label}
              {cat.id === "all" && unreadCount > 0 ? ` (${unreadCount})` : ""}
            </button>
          ))}
        </div>

        {loading && feed.length === 0 ? (
          <p className="mt-6 text-center font-body text-sm text-emerald-900/45">Loading notifications…</p>
        ) : feed.length === 0 ? (
          <div className="mt-6">
            <AccountEmptyState
              title="All caught up"
              description="You have no notifications in this category. Order updates will appear here after you shop."
              actionLabel="Browse products"
              actionHref="/products/all"
            />
          </div>
        ) : (
          <ul className="mt-6 space-y-2">
            {feed.map((item) => {
              const unread = !isRead(item.id);
              return (
                <li key={item.id}>
                  <div
                    className={`account-notification-item ${unread ? "account-notification-item--unread" : ""}`}
                  >
                    <NotificationIcon type={item.type} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="font-body text-sm font-medium text-emerald-900">{item.title}</p>
                        <time className="shrink-0 font-body text-[11px] text-emerald-900/35" dateTime={item.at}>
                          {formatNotificationTime(item.at)}
                        </time>
                      </div>
                      <p className="mt-1 font-body text-xs leading-relaxed text-emerald-900/50">{item.message}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        {item.actionHref ? (
                          <Link
                            to={item.actionHref}
                            className="font-body text-xs font-medium text-emerald-800/75 underline-offset-2 hover:underline"
                            onClick={() => markAsRead(item.id)}
                          >
                            {item.actionLabel}
                          </Link>
                        ) : null}
                        {unread ? (
                          <button
                            type="button"
                            className="font-body text-xs text-emerald-900/40 hover:text-emerald-900/65"
                            onClick={() => markAsRead(item.id)}
                          >
                            Mark as read
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </AccountCard>

      <AccountCard>
        <h3 className="font-display text-lg text-emerald-900">Notification preferences</h3>
        <p className="mt-1.5 font-body text-sm text-emerald-900/45">
          Choose which updates you would like to receive.
        </p>

        <ul className="mt-6 divide-y divide-cream-200/70">
          {NOTIFICATION_OPTIONS.map((option) => (
            <li key={option.id} className="flex items-start justify-between gap-4 py-5 first:pt-0 last:pb-0">
              <div>
                <p className="font-body text-sm font-medium text-emerald-900">{option.label}</p>
                <p className="mt-1 font-body text-xs leading-relaxed text-emerald-900/45">{option.description}</p>
              </div>
              <label className="account-toggle relative inline-flex shrink-0 cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={Boolean(prefs[option.id])}
                  onChange={(e) => updatePref(option.id, e.target.checked)}
                />
                <span className="h-7 w-12 rounded-full bg-cream-200 transition-colors peer-checked:bg-emerald-800/85 peer-focus-visible:ring-2 peer-focus-visible:ring-gold-400/35" />
                <span className="absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform peer-checked:translate-x-5" />
              </label>
            </li>
          ))}
        </ul>
      </AccountCard>
    </div>
  );
}
