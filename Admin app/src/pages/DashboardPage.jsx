import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { StatusBadge } from "../components/ui/StatusBadge.jsx";
import { DataTable, DataRow, DataCell } from "../components/ui/DataTable.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";
import { AdminSelect } from "../components/ui/AdminSelect.jsx";
import { IconOrders, IconPackage, IconProducts, IconUsers } from "../components/icons/AdminIcons.jsx";

const RANGE_OPTIONS = [
  { value: "day", label: "Today" },
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
  { value: "all", label: "All time" },
];

const GROUP_OPTIONS = [
  { value: "day", label: "Group by day" },
  { value: "month", label: "Group by month" },
  { value: "year", label: "Group by year" },
];

function formatINR(value) {
  return `₹${Number(value ?? 0).toLocaleString("en-IN")}`;
}

function formatPeriodLabel(key) {
  if (!key) return "";
  const dayMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (dayMatch) {
    const d = new Date(Number(dayMatch[1]), Number(dayMatch[2]) - 1, Number(dayMatch[3]));
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }
  const monthMatch = /^(\d{4})-(\d{2})$/.exec(key);
  if (monthMatch) {
    const d = new Date(Number(monthMatch[1]), Number(monthMatch[2]) - 1, 1);
    return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  }
  return key;
}

function pickChartLabelIndices(length, maxLabels = 6) {
  if (length <= 0) return [];
  if (length <= maxLabels) return Array.from({ length }, (_, i) => i);
  const indices = [];
  for (let i = 0; i < maxLabels; i++) {
    indices.push(Math.round((i / (maxLabels - 1)) * (length - 1)));
  }
  return [...new Set(indices)];
}

function chartPointLimit(range, groupBy) {
  if (range === "month" && groupBy === "day") return 31;
  if (range === "year" && groupBy === "month") return 12;
  if (range === "year" && groupBy === "day") return 90;
  if (groupBy === "day") return 31;
  if (groupBy === "month") return 24;
  return 12;
}

function KpiCard({ label, value, hint, icon, growth }) {
  return (
    <div className="flex min-w-[200px] flex-1 flex-col rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="admin-caption">{label}</p>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] text-[var(--admin-link)]">
          {icon}
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-2">
        <p className="font-display text-4xl font-semibold text-[var(--admin-fg)]">{value}</p>
        {growth ? (
          <span className="rounded-md border border-[var(--admin-success-bg)] bg-[var(--admin-badge-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--admin-success)]">
            {growth}
          </span>
        ) : null}
      </div>
      {hint ? <p className="admin-muted mt-2 text-xs">{hint}</p> : null}
    </div>
  );
}

