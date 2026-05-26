import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { RoleBadge } from "../components/ui/RoleBadge.jsx";
import { StatusBadge } from "../components/ui/StatusBadge.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";

export function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [form, setForm] = useState({ fullName: "", phone: "", role: "customer", profileNote: "" });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    apiFetch(`/api/admin/users/${id}`)
      .then((d) => {
        setUser(d.user);
        setRecentOrders(d.recentOrders ?? []);
        setForm({
          fullName: d.user.fullName,
          phone: d.user.phone,
          role: d.user.role,
          profileNote: d.user.profileNote ?? "",
        });
      })
      .catch((e) => setError(e.message));
  }, [id]);

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSaved(false);
    try {
      const d = await apiFetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      setUser(d.user);
      setSaved(true);
    } catch (err) {
      setError(err.message);
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

  if (!user && !error) return <LoadingState />;
  if (error && !user) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
    );
  }

  const isSelf = currentUser?.id === user.id;
  const canDelete = user.role === "customer" && !isSelf;

  return (
    <div>
      <Link to="/users" className="btn-ghost mb-2 inline-flex gap-1 px-0">
        ← Back to users
      </Link>

      <PageHeader
        title={user.fullName}
        subtitle={user.email}
        action={<RoleBadge role={user.role} />}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="admin-card p-4 text-center">
          <p className="text-2xl font-display font-medium text-emerald-900">{user.orderCount}</p>
          <p className="text-xs uppercase tracking-wider text-emerald-900/50">Orders</p>
        </div>
        <div className="admin-card p-4 text-center">
          <p className="text-2xl font-display font-medium text-emerald-900">{user.addressCount}</p>
          <p className="text-xs uppercase tracking-wider text-emerald-900/50">Addresses</p>
        </div>
        <div className="admin-card p-4 text-center">
          <p className="text-2xl font-display font-medium text-emerald-900">{user.wishlistCount}</p>
          <p className="text-xs uppercase tracking-wider text-emerald-900/50">Wishlist items</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard title="Account info">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="admin-label">Provider</dt>
              <dd className="capitalize">{user.provider}</dd>
            </div>
            <div>
              <dt className="admin-label">Password set</dt>
              <dd>{user.hasPassword ? "Yes" : "No (social / invite)"}</dd>
            </div>
            <div>
              <dt className="admin-label">Member since</dt>
              <dd>{new Date(user.createdAt).toLocaleString("en-IN")}</dd>
            </div>
          </dl>
        </AdminCard>

        <AdminCard title="Edit user">
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
              />
            </label>
            <label className="block">
              <span className="admin-label">Role</span>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="admin-input"
                disabled={isSelf}
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
              {isSelf && (
                <p className="mt-1 text-xs text-emerald-900/45">You cannot change your own role</p>
              )}
            </label>
            <label className="block">
              <span className="admin-label">Profile note</span>
              <textarea
                value={form.profileNote}
                onChange={(e) => setForm({ ...form, profileNote: e.target.value })}
                rows={2}
                className="admin-input resize-none"
              />
            </label>
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}
            {saved && (
              <p className="rounded-lg bg-emerald-800/10 px-3 py-2 text-sm text-emerald-800">Saved.</p>
            )}
            <button type="submit" className="btn-primary">
              Save changes
            </button>
          </form>
        </AdminCard>
      </div>

      {recentOrders.length > 0 && (
        <AdminCard title="Recent orders" className="mt-6">
          <ul className="divide-y divide-emerald-900/6">
            {recentOrders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <Link to={`/orders/${o.id}`} className="font-medium text-emerald-800 hover:underline">
                  {o.id}
                </Link>
                <div className="flex items-center gap-3">
                  <StatusBadge status={o.status} />
                  <span className="font-medium">₹{o.total.toLocaleString("en-IN")}</span>
                </div>
              </li>
            ))}
          </ul>
        </AdminCard>
      )}

      {canDelete && (
        <div className="mt-8 rounded-2xl border border-red-200/60 bg-red-50/50 p-5">
          <h3 className="font-medium text-red-800">Danger zone</h3>
          <p className="mt-1 text-sm text-red-700/80">
            Permanently delete this customer and all related data.
          </p>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="mt-4 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete user"}
          </button>
        </div>
      )}
    </div>
  );
}
