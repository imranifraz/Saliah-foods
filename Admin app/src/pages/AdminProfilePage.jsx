import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { uploadAdminAvatar } from "../lib/adminUpload.js";
import {
  formatPhoneDisplay,
  formatPhoneForStorage,
  phoneLocalDigits,
  validateIndianPhoneLocal,
} from "../lib/phone.js";
import { resolveAdminMediaUrl } from "../lib/mediaUrl.js";
import { useAuth } from "../context/AuthContext.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { ChangePasswordModal } from "../components/ChangePasswordModal.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";

function ProfileAvatar({ name, avatarUrl, size = "lg" }) {
  const initials = (name ?? "A")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sizeClass = size === "lg" ? "h-24 w-24 text-3xl" : "h-10 w-10 text-sm";
  const src = avatarUrl ? resolveAdminMediaUrl(avatarUrl) : "";

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={`admin-profile-avatar shrink-0 rounded-full object-cover ${sizeClass}`}
      />
    );
  }

  return (
    <span
      className={`admin-profile-avatar flex shrink-0 items-center justify-center rounded-full font-display font-semibold text-white ${sizeClass}`}
    >
      {initials}
    </span>
  );
}

function ProfilePhotoUpload({ name, avatarUrl, uploading, onUpload, onRemove }) {
  const inputRef = useRef(null);

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) onUpload(file);
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <ProfileAvatar name={name} avatarUrl={avatarUrl} />
        <button
          type="button"
          className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-link)] shadow-sm transition hover:bg-[var(--admin-hover)]"
          aria-label="Upload profile photo"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          </svg>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={handleFileChange}
      />
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          className="btn-ghost text-xs"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading…" : "Upload photo"}
        </button>
        {avatarUrl ? (
          <button type="button" className="btn-ghost text-xs" disabled={uploading} onClick={onRemove}>
            Remove
          </button>
        ) : null}
      </div>
      <p className="admin-muted mt-2 max-w-[220px] text-center text-xs">JPG, PNG, or WebP up to 2 MB.</p>
    </div>
  );
}

function IconProfile() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.75 0 3.75 3.75 0 017.75 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function IconKey() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.75 0 3.75 3.75 0 017.75 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function ProfileField({ label, value, icon }) {
  return (
    <div className="admin-profile-field rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-4">
      <div className="flex items-start gap-3">
        <span className="admin-profile-field__icon flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-link)]">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="admin-caption">{label}</p>
          <p className="mt-1 truncate text-sm font-semibold text-[var(--admin-fg)]">{value || "—"}</p>
        </div>
      </div>
    </div>
  );
}

