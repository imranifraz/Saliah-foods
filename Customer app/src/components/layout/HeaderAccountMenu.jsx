import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { AccountProfileAvatar } from "../account/AccountProfileAvatar";

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function HeaderAccountMenu({ onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;

    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    const onPointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  const handleSignOut = () => {
    logout();
    close();
    onNavigate?.();
    navigate("/");
  };

  return (
    <div className="relative hidden sm:block" ref={menuRef}>
      <button
        type="button"
        className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 ${
          open ? "bg-emerald-900/10 text-emerald-900" : "bg-emerald-900/5 text-emerald-900 hover:bg-emerald-900/10"
        }`}
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        {user?.avatarUrl ? (
          <AccountProfileAvatar name={user.fullName} avatarUrl={user.avatarUrl} size="sm" />
        ) : (
          <IconUser />
        )}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            aria-label="Account"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="header-account-menu absolute right-0 top-[calc(100%+0.5rem)] z-[60] min-w-[12.5rem] overflow-hidden rounded-xl border border-cream-200/90 bg-white/95 p-1.5 shadow-[0_8px_32px_rgba(22,49,42,0.12)] backdrop-blur-md"
          >
            <div className="header-account-menu__profile border-b border-cream-200/80 px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <AccountProfileAvatar name={user?.fullName} avatarUrl={user?.avatarUrl} size="sm" />
                <div className="min-w-0">
                  <p className="truncate font-body text-sm font-medium text-emerald-900">
                    {user?.fullName || "Your account"}
                  </p>
                  <p className="truncate font-body text-[11px] text-emerald-900/45">{user?.email}</p>
                </div>
              </div>
            </div>

            <Link
              to="/account"
              role="menuitem"
              className="header-account-menu__item"
              onClick={() => {
                close();
                onNavigate?.();
              }}
            >
              Profile
            </Link>

            <Link
              to="/account?tab=notifications"
              role="menuitem"
              className="header-account-menu__item"
              onClick={() => {
                close();
                onNavigate?.();
              }}
            >
              Notifications
            </Link>

            <button type="button" role="menuitem" className="header-account-menu__item header-account-menu__item--danger w-full text-left" onClick={handleSignOut}>
              Sign out
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
