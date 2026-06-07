import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";
import { getAdminAppSections } from "../config/adminApps.js";

function IconGrid() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
      />
    </svg>
  );
}

function AppLink({ item, onNavigate }) {
  const Icon = item.icon;
  const TrailingIcon = item.trailingIcon;
  const content = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] text-[var(--admin-link)]">
        <Icon />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold text-[var(--admin-fg)]">{item.label}</span>
          {TrailingIcon ? (
            <span className="shrink-0 text-[var(--admin-fg-faint)]">
              <TrailingIcon />
            </span>
          ) : null}
        </span>
        <span className="admin-muted mt-0.5 block truncate text-xs">{item.description}</span>
      </span>
    </>
  );

  const className =
    "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-[var(--admin-hover)]";

  if (item.type === "external") {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        role="menuitem"
        onClick={onNavigate}
      >
        {content}
      </a>
    );
  }

  return (
    <NavLink to={item.to} end={item.end} className={className} role="menuitem" onClick={onNavigate}>
      {content}
    </NavLink>
  );
}

function AppsMenuPanel({ sections, style, panelRef, onClose }) {
  return (
    <div
      ref={panelRef}
      style={style}
      className="admin-apps-panel w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-2xl"
      role="menu"
    >
      <div className="admin-apps-panel__header relative overflow-hidden border-b border-[var(--admin-border)] px-4 py-3">
        <div className="relative flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--admin-tab-active-border)] bg-[var(--admin-surface)] text-[var(--admin-link)] shadow-sm">
            <IconGrid />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--admin-fg)]">Quick apps</p>
            <p className="admin-muted mt-0.5 text-xs">Jump to admin pages or the customer site.</p>
          </div>
        </div>
      </div>

      <div className="admin-apps-panel__body max-h-[min(24rem,calc(100vh-8rem))] overflow-y-auto bg-[var(--admin-surface)] p-2">
        {sections.map((section, index) => (
          <div key={section.label} className={index > 0 ? "mt-2 border-t border-[var(--admin-border)] pt-2" : ""}>
            <p className="admin-caption mb-1 px-2">{section.label}</p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <AppLink key={`${section.label}-${item.label}`} item={item} onNavigate={onClose} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getAdminPortalRoot() {
  return document.querySelector(".admin-shell") ?? document.body;
}

export function AdminAppsLauncher() {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const sections = getAdminAppSections();

  function close() {
    setOpen(false);
  }

  function updateMenuPosition() {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    setMenuStyle({
      position: "fixed",
      top: rect.bottom + 8,
      right: Math.max(16, window.innerWidth - rect.right),
      zIndex: 200,
    });
  }

  useLayoutEffect(() => {
    if (!open) return undefined;
    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    function onPointerDown(event) {
      const target = event.target;
      if (buttonRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    }

    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    const timer = window.setTimeout(() => {
      document.addEventListener("mousedown", onPointerDown);
    }, 0);

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={`rounded-lg p-2 transition ${
          open
            ? "bg-[var(--admin-hover)] text-[var(--admin-fg)]"
            : "text-[var(--admin-fg-muted)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]"
        }`}
        aria-label="Apps"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <IconGrid />
      </button>

      {open && menuStyle
        ? createPortal(
            <AppsMenuPanel
              sections={sections}
              style={menuStyle}
              panelRef={panelRef}
              onClose={close}
            />,
            getAdminPortalRoot()
          )
        : null}
    </>
  );
}
