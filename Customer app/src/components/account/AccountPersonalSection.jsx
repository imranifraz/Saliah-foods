import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { validateProfileForm } from "../../data/auth";
import {
  AccountAlert,
  AccountBtn,
  AccountCard,
  AccountField,
  AccountInput,
  AccountSectionHeader,
  AccountTextarea,
} from "./AccountUI";

export function AccountPersonalSection() {
  const navigate = useNavigate();
  const { user, updateProfile, deleteAccount } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    dateOfBirth: user?.dateOfBirth ?? "",
    profileNote: user?.profileNote ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const initials = (form.fullName || "S")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const update = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateProfileForm(form);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setSaving(true);
    const result = await updateProfile(form);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage("Your profile has been updated.");
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    const result = await deleteAccount();
    if (!result.ok) {
      setDeleteError(result.error ?? "Could not delete your account. Please try again.");
      return;
    }
    navigate("/", { replace: true });
  };

  return (
    <div>
      <AccountSectionHeader
        title="Personal details"
        description="Manage your contact information for orders, delivery updates, and account security."
      />

      <div className="account-summary mb-6">
        <div className="flex items-center gap-4">
          <span className="account-summary__avatar" aria-hidden>{initials}</span>
          <div>
            <p className="font-display text-lg text-emerald-900">{form.fullName || "Your profile"}</p>
            <p className="mt-1 font-body text-sm text-emerald-900/50">{form.email}</p>
            {form.phone ? (
              <p className="mt-0.5 font-body text-xs text-emerald-900/40">+91 {form.phone}</p>
            ) : null}
          </div>
        </div>
        <p className="font-body text-[11px] uppercase tracking-[0.14em] text-emerald-900/35">
          Saliah member
        </p>
      </div>

      <AccountCard>
        <form onSubmit={handleSubmit}>
          <div className="account-form-grid">
            <AccountField id="profile-name" label="Full name" error={errors.fullName} className="account-field--full sm:col-span-2">
              <AccountInput
                id="profile-name"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                autoComplete="name"
              />
            </AccountField>

            <AccountField id="profile-email" label="Email address" error={errors.email}>
              <AccountInput
                id="profile-email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                autoComplete="email"
              />
            </AccountField>

            <AccountField id="profile-phone" label="Mobile number" error={errors.phone}>
              <AccountInput
                id="profile-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                autoComplete="tel"
                placeholder="10-digit mobile"
              />
            </AccountField>

            <AccountField id="profile-dob" label="Date of birth" error={errors.dateOfBirth}>
              <AccountInput
                id="profile-dob"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => update("dateOfBirth", e.target.value)}
              />
            </AccountField>

            <AccountField id="profile-note" label="About you (optional)" className="account-field--full sm:col-span-2">
              <AccountTextarea
                id="profile-note"
                value={form.profileNote}
                onChange={(e) => update("profileNote", e.target.value)}
                placeholder="Dietary preferences, gifting notes, or delivery instructions"
                maxLength={280}
              />
            </AccountField>
          </div>

          <div className="mt-6 space-y-3">
            {error ? <AccountAlert type="error">{error}</AccountAlert> : null}
            {message ? <AccountAlert type="success">{message}</AccountAlert> : null}
            <AccountBtn variant="primary" type="submit" className="w-full sm:w-auto">
              Save changes
            </AccountBtn>
          </div>
        </form>
      </AccountCard>

      <AccountCard className="account-danger-zone mt-6">
        <h3 className="font-display text-base text-emerald-900">Delete account</h3>
        <p className="mt-1.5 font-body text-sm leading-relaxed text-emerald-900/50">
          Permanently remove your Saliah account, saved addresses, orders, and wishlist from this device. This cannot
          be undone.
        </p>

        {deleteError ? (
          <div className="mt-4">
            <AccountAlert type="error">{deleteError}</AccountAlert>
          </div>
        ) : null}

        {confirmDelete ? (
          <div className="mt-4 rounded-xl border border-red-100/80 bg-red-50/30 p-4">
            <p className="font-body text-sm text-red-900/75">
              Are you sure? You will be signed out and all account data on this device will be deleted.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <AccountBtn variant="danger" className="account-btn--sm" onClick={handleDeleteAccount}>
                Yes, delete my account
              </AccountBtn>
              <AccountBtn
                variant="ghost"
                className="account-btn--sm"
                onClick={() => {
                  setConfirmDelete(false);
                  setDeleteError("");
                }}
              >
                Cancel
              </AccountBtn>
            </div>
          </div>
        ) : (
          <AccountBtn variant="danger" className="account-btn--sm mt-4" onClick={() => setConfirmDelete(true)}>
            Delete account
          </AccountBtn>
        )}
      </AccountCard>
    </div>
  );
}
