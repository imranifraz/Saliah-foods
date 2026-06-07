import { useEffect, useState } from "react";
import { requestPasswordResetOtpApi, verifyPasswordResetOtpApi } from "../../services/passwordResetApi.js";
import { validateOtpResetPasswordForm } from "../../data/auth";
import { AccountAlert, AccountBtn, PasswordStrengthBar } from "./AccountUI";
import { AccountPasswordField } from "./AccountPasswordField";

const RESEND_COOLDOWN = 60;

function ResetModalIcon({ variant }) {
  return (
    <div className="account-password-reset-modal__icon" aria-hidden>
      {variant === "verify" ? (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

function EmailChip({ email, label }) {
  return (
    <p className="account-password-reset-email">
      <span className="account-password-reset-email__label">{label}</span>
      <span className="account-password-reset-email__value">{email}</span>
    </p>
  );
}

export function AccountPasswordOtpReset({ email, onCancel, onSuccess, onStepChange }) {
  const [step, setStep] = useState("request");
  const [otp, setOtp] = useState("");
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState(false);

  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const timer = window.setInterval(() => {
      setResendIn((seconds) => (seconds > 0 ? seconds - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendIn]);

  const update = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    setError("");
  };

  async function sendCode(isResend = false) {
    setError("");
    setBusy(true);
    try {
      const data = await requestPasswordResetOtpApi(email);
      setDevOtpHint(Boolean(data.devOtpLogged));
      setCodeSent(true);
      setStep("verify");
      setResendIn(RESEND_COOLDOWN);
      if (!isResend) setOtp("");
    } catch (err) {
      if (err.status === 429 && err.retryAfterSeconds) {
        setResendIn(err.retryAfterSeconds);
      }
      setError(err.message ?? "Could not send verification code");
    } finally {
      setBusy(false);
    }
  }

  async function handleRequest(e) {
    e.preventDefault();
    await sendCode(false);
  }

  async function handleResend() {
    if (resendIn > 0 || busy) return;
    await sendCode(true);
  }

  async function handleVerify(e) {
    e.preventDefault();
    const nextErrors = validateOtpResetPasswordForm({ otp, ...form });
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setError("");
    setBusy(true);
    try {
      const data = await verifyPasswordResetOtpApi({
        email,
        otp: otp.trim(),
        newPassword: form.newPassword,
      });
      onSuccess?.(data.message ?? "Your password has been updated successfully.");
    } catch (err) {
      setError(err.message ?? "Could not reset password");
    } finally {
      setBusy(false);
    }
  }

  if (step === "request") {
    return (
      <div className="account-password-reset-flow">
        <div className="account-password-reset-modal__hero">
          <ResetModalIcon variant="request" />
          <h2 id="account-password-reset-modal-title" className="account-password-reset-modal__title">
            Reset with email code
          </h2>
          <p className="account-password-reset-modal__lead">
            We&apos;ll send a 6-digit verification code so you can set a new password without your current one.
          </p>
        </div>

        <EmailChip email={email} label="Your email" />

        {error ? <AccountAlert type="error">{error}</AccountAlert> : null}

        <div className="account-password-reset-modal__actions">
          <AccountBtn variant="primary" type="button" disabled={busy} onClick={handleRequest}>
            {busy ? "Sending code…" : "Send verification code"}
          </AccountBtn>
          <AccountBtn variant="ghost" type="button" disabled={busy} onClick={onCancel}>
            Cancel
          </AccountBtn>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleVerify} className="account-password-reset-flow">
      <div className="account-password-reset-modal__hero account-password-reset-modal__hero--compact">
        <ResetModalIcon variant="verify" />
        <h2 id="account-password-reset-modal-title" className="account-password-reset-modal__title">
          Enter verification code
        </h2>
        <p className="account-password-reset-modal__lead">
          {codeSent ? "Enter the code from your email, then choose a new password." : "Check your inbox for the 6-digit code."}
        </p>
      </div>

      <EmailChip email={email} label="Sent to" />

      {devOtpHint ? (
        <p className="account-password-reset-dev-hint">
          Development mode: check the backend console for the OTP code.
        </p>
      ) : null}

      {error ? <AccountAlert type="error">{error}</AccountAlert> : null}

      <section className="account-password-reset-section" aria-labelledby="reset-otp-heading">
        <h3 id="reset-otp-heading" className="account-password-reset-section__title">
          Verification code
        </h3>
        <div className="account-password-reset-otp-wrap">
          <input
            id="reset-otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={6}
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
              if (errors.otp) setErrors((prev) => ({ ...prev, otp: undefined }));
              setError("");
            }}
            className={`account-password-reset-otp-input${errors.otp ? " account-password-reset-otp-input--error" : ""}`}
            aria-invalid={Boolean(errors.otp)}
            aria-describedby={errors.otp ? "reset-otp-error" : undefined}
          />
          {errors.otp ? (
            <p id="reset-otp-error" className="account-password-reset-otp-error" role="alert">
              {errors.otp}
            </p>
          ) : null}
        </div>
        <p className="account-password-reset-resend">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            className="account-password-reset-resend__btn"
            disabled={resendIn > 0 || busy}
            onClick={handleResend}
          >
            {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
          </button>
        </p>
      </section>

      <section className="account-password-reset-section" aria-labelledby="reset-password-heading">
        <h3 id="reset-password-heading" className="account-password-reset-section__title">
          New password
        </h3>
        <div className="account-password-reset-fields">
          <div>
            <AccountPasswordField
              id="otpNewPassword"
              label="New password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={form.newPassword}
              onChange={(e) => update("newPassword", e.target.value)}
              error={errors.newPassword}
              hint={!errors.newPassword ? "Use 8+ characters with letters and numbers" : undefined}
            />
            <PasswordStrengthBar password={form.newPassword} />
          </div>

          <AccountPasswordField
            id="otpConfirmPassword"
            label="Confirm new password"
            autoComplete="new-password"
            placeholder="Re-enter your new password"
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            error={errors.confirmPassword}
          />
        </div>
      </section>

      <div className="account-password-reset-modal__actions">
        <AccountBtn variant="primary" type="submit" disabled={busy}>
          {busy ? "Updating password…" : "Reset password"}
        </AccountBtn>
        <AccountBtn variant="ghost" type="button" disabled={busy} onClick={onCancel}>
          Cancel
        </AccountBtn>
      </div>
    </form>
  );
}
