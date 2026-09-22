import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useAdminTheme } from "../context/AdminThemeContext.jsx";
import { adminMenuGroups } from "../config/adminMenu.js";
import { AdminAppsLauncher } from "./AdminAppsLauncher.jsx";
import { AdminGlobalSearch } from "./AdminGlobalSearch.jsx";
import { AdminLogo } from "./AdminLogo.jsx";
import { AdminNotificationsBell } from "./AdminNotificationsBell.jsx";
import { AdminThemeToggle } from "./AdminThemeToggle.jsx";
import { AdminRouteBackNav } from "./AdminBackLink.jsx";
import { resolveAdminMediaUrl } from "../lib/mediaUrl.js";

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

function SidebarCollapseIcon({ collapsed }) {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      {collapsed ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5M6.75 19.5l-7.5-7.5 7.5-7.5" />
      )}
    </svg>
  );
}

const SIDEBAR_COLLAPSED_KEY = "saliah-admin-sidebar-collapsed";

function readSidebarCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

function UserAvatar({ name, avatarUrl }) {
  const initials = (name ?? "A")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const src = avatarUrl ? resolveAdminMediaUrl(avatarUrl) : "";

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="h-9 w-9 shrink-0 rounded-full border border-[var(--admin-tab-active-border)] object-cover"
      />
    );
  }

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--admin-tab-active-border)] bg-[var(--admin-surface-2)] text-xs font-bold text-[var(--admin-link)]">
      {initials}
    </span>
  );
}

