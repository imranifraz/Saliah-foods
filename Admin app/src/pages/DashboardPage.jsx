import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { StatCard } from "../components/ui/StatCard.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { StatusBadge } from "../components/ui/StatusBadge.jsx";
import { DataTable, DataRow, DataCell } from "../components/ui/DataTable.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";
import { IconOrders, IconPackage, IconProducts, IconUsers } from "../components/icons/AdminIcons.jsx";

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/admin/dashboard")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
    );
  }

  if (!data) return <LoadingState label="Loading dashboard…" />;

  const { stats, recentOrders } = data;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your store — orders, products, and customers at a glance."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total orders"
          value={stats.orderCount}
          accent="emerald"
          icon={<IconOrders />}
        />
        <StatCard
          label="Pending orders"
          value={stats.pendingOrders}
          hint="Awaiting fulfillment"
          accent="gold"
          icon={<IconPackage />}
        />
        <StatCard
          label="Products"
          value={stats.productCount}
          accent="cream"
          icon={<IconProducts />}
        />
        <StatCard
          label="Customers"
          value={stats.customerCount}
          accent="marble"
          icon={<IconUsers />}
        />
      </div>

      <AdminCard
        className="mt-8"
        title="Recent orders"
        action={
          <Link to="/orders" className="btn-ghost text-xs">
            View all →
          </Link>
        }
      >
        <DataTable
          columns={["Order", "Customer", "Status", "Total"]}
          emptyMessage="No orders yet"
        >
          {recentOrders.map((o) => (
            <DataRow key={o.id}>
              <DataCell>
                <Link
                  to={`/orders/${o.id}`}
                  className="font-medium text-emerald-800 transition hover:text-emerald-700"
                >
                  {o.id}
                </Link>
              </DataCell>
              <DataCell className="text-emerald-900/80">{o.customerName}</DataCell>
              <DataCell>
                <StatusBadge status={o.status} />
              </DataCell>
              <DataCell className="font-medium">₹{o.total.toLocaleString("en-IN")}</DataCell>
            </DataRow>
          ))}
        </DataTable>
      </AdminCard>
    </div>
  );
}
