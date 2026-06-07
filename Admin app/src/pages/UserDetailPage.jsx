import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { RoleBadge } from "../components/ui/RoleBadge.jsx";
import { StatusBadge } from "../components/ui/StatusBadge.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";
import { IconOrders, IconPackage, IconProducts } from "../components/icons/AdminIcons.jsx";

function formatMemberSince(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatOrderDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ProfileAvatar({ name }) {
  const initials = (name ?? "A")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] font-display text-xl font-semibold text-[var(--admin-link)]">
      {initials}
    </span>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="flex flex-col rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="admin-caption">{label}</p>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] text-[var(--admin-link)]">
          {icon}
        </span>
      </div>
      <p className="mt-4 font-display text-4xl font-semibold text-[var(--admin-fg)]">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--admin-border)] py-3 last:border-0">
      <dt className="admin-label mb-0 shrink-0">{label}</dt>
      <dd className="text-right text-sm font-medium text-[var(--admin-fg)]">{value}</dd>
    </div>
  );
}

export function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [form, setForm] = useState({ fullName: "", phone: "", profileNote: "" });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch(`/api/admin/users/${id}`)
      .then((d) => {
        setUser(d.user);
        setRecentOrders(d.recentOrders ?? []);
        setForm({
          fullName: d.user.fullName,
          phone: d.user.phone,
          profileNote: d.user.profileNote ?? "",
        });
      })
      .catch((e) => setError(e.message));
  }, [id]);

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const d = await apiFetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      setUser(d.user);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this user permanently? This cannot be undone.")) return;
    setDeleting(true);
    setError("");
    try {
      await apiFetch(`/api/admin/users/${id}`, { method: "DELETE" });
      navigate("/users");
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  if (!user && !error) return <LoadingState label="Loading profile..." />;
  if (error && !user) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
        {error}
      </p>
    );
  }

  const canDelete = true;

  return (
    <div>
      <Link
        to="/users"
        className="admin-muted mb-5 inline-flex items-center gap-1.5 text-sm font-medium transition hover:text-[var(--admin-link)]"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to customers
      </Link>

      <section className="admin-card mb-6 overflow-hidden">
        <div className="relative border-b border-[var(--admin-border)] px-6 py-6">
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--admin-tab-active-bg)] via-transparent to-transparent opacity-80"
            aria-hidden
          />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            <ProfileAvatar name={user.fullName} />
            <div className="min-w-0 flex-1">
              <p className="admin-caption text-[var(--admin-link)]">Customer profile</p>
              <div className="mt-2 flex flex-wrap items-center gap-2.5">
                <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--admin-fg)]">
                  {user.fullName}
                </h1>
                <RoleBadge role="customer" />
              </div>
              <p className="admin-muted mt-2 text-[15px]">{user.email}</p>
              {user.phone ? (
                <p className="admin-muted mt-1 text-sm">{user.phone}</p>
              ) : null}
              <p className="admin-caption mt-3">Member since {formatMemberSince(user.createdAt)}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Orders" value={user.orderCount} icon={<IconOrders />} />
        <StatCard label="Addresses" value={user.addressCount} icon={<IconPackage />} />
        <StatCard label="Wishlist items" value={user.wishlistCount} icon={<IconProducts />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard title="Account info" subtitle="Sign-in and membership details">
          <dl>
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Phone" value={user.phone || "Not set"} />
            <InfoRow label="Provider" value={user.provider === "local" ? "Email & password" : user.provider} />
            <InfoRow
              label="Password"
              value={user.hasPassword ? "Configured" : "Not set (social or invite)"}
            />
            <InfoRow label="Member since" value={formatMemberSince(user.createdAt)} />
            {user.profileNote ? (
              <div className="border-t border-[var(--admin-border)] pt-3">
                <dt className="admin-label">Profile note</dt>
                <dd className="mt-2 text-sm leading-relaxed text-[var(--admin-fg-muted)]">{user.profileNote}</dd>
              </div>
            ) : null}
          </dl>
        </AdminCard>

        <AdminCard title="Edit customer" subtitle="Manage name, contact, and internal notes">
          <form onSubmit={handleSave} className="space-y-4">
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
              <span className="admin-label">Phone</span>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="admin-input"
                placeholder="Optional"
              />
            </label>
            <label className="block">
              <span className="admin-label">Profile note</span>
              <textarea
                value={form.profileNote}
                onChange={(e) => setForm({ ...form, profileNote: e.target.value })}
                rows={3}
                className="admin-input resize-none"
                placeholder="Internal note for admin reference"
              />
            </label>
            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            ) : null}
            {saved ? (
              <p className="rounded-lg border border-[var(--admin-success-bg)] bg-[var(--admin-badge-bg)] px-3 py-2 text-sm text-[var(--admin-success)]">
                Changes saved successfully.
              </p>
            ) : null}
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        </AdminCard>
      </div>

      <AdminCard title="Recent orders" subtitle="Latest activity for this account" className="mt-6">
        {recentOrders.length === 0 ? (
          <p className="admin-muted py-6 text-center text-sm">No orders yet for this account.</p>
        ) : (
          <ul className="divide-y divide-[var(--admin-border)]">
            {recentOrders.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5 text-sm">
                <div className="min-w-0">
                  <Link to={`/orders/${order.id}`} className="font-semibold text-[var(--admin-link)] hover:underline">
                    {order.id}
                  </Link>
                  <p className="admin-muted mt-0.5 text-xs">{formatOrderDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <span className="font-semibold text-[var(--admin-fg)]">
                    ₹{order.total.toLocaleString("en-IN")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>

      {canDelete ? (
        <div className="mt-8 rounded-2xl border border-red-200/80 bg-red-50/60 p-5">
          <h3 className="font-semibold text-red-800">Danger zone</h3>
          <p className="mt-1 text-sm text-red-700/80">
            Permanently delete this customer and all related data.
          </p>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="mt-4 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete user"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
