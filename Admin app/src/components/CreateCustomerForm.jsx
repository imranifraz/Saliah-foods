import { useState } from "react";
import { apiFetch } from "../lib/api.js";

function emptyForm() {
  return {
    fullName: "",
    email: "",
    phone: "",
    password: "",
  };
}

export function CreateCustomerForm({ onCancel, onSuccess }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      await apiFetch("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(form),
      });
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="admin-label">Full name</span>
        <input
          required
          value={form.fullName}
          onChange={(event) => setForm({ ...form, fullName: event.target.value })}
          className="admin-input mt-1.5 w-full"
        />
      </label>
      <label className="block">
        <span className="admin-label">Email</span>
        <input
          type="email"
          required
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          className="admin-input mt-1.5 w-full"
        />
      </label>
      <label className="block">
        <span className="admin-label">Phone</span>
        <input
          value={form.phone}
          onChange={(event) => setForm({ ...form, phone: event.target.value })}
          className="admin-input mt-1.5 w-full"
          placeholder="Optional"
        />
      </label>
      <label className="block">
        <span className="admin-label">Password</span>
        <input
          type="password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          className="admin-input mt-1.5 w-full"
          placeholder="Optional"
        />
      </label>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="btn-ghost">
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Creating…" : "Create customer"}
        </button>
      </div>
    </form>
  );
}
