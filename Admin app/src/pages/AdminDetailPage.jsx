import { useEffect, useState } from "react";

import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { apiFetch } from "../lib/api.js";

import { uploadAdminAvatar } from "../lib/adminUpload.js";

import {

  formatPhoneDisplay,

  formatPhoneForStorage,

  phoneLocalDigits,

  validateIndianPhoneLocal,

} from "../lib/phone.js";

import { resolveAdminMediaUrl } from "../lib/mediaUrl.js";

import { generateSecurePassword } from "../lib/password.js";

import { useAuth } from "../context/AuthContext.jsx";
import { useAdminToast } from "../context/AdminToastContext.jsx";

import { AdminAvatarUpload } from "../components/AdminAvatarUpload.jsx";

import { AdminCard } from "../components/ui/AdminCard.jsx";

import { RoleBadge } from "../components/ui/RoleBadge.jsx";

import { LoadingState } from "../components/ui/LoadingState.jsx";

import { ConfirmDialog } from "../components/ConfirmDialog.jsx";



function formatDate(iso) {

  return new Date(iso).toLocaleDateString("en-IN", {

    day: "numeric",

    month: "short",

    year: "numeric",

  });

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

    return (

      <img

        src={src}

        alt=""

        className="h-16 w-16 shrink-0 rounded-2xl object-cover"

      />

    );

  }



  return (

    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] font-display text-xl font-semibold text-[var(--admin-link)]">

      {initials}

    </span>

  );

}



function DetailField({ label, value }) {

  return (

    <div className="admin-profile-field rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-4">

      <p className="admin-caption">{label}</p>

      <p className="mt-1 text-sm font-semibold text-[var(--admin-fg)]">{value || "—"}</p>

    </div>

  );

}



