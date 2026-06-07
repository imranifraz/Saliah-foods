import { useEffect } from "react";

function IconClose() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    if (!open) return undefined;

    function onKeyDown(event) {
      if (event.key === "Escape" && !loading) onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, loading, onClose]);

  if (!open) return null;

  return (
    <div className="admin-modal fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Close dialog"
        disabled={loading}
        onClick={onClose}
      />
      <div
        className="admin-modal__panel admin-card relative z-10 w-full max-w-md overflow-hidden"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--admin-border)] px-5 py-4">
          <div className="min-w-0">
            <h2 id="confirm-dialog-title" className="font-display text-lg font-semibold text-[var(--admin-fg)]">
              {title}
            </h2>
            {description ? (
              <p id="confirm-dialog-description" className="admin-muted mt-1 text-sm leading-relaxed">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-[var(--admin-fg-muted)] transition hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)] disabled:opacity-50"
            aria-label="Close"
            disabled={loading}
            onClick={onClose}
          >
            <IconClose />
          </button>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4">
          <button type="button" className="btn-ghost" disabled={loading} onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={
              danger
                ? "rounded-xl border border-red-300 bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                : "btn-primary"
            }
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
