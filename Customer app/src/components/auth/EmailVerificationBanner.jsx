import { Link } from "react-router-dom";
import { useState } from "react";
import { authErrorBannerClass, authSuccessBannerClass } from "../auth/authFormStyles";

export function EmailVerificationBanner({
  email,
  onResend,
  className = "",
  compact = false,
}) {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  async function handleResend() {
    if (!onResend || status === "sending") return;
    setStatus("sending");
    setMessage("");
    const result = await onResend();
    if (result.ok) {
      setStatus("sent");
      setMessage(result.message ?? "Verification email sent.");
    } else {
      setStatus("error");
      setMessage(result.error ?? "Could not send verification email.");
    }
  }

  const title = compact ? "Verify your email to checkout" : "Verify your email address";

  return (
    <div
      className={`email-verification-banner ${compact ? "email-verification-banner--compact" : ""} ${className}`.trim()}
      role="status"
    >
      <div className="email-verification-banner__icon" aria-hidden>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path
            d="M4 7h16v10H4zM4 7l8 6 8-6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="email-verification-banner__body">
        <div className="email-verification-banner__content">
          <p className="email-verification-banner__eyebrow">Action required</p>
          <h2 className="email-verification-banner__title">{title}</h2>
          <p className="email-verification-banner__desc">
            {compact ? (
              <>
                We sent a verification link to your inbox. Checkout is available once your email is
                confirmed.
              </>
            ) : (
              <>
                We sent a verification link to your inbox. You can browse and update your profile now,
                but checkout requires a verified email.
              </>
            )}
          </p>
          {email ? (
            <p className="email-verification-banner__email">
              <span className="email-verification-banner__email-label">Sent to</span>
              <span className="email-verification-banner__email-value">{email}</span>
            </p>
          ) : null}
        </div>

        <div className="email-verification-banner__actions">
          <button
            type="button"
            onClick={handleResend}
            disabled={status === "sending"}
            className="email-verification-banner__btn email-verification-banner__btn--primary"
          >
            {status === "sending" ? "Sending…" : "Resend email"}
          </button>
          <Link to="/verify-email" className="email-verification-banner__btn email-verification-banner__btn--ghost">
            Verification help
          </Link>
        </div>

        {message ? (
          <p
            className={`email-verification-banner__feedback ${status === "error" ? authErrorBannerClass : authSuccessBannerClass}`}
            role={status === "error" ? "alert" : "status"}
          >
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
