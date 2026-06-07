import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthPasswordField } from "./AuthPasswordField";
import {
  authErrorBannerClass,
  authFieldClass,
  authFooterLinkClass,
  authLabelClass,
  authSubmitClass,
  authSuccessBannerClass,
} from "./authFormStyles";
import { PasswordStrengthBar } from "../account/AccountUI";
import { validateOtpResetPasswordForm } from "../../data/auth";
import { requestPasswordResetOtpApi, verifyPasswordResetOtpApi } from "../../services/passwordResetApi.js";

const RESEND_COOLDOWN = 60;

export function ForgotPasswordForm({
  defaultEmail = "",
  lockEmail = false,
  redirectTo = "/login",
  onSuccessRedirect = true,
}) {
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState("");
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
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

  const update = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    setError("");
  };

  async function sendCode() {
    setError("");
    setInfo("");
    setBusy(true);
    try {
      const data = await requestPasswordResetOtpApi(email);
      setDevOtpHint(Boolean(data.devOtpLogged));
      setInfo(data.message ?? "Verification code sent.");
      setStep("verify");
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

  async function handleRequest(e) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Email is required");
      return;
    }
    await sendCode();
  }

  async function handleResend() {
    if (resendIn > 0 || busy) return;
    await sendCode();
  }

  async function handleVerify(e) {
    e.preventDefault();
    const nextErrors = validateOtpResetPasswordForm({ otp, ...form });
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setError("");
    setInfo("");
    setBusy(true);
    try {
      const data = await verifyPasswordResetOtpApi({
        email,
        otp: otp.trim(),
        newPassword: form.newPassword,
      });
      setInfo(data.message ?? "Your password has been updated successfully.");
      setStep("success");
      if (onSuccessRedirect) {
        window.setTimeout(() => {
          navigate(redirectTo, { replace: true, state: { passwordUpdated: true } });
        }, 1800);
      }
    } catch (err) {
      setError(err.message ?? "Could not reset password");
    } finally {
      setBusy(false);
    }
  }

  if (step === "success") {
    return (
      <div className="space-y-4">
        <p className={authSuccessBannerClass} role="status">
          {info || "Password updated. Redirecting to sign in…"}
        </p>
        <p className="text-center font-body text-sm text-emerald-900/50">
          <Link to={redirectTo} className={authFooterLinkClass}>
            Sign in now
          </Link>
        </p>
      </div>
    );
  }

  if (step === "email") {
    return (
      <form onSubmit={handleRequest} className="flex w-full flex-col gap-4" noValidate>
        {error ? (
          <p className={authErrorBannerClass} role="alert">
            {error}
          </p>
        ) : null}

        <div className="w-full">
          <label htmlFor="forgot-email" className={authLabelClass}>
            Email address
          </label>
          <input
            id="forgot-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            className={`${authFieldClass}${lockEmail ? " cursor-default opacity-90" : ""}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            readOnly={lockEmail}
            required
          />
        </div>

        <button type="submit" className={authSubmitClass} disabled={busy}>
          {busy ? "Sending code…" : "Send verification code"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerify} className="flex w-full flex-col gap-4" noValidate>
      {error ? (
        <p className={authErrorBannerClass} role="alert">
          {error}
        </p>
      ) : null}

      {info ? (
        <p className={authSuccessBannerClass} role="status">
          {info}
          {devOtpHint ? (
            <span className="mt-2 block text-xs text-emerald-900/50">
              Development mode: check the backend console for the OTP code.
            </span>
          ) : null}
        </p>
      ) : null}

      <p className="font-body text-sm text-emerald-900/50">
        Enter the 6-digit code sent to{" "}
        <span className="font-medium text-emerald-900/70">{email}</span>.
      </p>

      <div className="w-full">
        <label htmlFor="forgot-otp" className={authLabelClass}>
          Verification code
        </label>
        <input
          id="forgot-otp"
          name="otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="6-digit code"
          maxLength={6}
          className={`${authFieldClass} tracking-[0.3em]`}
          value={otp}
          onChange={(e) => {
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
            if (errors.otp) setErrors((prev) => ({ ...prev, otp: undefined }));
            setError("");
          }}
          aria-invalid={Boolean(errors.otp)}
        />
        {errors.otp ? (
          <p className="mt-1 font-body text-sm text-red-800/90" role="alert">
            {errors.otp}
          </p>
        ) : null}
      </div>

      <div className="w-full">
        <AuthPasswordField
          id="forgot-new-password"
          label="New password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={form.newPassword}
          onChange={(e) => update("newPassword", e.target.value)}
          error={errors.newPassword}
        />
        <PasswordStrengthBar password={form.newPassword} />
      </div>

      <AuthPasswordField
        id="forgot-confirm-password"
        label="Confirm new password"
        autoComplete="new-password"
        placeholder="Re-enter your new password"
        value={form.confirmPassword}
        onChange={(e) => update("confirmPassword", e.target.value)}
        error={errors.confirmPassword}
        className="w-full"
      />

      <p className="font-body text-sm text-emerald-900/50">
        Didn&apos;t receive the code?{" "}
        <button
          type="button"
          className="font-semibold text-emerald-800 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          disabled={resendIn > 0 || busy}
          onClick={handleResend}
        >
          {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
        </button>
      </p>

      {!lockEmail ? (
        <p className="text-center font-body text-sm">
          <button
            type="button"
            className="font-semibold text-emerald-800 underline-offset-2 hover:underline"
            onClick={() => {
              setStep("email");
              setError("");
              setInfo("");
              setOtp("");
              setForm({ newPassword: "", confirmPassword: "" });
            }}
          >
            Use a different email
          </button>
        </p>
      ) : null}

      <button type="submit" className={authSubmitClass} disabled={busy}>
        {busy ? "Updating password…" : "Reset password"}
      </button>
    </form>
  );
}
