import { useEffect, useState } from "react";
import { ChangePasswordForm } from "./ChangePasswordForm.jsx";
import { ForgotPasswordForm } from "./ForgotPasswordForm.jsx";

function IconClose() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function ChangePasswordModal({ open, onClose, defaultEmail = "", lockEmail = false }) {
  const [view, setView] = useState("change");

  useEffect(() => {
    if (!open) return undefined;

    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setView("change");
  }, [open]);

  if (!open) return null;

  const isForgotView = view === "forgot";

  return (
    <div className="admin-modal fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        className="admin-modal__panel admin-card relative z-10 w-full max-w-md overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--admin-border)] px-5 py-4">
          <div className="min-w-0">
            <h2 id="change-password-title" className="font-display text-lg font-semibold text-[var(--admin-fg)]">
              {isForgotView ? "Reset password" : "Change password"}
            </h2>
            <p className="admin-muted mt-1 text-sm">
              {isForgotView
                ? lockEmail && defaultEmail
                  ? `We'll send a verification code to ${defaultEmail}.`
                  : "Enter your admin email to receive a verification code."
                : "All active sessions will be signed out after your password is updated."}
            </p>
            {isForgotView ? (
              <p className="mt-2 text-sm">
                <button
                  type="button"
                  className="admin-login-card__forgot-link"
                  onClick={() => setView("change")}
                >
                  ← Back to change password
                </button>
              </p>
            ) : null}
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
        <div className="p-5">
          {isForgotView ? (
            <ForgotPasswordForm
              key={defaultEmail}
              onCancel={onClose}
              defaultEmail={defaultEmail}
              lockEmail={lockEmail}
            />
          ) : (
            <ChangePasswordForm onCancel={onClose} onForgotPassword={() => setView("forgot")} />
          )}
        </div>
      </div>
    </div>
  );
}
