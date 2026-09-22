import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { AdminFilterDock, AdminFilterSegment } from "../components/ui/AdminFilterDock.jsx";
import { StatCard } from "../components/ui/StatCard.jsx";
import { DataTable, DataRow, DataCell } from "../components/ui/DataTable.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";
import { IconPayment } from "../components/icons/AdminIcons.jsx";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "refunded", label: "Refunded" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_STATUS_STYLES = {
  paid: "bg-[var(--admin-badge-bg)] text-[var(--admin-badge-fg)]",
  pending: "bg-[var(--admin-tab-active-bg)] text-[var(--admin-link)]",
  unverified: "border border-[var(--admin-border)] bg-[var(--admin-hover)] text-[var(--admin-fg-subtle)]",
  cancelled: "bg-[var(--admin-danger-bg)] text-[var(--admin-danger)]",
  refunded: "bg-[var(--admin-danger-bg)] text-[var(--admin-danger)]",
};

function formatDateTime(iso) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function PaymentStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
        PAYMENT_STATUS_STYLES[status] ?? PAYMENT_STATUS_STYLES.unverified
      }`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function TransactionsPage() {
  const [status, setStatus] = useState("all");
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalCollected: 0,
    paidCount: 0,
    totalRefunded: 0,
    refundedCount: 0,
    transactionCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    apiFetch(`/api/admin/transactions?status=${status}`)
      .then((data) => {
        setTransactions(data.transactions ?? []);
        setSummary(
          data.summary ?? {
            totalCollected: 0,
            paidCount: 0,
            totalRefunded: 0,
            refundedCount: 0,
            transactionCount: 0,
          }
        );
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [status]);

  const filterItems = useMemo(
    () =>
      STATUS_TABS.map((tab) => ({
        ...tab,
        count: tab.value === "all" ? summary.transactionCount : undefined,
      })),
    [summary.transactionCount]
  );

  if (loading && !transactions.length) {
    return <LoadingState label="Loading transactions…" />;
  }

  return (
    <div>
      <PageHeader
        title="Transactions"
        subtitle="Payment records from Razorpay — linked to each order."
      />

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total collected"
          value={`₹${summary.totalCollected.toLocaleString("en-IN")}`}
          accent="emerald"
          icon={<IconPayment />}
        />
        <StatCard
          label="Total refunded"
          value={`₹${summary.totalRefunded.toLocaleString("en-IN")}`}
          accent="gold"
          icon={<IconPayment />}
        />
        <StatCard
          label="Refunded"
          value={summary.refundedCount}
          accent="cream"
          icon={<IconPayment />}
        />
        <StatCard
          label="All transactions"
          value={summary.transactionCount}
          accent="marble"
          icon={<IconPayment />}
        />
      </div>

      <AdminFilterDock title="Find transactions" className="mt-6">
        <AdminFilterSegment
          label="Payment status"
          options={filterItems}
          value={status}
          onChange={setStatus}
        />
      </AdminFilterDock>

      <AdminCard className="mt-6" title="Transaction history">
        <DataTable
          columns={[
            "Paid on",
            "Order",
            "Customer",
            "Paid",
            "Refund",
            "Refunded on",
            "Status",
            "Reference",
          ]}
          emptyMessage="No transactions for this filter"
        >
          {transactions.map((t) => (
            <DataRow key={`${t.orderId}-${t.id}`}>
              <DataCell className="text-emerald-900/70">{formatDateTime(t.paidAt)}</DataCell>
              <DataCell>
                <Link
                  to={`/orders/${t.orderId}`}
                  className="font-medium text-emerald-800 transition hover:text-emerald-700"
                >
                  {t.orderId}
                </Link>
              </DataCell>
              <DataCell>
                <p className="font-medium text-emerald-900">{t.customerName}</p>
                {t.customerEmail && (
                  <p className="text-xs text-emerald-900/50">{t.customerEmail}</p>
                )}
              </DataCell>
              <DataCell className="capitalize">
                {t.gateway}
                {t.mode === "test" ? (
                  <span className="ml-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-700">
                    test
                  </span>
                ) : null}
              </DataCell>
              <DataCell className="font-medium">₹{t.amount.toLocaleString("en-IN")}</DataCell>
              <DataCell className="font-medium text-rose-800">
                {t.refundAmount != null ? `₹${t.refundAmount.toLocaleString("en-IN")}` : "—"}
              </DataCell>
              <DataCell className="text-emerald-900/70">
                {t.refundedAt ? formatDateTime(t.refundedAt) : "—"}
              </DataCell>
              <DataCell>
                <PaymentStatusBadge status={t.paymentStatus} />
              </DataCell>
              <DataCell className="font-mono text-xs text-emerald-900/60">
                {t.razorpayRefundId ?? t.razorpayPaymentId ?? "—"}
              </DataCell>
            </DataRow>
          ))}
        </DataTable>
      </AdminCard>
    </div>
  );
}