export function AdminProfilePage() {
  const { user: sessionUser, refresh } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!sessionUser?.id) return;

    apiFetch(`/api/admin/admins/${sessionUser.id}`)
      .then((data) => {
        setProfile(data.admin);
        setForm({
          fullName: data.admin.fullName ?? "",
          email: data.admin.email ?? "",
          phone: phoneLocalDigits(data.admin.phone),
        });
      })
      .catch((err) => setError(err.message));
  }, [sessionUser?.id]);

  useEffect(() => {
    if (searchParams.get("edit") === "1" && profile) {
      setIsEditing(true);
      setSearchParams({}, { replace: true });
    }
  }, [profile, searchParams, setSearchParams]);

  async function updateAvatar(avatarUrl) {
    if (!sessionUser?.id) return;

    const data = await apiFetch(`/api/admin/admins/${sessionUser.id}`, {
      method: "PATCH",
      body: JSON.stringify({ avatarUrl }),
    });
    setProfile(data.admin);
    await refresh();
  }

  async function handleAvatarUpload(file) {
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG, or WebP).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be 2 MB or smaller.");
      return;
    }

    setError("");
    setAvatarUploading(true);
    try {
      const upload = await uploadAdminAvatar(file);
      await updateAvatar(upload.url);
    } catch (err) {
      setError(err.message ?? "Could not upload profile photo");
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleRemoveAvatar() {
    setError("");
    setAvatarUploading(true);
    try {
      await updateAvatar("");
    } catch (err) {
      setError(err.message ?? "Could not remove profile photo");
    } finally {
      setAvatarUploading(false);
    }
  }

  function openEditForm() {
    setIsEditing(true);
    setError("");
    setSaved(false);
    setSearchParams({ edit: "1" }, { replace: true });
  }

  function closeEditForm() {
    if (!profile) return;
    setForm({
      fullName: profile.fullName ?? "",
      email: profile.email ?? "",
      phone: phoneLocalDigits(profile.phone),
    });
    setError("");
    setSaved(false);
    setIsEditing(false);
    if (searchParams.get("edit") === "1") {
      setSearchParams({}, { replace: true });
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!sessionUser?.id) return;

    const phoneCheck = validateIndianPhoneLocal(form.phone);
    if (!phoneCheck.ok) {
      setError(phoneCheck.error);
      return;
    }

    setError("");
    setSaved(false);
    setSaving(true);

    try {
      const data = await apiFetch(`/api/admin/admins/${sessionUser.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...form,
          phone: formatPhoneForStorage(form.phone),
        }),
      });
      setProfile(data.admin);
      setSaved(true);
      setIsEditing(false);
      setSearchParams({}, { replace: true });
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!profile && !error) return <LoadingState label="Loading profile..." />;

  if (error && !profile) {
    return <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="admin-card admin-profile-intro p-6">
        <div className="flex items-center gap-4">
          <span className="admin-profile-intro__icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] text-[var(--admin-link)]">
            <IconProfile />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--admin-fg)]">Profile</h1>
            <p className="admin-muted mt-2 max-w-2xl text-[15px] leading-relaxed">
              Manage your administrator account, contact details, and security settings. Updates apply to your sign-in
              profile for this admin panel.
            </p>
          </div>
        </div>
      </section>

      <AdminCard
        title="Account information"
        subtitle="Official directory record for your administrator account."
        action={
          !isEditing ? (
            <button type="button" onClick={openEditForm} className="btn-ghost inline-flex items-center gap-2">
              <IconEdit />
              Edit profile
            </button>
          ) : null
        }
      >
        {saved ? (
          <p className="mb-5 rounded-lg border border-[var(--admin-success-bg)] bg-[var(--admin-badge-bg)] px-3 py-2 text-sm text-[var(--admin-success)]">
            Profile updated successfully.
          </p>
        ) : null}

        {error && profile ? (
          <p className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <ProfilePhotoUpload
              name={form.fullName || profile.fullName}
              avatarUrl={profile.avatarUrl}
              uploading={avatarUploading}
              onUpload={handleAvatarUpload}
              onRemove={handleRemoveAvatar}
            />

            <label className="block">
              <span className="admin-label">Full name</span>
              <input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="admin-input mt-1.5 w-full"
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="admin-label">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="admin-input mt-1.5 w-full"
                  required
                  autoComplete="email"
                />
              </label>

              <label className="block">
                <span className="admin-label">Phone</span>
                <div className="admin-phone-input mt-1.5 flex overflow-hidden rounded-lg border border-[var(--admin-border-strong)] bg-[var(--admin-input-bg)] transition focus-within:border-[color-mix(in_srgb,var(--admin-accent)_55%,transparent)] focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--admin-accent)_18%,transparent)]">
                  <span className="flex shrink-0 items-center border-r border-[var(--admin-border-strong)] px-3 text-sm font-semibold text-[var(--admin-fg-muted)]">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-[0.9375rem] font-medium text-[var(--admin-fg)] outline-none placeholder:font-normal placeholder:text-[var(--admin-fg-faint)]"
                    placeholder="9876543210"
                    autoComplete="tel-national"
                    pattern="[6-9][0-9]{9}"
                    title="Enter a valid 10-digit mobile number"
                  />
                </div>
                <p className="admin-muted mt-1.5 text-xs">10-digit Indian mobile number starting with 6–9.</p>
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={closeEditForm} className="btn-ghost" disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)] lg:items-start">
            <div className="mx-auto flex w-full max-w-[220px] flex-col items-center text-center">
              <ProfileAvatar name={profile.fullName} avatarUrl={profile.avatarUrl} />
              <h2 className="mt-4 font-display text-xl font-semibold text-[var(--admin-fg)]">{profile.fullName}</h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ProfileField label="Full name" value={profile.fullName} icon={<IconUser />} />
              <ProfileField label="Email" value={profile.email} icon={<IconMail />} />
              <ProfileField label="Phone" value={formatPhoneDisplay(profile.phone)} icon={<IconPhone />} />
              <ProfileField label="Role" value="Administrator" icon={<IconShield />} />
            </div>
          </div>
        )}
      </AdminCard>

      <section className="admin-card admin-profile-security p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="admin-profile-security__icon flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] text-[var(--admin-link)]">
              <IconKey />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-[var(--admin-fg)]">Change password</h2>
              <p className="admin-muted mt-1 max-w-xl text-sm leading-relaxed">
                Use a strong, unique password for your admin account. Changing your password signs out all other active
                sessions.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPasswordModalOpen(true)}
            className="btn-primary inline-flex shrink-0 items-center gap-2"
          >
            <IconKey />
            Change password
          </button>
        </div>
      </section>

      <ChangePasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        defaultEmail={profile?.email ?? sessionUser?.email ?? ""}
        lockEmail
      />
    </div>
  );
}
