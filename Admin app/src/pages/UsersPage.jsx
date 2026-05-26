import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { RoleBadge } from "../components/ui/RoleBadge.jsx";
import { DataTable, DataRow, DataCell } from "../components/ui/DataTable.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";

const ROLE_OPTIONS = ["all", "customer", "admin"];

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  role: "customer",
};

export function UsersPage() {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState("all");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (role !== "all") params.set("role", role);
    if (query.trim()) params.set("q", query.trim());
    const qs = params.toString() ? `?${params}` : "";

    apiFetch(`/api/admin/users${qs}`)
      .then((d) => setUsers(d.users))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [role, query]);

  function handleSearch(e) {
    e.preventDefault();
    setQuery(search);
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await apiFetch("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="View and manage customer accounts and admin staff."
        action={
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className={showForm ? "btn-secondary" : "btn-primary"}
          >
            {showForm ? "Cancel" : "+ Add user"}
          </button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2 min-w-[200px] max-w-md">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone…"
            className="admin-input flex-1"
          />
          <button type="submit" className="btn-secondary shrink-0">
            Search
          </button>
        </form>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="admin-input w-auto min-w-[140px]"
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r === "all" ? "All roles" : r}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {showForm && (
        <AdminCard title="New user" className="mb-6">
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="admin-label">Full name</span>
              <input
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="admin-input"
              />
            </label>
            <label className="block">
              <span className="admin-label">Email</span>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="admin-input"
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
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            {form.role === "admin" && (
              <label className="block sm:col-span-2">
                <span className="admin-label">Password (required for admin)</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="admin-input"
                  minLength={6}
                />
              </label>
            )}
            <div className="sm:col-span-2">
              <button type="submit" className="btn-primary">
                Create user
              </button>
            </div>
          </form>
        </AdminCard>
      )}

      <AdminCard>
        {loading ? (
          <LoadingState label="Loading users…" />
        ) : (
          <DataTable
            columns={["Name", "Email", "Phone", "Role", "Orders", "Joined", ""]}
            emptyMessage="No users found"
          >
            {users.map((u) => (
              <DataRow key={u.id}>
                <DataCell className="font-medium">{u.fullName}</DataCell>
                <DataCell>{u.email}</DataCell>
                <DataCell className="text-emerald-900/70">{u.phone || "—"}</DataCell>
                <DataCell>
                  <RoleBadge role={u.role} />
                </DataCell>
                <DataCell>{u.orderCount}</DataCell>
                <DataCell className="text-emerald-900/55">
                  {new Date(u.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </DataCell>
                <DataCell className="text-right">
                  <Link to={`/users/${u.id}`} className="btn-ghost">
                    View →
                  </Link>
                </DataCell>
              </DataRow>
            ))}
          </DataTable>
        )}
      </AdminCard>
    </div>
  );
}
