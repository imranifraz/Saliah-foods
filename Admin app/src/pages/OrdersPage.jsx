import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { AdminFilterDock, AdminFilterSegment } from "../components/ui/AdminFilterDock.jsx";
import { StatCard } from "../components/ui/StatCard.jsx";
import { StatusBadge } from "../components/ui/StatusBadge.jsx";
import { DataTable, DataRow, DataCell } from "../components/ui/DataTable.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";
import { ConfirmDialog } from "../components/ConfirmDialog.jsx";
import { IconOrders, IconPackage } from "../components/icons/AdminIcons.jsx";
import { ORDER_BUCKETS, isOrderInBucket } from "../lib/orderStatus.js";
import { formatRefundAmount, getRefundDetails } from "../utils/paymentRefund.js";
import { useAdminToast } from "../context/AdminToastContext.jsx";

function IconTrash() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    </svg>
  );
}

export function OrdersPage() {
  const toast = useAdminToast();
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bucket, setBucket] = useState("active");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    apiFetch("/api/admin/categories")
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    apiFetch("/api/admin/orders")
      .then((d) => {
        setOrders(d.orders ?? []);
        setError("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const bucketCounts = useMemo(
    () => ({
      active: orders.filter((order) => isOrderInBucket(order, "active")).length,
      past: orders.filter((order) => isOrderInBucket(order, "past")).length,
      cancelled: orders.filter((order) => isOrderInBucket(order, "cancelled")).length,
    }),
    [orders]
  );

  const bucketTabs = useMemo(
    () =>
      ORDER_BUCKETS.map((item) => ({
        value: item.id,
        label: item.label,
        count: bucketCounts[item.id] ?? 0,
      })),
    [bucketCounts]
  );

  const bucketOrders = useMemo(
    () => orders.filter((order) => isOrderInBucket(order, bucket)),
    [orders, bucket]
  );

  const categoryTabs = useMemo(
    () => [
      { value: "all", label: "All", count: bucketOrders.length },
      ...categories.map((category) => ({
        value: category.id,
        label: category.label,
        count: bucketOrders.filter((order) =>
          order.items.some((item) => item.categoryId === category.id)
        ).length,
      })),
    ],
    [categories, bucketOrders]
  );

  const filteredOrders = useMemo(
    () =>
      selectedCategory === "all"
        ? bucketOrders
        : bucketOrders.filter((order) =>
            order.items.some((item) => item.categoryId === selectedCategory)
          ),
    [bucketOrders, selectedCategory]
  );

  const metrics = useMemo(() => {
    const readyToPack = filteredOrders.filter((order) => order.status === "confirmed").length;
    const inProgress = filteredOrders.filter((order) =>
      ["packed", "shipped", "out_for_delivery"].includes(order.status)
    ).length;
    const delivered = filteredOrders.filter((order) => order.status === "delivered").length;

    return {
      total: filteredOrders.length,
      readyToPack,
      inProgress,
      delivered,
    };
  }, [filteredOrders]);

  function getOrderCategorySummary(order) {
    const labels = [...new Set(order.items.map((item) => item.categoryLabel).filter(Boolean))];
    if (!labels.length) return "—";
    if (labels.length === 1) return labels[0];
    return `${labels[0]} +${labels.length - 1}`;
  }

  async function handleDelete(order) {
    if (!order?.id) return;
    setDeletingId(order.id);
    setError("");
    try {
      await apiFetch(`/api/admin/orders/${order.id}`, { method: "DELETE" });
      setOrders((current) => current.filter((row) => row.id !== order.id));
      setDeleteTarget(null);
      toast.success("Order deleted");
    } catch (err) {
      setError(err.message ?? "Could not delete order");
      toast.error("Could not delete order", err.message);
    } finally {
      setDeletingId("");
    }
  }

  const emptyMessages = {
    active: "No active orders",
    past: "No past orders",
    cancelled: "No cancelled orders",
  };

  return (
    <div>
      <PageHeader
        title="Order Management"
        subtitle="Track and manage customer orders across active, past, and cancelled."
      />

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <AdminFilterDock
        title="Find orders"
        className="mb-6"
        chips={
          selectedCategory !== "all"
            ? [
                {
                  key: "category",
                  label:
                    categoryTabs.find((tab) => tab.value === selectedCategory)?.label ?? selectedCategory,
                  onRemove: () => setSelectedCategory("all"),
                },
              ]
            : []
        }
        onClearAll={selectedCategory !== "all" ? () => setSelectedCategory("all") : undefined}
      >
        <AdminFilterSegment
          label="Order status"
          options={bucketTabs}
          value={bucket}
          onChange={(next) => {
            setBucket(next);
            setSelectedCategory("all");
          }}
        />
        <AdminFilterSegment
          label="Category"
          options={categoryTabs}
          value={selectedCategory}
          onChange={setSelectedCategory}
        />
      </AdminFilterDock>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Orders in view" value={metrics.total} accent="emerald" icon={<IconOrders />} />
        <StatCard label="Ready to pack" value={metrics.readyToPack} accent="gold" icon={<IconPackage />} />
        <StatCard label="In progress" value={metrics.inProgress} accent="cream" icon={<IconOrders />} />
        <StatCard label="Delivered" value={metrics.delivered} accent="marble" icon={<IconPackage />} />
      </div>

      <AdminCard>
        {loading ? (
          <LoadingState label="Loading orders…" />
        ) : (
          <DataTable
            columns={["Order ID", "Customer", "Category", "Status", "Payment", "Total", "Date", ""]}
            emptyMessage={emptyMessages[bucket] ?? "No orders found"}
          >
            {filteredOrders.map((o) => {
              const refund = getRefundDetails(o);
              return (
                <DataRow key={o.id}>
                  <DataCell>
                    <Link to={`/orders/${o.id}`} className="admin-link">
                      {o.id}
                    </Link>
                  </DataCell>
                  <DataCell>{o.customer?.fullName ?? "—"}</DataCell>
                  <DataCell className="admin-muted">{getOrderCategorySummary(o)}</DataCell>
                  <DataCell>
                    <StatusBadge status={o.status} />
                  </DataCell>
                  <DataCell>
                    {refund?.isRefunded ? (
                      <div>
                        <p className="text-xs font-semibold uppercase text-rose-700">Refunded</p>
                        <p className="text-sm font-medium">{formatRefundAmount(refund.amount)}</p>
                      </div>
                    ) : (
                      <span className="text-sm capitalize admin-muted">
                        {o.customer?.payment?.status ?? o.paymentMethod ?? "—"}
                      </span>
                    )}
                  </DataCell>
                  <DataCell className="font-medium text-cream-50">₹{o.total.toLocaleString("en-IN")}</DataCell>
                  <DataCell className="admin-muted">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </DataCell>
                  <DataCell>
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                      aria-label={`Delete order ${o.id}`}
                      title="Delete order"
                      disabled={Boolean(deletingId)}
                      onClick={() => setDeleteTarget(o)}
                    >
                      {deletingId === o.id ? <span className="text-xs">…</span> : <IconTrash />}
                    </button>
                  </DataCell>
                </DataRow>
              );
            })}
          </DataTable>
        )}
      </AdminCard>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete order?"
        description={
          deleteTarget
            ? `Permanently delete ${deleteTarget.id} for ${deleteTarget.customer?.fullName ?? "this customer"}? Reserved stock for open orders will be released. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete order"
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
