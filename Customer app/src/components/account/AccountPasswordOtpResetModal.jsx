import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AccountPasswordOtpReset } from "./AccountPasswordOtpReset";

function PasswordResetToolbar({ step, onClose }) {
  const current = step === "verify" ? 2 : 1;
  const label = step === "verify" ? "Reset password" : "Send code";

  return (
    <div className="account-password-reset-modal__toolbar">
      <div className="account-password-reset-modal__toolbar-main">
        <p className="account-password-reset-modal__eyebrow">Password reset</p>
        <p className="account-password-reset-step" aria-live="polite">
          <span className="account-password-reset-step__count">Step {current} of 2</span>
          <span className="account-password-reset-step__dot" aria-hidden>
            ·
          </span>
          <span className="account-password-reset-step__label">{label}</span>
        </p>
      </div>
      <button
        type="button"
        className="account-password-reset-modal__close"
        aria-label="Close reset password dialog"
        onClick={onClose}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );
}

export function AccountPasswordOtpResetModal({ open, email, onClose, onSuccess }) {
  const reduce = useReducedMotion();
  const [sessionKey, setSessionKey] = useState(0);
  const [flowStep, setFlowStep] = useState("request");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setSessionKey((key) => key + 1);
      setFlowStep("request");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="order-success-overlay account-password-reset-overlay"
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
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-password-reset-modal-title"
            className="account-password-reset-modal"
            initial={reduce ? false : { opacity: 0, scale: 0.96, y: 16 }}
            animate={reduce ? undefined : { opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            <PasswordResetToolbar step={flowStep} onClose={onClose} />

            <div className="account-password-reset-modal__body">
              <AccountPasswordOtpReset
                key={sessionKey}
                email={email}
                onCancel={onClose}
                onStepChange={setFlowStep}
                onSuccess={(message) => {
                  onSuccess?.(message);
                  onClose?.();
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