function formatRoleLabel(role) {
  if (role === "admin") return "Administrator";
  if (!role) return "User";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function IconChevronDown({ open }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-[var(--admin-fg-faint)] transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function HeaderUserProfile({ user }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const displayName = user?.fullName?.trim() || user?.email?.split("@")[0] || "Admin";
  const profilePath = "/account/profile";

  useEffect(() => {
    if (!open) return undefined;

    function onPointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function handleLogout() {
    setOpen(false);
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="relative border-l border-[var(--admin-border)] pl-3" ref={rootRef}>
      <button
        type="button"
        className="admin-header-user flex max-w-[11rem] cursor-pointer items-center gap-2 rounded-lg py-1 pr-1 transition hover:bg-[var(--admin-hover)] xl:max-w-[13rem]"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <UserAvatar name={displayName} avatarUrl={user?.avatarUrl} />
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-semibold leading-tight text-[var(--admin-fg)]">{displayName}</p>
          <p className="mt-0.5 truncate text-[11px] leading-tight text-[var(--admin-fg-muted)]">
            {formatRoleLabel(user?.role)}
          </p>
        </div>
        <IconChevronDown open={open} />
      </button>

      {open ? (
        <div
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-2xl"
          role="menu"
        >
          <div className="border-b border-[var(--admin-border)] px-4 py-3">
            <p className="truncate text-sm font-semibold text-[var(--admin-fg)]">{displayName}</p>
            {user?.email ? (
              <p className="admin-muted mt-0.5 truncate text-xs">{user.email}</p>
            ) : null}
          </div>
          <div className="py-1">
            <Link
              to={profilePath}
              role="menuitem"
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--admin-fg)] transition hover:bg-[var(--admin-hover)]"
              onClick={() => setOpen(false)}
            >
              <svg className="h-4 w-4 shrink-0 text-[var(--admin-fg-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.75 0 3.75 3.75 0 017.75 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              Profile
            </Link>
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-[var(--admin-hover)] dark:text-red-400"
              onClick={handleLogout}
            >
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function AdminLayout() {
  const { user } = useAuth();
  const { theme } = useAdminTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarCollapsed);

  function closeSidebar() {
    setSidebarOpen(false);
  }

  function toggleSidebarCollapsed() {
    setSidebarCollapsed((value) => {
      const next = !value;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        /* ignore storage errors */
      }
      return next;
    });
  }

  const sidebarContent = (
    <>
      <div
        className={`admin-sidebar__brand relative flex shrink-0 items-center gap-2 px-4 py-3 ${
          sidebarCollapsed ? "lg:justify-center lg:px-2" : "justify-between"
        }`}
      >
        <div className="admin-sidebar__brand-glow pointer-events-none absolute inset-0" aria-hidden />
        <Link
          to="/"
          className={`admin-sidebar__brand-link relative z-10 min-w-0 shrink ${
            sidebarCollapsed ? "lg:shrink-0" : "flex-1"
          }`}
          onClick={closeSidebar}
          title="Saliah Foods home"
        >
          <AdminLogo
            size="sidebar"
            variant="brand"
            className={`items-center ${sidebarCollapsed ? "lg:hidden" : ""}`}
          />
          {sidebarCollapsed ? (
            <AdminLogo size="icon" variant="brand" className="hidden items-center lg:flex" />
          ) : null}
        </Link>
        <button
          type="button"
          className="admin-sidebar__collapse relative z-10 hidden shrink-0 rounded-lg border border-[var(--admin-border)] p-2 text-[var(--admin-fg-muted)] transition hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)] lg:inline-flex"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!sidebarCollapsed}
          onClick={toggleSidebarCollapsed}
        >
          <SidebarCollapseIcon collapsed={sidebarCollapsed} />
        </button>
      </div>

      <nav
        className={`admin-sidebar__nav min-h-0 flex-1 overflow-y-auto py-5 ${
          sidebarCollapsed ? "px-2 lg:px-2" : "px-3"
        }`}
      >
        {adminMenuGroups.map((group) => (
          <div
            key={group.label}
            className={`admin-sidebar__group mb-5 last:mb-2 ${sidebarCollapsed ? "lg:mb-3" : ""}`}
          >
            <p
              className={`admin-caption admin-sidebar__caption mb-2.5 px-3 ${
                sidebarCollapsed ? "lg:sr-only" : ""
              }`}
            >
              {group.label}
            </p>
            {sidebarCollapsed ? (
              <div className="admin-sidebar__group-divider mx-auto mb-2 hidden h-px w-8 bg-[var(--admin-border)] lg:block" aria-hidden />
            ) : null}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    title={item.label}
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                      `admin-sidebar__link flex items-center gap-3 rounded-xl border-l-2 py-2.5 text-sm font-semibold transition ${
                        sidebarCollapsed
                          ? "lg:justify-center lg:border-l-0 lg:px-2 lg:py-2.5"
                          : "pl-2.5 pr-3"
                      } ${
                        isActive
                          ? "admin-sidebar__link--active border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] text-[var(--admin-tab-active-fg)]"
                          : "border-transparent text-[var(--admin-tab-fg)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]"
                      }`
                    }
                  >
                    <span className="admin-sidebar__link-icon shrink-0">
                      <Icon />
                    </span>
                    <span className={`admin-sidebar__link-label leading-snug ${sidebarCollapsed ? "lg:hidden" : ""}`}>
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </>
  );

  return (
    <div
      className={`admin-shell${sidebarCollapsed ? " admin-shell--sidebar-collapsed" : ""}`}
      data-admin-theme={theme}
      data-sidebar-collapsed={sidebarCollapsed ? "true" : "false"}
    >
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={closeSidebar}
        />
      ) : null}

      <aside
        className={`admin-sidebar fixed inset-y-0 left-0 z-50 flex w-80 max-w-[88vw] flex-col transition-[transform,width] duration-200 lg:z-30 lg:max-w-none lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${sidebarCollapsed ? "lg:w-[4.75rem]" : "lg:w-72"}`}
      >
        {sidebarContent}
      </aside>


      <div
        className={`flex min-h-screen flex-col transition-[padding] duration-200 ${
          sidebarCollapsed ? "lg:pl-[4.75rem]" : "lg:pl-72"
        }`}
      >
        <header className="admin-header sticky top-0 z-20 md:hidden">
          <div className="flex min-h-14 items-center justify-between gap-3 px-4 py-2">
            <Link to="/" className="min-w-0 shrink" onClick={closeSidebar}>
              <AdminLogo size="sidebar" variant="brandNative" className="items-center" />
            </Link>
            <div className="flex shrink-0 items-center gap-2">
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
          </div>
        </header>

        <header className="admin-header sticky top-0 z-20 hidden overflow-visible md:block">
          <div className="flex min-h-14 items-center gap-4 px-4 py-2 md:px-6 lg:px-8">
            <AdminGlobalSearch />

            <div className="flex flex-1" aria-hidden />

            <div className="flex shrink-0 items-center gap-2">
              <AdminNotificationsBell />
              <AdminThemeToggle iconOnly />
              <AdminAppsLauncher />
              <HeaderUserProfile user={user} />
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-6 md:py-8 lg:px-8">
          <AdminRouteBackNav />
          <Outlet />
        </main>
      </div>
    </div>
  );
}

