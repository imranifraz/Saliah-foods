import { useState } from "react";
import { apiFetch } from "../lib/api.js";
import { formatPhoneDisplay } from "../lib/phone.js";
import { resolveAdminMediaUrl } from "../lib/mediaUrl.js";
import { generateSecurePassword } from "../lib/password.js";
import { ConfirmDialog } from "./ConfirmDialog.jsx";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function DetailField({ label, value }) {
  return (
    <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-3">
      <p className="admin-caption">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[var(--admin-fg)]">{value || "—"}</p>
    </div>
  );
}

function ProfileAvatar({ name, avatarUrl }) {
  const initials = (name ?? "A")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const src = avatarUrl ? resolveAdminMediaUrl(avatarUrl) : "";

  if (src) {
    return <img src={src} alt="" className="admin-profile-avatar h-16 w-16 rounded-full object-cover" />;
  }

  return (
    <span className="admin-profile-avatar flex h-16 w-16 items-center justify-center rounded-full font-display text-xl font-semibold text-white">
      {initials}
    </span>
  );
}

function PasswordVisibilityToggle({ visible, onToggle }) {
  return (
    <button
      type="button"
      className="admin-password-field__toggle"
      onClick={onToggle}
      aria-label={visible ? "Hide password" : "Show password"}
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

export function ViewAdminPanel({ admin, isSelf, onEdit, onClose }) {
  const [resetPassword, setResetPassword] = useState("");
  const [resetPasswordVisible, setResetPasswordVisible] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [passwordResetDone, setPasswordResetDone] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [error, setError] = useState("");

  async function handleResetPassword() {
    setError("");
    setResettingPassword(true);

    try {
      await apiFetch(`/api/admin/admins/${admin.id}/password`, {
        method: "PATCH",
        body: JSON.stringify({ password: resetPassword }),
      });
      setResetPassword("");
      setResetPasswordVisible(false);
      setResetPasswordDialogOpen(false);
      setPasswordResetDone(true);
    } catch (err) {
      setError(err.message);
      setResetPasswordDialogOpen(false);
    } finally {
      setResettingPassword(false);
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="flex items-center gap-4 border-b border-[var(--admin-border)] pb-4">
        <ProfileAvatar name={admin.fullName} avatarUrl={admin.avatarUrl} />
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold text-[var(--admin-fg)]">{admin.fullName}</p>
          <p className="admin-muted truncate text-sm">{admin.email}</p>
          {isSelf ? (
            <span className="mt-1 inline-flex rounded-md border border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--admin-tab-active-fg)]">
              You
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DetailField label="Full name" value={admin.fullName} />
        <DetailField label="Email" value={admin.email} />
        <DetailField label="Phone" value={formatPhoneDisplay(admin.phone)} />
        <DetailField label="Role" value="Administrator" />
        <DetailField label="Joined" value={formatDate(admin.createdAt)} />
        <DetailField label="Last updated" value={formatDate(admin.updatedAt)} />
      </div>

      {admin.profileNote ? <DetailField label="Profile note" value={admin.profileNote} /> : null}

      {!isSelf ? (
        <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-4">
          <p className="admin-label">Reset password</p>
          {passwordResetDone ? (
            <p className="mt-2 text-sm text-[var(--admin-success)]">
              Password reset. {admin.fullName} must sign in with the new password.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              <p className="admin-muted text-xs leading-relaxed">
                Signs the admin out of all active sessions. Share the new password securely.
              </p>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-fg-muted)]">
                  New password
                </span>
                <button
                  type="button"
                  className="admin-login-card__forgot-link text-xs"
                  onClick={() => {
                    setResetPassword(generateSecurePassword());
                    setResetPasswordVisible(true);
                  }}
                >
                  Generate
                </button>
              </div>
              <div className="admin-password-field">
                <input
                  type={resetPasswordVisible ? "text" : "password"}
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  className="admin-input w-full"
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                />
                <PasswordVisibilityToggle
                  visible={resetPasswordVisible}
                  onToggle={() => setResetPasswordVisible((current) => !current)}
                />
              </div>
              <button
                type="button"
                className="btn-secondary w-full text-sm"
                disabled={resettingPassword || !resetPassword.trim()}
                onClick={() => setResetPasswordDialogOpen(true)}
              >
                Reset password
              </button>
            </div>
          )}
        </div>
      ) : null}

      <div className="sticky bottom-0 -mx-4 flex flex-col-reverse gap-2 border-t border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 pb-1 pt-3 sm:-mx-5 sm:flex-row sm:justify-end sm:px-5 sm:pb-0">
        <button type="button" onClick={onClose} className="btn-ghost w-full sm:w-auto">
          Close
        </button>
        <button type="button" onClick={onEdit} className="btn-primary w-full sm:w-auto">
          Edit admin
        </button>
      </div>

      <ConfirmDialog
        open={resetPasswordDialogOpen}
        title="Reset password?"
        description={`Set a new password for "${admin.fullName}"? They will be signed out of all active sessions.`}
        confirmLabel="Reset password"
        cancelLabel="Cancel"
        loading={resettingPassword}
        onClose={() => {
          if (!resettingPassword) setResetPasswordDialogOpen(false);
        }}
        onConfirm={handleResetPassword}
      />
    </div>
  );
}
