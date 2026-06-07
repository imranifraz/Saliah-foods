import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { validateChangePasswordForm } from "../../data/auth";
import { AccountAlert, AccountBtn, AccountCard, PasswordStrengthBar } from "./AccountUI";
import { AccountPasswordField } from "./AccountPasswordField";
import { AccountPasswordOtpResetModal } from "./AccountPasswordOtpResetModal";

export function AccountPasswordSection() {
  const { user, hasPassword, changePassword, markPasswordUpdated } = useAuth();
  const socialOnly = !hasPassword;
  const [otpModalOpen, setOtpModalOpen] = useState(false);

  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateChangePasswordForm(form, hasPassword);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setSaving(true);
    const result = await changePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setMessage(
      socialOnly
        ? "Password set. You can now sign in with your email and password."
        : "Your password has been updated successfully."
    );
  };

  const handleOtpSuccess = (successMessage) => {
    markPasswordUpdated();
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setErrors({});
    setError("");
    setMessage(successMessage);
  };

  return (
    <div className="account-section">
      <AccountCard>
        <form onSubmit={handleSubmit} className="space-y-5">
          {hasPassword ? (
            <div>
              <AccountPasswordField
                id="currentPassword"
                label="Current password"
                autoComplete="current-password"
                placeholder="Enter your current password"
                value={form.currentPassword}
                onChange={(e) => update("currentPassword", e.target.value)}
                error={errors.currentPassword}
              />
              <p className="mt-2 text-right">
                <button
                  type="button"
                  className="font-body text-sm font-medium text-emerald-800/80 underline-offset-2 transition hover:text-emerald-900 hover:underline"
                  onClick={() => {
                    setOtpModalOpen(true);
                    setMessage("");
                    setError("");
                  }}
                >
                  Forgot password?
                </button>
              </p>
            </div>
          ) : null}

          <div className="account-form-grid">
            <div>
              <AccountPasswordField
                id="newPassword"
                label="New password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={form.newPassword}
                onChange={(e) => update("newPassword", e.target.value)}
                error={errors.newPassword}
                hint={!errors.newPassword ? "Use 8+ characters with letters and numbers for best security" : undefined}
              />
              <PasswordStrengthBar password={form.newPassword} />
            </div>

            <AccountPasswordField
              id="confirmPassword"
              label="Confirm new password"
              autoComplete="new-password"
              placeholder="Re-enter your new password"
              value={form.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
              error={errors.confirmPassword}
            />
          </div>

          <div className="space-y-3 pt-1">
            {error ? <AccountAlert type="error">{error}</AccountAlert> : null}
            {message ? <AccountAlert type="success">{message}</AccountAlert> : null}
            <AccountBtn variant="primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : socialOnly ? "Set password" : "Update password"}
            </AccountBtn>
          </div>
        </form>

        <p className="account-security-note">
          Password changes apply immediately to your Saliah account.
          {hasPassword ? (
            <>
              {" "}
              If you forget your current password, use{" "}
              <button
                type="button"
                className="font-medium text-emerald-800/80 underline-offset-2 hover:text-emerald-900 hover:underline"
                onClick={() => {
                  setOtpModalOpen(true);
                  setMessage("");
                  setError("");
                }}
              >
                Forgot password?
              </button>
              .
            </>
          ) : null}
        </p>
      </AccountCard>

      <AccountPasswordOtpResetModal
        open={otpModalOpen}
        email={user?.email ?? ""}
        onClose={() => setOtpModalOpen(false)}
        onSuccess={handleOtpSuccess}
      />
    </div>
  );
}
