import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { validateChangePasswordForm } from "../../data/auth";
import { AccountAlert, AccountBtn, AccountCard, AccountSectionHeader, PasswordStrengthBar } from "./AccountUI";
import { AccountPasswordField } from "./AccountPasswordField";

export function AccountPasswordSection() {
  const { user, hasPassword, changePassword } = useAuth();
  const socialOnly = !hasPassword;

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

  return (
    <div>
      <AccountSectionHeader
        title="Password & security"
        description={
          socialOnly
            ? "Create a password to sign in with email in addition to your social account."
            : "Keep your Saliah account secure with a strong, unique password."
        }
      />

      <AccountCard className="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {hasPassword ? (
            <AccountPasswordField
              id="currentPassword"
              label="Current password"
              autoComplete="current-password"
              value={form.currentPassword}
              onChange={(e) => update("currentPassword", e.target.value)}
              error={errors.currentPassword}
            />
          ) : null}

          <div>
            <AccountPasswordField
              id="newPassword"
              label="New password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={form.newPassword}
              onChange={(e) => update("newPassword", e.target.value)}
              error={errors.newPassword}
              hint={!errors.newPassword ? "Use 10+ characters with letters and numbers for best security" : undefined}
            />
            <PasswordStrengthBar password={form.newPassword} />
          </div>

          <AccountPasswordField
            id="confirmPassword"
            label="Confirm new password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            error={errors.confirmPassword}
          />

          <div className="space-y-3 pt-1">
            {error ? <AccountAlert type="error">{error}</AccountAlert> : null}
            {message ? <AccountAlert type="success">{message}</AccountAlert> : null}
            <AccountBtn variant="primary" type="submit">
              {socialOnly ? "Set password" : "Update password"}
            </AccountBtn>
          </div>
        </form>

        <p className="account-security-note">
          We never store card details on this demo storefront. Password changes apply immediately to your Saliah account.
        </p>
      </AccountCard>
    </div>
  );
}
