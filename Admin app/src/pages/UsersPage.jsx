import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { formatPhoneDisplay } from "../lib/phone.js";
import { resolveAdminMediaUrl } from "../lib/mediaUrl.js";
import { useAuth } from "../context/AuthContext.jsx";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { DataTable, DataRow, DataCell } from "../components/ui/DataTable.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";
import { CreateAdminModal } from "../components/CreateAdminModal.jsx";
import { AdminManageModal } from "../components/AdminManageModal.jsx";
import { ConfirmDialog } from "../components/ConfirmDialog.jsx";

function emptyAdminForm() {
  return {
    fullName: "",
    email: "",
    phone: "",
    password: "",
  };
}

function formatJoinedDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatUpdatedDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ListAvatar({ name, avatarUrl }) {
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
        className="admin-list-avatar h-10 w-10 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span className="admin-list-avatar flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-semibold text-white">
      {initials}
    </span>
  );
}

function IconClear() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function IconAdminUsers() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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

function IconTrash() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function AdminPill({ children, tone = "role" }) {
  const styles =
    tone === "active"
      ? "border-[var(--admin-success-bg)] bg-[var(--admin-badge-bg)] text-[var(--admin-success)]"
      : "border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] text-[var(--admin-link)]";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${styles}`}>
      {children}
    </span>
  );
}

function TableIconButton({ to, onClick, label, children, danger = false, disabled = false }) {
  const className = `inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--admin-border)] transition ${
    disabled
      ? "cursor-not-allowed opacity-40"
      : danger
        ? "text-[var(--admin-danger)] hover:border-[color-mix(in_srgb,var(--admin-danger)_35%,transparent)] hover:bg-[var(--admin-hover)]"
        : "text-[var(--admin-fg-muted)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]"
  }`;

  if (to) {
    return (
      <Link to={to} className={className} aria-label={label} title={label}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function UsersListPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyAdminForm);

  function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());

    apiFetch(`/api/admin/users?${params}`)
      .then((d) => setUsers(d.users))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [query]);

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
      setForm(emptyAdminForm());
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const columns = ["Name", "Email", "Phone", "Orders", "Joined", ""];

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="View and manage customer accounts."
        action={
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className={showForm ? "btn-secondary" : "btn-primary"}
          >
            {showForm ? "Cancel" : "+ Add customer"}
          </button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex min-w-[200px] max-w-md flex-1 gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone"
            className="admin-input flex-1"
          />
          <button type="submit" className="btn-secondary shrink-0">
            Search
          </button>
        </form>
      </div>

      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      {showForm ? (
        <AdminCard title="New customer" className="mb-6">
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
              <span className="admin-label">Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="admin-input"
                placeholder="Optional"
              />
            </label>
            <div className="sm:col-span-2">
              <button type="submit" className="btn-primary">
                Create customer
              </button>
            </div>
          </form>
        </AdminCard>
      ) : null}

      <AdminCard>
        {loading ? (
          <LoadingState label="Loading customers..." />
        ) : (
          <DataTable columns={columns} emptyMessage="No customers found">
            {users.map((u) => (
              <DataRow key={u.id}>
                <DataCell className="font-medium">{u.fullName}</DataCell>
                <DataCell>{u.email}</DataCell>
                <DataCell className="text-emerald-900/70">{u.phone || "—"}</DataCell>
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

function AdminsListPage() {
  const { user: sessionUser } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [manageAdmin, setManageAdmin] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function load(nextPage = page) {
    setLoading(true);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    params.set("page", String(nextPage));
    params.set("pageSize", String(pageSize));

    apiFetch(`/api/admin/admins?${params}`)
      .then((d) => {
        const responseTotal = d.total ?? d.admins.length;
        const responsePage = d.page ?? nextPage;
        if (d.admins.length === 0 && responsePage > 1 && responseTotal > 0) {
          setPage(responsePage - 1);
          return;
        }
        setAdmins(d.admins);
        setTotal(responseTotal);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load(page);
  }, [query, page, pageSize]);

  function handleSearch(e) {
    e.preventDefault();
    setQuery(search.trim());
    setPage(1);
  }

  function clearSearch() {
    setSearch("");
    setQuery("");
    setPage(1);
  }

  function handlePageSizeChange(nextPageSize) {
    setPageSize(nextPageSize);
    setPage(1);
  }

  async function handleDelete(admin) {
    if (admin.id === sessionUser?.id) return;

    setError("");
    setDeletingId(admin.id);
    try {
      await apiFetch(`/api/admin/admins/${admin.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  function openManageAdmin(admin, mode) {
    setManageAdmin({ id: admin.id, mode });
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const showingFrom = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const showingTo = total === 0 ? 0 : Math.min(safePage * pageSize, total);

  const columns = ["User", "Contact", "Role", "Joined", "Updated", "Actions"];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="admin-card admin-page-intro p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <span className="admin-page-intro__icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] text-[var(--admin-link)]">
              <IconAdminUsers />
            </span>
            <div className="min-w-0">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--admin-fg)]">
                Admin Management
              </h1>
              <p className="admin-muted mt-2 max-w-2xl text-[15px] leading-relaxed">
                Manage system administrators, contact details, and dashboard access for your team.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="btn-primary inline-flex shrink-0 items-center gap-2"
          >
            <IconPlus />
            Add admin
          </button>
        </div>
      </section>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <AdminCard
        title="Administrators"
        subtitle="Search, review, and manage admin accounts."
        action={
          <form
            onSubmit={handleSearch}
            className="flex w-full min-w-0 flex-nowrap items-center gap-3 sm:w-auto sm:justify-end"
          >
            <div className="flex min-w-0 flex-1 items-stretch overflow-hidden rounded-lg border border-[var(--admin-border-strong)] bg-[var(--admin-input-bg)] sm:max-w-xs lg:max-w-sm">
              <span className="flex shrink-0 items-center pl-3 text-[var(--admin-fg-muted)]">
                <IconSearch />
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, phone…"
                className="min-w-0 flex-1 border-0 bg-transparent px-2 py-2.5 text-[0.9375rem] font-medium text-[var(--admin-fg)] outline-none placeholder:font-normal placeholder:text-[var(--admin-fg-faint)]"
              />
              {search ? (
                <button
                  type="button"
                  className="flex shrink-0 items-center px-2 text-[var(--admin-fg-muted)] transition hover:text-[var(--admin-fg)]"
                  aria-label="Clear search"
                  onClick={clearSearch}
                >
                  <IconClear />
                </button>
              ) : null}
              <button
                type="submit"
                className="shrink-0 border-l border-[var(--admin-border-strong)] px-4 text-sm font-semibold text-[var(--admin-link)] transition hover:bg-[var(--admin-hover)]"
              >
                Search
              </button>
            </div>
          </form>
        }
      >
        {query ? (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="admin-muted text-sm">Filtered by</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-1 text-xs font-medium text-[var(--admin-fg)]">
              {query}
              <button
                type="button"
                className="rounded-full p-0.5 text-[var(--admin-fg-muted)] transition hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]"
                aria-label="Remove filter"
                onClick={clearSearch}
              >
                <IconClear />
              </button>
            </span>
          </div>
        ) : null}

        {loading ? (
          <LoadingState label="Loading admins..." />
        ) : total === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] text-[var(--admin-link)]">
              <IconAdminUsers />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold text-[var(--admin-fg)]">
              {query ? "No admins match your search" : "No administrators yet"}
            </h3>
            <p className="admin-muted mt-2 max-w-sm text-sm leading-relaxed">
              {query
                ? "Try a different name, email, or phone number."
                : "Create the first admin account to grant dashboard access."}
            </p>
            {!query ? (
              <button type="button" onClick={() => setCreateModalOpen(true)} className="btn-primary mt-5 inline-flex items-center gap-2">
                <IconPlus />
                Add admin
              </button>
            ) : (
              <button type="button" onClick={clearSearch} className="btn-ghost mt-5">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <DataTable columns={columns} emptyMessage="No admins found">
              {admins.map((admin) => {
                const isSelf = admin.id === sessionUser?.id;

                return (
                  <DataRow key={admin.id} className={isSelf ? "bg-[var(--admin-tab-active-bg)]/40" : ""}>
                    <DataCell>
                      <button
                        type="button"
                        onClick={() => openManageAdmin(admin, "view")}
                        className="flex w-full items-center gap-3 text-left transition hover:opacity-90"
                      >
                        <ListAvatar name={admin.fullName} avatarUrl={admin.avatarUrl} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[var(--admin-fg)]">{admin.fullName}</p>
                        </div>
                      </button>
                    </DataCell>
                    <DataCell>
                      <div className="space-y-0.5">
                        <p className="truncate text-sm">{admin.email}</p>
                        <p className="admin-muted truncate text-xs">{formatPhoneDisplay(admin.phone)}</p>
                      </div>
                    </DataCell>
                    <DataCell>
                      <AdminPill>Administrator</AdminPill>
                    </DataCell>
                    <DataCell className="admin-muted whitespace-nowrap text-sm">
                      {formatJoinedDate(admin.createdAt)}
                    </DataCell>
                    <DataCell className="admin-muted whitespace-nowrap text-sm">
                      {formatUpdatedDate(admin.updatedAt)}
                    </DataCell>
                    <DataCell>
                      <div className="flex items-center justify-end gap-1.5">
                        <TableIconButton
                          label="View admin"
                          onClick={() => openManageAdmin(admin, "view")}
                        >
                          <IconEye />
                        </TableIconButton>
                        <TableIconButton
                          label="Edit admin"
                          onClick={() => openManageAdmin(admin, "edit")}
                        >
                          <IconEdit />
                        </TableIconButton>
                        <TableIconButton
                          label={isSelf ? "You cannot delete your own account" : "Delete admin"}
                          danger
                          disabled={isSelf}
                          onClick={() => setDeleteTarget(admin)}
                        >
                          {deletingId === admin.id ? (
                            <span className="text-xs">…</span>
                          ) : (
                            <IconTrash />
                          )}
                        </TableIconButton>
                      </div>
                    </DataCell>
                  </DataRow>
                );
              })}
            </DataTable>

            <div className="-mx-5 -mb-5 flex flex-col gap-3 border-t border-[var(--admin-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="admin-muted text-sm">
                Showing {showingFrom} to {showingTo} of {total} admin{total === 1 ? "" : "s"}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-[var(--admin-fg-muted)]">
                  <span className="whitespace-nowrap">Per page</span>
                  <div className="flex items-stretch overflow-hidden rounded-lg border border-[var(--admin-border-strong)] bg-[var(--admin-input-bg)]">
                    <select
                      value={pageSize}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      aria-label="Results per page"
                      className="admin-input admin-select !min-w-[4.5rem] w-auto rounded-none border-0 bg-transparent py-2.5 pl-3 pr-8"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </label>
                {totalPages > 1 ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="btn-ghost text-sm"
                      disabled={safePage <= 1}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                    >
                      Previous
                    </button>
                    <span className="admin-muted px-2 text-sm">
                      Page {safePage} of {totalPages}
                    </span>
                    <button
                      type="button"
                      className="btn-ghost text-sm"
                      disabled={safePage >= totalPages}
                      onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    >
                      Next
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </>
        )}
      </AdminCard>

      <CreateAdminModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} onCreated={load} />

      <AdminManageModal
        open={Boolean(manageAdmin)}
        adminId={manageAdmin?.id ?? null}
        mode={manageAdmin?.mode ?? "view"}
        onClose={() => setManageAdmin(null)}
        onUpdated={load}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete admin?"
        description={
          deleteTarget
            ? `Remove "${deleteTarget.fullName}" from the system? This revokes dashboard access and cannot be undone.`
            : ""
        }
        confirmLabel="Delete admin"
        cancelLabel="Cancel"
        danger
        loading={Boolean(deletingId)}
        onClose={() => {
          if (!deletingId) setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget);
        }}
      />
    </div>
  );
}

export function UsersPage() {
  return <UsersListPage />;
}

export function AdminsPage() {
  return <AdminsListPage />;
}
