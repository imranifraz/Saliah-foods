import { useState } from "react";

const TAB_ICONS = {
  personal: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
    </svg>
  ),
  password: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  ),
  orders: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M6 6h15l-1.5 9h-12zM9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM18 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
    </svg>
  ),
  addresses: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11zM12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    </svg>
  ),
  wishlist: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
  notifications: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
};

export function AccountSidebar({ tabs, activeTab, onSelect, wishlistCount }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  return (
    <>
      <div className="account-nav-mobile lg:hidden">
        <label className="account-label" htmlFor="account-nav-select">
          Account section
        </label>
        <select
          id="account-nav-select"
          className="account-input account-select mt-1.5"
          value={activeTab}
          onChange={(e) => onSelect(e.target.value)}
        >
          {tabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
              {tab.id === "wishlist" && wishlistCount > 0 ? ` (${wishlistCount})` : ""}
            </option>
          ))}
        </select>
      </div>

      <nav className="account-sidebar hidden lg:block" aria-label="Account sections">
        <p className="account-sidebar__label">Your account</p>
        <ul className="account-sidebar__list">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <li key={tab.id}>
                <button
                  type="button"
                  className={`account-sidebar__item ${isActive ? "account-sidebar__item--active" : ""}`}
                  onClick={() => onSelect(tab.id)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="account-sidebar__icon">{TAB_ICONS[tab.id]}</span>
                  <span className="account-sidebar__text">{tab.label}</span>
                  {tab.id === "wishlist" && wishlistCount > 0 ? (
                    <span className="account-sidebar__count">{wishlistCount}</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <button
        type="button"
        className="account-nav-drawer-trigger hidden"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((v) => !v)}
      >
        {active.label}
      </button>
    </>
  );
}
