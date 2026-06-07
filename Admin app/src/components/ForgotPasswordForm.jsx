import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestAdminPasswordResetOtp, verifyAdminPasswordResetOtp } from "../lib/forgotPasswordApi.js";
import { clearAuthSession, validatePasswordStrength } from "../lib/api.js";

const RESEND_COOLDOWN = 60;

function PasswordVisibilityToggle({ visible, onToggle, fieldLabel }) {
  return (
    <button
      type="button"
      className="admin-password-field__toggle"
      onClick={onToggle}
      aria-label={visible ? `Hide ${fieldLabel}` : `Show ${fieldLabel}`}
      aria-pressed={visible}
    >
      {visible ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )}
    </button>
  );
}

function PasswordField({ label, fieldLabel, value, onChange, autoComplete, placeholder, minLength }) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <span className="admin-label">{label}</span>
      <div className="admin-password-field mt-1.5">
        <input
          type={visible ? "text" : "password"}
          required
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          minLength={minLength}
          placeholder={placeholder}
          className="admin-input w-full"
        />
        <PasswordVisibilityToggle
          visible={visible}
          onToggle={() => setVisible((current) => !current)}
          fieldLabel={fieldLabel}
        />
      </div>
    </label>
  );
}

export function ForgotPasswordForm({
  onCancel,
  showCancel = true,
  defaultEmail = "",
  lockEmail = false,
  onSuccessRedirect = true,
}) {
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState(false);

  useEffect(() => {
    setEmail(defaultEmail);
  }, [defaultEmail]);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const timer = window.setInterval(() => {
      setResendIn((seconds) => (seconds > 0 ? seconds - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendIn]);

  async function handleRequestOtp(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    try {
      const data = await requestAdminPasswordResetOtp(email);
      setDevOtpHint(Boolean(data.devOtpLogged));
      setInfo(data.message ?? "Verification code sent.");
      setStep("otp");
      setResendIn(RESEND_COOLDOWN);
      setOtp("");
    } catch (err) {
      if (err.status === 429 && err.retryAfterSeconds) {
        setResendIn(err.retryAfterSeconds);
      }
      setError(err.message ?? "Could not send verification code");
    } finally {
      setBusy(false);
    }
  }

  async function handleResendOtp() {
    if (resendIn > 0 || busy) return;
    setError("");
    setInfo("");
    setBusy(true);
    try {
      const data = await requestAdminPasswordResetOtp(email);
      setDevOtpHint(Boolean(data.devOtpLogged));
      setInfo("A new verification code has been sent.");
      setResendIn(RESEND_COOLDOWN);
      setOtp("");
    } catch (err) {
      if (err.status === 429 && err.retryAfterSeconds) {
        setResendIn(err.retryAfterSeconds);
      }
      setError(err.message ?? "Could not resend verification code");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const policy = validatePasswordStrength(newPassword);
    if (!policy.ok) {
      setError(policy.error);
      return;
    }

    setBusy(true);
    try {
      const data = await verifyAdminPasswordResetOtp({ email, otp, newPassword });
      setInfo(data.message ?? "Password updated.");
      setStep("success");
      clearAuthSession();
      if (onSuccessRedirect) {
        window.setTimeout(() => {
          navigate("/login", { replace: true, state: { passwordUpdated: true } });
        }, 1800);
      }
    } catch (err) {
      setError(err.message ?? "Could not reset password");
    } finally {
      setBusy(false);
    }
  }

  function resetToEmailStep() {
    setStep("email");
    setError("");
    setInfo("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
  }

  if (step === "success") {
    return (
      <div className="space-y-3">
        <p
          className="rounded-lg border border-[var(--admin-success-bg)] bg-[var(--admin-badge-bg)] px-3 py-2 text-sm text-[var(--admin-success)]"
          role="status"
        >
          {info || "Password updated. Redirecting to sign in…"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {info ? (
        <p
          className="rounded-lg border border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] px-3 py-2 text-sm text-[var(--admin-fg-muted)]"
          role="status"
        >
          {info}
          {devOtpHint ? (
            <span className="mt-2 block text-xs text-[var(--admin-fg-faint)]">
              Development mode: check the backend console for the OTP code.
            </span>
          ) : null}
        </p>
      ) : null}

      {step === "email" ? (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <label className="block">
            <span className="admin-label">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly={lockEmail}
              className={`admin-input mt-1.5 w-full${lockEmail ? " cursor-default opacity-90" : ""}`}
              placeholder="admin@saliahfoods.com"
            />
          </label>

          <div className="flex justify-end gap-2 pt-1">
            {showCancel && onCancel ? (
              <button type="button" onClick={onCancel} className="btn-ghost" disabled={busy}>
                Cancel
              </button>
            ) : null}
            <button type="submit" disabled={busy} className="btn-primary">
              {busy ? "Sending code…" : "Send verification code"}
            </button>
          </div>
        </form>
      ) : null}

      {step === "otp" ? (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <label className="block">
            <span className="admin-label">Verification code</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="admin-input mt-1.5 w-full tracking-[0.3em]"
              placeholder="6-digit code"
            />
          </label>

          <PasswordField
            label="New password"
            fieldLabel="new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            placeholder="At least 8 characters with letters and numbers"
          />

          <PasswordField
            label="Confirm password"
            fieldLabel="confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
          />

          <p className="text-center text-sm text-[var(--admin-fg-muted)]">
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              className="font-semibold text-[var(--admin-link)] transition hover:underline disabled:cursor-not-allowed disabled:opacity-60"
              disabled={resendIn > 0 || busy}
              onClick={handleResendOtp}
            >
              {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
            </button>
          </p>

          {!lockEmail ? (
            <p className="text-center text-sm">
              <button
                type="button"
                className="font-semibold text-[var(--admin-link)] transition hover:underline"
                onClick={resetToEmailStep}
              >
                Use a different email
              </button>
            </p>
          ) : null}

          <div className="flex justify-end gap-2 pt-1">
            {showCancel && onCancel ? (
              <button type="button" onClick={onCancel} className="btn-ghost" disabled={busy}>
                Cancel
              </button>
            ) : null}
            <button type="submit" disabled={busy} className="btn-primary">
              {busy ? "Updating password…" : "Reset password"}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