function RevenueLineChart({ series }) {
  const points = Array.isArray(series) ? series : [];
  if (points.length < 2) {
    return (
      <div className="admin-muted flex h-[220px] items-center justify-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] text-sm">
        Not enough data for chart
      </div>
    );
  }

  const values = points.map((p) => p.revenue);
  const max = Math.max(...values, 1);
  const min = 0;
  const range = max - min || 1;
  const width = 100;
  const height = 100;
  const padY = 8;

  const coords = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = padY + (1 - (v - min) / range) * (height - padY * 2);
    return { x, y };
  });

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`).join(" ");
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  const gridLines = [0.25, 0.5, 0.75, 1].map((t) => padY + (1 - t) * (height - padY * 2));

  const labelIndices = pickChartLabelIndices(points.length, points.length > 14 ? 7 : 5);

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-[220px] w-full">
        <defs>
          <linearGradient id="revenueArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(212,175,55,0.25)" />
            <stop offset="100%" stopColor="rgba(212,175,55,0)" />
          </linearGradient>
        </defs>
        {gridLines.map((y, i) => (
          <line
            key={i}
            x1="0"
            y1={y}
            x2={width}
            y2={y}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="0.3"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path d={areaPath} fill="url(#revenueArea)" />
        <path
          d={linePath}
          fill="none"
          stroke="#d4af37"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
        />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r="1.2" fill="#d4af37" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="admin-subtle mt-2 flex flex-wrap justify-between gap-x-2 gap-y-1 text-[10px] tracking-wide">
        {labelIndices.map((i) => (
          <span key={`${points[i].key}-${i}`} className="whitespace-nowrap">
            {formatPeriodLabel(points[i].key)}
          </span>
        ))}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsRange, setAnalyticsRange] = useState("month");
  const [analyticsGroupBy, setAnalyticsGroupBy] = useState("day");
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let attempt = 0;

    async function loadDashboard() {
      setError("");
      try {
        const res = await apiFetch("/api/admin/dashboard");
        if (!cancelled) setData(res);
      } catch (e) {
        attempt += 1;
        // Retry a few times — first paint often races backend/proxy startup.
        if (!cancelled && attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
          if (!cancelled) return loadDashboard();
        }
        if (!cancelled) {
          setData(null);
          setError(e.message || "Request failed");
        }
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  useEffect(() => {
    let cancelled = false;
    setAnalyticsLoading(true);
    apiFetch(`/api/admin/analytics?range=${analyticsRange}&groupBy=${analyticsGroupBy}`)
      .then((res) => {
        if (!cancelled) setAnalytics(res);
      })
      .catch(() => {
        if (!cancelled) setAnalytics(null);
      })
      .finally(() => {
        if (!cancelled) setAnalyticsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [analyticsRange, analyticsGroupBy, reloadToken]);

  if (error) {
    return (
      <div className="space-y-3">
        <p className="rounded-xl border border-[color-mix(in_srgb,var(--admin-danger)_40%,transparent)] bg-[var(--admin-danger-bg)] px-4 py-3 text-sm font-medium text-[var(--admin-danger)]">
          {error}
        </p>
        <button
          type="button"
          className="btn-primary text-xs"
          onClick={() => {
            setError("");
            setData(null);
            setReloadToken((value) => value + 1);
          }}
        >
          Retry dashboard
        </button>
      </div>
    );
  }

  if (!data) return <LoadingState label="Loading dashboard…" />;

  const { stats, recentOrders } = data;
  const summary = analytics?.summary ?? null;
  const bestSellers = analytics?.bestSellers ?? [];
  const series = analytics?.series ?? [];

  const cleanedSeries = (Array.isArray(series) ? series : [])
    .map((p) => ({
      key: String(p.key ?? ""),
      revenue: Number(p.revenue ?? 0),
    }))
    .filter((p) => p.key && Number.isFinite(p.revenue));

  const revenueSeries = cleanedSeries.slice(-chartPointLimit(analyticsRange, analyticsGroupBy));

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Comprehensive business overview including order volumes, inventory levels, and client acquisition metrics."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Orders" value={stats.orderCount} icon={<IconOrders />} />
        <KpiCard
          label="Pending Fulfillment"
          value={stats.pendingOrders}
          hint="Awaiting dispatch"
          icon={<IconPackage />}
        />
        <KpiCard
          label="Low stock SKUs"
          value={stats.lowStockVariants ?? 0}
          hint={`Active variants below ${stats.lowStockThreshold ?? 5} available`}
          icon={<IconPackage />}
        />
        <KpiCard
          label="Customers with orders"
          value={stats.customerCount}
          hint="Registered accounts with at least one completed sale"
          icon={<IconUsers />}
        />
      </div>

      {(stats.lowStockVariants > 0 || stats.outOfStockVariants > 0) && (
        <div className="mt-4 space-y-3">
          {stats.lowStockVariants > 0 ? (
            <Link
              to="/inventory?stock=low_stock"
              className="block rounded-xl border border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] px-4 py-3 text-sm text-[var(--admin-link)] transition hover:opacity-90"
            >
              <strong>{stats.lowStockVariants}</strong> active variant{stats.lowStockVariants === 1 ? "" : "s"}{" "}
              {stats.lowStockVariants === 1 ? "has" : "have"} low stock (below {stats.lowStockThreshold ?? 5} units
              available). Review inventory →
            </Link>
          ) : null}
          {stats.outOfStockVariants > 0 ? (
            <Link
              to="/inventory?stock=out_of_stock"
              className="block rounded-xl border border-[var(--admin-danger-bg)] bg-[var(--admin-danger-bg)] px-4 py-3 text-sm text-[var(--admin-danger)] transition hover:opacity-90"
            >
              <strong>{stats.outOfStockVariants}</strong> active variant{stats.outOfStockVariants === 1 ? "" : "s"}{" "}
              {stats.outOfStockVariants === 1 ? "is" : "are"} out of stock. Review inventory →
            </Link>
          ) : null}
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <AdminCard
          title="Sales Performance"
          action={
            <>
              <AdminSelect
                aria-label="Date range"
                value={analyticsRange}
                onChange={setAnalyticsRange}
                options={RANGE_OPTIONS}
              />
              <AdminSelect
                aria-label="Group by"
                value={analyticsGroupBy}
                onChange={setAnalyticsGroupBy}
                options={GROUP_OPTIONS}
              />
            </>
          }
        >
          {analyticsLoading ? (
            <p className="admin-muted text-sm">Analytics loading…</p>
          ) : !summary ? (
            <p className="text-sm text-red-300/90">Could not load analytics. Is the backend running?</p>
          ) : (
            <>
              <div className="grid gap-6 border-b border-[var(--admin-border)] pb-6 sm:grid-cols-3">
                <div>
                  <p className="admin-caption">Revenue</p>
                  <p className="mt-1 font-display text-3xl font-semibold text-gold-400">{formatINR(summary.revenue)}</p>
                </div>
                <div>
                  <p className="admin-caption">Orders</p>
                  <p className="mt-1 font-display text-3xl font-semibold text-[var(--admin-fg)]">{summary.orders}</p>
                </div>
                <div>
                  <p className="admin-caption">Avg. Order Value</p>
                  <p className="mt-1 font-display text-3xl font-semibold text-[var(--admin-fg)]">{formatINR(summary.aov)}</p>
                </div>
              </div>
              <div className="mt-6">
                <p className="admin-caption mb-3">Revenue Trend</p>
                <RevenueLineChart series={revenueSeries} />
              </div>
            </>
          )}
        </AdminCard>

        <AdminCard title="Top Products" subtitle="Period top 5">
          <div className="space-y-3">
            {bestSellers.slice(0, 5).map((p, i) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--admin-fg)]">
                    <span className="mr-2 font-display text-gold-400">{i + 1}.</span>
                    {p.name}
                  </p>
                  <p className="admin-muted mt-0.5 text-xs">{p.quantity} units sold</p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-gold-400">{formatINR(p.revenue)}</p>
              </div>
            ))}
            {bestSellers.length === 0 ? (
              <p className="admin-muted text-sm">No items sold in this period.</p>
            ) : null}
          </div>
        </AdminCard>
      </div>

      <AdminCard
        className="mt-8"
        title="Recent Transactions"
        action={
          <Link to="/orders" className="btn-ghost">
            View ledger →
          </Link>
        }
      >
        <DataTable
          columns={["Transaction ID", "Client Name", "Status", "Amount"]}
          emptyMessage="No orders yet"
        >
          {recentOrders.map((o) => (
            <DataRow key={o.id}>
              <DataCell>
                <Link
                  to={`/orders/${o.id}`}
                  className="font-medium text-gold-400 transition hover:text-gold-300"
                >
                  {o.id}
                </Link>
              </DataCell>
              <DataCell>{o.customerName}</DataCell>
              <DataCell>
                <StatusBadge status={o.status} />
              </DataCell>
              <DataCell className="font-semibold">{formatINR(o.total)}</DataCell>
            </DataRow>
          ))}
        </DataTable>
      </AdminCard>
    </div>
  );
}
