import { useEffect } from "react";

function IconClose() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function AdminModalLayout({
  open,
  title,
  subtitle,
  titleId,
  onClose,
  children,
  footer,
  maxWidthClass = "max-w-md",
  maxHeightClass = "sm:max-h-[min(36rem,calc(100dvh-2rem))]",
}) {
  useEffect(() => {
    if (!open) return undefined;

    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function handleBackdropPointer(event) {
    if (event.target === event.currentTarget) onClose();
  }

  return (
    <div
      className="admin-modal fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={handleBackdropPointer}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-black/60"
      />
      <div
        className={`admin-modal__panel admin-card relative z-10 flex max-h-[100dvh] w-full ${maxWidthClass} flex-col overflow-hidden rounded-t-2xl ${maxHeightClass} sm:rounded-2xl`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--admin-border)] px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <h2 id={titleId} className="font-display text-lg font-semibold text-[var(--admin-fg)]">
              {title}
            </h2>
            {subtitle ? <p className="admin-muted mt-1 text-sm">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-[var(--admin-fg-muted)] transition hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]"
            aria-label="Close"
            onClick={onClose}
          >
            <IconClose />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">{children}</div>
        {footer ? (
          <div className="shrink-0 border-t border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3 sm:px-5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
