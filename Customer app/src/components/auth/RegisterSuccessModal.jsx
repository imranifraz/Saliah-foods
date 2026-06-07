import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { authErrorBannerClass, authSuccessBannerClass } from "./authFormStyles";

export function RegisterSuccessModal({
  email,
  message,
  onResend,
  onContinue,
  continueLabel = "Continue",
}) {
  const reduce = useReducedMotion();
  const [status, setStatus] = useState("idle");
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") onContinue?.();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onContinue]);

  async function handleResend() {
    if (!onResend || status === "sending") return;
    setStatus("sending");
    setResendMessage("");
    const result = await onResend();
    if (result.ok) {
      setStatus("sent");
      setResendMessage(result.message ?? "Verification email sent.");
    } else {
      setStatus("error");
      setResendMessage(result.error ?? "Could not send verification email.");
    }
  }

  return (
    <AnimatePresence>
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
          onClick={onContinue}
        />

        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="register-success-title"
          className="order-success-popup"
          initial={reduce ? false : { opacity: 0, scale: 0.92, y: 24 }}
          animate={reduce ? undefined : { opacity: 1, scale: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="order-success-popup__hero">
            <div className="order-success-popup__icon" aria-hidden>
              <svg className="h-9 w-9 text-emerald-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="order-success-popup__eyebrow">Account created</p>
            <h2 id="register-success-title" className="order-success-popup__title">
              Check your email
            </h2>
            <p className="order-success-popup__lead">{message}</p>
          </div>

          <div className="order-success-popup__summary">
            <div className="order-success-popup__row">
              <span className="order-success-popup__label">Sent to</span>
              <span className="order-success-popup__value truncate">{email}</span>
            </div>
            <p className="order-success-popup__gst">
              Open the verification link in your inbox to unlock checkout. You can browse and update your profile until then.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleResend}
                disabled={status === "sending"}
                className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-800 underline-offset-2 hover:underline disabled:opacity-60"
              >
                {status === "sending" ? "Sending…" : "Resend email"}
              </button>
              <Link
                to="/verify-email"
                className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-800/70 underline-offset-2 hover:text-emerald-900 hover:underline"
                onClick={onContinue}
              >
                Need help?
              </Link>
            </div>
            {resendMessage ? (
              <p
                className={`mt-2 ${status === "error" ? authErrorBannerClass : authSuccessBannerClass}`}
                role={status === "error" ? "alert" : "status"}
              >
                {resendMessage}
              </p>
            ) : null}
          </div>

          <div className="order-success-popup__actions">
            <button
              type="button"
              className="order-success-popup__btn order-success-popup__btn--primary"
              onClick={onContinue}
            >
              {continueLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