function IconEdit() {

  return (

    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>

      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />

    </svg>

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



function emptyForm(admin) {

  return {

    fullName: admin?.fullName ?? "",

    phone: phoneLocalDigits(admin?.phone),

    profileNote: admin?.profileNote ?? "",

    email: admin?.email ?? "",

    avatarUrl: admin?.avatarUrl ?? "",

  };

}



export function AdminDetailPage() {

  const toast = useAdminToast();

  const { id } = useParams();

  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const { user: currentUser, refresh } = useAuth();

  const [admin, setAdmin] = useState(null);

  const [form, setForm] = useState(emptyForm());

  const [error, setError] = useState("");

  const [saved, setSaved] = useState(false);

  const [saving, setSaving] = useState(false);

  const [avatarUploading, setAvatarUploading] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [resetPassword, setResetPassword] = useState("");

  const [resetPasswordVisible, setResetPasswordVisible] = useState(false);

  const [resettingPassword, setResettingPassword] = useState(false);

  const [passwordResetDone, setPasswordResetDone] = useState(false);

  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);



  const isEditing = searchParams.get("edit") === "1";



  useEffect(() => {

    apiFetch(`/api/admin/admins/${id}`)

      .then((data) => {

        setAdmin(data.admin);

        setForm(emptyForm(data.admin));

      })

      .catch((err) => setError(err.message));

  }, [id]);



  function openEditMode() {

    setError("");

    setSaved(false);

    setForm(emptyForm(admin));

    setSearchParams({ edit: "1" });

  }



  function closeEditMode() {

    if (!admin) return;

    setForm(emptyForm(admin));

    setError("");

    setSaved(false);

    setSearchParams({});

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

      setForm((current) => ({ ...current, avatarUrl: upload.url }));

    } catch (err) {

      setError(err.message ?? "Could not upload profile photo");

    } finally {

      setAvatarUploading(false);

    }

  }



  async function handleSave(event) {

    event.preventDefault();



    const phoneCheck = validateIndianPhoneLocal(form.phone);

    if (!phoneCheck.ok) {

      setError(phoneCheck.error);

      return;

    }



    setError("");

    setSaved(false);

    setSaving(true);



    try {

      const data = await apiFetch(`/api/admin/admins/${id}`, {

        method: "PATCH",

        body: JSON.stringify({

          fullName: form.fullName,

          email: form.email,

          phone: formatPhoneForStorage(form.phone),

          profileNote: form.profileNote,

          avatarUrl: form.avatarUrl,

        }),

      });

      setAdmin(data.admin);

      setForm(emptyForm(data.admin));

      setSaved(true);

      toast.success("Admin updated");

      setSearchParams({});

      if (currentUser?.id === data.admin.id) {

        await refresh();

      }

    } catch (err) {

      setError(err.message);

      toast.error("Could not update admin", err.message);

    } finally {

      setSaving(false);

    }

  }



  async function handleDelete() {

    setDeleting(true);

    setError("");



    try {

      await apiFetch(`/api/admin/admins/${id}`, { method: "DELETE" });

      toast.success("Admin deleted");

      navigate("/admins");

    } catch (err) {

      setError(err.message);

      toast.error("Could not delete admin", err.message);

      setDeleting(false);

      setDeleteDialogOpen(false);

    }

  }



  async function handleResetPassword() {

    if (!resetPassword.trim()) {

      setError("Enter a new password or generate one.");

      return;

    }



    setError("");

    setResettingPassword(true);

    setPasswordResetDone(false);



    try {

      await apiFetch(`/api/admin/admins/${id}/password`, {

        method: "PATCH",

        body: JSON.stringify({ password: resetPassword }),

      });

      setResetPassword("");

      setResetPasswordVisible(false);

      setResetPasswordDialogOpen(false);

      setPasswordResetDone(true);

      toast.success("Password reset");

    } catch (err) {

      setError(err.message);

      toast.error("Could not reset password", err.message);

      setResetPasswordDialogOpen(false);

    } finally {

      setResettingPassword(false);

    }

  }



  if (!admin && !error) return <LoadingState label="Loading admin..." />;

  if (error && !admin) {

    return (

      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>

    );

  }



  const isSelf = currentUser?.id === admin.id;

  const displayAvatarUrl = isEditing ? form.avatarUrl : admin.avatarUrl;

  const displayName = isEditing ? form.fullName || admin.fullName : admin.fullName;

  const formBusy = saving || avatarUploading;



  return (

    <div>

      <section className="admin-card mb-6 overflow-hidden">

        <div className="relative border-b border-[var(--admin-border)] px-6 py-6">

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">

            <ProfileAvatar name={displayName} avatarUrl={displayAvatarUrl} />

            <div className="min-w-0 flex-1">

              <p className="admin-caption text-[var(--admin-link)]">Admin account</p>

              <div className="mt-2 flex flex-wrap items-center gap-2.5">

                <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--admin-fg)]">

                  {displayName}

                </h1>

                <RoleBadge role="admin" />

                {isSelf ? (

                  <span className="rounded-md border border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--admin-tab-active-fg)]">

                    You

                  </span>

                ) : null}

              </div>

              <p className="admin-muted mt-2 text-[15px]">{admin.email}</p>

              <p className="admin-caption mt-3">Member since {formatDate(admin.createdAt)}</p>

            </div>

            {!isEditing ? (

              <button type="button" onClick={openEditMode} className="btn-ghost inline-flex shrink-0 items-center gap-2">

                <IconEdit />

                Edit admin

              </button>

            ) : null}

          </div>

        </div>

      </section>



      {error && admin ? (

        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>

      ) : null}



      {isEditing ? (

        <AdminCard title="Edit admin" subtitle="Update dashboard access details">

          <form onSubmit={handleSave} className="space-y-4">

            <AdminAvatarUpload

              name={form.fullName || admin.fullName}

              avatarUrl={form.avatarUrl}

              uploading={avatarUploading}

              disabled={formBusy}

              compact

              onUpload={handleAvatarUpload}

              onRemove={() => setForm((current) => ({ ...current, avatarUrl: "" }))}

            />



            <label className="block">

              <span className="admin-label">Full name</span>

              <input

                value={form.fullName}

                onChange={(e) => setForm({ ...form, fullName: e.target.value })}

                className="admin-input"

                required

              />

            </label>

            <label className="block">

              <span className="admin-label">Email</span>

              <input

                type="email"

                value={form.email}

                onChange={(e) => setForm({ ...form, email: e.target.value })}

                className="admin-input"

                required

                disabled={isSelf}

              />

              {isSelf ? (

                <p className="admin-muted mt-1.5 text-xs">Contact another admin to change your login email.</p>

              ) : null}

            </label>

            <label className="block">

              <span className="admin-label">Phone</span>

              <div className="admin-phone-input flex overflow-hidden rounded-lg border border-[var(--admin-border-strong)] bg-[var(--admin-input-bg)]">

                <span className="flex shrink-0 items-center border-r border-[var(--admin-border-strong)] px-3 text-sm font-semibold text-[var(--admin-fg-muted)]">

                  +91

                </span>

                <input

                  type="tel"

                  inputMode="numeric"

                  value={form.phone}

                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}

                  className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-[0.9375rem] font-medium text-[var(--admin-fg)] outline-none"

                  placeholder="9876543210"

                  pattern="[6-9][0-9]{9}"

                  title="Enter a valid 10-digit mobile number"

                />

              </div>

            </label>

            <label className="block">

              <span className="admin-label">Profile note</span>

              <textarea

                value={form.profileNote}

                onChange={(e) => setForm({ ...form, profileNote: e.target.value })}

                rows={3}

                className="admin-input resize-none"

              />

            </label>

            {saved ? (

              <p className="rounded-lg border border-[var(--admin-success-bg)] bg-[var(--admin-badge-bg)] px-3 py-2 text-sm text-[var(--admin-success)]">

                Changes saved successfully.

              </p>

            ) : null}

            <div className="flex justify-end gap-2">

              <button type="button" onClick={closeEditMode} className="btn-ghost" disabled={formBusy}>

                Cancel

              </button>

              <button type="submit" className="btn-primary" disabled={formBusy}>

                {saving ? "Saving..." : "Save changes"}

              </button>

            </div>

          </form>

        </AdminCard>

      ) : (

        <AdminCard title="Admin details" subtitle="Contact and account information">

          <div className="grid gap-3 sm:grid-cols-2">

            <DetailField label="Full name" value={admin.fullName} />

            <DetailField label="Email" value={admin.email} />

            <DetailField label="Phone" value={formatPhoneDisplay(admin.phone)} />

            <DetailField label="Role" value="Administrator" />

            <DetailField label="Joined" value={formatDate(admin.createdAt)} />

            <DetailField label="Last updated" value={formatDate(admin.updatedAt)} />

          </div>

          {admin.profileNote ? (

            <div className="mt-4">

              <DetailField label="Profile note" value={admin.profileNote} />

            </div>

          ) : null}

        </AdminCard>

      )}



      {!isSelf && !isEditing ? (

        <AdminCard title="Reset password" subtitle="Set a new sign-in password for this admin" className="mt-6">

          {passwordResetDone ? (

            <p className="rounded-lg border border-[var(--admin-success-bg)] bg-[var(--admin-badge-bg)] px-3 py-2 text-sm text-[var(--admin-success)]">

              Password reset. {admin.fullName} must sign in with the new password.

            </p>

          ) : (

            <div className="space-y-4">

              <p className="admin-muted text-sm leading-relaxed">

                This signs the admin out of all active sessions. Share the new password with them securely.

              </p>

              <label className="block">

                <div className="flex items-center justify-between gap-3">

                  <span className="admin-label">New password</span>

                  <button

                    type="button"

                    className="admin-login-card__forgot-link"

                    onClick={() => {

                      setResetPassword(generateSecurePassword());

                      setResetPasswordVisible(true);

                    }}

                  >

                    Generate

                  </button>

                </div>

                <div className="admin-password-field mt-1.5">

                  <input

                    type={resetPasswordVisible ? "text" : "password"}

                    value={resetPassword}

                    onChange={(e) => setResetPassword(e.target.value)}

                    className="admin-input w-full"

                    minLength={8}

                    autoComplete="new-password"

                    placeholder="At least 8 characters with letters and numbers"

                  />

                  <PasswordVisibilityToggle

                    visible={resetPasswordVisible}

                    onToggle={() => setResetPasswordVisible((current) => !current)}

                  />

                </div>

              </label>

              <button

                type="button"

                className="btn-primary"

                disabled={resettingPassword || !resetPassword.trim()}

                onClick={() => setResetPasswordDialogOpen(true)}

              >

                Reset password

              </button>

            </div>

          )}

        </AdminCard>

      ) : null}



      {!isSelf ? (

        <div className="mt-8 rounded-2xl border border-red-200/80 bg-red-50/60 p-5">

          <h3 className="font-semibold text-red-800">Danger zone</h3>

          <p className="mt-1 text-sm text-red-700/80">Remove this admin account and revoke all active sessions.</p>

          <button

            type="button"

            onClick={() => setDeleteDialogOpen(true)}

            disabled={deleting}

            className="mt-4 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"

          >

            Delete admin

          </button>

        </div>

      ) : null}



      <ConfirmDialog

        open={deleteDialogOpen}

        title="Delete admin?"

        description={`Remove "${admin.fullName}" from the system? This revokes dashboard access and cannot be undone.`}

        confirmLabel="Delete admin"

        cancelLabel="Cancel"

        danger

        loading={deleting}

        onClose={() => {

          if (!deleting) setDeleteDialogOpen(false);

        }}

        onConfirm={handleDelete}

      />



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

