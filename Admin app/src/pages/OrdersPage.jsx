import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { AdminFilterTabs } from "../components/ui/AdminFilterTabs.jsx";
import { StatCard } from "../components/ui/StatCard.jsx";
import { StatusBadge } from "../components/ui/StatusBadge.jsx";
import { DataTable, DataRow, DataCell } from "../components/ui/DataTable.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";
import { IconOrders, IconPackage } from "../components/icons/AdminIcons.jsx";

const STATUS_OPTIONS = [
  "all",
  "placed",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/admin/categories")
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const q = status === "all" ? "" : `?status=${status}`;
    apiFetch(`/api/admin/orders${q}`)
      .then((d) => {
        setOrders(d.orders ?? []);
        setError("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [status]);

  const categoryTabs = useMemo(
    () => [
      { value: "all", label: "All", count: orders.length },
      ...categories.map((category) => ({
        value: category.id,
        label: category.label,
        count: orders.filter((order) =>
          order.items.some((item) => item.categoryId === category.id)
        ).length,
      })),
    ],
    [categories, orders]
  );

  const filteredOrders = useMemo(
    () =>
      selectedCategory === "all"
        ? orders
        : orders.filter((order) => order.items.some((item) => item.categoryId === selectedCategory)),
    [orders, selectedCategory]
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

  return (
    <div>
      <PageHeader
        title="Order Management"
        subtitle="Track and manage customer orders across all statuses."
        action={
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="admin-input w-auto min-w-[180px]"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All statuses" : s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        }
      />

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <AdminFilterTabs items={categoryTabs} value={selectedCategory} onChange={setSelectedCategory} />

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
            columns={["Order ID", "Customer", "Category", "Status", "Total", "Date"]}
            emptyMessage="No orders found"
          >
            {filteredOrders.map((o) => (
              <DataRow key={o.id}>
                <DataCell>
                  <Link
                    to={`/orders/${o.id}`}
                    className="font-medium text-emerald-800 hover:text-emerald-700"
                  >
                    {o.id}
                  </Link>
                </DataCell>
                <DataCell>{o.customer?.fullName ?? "—"}</DataCell>
                <DataCell className="text-emerald-900/60">{getOrderCategorySummary(o)}</DataCell>
                <DataCell>
                  <StatusBadge status={o.status} />
                </DataCell>
                <DataCell className="font-medium">₹{o.total.toLocaleString("en-IN")}</DataCell>
                <DataCell className="text-emerald-900/55">
                  {new Date(o.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </DataCell>
              </DataRow>
            ))}
          </DataTable>
        )}
      </AdminCard>
    </div>
  );
}
