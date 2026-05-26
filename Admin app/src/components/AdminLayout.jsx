import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { adminMenuGroups } from "../config/adminMenu.js";
import { AdminLogo } from "./AdminLogo.jsx";

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

export function AdminLayout() {
  const { user, logout } = useAuth();
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
      <div className="border-b border-white/10 px-5 py-5">
        <Link to="/" className="block" onClick={closeSidebar}>
          <AdminLogo size="sidebar" showTagline />
        </Link>
        <div className="gold-line mt-4 opacity-80" />
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {adminMenuGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-gold-300/90">
              {group.label}
            </p>
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
                      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? "bg-white/15 text-white shadow-sm"
                          : "text-cream-50/90 hover:bg-white/10 hover:text-white"
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

      <div className="shrink-0 border-t border-white/10 p-4">
        <div className="rounded-xl bg-white/10 px-3 py-2.5">
          <p className="truncate text-[10px] uppercase tracking-wider text-cream-50/60">Signed in</p>
          <p className="truncate text-sm font-medium text-cream-50">{user?.fullName ?? "Admin"}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 w-full rounded-xl border border-white/25 py-2 text-sm font-medium text-cream-50 transition hover:bg-white/10"
        >
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-cream-50">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-emerald-950/50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-emerald-900 shadow-2xl transition-transform duration-200 lg:z-30 lg:w-64 lg:max-w-none lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "linear-gradient(160deg, #0a1f18 0%, #16312a 45%, #1c5733 100%)",
        }}
      >
        {sidebarContent}
      </aside>

      <button
        type="button"
        aria-label="Open menu"
        className="fixed left-4 top-4 z-20 rounded-lg border border-emerald-900/15 bg-cream-50 p-2 text-emerald-900 shadow-sm lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <MenuIcon open={sidebarOpen} />
      </button>

      <div className="flex min-h-screen flex-col lg:pl-64">
        <main className="flex-1 px-4 pt-14 py-6 lg:px-8 lg:py-8 lg:pt-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
