import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { validateProfileForm } from "../../data/auth";
import { uploadProfileAvatarApi } from "../../services/authApi.js";
import { formatMemberSince, formatSignInMethod } from "./accountUtils";
import {
  AccountAlert,
  AccountBtn,
  AccountCard,
  AccountField,
  AccountInput,
  AccountPhoneInput,
} from "./AccountUI";
import { AccountDeleteSection } from "./AccountDeleteSection";
import { AccountProfileAvatar } from "./AccountProfileAvatar";
import { AccountProfilePhotoUpload } from "./AccountProfilePhotoUpload";

function profileFromUser(user) {
  return {
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  };
}

function AccountProfileSummary({ user }) {
  return (
    <div className="account-profile-summary">
      <AccountProfileAvatar name={user?.fullName} avatarUrl={user?.avatarUrl} size="lg" />
      <div className="account-profile-summary__body">
        <p className="account-profile-summary__name">{user?.fullName || "Your profile"}</p>
        {user?.email ? <p className="account-profile-summary__line">{user.email}</p> : null}
        {user?.phone ? <p className="account-profile-summary__line">+91 {user.phone}</p> : null}
      </div>
    </div>
  );
}

function AccountProfileMeta({ user, emailVerified }) {
  return (
    <div className="account-profile-meta">
      <div className="account-profile-meta__item">
        <p className="account-profile-meta__label">Member since</p>
        <p className="account-profile-meta__value">{formatMemberSince(user?.createdAt)}</p>
      </div>
      <div className="account-profile-meta__item">
        <p className="account-profile-meta__label">Email status</p>
        <p className="account-profile-meta__value">
          {emailVerified ? (
            <span className="account-profile-meta__badge account-profile-meta__badge--verified">Verified</span>
          ) : (
            <span className="account-profile-meta__badge account-profile-meta__badge--pending">Not verified</span>
          )}
        </p>
      </div>
      <div className="account-profile-meta__item">
        <p className="account-profile-meta__label">Sign-in method</p>
        <p className="account-profile-meta__value">{formatSignInMethod(user?.provider)}</p>
      </div>
    </div>
  );
}

export function AccountPersonalSection() {
  const { user, updateProfile, emailVerified, hasPassword } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => profileFromUser(user));
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [photoError, setPhotoError] = useState("");

  useEffect(() => {
    if (!editing) {
      setForm(profileFromUser(user));
    }
  }, [user, editing]);

  const update = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    setMessage("");
    setError("");
  };

  const startEdit = () => {
    setForm(profileFromUser(user));
    setErrors({});
    setMessage("");
    setError("");
    setPhotoError("");
    setEditing(true);
  };

  const cancelEdit = () => {
    setForm(profileFromUser(user));
    setErrors({});
    setError("");
    setPhotoError("");
    setEditing(false);
  };

  const handleAvatarUpload = async (file) => {
    setPhotoError("");
    setAvatarUploading(true);
    try {
      const upload = await uploadProfileAvatarApi(file);
      const result = await updateProfile({ avatarUrl: upload.url });
      if (!result.ok) {
        setPhotoError(result.error);
        return;
      }
      setMessage("Profile photo updated.");
    } catch (err) {
      setPhotoError(err.message ?? "Could not upload profile photo");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarRemove = async () => {
    setPhotoError("");
    setAvatarUploading(true);
    try {
      const result = await updateProfile({ avatarUrl: "" });
      if (!result.ok) {
        setPhotoError(result.error);
        return;
      }
      setMessage("Profile photo removed.");
    } catch (err) {
      setPhotoError(err.message ?? "Could not remove profile photo");
    } finally {
      setAvatarUploading(false);
    }
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
    setEditing(false);
  };

  return (
    <div className="account-section">
      <AccountCard>
        {!editing ? (
          <>
            <div className="account-profile-view-header">
              <p className="account-profile-view-header__title">Your Saliah account details</p>
              <AccountBtn variant="ghost" type="button" className="account-btn--sm" onClick={startEdit}>
                Edit profile
              </AccountBtn>
            </div>

            <AccountProfileSummary user={user} />

            <AccountProfileMeta user={user} emailVerified={emailVerified} />

            {!emailVerified ? (
              <p className="mt-4 font-body text-sm text-emerald-900/50">
                Verify your email to unlock checkout.{" "}
                <Link to="/verify-email" className="font-medium text-emerald-800 underline-offset-2 hover:underline">
                  Resend verification
                </Link>
              </p>
            ) : null}

            {!hasPassword && user?.provider && user.provider !== "local" ? (
              <p className="mt-4 font-body text-sm text-emerald-900/50">
                Add a password for email sign-in in{" "}
                <Link to="/account?tab=password" className="font-medium text-emerald-800 underline-offset-2 hover:underline">
                  Password & security
                </Link>
                .
              </p>
            ) : null}

            {message ? (
              <div className="mt-6">
                <AccountAlert type="success">{message}</AccountAlert>
              </div>
            ) : null}
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <AccountProfilePhotoUpload
              name={user?.fullName}
              avatarUrl={user?.avatarUrl}
              uploading={avatarUploading}
              disabled={saving}
              onUpload={handleAvatarUpload}
              onRemove={handleAvatarRemove}
            />
            {photoError ? (
              <div className="mb-4">
                <AccountAlert type="error">{photoError}</AccountAlert>
              </div>
            ) : null}

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
                <AccountPhoneInput
                  id="profile-phone"
                  value={form.phone}
                  error={errors.phone}
                  onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                />
              </AccountField>
            </div>

            <div className="mt-6 space-y-3">
              {error ? <AccountAlert type="error">{error}</AccountAlert> : null}
              <div className="flex flex-wrap gap-3">
                <AccountBtn variant="primary" type="submit" className="w-full sm:w-auto" disabled={saving || avatarUploading}>
                  {saving ? "Saving..." : "Save changes"}
                </AccountBtn>
                <AccountBtn variant="ghost" type="button" className="w-full sm:w-auto" onClick={cancelEdit} disabled={saving || avatarUploading}>
                  Cancel
                </AccountBtn>
              </div>
            </div>
          </form>
        )}
      </AccountCard>

      <AccountDeleteSection className="mt-6" />
    </div>
  );
}
