import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useAdminTheme } from "../context/AdminThemeContext.jsx";
import { adminMenuGroups } from "../config/adminMenu.js";
import { AdminLogo } from "./AdminLogo.jsx";
import { AdminNotificationsBell } from "./AdminNotificationsBell.jsx";
import { AdminThemeToggle } from "./AdminThemeToggle.jsx";

function MenuIcon({ open }) {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      )}
    </svg>
  );
}

function IconGrid() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
      />
    </svg>
  );
}

function UserAvatar({ name }) {
  const initials = (name ?? "A")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--admin-tab-active-border)] bg-[var(--admin-surface-2)] text-xs font-bold text-[var(--admin-link)]">
      {initials}
    </span>
  );
}

export function AdminLayout() {
  const { user, logout } = useAuth();
  const { theme } = useAdminTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  const sidebarContent = (
    <>
      <div className="border-b border-[var(--admin-border)] px-5 py-5">
        <Link to="/" className="block" onClick={closeSidebar}>
          <AdminLogo size="sidebar" showTagline variant="dark" />
        </Link>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {adminMenuGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="admin-caption mb-2 px-3">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg border-l-2 py-2.5 pl-2.5 pr-3 text-sm font-semibold transition ${
                        isActive
                          ? "border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] text-[var(--admin-tab-active-fg)]"
                          : "border-transparent text-[var(--admin-tab-fg)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]"
                      }`
                    }
                  >
                    <Icon />
                    <span className="leading-snug">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-[var(--admin-border)] p-4">
        <div className="flex items-center gap-3 rounded-xl bg-[var(--admin-surface-2)] px-3 py-3">
          <UserAvatar name={user?.fullName} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[var(--admin-fg)]">{user?.fullName ?? "Admin"}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-link)]">Superuser</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 w-full rounded-lg border border-[var(--admin-border-strong)] py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--admin-fg-muted)] transition hover:border-[var(--admin-tab-active-border)] hover:text-[var(--admin-link)]"
        >
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="admin-shell" data-admin-theme={theme}>
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={closeSidebar}
        />
      ) : null}

      <aside
        className={`admin-sidebar fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col transition-transform duration-200 lg:z-30 lg:w-64 lg:max-w-none lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      <div className="fixed right-4 top-4 z-20 flex items-center gap-2 lg:hidden">
        <AdminThemeToggle className="admin-theme-toggle" />
        <button
          type="button"
          aria-label="Open menu"
          className="rounded-lg border border-[var(--admin-border-strong)] bg-[var(--admin-surface)] p-2 text-[var(--admin-fg)]"
          onClick={() => setSidebarOpen(true)}
        >
          <MenuIcon open={sidebarOpen} />
        </button>
      </div>

      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="admin-header sticky top-0 z-20 hidden lg:block">
          <div className="flex h-14 items-center gap-4 px-8">
            <AdminThemeToggle className="admin-theme-toggle shrink-0" />
            <div className="flex flex-1 justify-center px-4">
              <label className="relative w-full max-w-md">
                <span className="sr-only">Search</span>
                <input
                  type="search"
                  placeholder="Search analytics or orders…"
                  className="admin-input h-10 w-full rounded-full py-0 pl-4 pr-10 text-sm"
                />
              </label>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <AdminNotificationsBell />
              <button
                type="button"
                className="rounded-lg p-2 text-[var(--admin-fg-muted)] transition hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]"
                aria-label="Apps"
              >
                <IconGrid />
              </button>
              <UserAvatar name={user?.fullName} />
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 pt-16 lg:px-8 lg:py-8 lg:pt-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
