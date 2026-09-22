import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, clearAuthSession, validatePasswordStrength } from "../lib/api.js";
import { useAdminToast } from "../context/AdminToastContext.jsx";

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

function PasswordField({ label, fieldLabel, value, onChange, autoComplete, placeholder, minLength, labelAction }) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <div className="flex items-center justify-between gap-3">
        <span className="admin-label">{label}</span>
        {labelAction}
      </div>
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

export function ChangePasswordForm({ onCancel, showCancel = true, onForgotPassword }) {
  const toast = useAdminToast();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      toast.error("Could not update password", "New passwords do not match");
      return;
    }

    const policy = validatePasswordStrength(newPassword);
    if (!policy.ok) {
      setError(policy.error);
      toast.error("Could not update password", policy.error);
      return;
    }

    setBusy(true);
    try {
      const data = await apiFetch("/api/admin/auth/password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setSuccess(data.message ?? "Password updated.");
      toast.success("Password updated");
      clearAuthSession();
      window.setTimeout(() => {
        navigate("/login", { replace: true, state: { passwordUpdated: true } });
      }, 1800);
    } catch (err) {
      const message = err.message ?? "Could not update password";
      setError(message);
      toast.error("Could not update password", message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {success ? (
        <p
          className="rounded-lg border border-[var(--admin-success-bg)] bg-[var(--admin-badge-bg)] px-3 py-2 text-sm text-[var(--admin-success)]"
          role="status"
        >
          {success}
        </p>
      ) : null}

      <PasswordField
        label="Current password"
        fieldLabel="current password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        autoComplete="current-password"
        labelAction={
          onForgotPassword ? (
            <button type="button" className="admin-login-card__forgot-link" onClick={onForgotPassword}>
              Forgot password?
            </button>
          ) : null
        }
      />

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
        label="Confirm new password"
        fieldLabel="confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        autoComplete="new-password"
        minLength={8}
      />

      <div className="flex justify-end gap-2 pt-1">
        {showCancel && onCancel ? (
          <button type="button" onClick={onCancel} className="btn-ghost" disabled={busy || Boolean(success)}>
            Cancel
          </button>
        ) : null}
        <button type="submit" disabled={busy || Boolean(success)} className="btn-primary">
          {busy ? "Updating…" : "Update password"}
        </button>
      </div>
    </form>
  );
}
