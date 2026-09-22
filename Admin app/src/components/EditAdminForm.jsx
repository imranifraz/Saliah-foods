import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api.js";
import { uploadAdminAvatar } from "../lib/adminUpload.js";
import {
  formatPhoneForStorage,
  phoneLocalDigits,
  validateIndianPhoneLocal,
} from "../lib/phone.js";
import { useAuth } from "../context/AuthContext.jsx";
import { AdminAvatarUpload } from "./AdminAvatarUpload.jsx";
import { useAdminToast } from "../context/AdminToastContext.jsx";

function emptyForm(admin) {
  return {
    fullName: admin?.fullName ?? "",
    phone: phoneLocalDigits(admin?.phone),
    email: admin?.email ?? "",
    avatarUrl: admin?.avatarUrl ?? "",
  };
}

export function EditAdminForm({ admin, onCancel, onSuccess }) {
  const toast = useAdminToast();
  const { user: sessionUser, refresh } = useAuth();
  const [form, setForm] = useState(emptyForm(admin));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const isSelf = sessionUser?.id === admin.id;
  const formBusy = saving || avatarUploading;

  useEffect(() => {
    setForm(emptyForm(admin));
    setError("");
  }, [admin]);

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

  async function handleSubmit(event) {
    event.preventDefault();

    const phoneCheck = validateIndianPhoneLocal(form.phone);
    if (!phoneCheck.ok) {
      setError(phoneCheck.error);
      return;
    }

    setError("");
    setSaving(true);

    try {
      const data = await apiFetch(`/api/admin/admins/${admin.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: formatPhoneForStorage(form.phone),
          avatarUrl: form.avatarUrl,
        }),
      });
      if (isSelf) await refresh();
      toast.success("Admin updated");
      onSuccess?.(data.admin);
    } catch (err) {
      setError(err.message);
      toast.error("Could not update admin", err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="border-b border-[var(--admin-border)] pb-3 sm:pb-4">
        <AdminAvatarUpload
          name={form.fullName || admin.fullName}
          avatarUrl={form.avatarUrl}
          uploading={avatarUploading}
          disabled={formBusy}
          compact
          onUpload={handleAvatarUpload}
          onRemove={() => setForm((current) => ({ ...current, avatarUrl: "" }))}
        />
      </div>

      <label className="block">
        <span className="admin-label">Full name</span>
        <input
          required
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          className="admin-input mt-1.5 w-full"
        />
      </label>

      <label className="block">
        <span className="admin-label">Email</span>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="admin-input mt-1.5 w-full"
          disabled={isSelf}
        />
        {isSelf ? (
          <p className="admin-muted mt-1.5 text-xs">Contact another admin to change your login email.</p>
        ) : null}
      </label>

      <label className="block">
        <span className="admin-label">Phone</span>
        <div className="admin-phone-input mt-1.5 flex overflow-hidden rounded-lg border border-[var(--admin-border-strong)] bg-[var(--admin-input-bg)]">
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

      <div className="sticky bottom-0 -mx-4 flex flex-col-reverse gap-2 border-t border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 pb-1 pt-3 sm:-mx-5 sm:flex-row sm:justify-end sm:px-5 sm:pb-0">
        <button type="button" onClick={onCancel} className="btn-ghost w-full sm:w-auto" disabled={formBusy}>
          Cancel
        </button>
        <button type="submit" className="btn-primary w-full sm:w-auto" disabled={formBusy}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
