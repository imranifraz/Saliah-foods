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
} from "./AccountUI";

function NotificationIcon({ type }) {
  const base = "account-notification-item__icon";
  if (type === "rating") {
    return (
      <span className={`${base} account-notification-item__icon--gold`} aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 7.1-1.01L12 2z" />
        </svg>
      </span>
    );
  }
  if (type === "review_approved" || type === "review_rejected") {
    return (
      <span className={`${base} account-notification-item__icon--emerald`} aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 7.1-1.01L12 2z" />
        </svg>
      </span>
    );
  }
  if (type === "order_cancelled") {
    return (
      <span className={`${base} account-notification-item__icon--danger`} aria-hidden>
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
    <div className="account-notifications-section space-y-6 md:space-y-7">
      {feed.length > 0 ? (
        <div className="flex flex-wrap justify-end gap-2">
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
      ) : null}

      <AccountCard className="account-notifications-card">
        <div className="account-filter-pills" role="tablist" aria-label="Filter notifications">
          {NOTIFICATION_CATEGORIES.map((cat) => {
            const isActive = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`account-filter-pill ${isActive ? "account-filter-pill--active" : ""}`}
                onClick={() => setCategory(cat.id)}
              >
                {cat.label}
                {cat.id === "all" && unreadCount > 0 ? ` (${unreadCount})` : ""}
              </button>
            );
          })}
        </div>

        {loading && feed.length === 0 ? (
          <p className="account-notifications-loading">Loading notifications…</p>
        ) : feed.length === 0 ? (
          <div className="account-notifications-empty">
            <AccountEmptyState
              title="All caught up"
              description="You have no notifications in this category. Order updates will appear here after you shop."
              actionLabel="Browse products"
              actionHref="/products"
            />
          </div>
        ) : (
          <ul className="account-notifications-list">
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
                        <p className="account-notification-item__title">{item.title}</p>
                        <time className="account-notification-item__time" dateTime={item.at}>
                          {formatNotificationTime(item.at)}
                        </time>
                      </div>
                      <p className="account-notification-item__message">{item.message}</p>
                      <div className="account-notification-item__actions">
                        {item.actionHref ? (
                          <Link
                            to={item.actionHref}
                            className="account-notification-item__link"
                            onClick={() => markAsRead(item.id)}
                          >
                            {item.actionLabel}
                          </Link>
                        ) : null}
                        {unread ? (
                          <button
                            type="button"
                            className="account-notification-item__mark-read"
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

      <AccountCard className="account-prefs-card">
        <header className="account-prefs-card__header">
          <h3 className="account-prefs-card__title">Notification preferences</h3>
          <p className="account-prefs-card__desc">
            Choose which updates you would like to receive.
          </p>
        </header>

        <ul className="account-prefs-list">
          {NOTIFICATION_OPTIONS.map((option) => (
            <li key={option.id} className="account-prefs-row">
              <div className="account-prefs-row__text">
                <p className="account-prefs-row__label">{option.label}</p>
                <p className="account-prefs-row__desc">{option.description}</p>
              </div>
              <label className="account-toggle">
                <input
                  type="checkbox"
                  className="account-toggle__input"
                  checked={Boolean(prefs[option.id])}
                  onChange={(e) => updatePref(option.id, e.target.checked)}
                />
                <span className="account-toggle__track" aria-hidden />
                <span className="account-toggle__thumb" aria-hidden />
              </label>
            </li>
          ))}
        </ul>
      </AccountCard>
    </div>
  );
}
