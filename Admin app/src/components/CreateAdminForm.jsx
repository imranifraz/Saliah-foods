import { useRef, useState } from "react";

import { apiFetch } from "../lib/api.js";

import { uploadAdminAvatar } from "../lib/adminUpload.js";

import { generateSecurePassword } from "../lib/password.js";

import { formatPhoneForStorage, validateIndianPhoneLocal } from "../lib/phone.js";

import { AdminAvatarUpload } from "./AdminAvatarUpload.jsx";
import { useAdminToast } from "../context/AdminToastContext.jsx";



function emptyForm() {

  return {

    fullName: "",

    email: "",

    phone: "",

    password: "",

    avatarUrl: "",

  };

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



export function CreateAdminForm({ onCancel, onSuccess }) {

  const toast = useAdminToast();

  const [form, setForm] = useState(emptyForm);

  const [passwordVisible, setPasswordVisible] = useState(false);

  const [avatarUploading, setAvatarUploading] = useState(false);

  const [error, setError] = useState("");

  const [busy, setBusy] = useState(false);



  function handleGeneratePassword() {

    setForm((current) => ({ ...current, password: generateSecurePassword() }));

    setPasswordVisible(true);

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



  async function handleSubmit(e) {

    e.preventDefault();

    setError("");



    const phoneCheck = validateIndianPhoneLocal(form.phone);

    if (!phoneCheck.ok) {

      setError(phoneCheck.error);

      return;

    }



    setBusy(true);



    try {

      await apiFetch("/api/admin/admins", {

        method: "POST",

        body: JSON.stringify({

          fullName: form.fullName,

          email: form.email,

          phone: formatPhoneForStorage(form.phone),

          password: form.password,

          avatarUrl: form.avatarUrl,

        }),

      });

      setForm(emptyForm());

      setPasswordVisible(false);

      toast.success("Admin created");

      onSuccess?.();

    } catch (err) {

      const message = err.message ?? "Could not create admin";

      setError(message);

      toast.error("Could not create admin", message);

    } finally {

      setBusy(false);

    }

  }



  const formBusy = busy || avatarUploading;



  return (

    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">

      {error ? (

        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">

          {error}

        </p>

      ) : null}



      <div className="border-b border-[var(--admin-border)] pb-3 sm:pb-4">

        <AdminAvatarUpload

          name={form.fullName}

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

          autoComplete="name"

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

          autoComplete="email"

        />

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

            autoComplete="tel-national"

            pattern="[6-9][0-9]{9}"

            title="Enter a valid 10-digit mobile number"

          />

        </div>

      </label>



      <label className="block">

        <div className="flex items-center justify-between gap-3">

          <span className="admin-label">Password</span>

          <button type="button" className="admin-login-card__forgot-link" onClick={handleGeneratePassword}>

            Generate

          </button>

        </div>

        <div className="admin-password-field mt-1.5">

          <input

            type={passwordVisible ? "text" : "password"}

            required

            value={form.password}

            onChange={(e) => setForm({ ...form, password: e.target.value })}

            className="admin-input w-full"

            minLength={8}

            autoComplete="new-password"

            placeholder="At least 8 characters with letters and numbers"

          />

          <PasswordVisibilityToggle

            visible={passwordVisible}

            onToggle={() => setPasswordVisible((current) => !current)}

          />

        </div>

      </label>



      <div className="sticky bottom-0 -mx-4 flex flex-col-reverse gap-2 border-t border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 pb-1 pt-3 sm:-mx-5 sm:flex-row sm:justify-end sm:px-5 sm:pb-0">

        <button type="button" onClick={onCancel} className="btn-ghost w-full sm:w-auto" disabled={formBusy}>

          Cancel

        </button>

        <button type="submit" className="btn-primary w-full sm:w-auto" disabled={formBusy}>

          {busy ? "Creating…" : "Create admin"}

        </button>

      </div>

    </form>

  );

}

