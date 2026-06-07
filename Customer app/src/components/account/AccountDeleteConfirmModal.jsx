import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AccountAlert, AccountBtn } from "./AccountUI";

export function AccountDeleteConfirmModal({ open, error, deleting = false, onConfirm, onCancel }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") onCancel?.();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="order-success-overlay"
          role="presentation"
          initial={reduce ? false : { opacity: 0 }}
          animate={reduce ? undefined : { opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button
            type="button"
            className="order-success-overlay__backdrop"
            aria-label="Close"
            onClick={onCancel}
          />

          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="account-delete-modal-title"
            aria-describedby="account-delete-modal-desc"
            className="account-delete-modal"
            initial={reduce ? false : { opacity: 0, scale: 0.92, y: 24 }}
            animate={reduce ? undefined : { opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="account-delete-modal__icon" aria-hidden>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
                <path
                  d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2 id="account-delete-modal-title" className="account-delete-modal__title">
              Delete your account?
            </h2>
            <p id="account-delete-modal-desc" className="account-delete-modal__desc">
              You will be signed out and all account data on this device will be permanently removed. This
              cannot be undone.
            </p>

            {error ? (
              <div className="account-delete-modal__error">
                <AccountAlert type="error">{error}</AccountAlert>
              </div>
            ) : null}

            <div className="account-delete-modal__actions">
              <AccountBtn
                variant="danger"
                className="account-btn--sm w-full sm:w-auto"
                onClick={onConfirm}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Yes, delete my account"}
              </AccountBtn>
              <AccountBtn
                variant="ghost"
                className="account-btn--sm w-full sm:w-auto"
                onClick={onCancel}
                disabled={deleting}
              >
                Cancel
              </AccountBtn>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
