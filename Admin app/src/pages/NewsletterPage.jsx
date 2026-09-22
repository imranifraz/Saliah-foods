import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch, getAuthToken } from "../lib/api.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { StatCard } from "../components/ui/StatCard.jsx";
import { DataTable, DataRow, DataCell } from "../components/ui/DataTable.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";
import { ConfirmDialog } from "../components/ConfirmDialog.jsx";
import { AdminFilterDock, AdminFilterSearch, AdminFilterSegment } from "../components/ui/AdminFilterDock.jsx";
import { IconMail } from "../components/icons/AdminIcons.jsx";
import { useAdminToast } from "../context/AdminToastContext.jsx";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "unsubscribed", label: "Unsubscribed" },
];

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function resolveExportUrl(status) {
  const base = import.meta.env.VITE_API_URL;
  const apiRoot =
    base === "" || base === "/"
      ? ""
      : base
        ? String(base).replace(/\/$/, "")
        : import.meta.env.DEV
          ? ""
          : "http://127.0.0.1:3001";
  return `${apiRoot}/api/admin/newsletter/export?status=${encodeURIComponent(status)}`;
}

export function NewsletterPage() {
  const toast = useAdminToast();
  const [subscribers, setSubscribers] = useState([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, unsubscribed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [workingId, setWorkingId] = useState("");
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (query.trim()) params.set("q", query.trim());
      const data = await apiFetch(`/api/admin/newsletter?${params.toString()}`);
      setSubscribers(data.subscribers ?? []);
      setSummary(data.summary ?? { total: 0, active: 0, unsubscribed: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [status, query]);

  useEffect(() => {
    load();
  }, [load]);

  const filterChips = useMemo(() => {
    const chips = [];
    if (query.trim()) {
      chips.push({ key: "q", label: `Search: ${query.trim()}`, onRemove: () => { setSearch(""); setQuery(""); } });
    }
    if (status !== "all") {
      chips.push({
        key: "status",
        label: STATUS_FILTERS.find((item) => item.value === status)?.label ?? status,
        onRemove: () => setStatus("all"),
      });
    }
    return chips;
  }, [query, status]);

  async function setSubscriberStatus(subscriber, nextStatus) {
    setWorkingId(subscriber.id);
    setError("");
    try {
      const data = await apiFetch(`/api/admin/newsletter/${subscriber.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      setSubscribers((current) =>
        current.map((row) => (row.id === subscriber.id ? data.subscriber : row))
      );
      toast.success(nextStatus === "active" ? "Subscriber reactivated" : "Subscriber unsubscribed");
      load();
    } catch (err) {
      setError(err.message);
      toast.error("Could not update subscriber", err.message);
    } finally {
      setWorkingId("");
    }
  }

  async function removeSubscriber(subscriber) {
    setWorkingId(subscriber.id);
    setError("");
    try {
      await apiFetch(`/api/admin/newsletter/${subscriber.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      toast.success("Subscriber removed");
      load();
    } catch (err) {
      setError(err.message);
      toast.error("Could not delete subscriber", err.message);
    } finally {
      setWorkingId("");
    }
  }

  async function exportCsv() {
    setExporting(true);
    setError("");
    try {
      const token = getAuthToken();
      const res = await fetch(resolveExportUrl(status === "all" ? "all" : status), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Export failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `newsletter-${status}-${new Date().toISOString().slice(0, 10)}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported");
    } catch (err) {
      setError(err.message);
      toast.error("Export failed", err.message);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Newsletter"
        subtitle="Emails collected from the storefront newsletter forms."
        action={
          <button type="button" className="btn-ghost" disabled={exporting || loading} onClick={exportCsv}>
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total subscribers" value={summary.total} accent="emerald" icon={<IconMail />} />
        <StatCard label="Active" value={summary.active} accent="gold" icon={<IconMail />} />
        <StatCard label="Unsubscribed" value={summary.unsubscribed} accent="marble" icon={<IconMail />} />
      </div>

      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <AdminCard title="Subscribers" subtitle="Search, filter, export, or remove newsletter emails.">
        <AdminFilterDock
          title="Find subscribers"
          search={
            <AdminFilterSearch
              id="newsletter-filter-search"
              value={search}
              onChange={setSearch}
              onSubmit={() => setQuery(search.trim())}
              onClear={() => {
                setSearch("");
                setQuery("");
              }}
              placeholder="Search by email…"
              label="Search subscribers"
            />
          }
          chips={filterChips}
          onClearAll={
            filterChips.length
              ? () => {
                  setSearch("");
                  setQuery("");
                  setStatus("all");
                }
              : undefined
          }
        >
          <AdminFilterSegment label="Status" options={STATUS_FILTERS} value={status} onChange={setStatus} />
        </AdminFilterDock>

        {loading ? (
          <LoadingState label="Loading subscribers…" />
        ) : (
          <DataTable
            columns={["Email", "Source", "Status", "Subscribed", ""]}
            emptyMessage={query.trim() || status !== "all" ? "No subscribers match your filters" : "No subscribers yet"}
          >
            {subscribers.map((subscriber) => (
              <DataRow key={subscriber.id}>
                <DataCell>
                  <a href={`mailto:${subscriber.email}`} className="admin-link font-medium">
                    {subscriber.email}
                  </a>
                </DataCell>
                <DataCell className="admin-muted capitalize">{subscriber.source.replace(/_/g, " ")}</DataCell>
                <DataCell>
                  {subscriber.status === "active" ? (
                    <span className="inline-flex rounded-full bg-[var(--admin-badge-bg)] px-2.5 py-0.5 text-xs font-semibold text-[var(--admin-badge-fg)]">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-2.5 py-0.5 text-xs font-semibold text-[var(--admin-fg-muted)]">
                      Unsubscribed
                    </span>
                  )}
                </DataCell>
                <DataCell className="admin-muted whitespace-nowrap text-sm">
                  {formatDateTime(subscriber.createdAt)}
                </DataCell>
                <DataCell>
                  <div className="flex flex-wrap justify-end gap-2">
                    {subscriber.status === "active" ? (
                      <button
                        type="button"
                        className="btn-ghost text-xs"
                        disabled={workingId === subscriber.id}
                        onClick={() => setSubscriberStatus(subscriber, "unsubscribed")}
                      >
                        Unsubscribe
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-ghost text-xs"
                        disabled={workingId === subscriber.id}
                        onClick={() => setSubscriberStatus(subscriber, "active")}
                      >
                        Reactivate
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-ghost text-xs text-[var(--admin-danger)]"
                      disabled={workingId === subscriber.id}
                      onClick={() => setDeleteTarget(subscriber)}
                    >
                      Delete
                    </button>
                  </div>
                </DataCell>
              </DataRow>
            ))}
          </DataTable>
        )}
      </AdminCard>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete subscriber?"
        description={
          deleteTarget
            ? `Remove ${deleteTarget.email} from the newsletter list permanently?`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        loading={Boolean(workingId)}
        onClose={() => {
          if (!workingId) setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (deleteTarget) removeSubscriber(deleteTarget);
        }}
      />
    </div>
  );
}
