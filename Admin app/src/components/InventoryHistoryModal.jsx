import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { AdminModalLayout } from "./AdminModalLayout.jsx";
import { LoadingState } from "./ui/LoadingState.jsx";

const SOURCE_LABELS = {
  admin_manual: "Manual update",
  admin_bulk: "Bulk update",
  order_reserved: "Order reserved",
  order_fulfilled: "Order fulfilled",
  order_cancelled: "Order cancelled",
  product_sync: "Product sync",
};

function formatWhen(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatActor(entry) {
  if (entry.adminName) return entry.adminName;
  if (entry.adminEmail) return entry.adminEmail;
  if (entry.orderId) return `Order ${entry.orderId}`;
  return "System";
}

function formatChange(entry) {
  const stockPart =
    entry.previousStock === entry.newStock
      ? `On hand ${entry.newStock}`
      : `On hand ${entry.previousStock} → ${entry.newStock}`;
  const reservedPart =
    entry.previousReserved === entry.newReserved
      ? null
      : `Reserved ${entry.previousReserved} → ${entry.newReserved}`;
  return reservedPart ? `${stockPart} · ${reservedPart}` : stockPart;
}

export function InventoryHistoryModal({ open, item, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !item?.id) return undefined;

    setLoading(true);
    setError("");
    apiFetch(`/api/admin/inventory/${item.id}/history`)
      .then((data) => setHistory(data.history ?? []))
      .catch((err) => {
        setHistory([]);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [open, item?.id]);

  if (!open || !item) return null;

  return (
    <AdminModalLayout
      open={open}
      title="Stock history"
      subtitle={`${item.sku} · ${item.product?.name ?? "Product"}`}
      onClose={onClose}
      footer={
        <button type="button" className="btn-secondary" onClick={onClose}>
          Close
        </button>
      }
    >
      {loading ? (
        <LoadingState label="Loading history…" />
      ) : error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : history.length === 0 ? (
        <p className="admin-muted py-8 text-center text-sm">No stock changes recorded yet.</p>
      ) : (
        <ul className="divide-y divide-[var(--admin-border)]">
          {history.map((entry) => (
            <li key={entry.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-[var(--admin-fg)]">
                    {SOURCE_LABELS[entry.source] ?? entry.source}
                  </p>
                  <p className="admin-muted mt-1 text-sm">{formatChange(entry)}</p>
                  {entry.note ? <p className="admin-muted mt-1 text-xs">{entry.note}</p> : null}
                </div>
                <p className="admin-muted whitespace-nowrap text-xs">{formatWhen(entry.createdAt)}</p>
              </div>
              <p className="admin-muted mt-2 text-xs">
                By {formatActor(entry)}
                {entry.orderId ? (
                  <>
                    {" · "}
                    <Link to={`/orders/${entry.orderId}`} className="text-[var(--admin-link)] hover:underline">
                      View order
                    </Link>
                  </>
                ) : null}
              </p>
            </li>
          ))}
        </ul>
      )}
    </AdminModalLayout>
  );
}
