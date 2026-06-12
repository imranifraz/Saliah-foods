import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { getCustomerStoreUrl } from "../config/adminApps.js";
import { ProductManageModal } from "../components/ProductManageModal.jsx";
import { InventoryHistoryModal } from "../components/InventoryHistoryModal.jsx";
import { InventoryManageModal } from "../components/InventoryManageModal.jsx";
import { InlineAvailableStockCell } from "../components/InlineAvailableStockCell.jsx";
import { ConfirmDialog } from "../components/ConfirmDialog.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { StatCard } from "../components/ui/StatCard.jsx";
import { DataRow, DataCell } from "../components/ui/DataTable.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";
import { ProductThumb } from "../components/ui/ProductThumb.jsx";
import { IconPackage, IconProducts } from "../components/icons/AdminIcons.jsx";

const STOCK_FILTERS = [
  { value: "all", label: "All stock" },
  { value: "in_stock", label: "In stock" },
  { value: "low_stock", label: "Low stock" },
  { value: "out_of_stock", label: "Out of stock" },
];

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
];

const SORT_OPTIONS = [
  { value: "productName:asc", label: "Product (A–Z)" },
  { value: "productName:desc", label: "Product (Z–A)" },
  { value: "sku:asc", label: "SKU (A–Z)" },
  { value: "sku:desc", label: "SKU (Z–A)" },
  { value: "availableQuantity:asc", label: "Available (low to high)" },
  { value: "availableQuantity:desc", label: "Available (high to low)" },
  { value: "stockQuantity:asc", label: "On hand (low to high)" },
  { value: "stockQuantity:desc", label: "On hand (high to low)" },
  { value: "updatedAt:desc", label: "Recently updated" },
  { value: "updatedAt:asc", label: "Oldest updated" },
];

function IconSearch() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function IconFilter() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M4.5 12h15.75M7.5 18h9.75" />
    </svg>
  );
}

function IconClear() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
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

function IconEye() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconExternalLink({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5M10.5 13.5L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function TableIconButton({ onClick, label, children, disabled = false }) {
  return (
    <button
      type="button"
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--admin-border)] transition ${
        disabled
          ? "cursor-not-allowed opacity-40"
          : "text-[var(--admin-fg-muted)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]"
      }`}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function IconStockToggle({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

function StockStatusButton({ inStock, isLowStock, loading, onToggle }) {
  const actionLabel = inStock ? "Mark out of stock" : "Mark in stock";
  const label = isLowStock ? "Low stock" : inStock ? "In stock" : "Out of stock";

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={loading}
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
        isLowStock
          ? "border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] text-[var(--admin-link)] hover:opacity-90"
          : inStock
            ? "border-[var(--admin-success-bg)] bg-[var(--admin-badge-bg)] text-[var(--admin-success)] hover:opacity-90"
            : "border-[var(--admin-danger-bg)] bg-[var(--admin-danger-bg)] text-[var(--admin-danger)] hover:opacity-90"
      }`}
      aria-label={actionLabel}
      title={actionLabel}
    >
      {loading ? "…" : (
        <>
          <IconStockToggle className="h-3.5 w-3.5" />
          {label}
        </>
      )}
    </button>
  );
}

function formatUpdatedAt(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function escapeCsv(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function downloadInventoryCsv(items) {
  const headers = ["SKU", "Product", "Product status", "Slug", "Variant", "Category", "On hand", "Reserved", "Available", "Status", "Updated"];
  const rows = items.map((item) =>
    [
      item.sku,
      item.product.name,
      item.product.status === "draft" ? "Draft" : "Active",
      item.product.slug,
      item.weight,
      item.product.categoryLabel,
      item.stockQuantity,
      item.reservedQuantity ?? 0,
      item.availableQuantity ?? item.stockQuantity,
      item.isLowStock ? "Low stock" : item.inStock ? "In stock" : "Out of stock",
      formatUpdatedAt(item.updatedAt),
    ]
      .map(escapeCsv)
      .join(",")
  );
  const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `inventory-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function buildInventoryUrl({
  query,
  stockFilter,
  statusFilter,
  categoryFilter,
  productFilter,
  sortValue,
  page,
  pageSize,
  all = false,
}) {
  const [sort, direction] = sortValue.split(":");
  const params = new URLSearchParams();
  if (stockFilter !== "all") params.set("stock", stockFilter);
  if (statusFilter !== "all") params.set("status", statusFilter);
  if (query.trim()) params.set("q", query.trim());
  if (categoryFilter !== "all") params.set("category", categoryFilter);
  if (productFilter) params.set("product", productFilter);
  params.set("sort", sort);
  params.set("direction", direction);
  if (all) {
    params.set("all", "true");
  } else {
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
  }
  return `/api/admin/inventory?${params.toString()}`;
}

function buildInventoryPageParams({
  query,
  categoryFilter,
  stockFilter,
  statusFilter,
  sortValue,
  page,
  pageSize,
  productFilter,
  productLabel,
}) {
  const [sort, direction] = sortValue.split(":");
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (categoryFilter !== "all") params.set("category", categoryFilter);
  if (stockFilter !== "all") params.set("stock", stockFilter);
  if (statusFilter !== "all") params.set("status", statusFilter);
  if (productFilter) {
    params.set("product", productFilter);
    if (productLabel) params.set("productLabel", productLabel);
  }
  if (sortValue !== "productName:asc") {
    params.set("sort", sort);
    params.set("direction", direction);
  }
  if (page > 1) params.set("page", String(page));
  if (pageSize !== 25) params.set("pageSize", String(pageSize));
  return params;
}

export function InventoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const customerStoreUrl = getCustomerStoreUrl();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    inStock: 0,
    outOfStock: 0,
    lowStock: 0,
    unitsOnHand: 0,
    unitsReserved: 0,
    unitsAvailable: 0,
    lowStockThreshold: 5,
  });
  const [categoryCounts, setCategoryCounts] = useState({});
  const [totalAllCategories, setTotalAllCategories] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [stockFilter, setStockFilter] = useState(() => searchParams.get("stock") ?? "all");
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get("status") ?? "all");
  const [categoryFilter, setCategoryFilter] = useState(() => searchParams.get("category") ?? "all");
  const [productFilter, setProductFilter] = useState(() => searchParams.get("product") ?? "");
  const [productLabel, setProductLabel] = useState(() => searchParams.get("productLabel") ?? "");
  const [sortValue, setSortValue] = useState(() => searchParams.get("sort") ?? "productName:asc");
  const [page, setPage] = useState(() => Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1));
  const [pageSize, setPageSize] = useState(() => Number.parseInt(searchParams.get("pageSize") ?? "25", 10) || 25);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [bulkWorking, setBulkWorking] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkStockTarget, setBulkStockTarget] = useState(null);
  const [stockTarget, setStockTarget] = useState(null);
  const [togglingStockId, setTogglingStockId] = useState(null);
  const [manageInventory, setManageInventory] = useState(null);
  const [manageProduct, setManageProduct] = useState(null);
  const [historyTarget, setHistoryTarget] = useState(null);

  const hasNonDefaultSort = sortValue !== "productName:asc";
  const filtersActive =
    categoryFilter !== "all" ||
    stockFilter !== "all" ||
    statusFilter !== "all" ||
    hasNonDefaultSort ||
    Boolean(productFilter);
  const safePage = Math.min(page, totalPages);
  const showingFrom = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const showingTo = total === 0 ? 0 : Math.min(safePage * pageSize, total);
  const allPageSelected = items.length > 0 && items.every((item) => selectedIds.has(item.id));
  const somePageSelected = items.some((item) => selectedIds.has(item.id));

  useEffect(() => {
    apiFetch("/api/admin/categories")
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => {});
  }, []);

  const syncUrlParams = useCallback(
    (nextQuery, nextCategory, nextStock, nextStatus, nextSort, nextPage, nextPageSize, nextProduct, nextProductLabel) => {
      setSearchParams(
        buildInventoryPageParams({
          query: nextQuery,
          categoryFilter: nextCategory,
          stockFilter: nextStock,
          statusFilter: nextStatus,
          sortValue: nextSort,
          page: nextPage,
          pageSize: nextPageSize,
          productFilter: nextProduct ?? productFilter,
          productLabel: nextProductLabel ?? productLabel,
        }),
        { replace: true }
      );
    },
    [setSearchParams, productFilter, productLabel]
  );

  const load = useCallback(() => {
    setLoading(true);
    apiFetch(
      buildInventoryUrl({
        query,
        stockFilter,
        statusFilter,
        categoryFilter,
        productFilter,
        sortValue,
        page,
        pageSize,
      })
    )
      .then((data) => {
        const nextItems = data.items ?? [];
        setItems(nextItems);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
        setSummary(
          data.summary ?? {
            total: 0,
            inStock: 0,
            outOfStock: 0,
            lowStock: 0,
            unitsOnHand: 0,
            unitsReserved: 0,
            unitsAvailable: 0,
            lowStockThreshold: 5,
          }
        );
        setCategoryCounts(data.categoryCounts ?? {});
        setTotalAllCategories(data.totalAllCategories ?? 0);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [query, stockFilter, statusFilter, categoryFilter, productFilter, sortValue, page, pageSize]);

  useEffect(() => {
    const timer = window.setTimeout(load, query ? 180 : 0);
    return () => window.clearTimeout(timer);
  }, [load, query]);

  useEffect(() => {
    const urlQuery = searchParams.get("q") ?? "";
    const urlStock = searchParams.get("stock") ?? "all";
    const urlStatus = searchParams.get("status") ?? "all";
    const urlCategory = searchParams.get("category") ?? "all";
    const urlProduct = searchParams.get("product") ?? "";
    const urlProductLabel = searchParams.get("productLabel") ?? "";
    const rawSort = searchParams.get("sort") ?? "productName";
    const urlSort = rawSort.includes(":")
      ? rawSort
      : `${rawSort}:${searchParams.get("direction") ?? "asc"}`;
    const urlPage = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const urlPageSize = Number.parseInt(searchParams.get("pageSize") ?? "25", 10) || 25;
    setSearch(urlQuery);
    setQuery(urlQuery);
    setStockFilter(urlStock);
    setStatusFilter(urlStatus);
    setCategoryFilter(urlCategory);
    setProductFilter(urlProduct);
    setProductLabel(urlProductLabel);
    setSortValue(urlSort);
    setPage(urlPage);
    setPageSize(urlPageSize);
  }, [searchParams]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [query, stockFilter, statusFilter, categoryFilter, productFilter, sortValue, pageSize]);

  useEffect(() => {
    if (filtersActive) setFiltersOpen(true);
  }, [filtersActive]);

  const categoryOptions = useMemo(
    () => [
      { value: "all", label: `All categories (${totalAllCategories})` },
      ...categories.map((category) => ({
        value: category.id,
        label: `${category.label} (${categoryCounts[category.id] ?? 0})`,
      })),
    ],
    [categories, categoryCounts, totalAllCategories]
  );

  function handleSearch(event) {
    event.preventDefault();
    const nextQuery = search.trim();
    setQuery(nextQuery);
    syncUrlParams(nextQuery, categoryFilter, stockFilter, statusFilter, sortValue, 1, pageSize);
  }

  function clearSearch() {
    setSearch("");
    setQuery("");
    syncUrlParams("", categoryFilter, stockFilter, statusFilter, sortValue, 1, pageSize);
  }

  function setCategory(value) {
    setCategoryFilter(value);
    syncUrlParams(query, value, stockFilter, statusFilter, sortValue, 1, pageSize);
  }

  function setStock(value) {
    setStockFilter(value);
    syncUrlParams(query, categoryFilter, value, statusFilter, sortValue, 1, pageSize);
  }

  function setStatus(value) {
    setStatusFilter(value);
    syncUrlParams(query, categoryFilter, stockFilter, value, sortValue, 1, pageSize);
  }

  function setSort(nextSort) {
    setSortValue(nextSort);
    syncUrlParams(query, categoryFilter, stockFilter, statusFilter, nextSort, 1, pageSize);
  }

  function clearFilters() {
    setCategoryFilter("all");
    setStockFilter("all");
    setStatusFilter("all");
    setSortValue("productName:asc");
    syncUrlParams(query, "all", "all", "all", "productName:asc", 1, pageSize, productFilter, productLabel);
  }

  function clearProductFilter() {
    syncUrlParams(query, categoryFilter, stockFilter, statusFilter, sortValue, 1, pageSize, "", "");
  }

  function toggleSelected(id) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAllPage() {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allPageSelected) {
        items.forEach((item) => next.delete(item.id));
      } else {
        items.forEach((item) => next.add(item.id));
      }
      return next;
    });
  }

  async function bulkPatchStock(inStock) {
    setBulkWorking(true);
    setError("");
    try {
      await apiFetch("/api/admin/inventory/bulk", {
        method: "PATCH",
        body: JSON.stringify({
          ids: [...selectedIds],
          patch: { inStock },
        }),
      });
      setSelectedIds(new Set());
      setBulkStockTarget(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBulkWorking(false);
    }
  }

  async function toggleVariantStock(item) {
    setError("");
    setTogglingStockId(item.id);
    try {
      await apiFetch("/api/admin/inventory/bulk", {
        method: "PATCH",
        body: JSON.stringify({
          ids: [item.id],
          patch: { inStock: !item.inStock },
        }),
      });
      setStockTarget(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setTogglingStockId(null);
    }
  }

  async function exportCsv() {
    setExporting(true);
    setError("");
    try {
      const data = await apiFetch(
        buildInventoryUrl({
          query,
          stockFilter,
          statusFilter,
          categoryFilter,
          productFilter,
          sortValue,
          page,
          pageSize,
          all: true,
        })
      );
      downloadInventoryCsv(data.items ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      window.setTimeout(() => setExporting(false), 300);
    }
  }

  const lowStockThreshold = summary.lowStockThreshold ?? 5;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="admin-card admin-page-intro p-6">
        <div className="flex min-w-0 items-start gap-4">
          <span className="admin-page-intro__icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] text-[var(--admin-link)]">
            <IconPackage />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--admin-fg)]">
              Inventory Management
            </h1>
            <p className="admin-muted mt-2 max-w-2xl text-[15px] leading-relaxed">
              View SKU-wise stock for every product variant and update quantities quickly.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Variants in view" value={summary.total} accent="emerald" icon={<IconProducts />} />
        <StatCard label="In stock" value={summary.inStock} accent="gold" icon={<IconPackage />} />
        <button
          type="button"
          className="block w-full text-left transition hover:opacity-95"
          onClick={() => setStock("low_stock")}
        >
          <StatCard
            label={`Low stock (1–${lowStockThreshold})`}
            value={summary.lowStock}
            accent="cream"
            icon={<IconPackage />}
          />
        </button>
        <StatCard label="Out of stock" value={summary.outOfStock} accent="marble" icon={<IconPackage />} />
      </div>

      {summary.lowStock > 0 ? (
        <div className="rounded-xl border border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] px-4 py-3 text-sm text-[var(--admin-link)]">
          <strong>{summary.lowStock}</strong> variant{summary.lowStock === 1 ? "" : "s"} in this view{" "}
          {summary.lowStock === 1 ? "has" : "have"} low stock ({1}–{lowStockThreshold} units available).
        </div>
      ) : null}

      {summary.outOfStock > 0 ? (
        <div className="rounded-xl border border-[var(--admin-danger-bg)] bg-[var(--admin-danger-bg)] px-4 py-3 text-sm text-[var(--admin-danger)]">
          <strong>{summary.outOfStock}</strong> variant{summary.outOfStock === 1 ? "" : "s"} in this view{" "}
          {summary.outOfStock === 1 ? "is" : "are"} out of stock.
        </div>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}


      <AdminCard
        title="Inventory"
        subtitle="Search SKUs, filter by stock status, and update quantities."
        action={
          <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-2">
            <form onSubmit={handleSearch} className="min-w-0 flex-1 sm:max-w-md">
              <div className="flex w-full min-w-0 items-stretch overflow-hidden rounded-lg border border-[var(--admin-border-strong)] bg-[var(--admin-input-bg)]">
                <span className="flex shrink-0 items-center pl-3 text-[var(--admin-fg-muted)]">
                  <IconSearch />
                </span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search SKU, product, or slug…"
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
            <button
              type="button"
              className={`relative inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg border transition ${
                filtersOpen || filtersActive
                  ? "border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] text-[var(--admin-link)]"
                  : "border-[var(--admin-border-strong)] bg-[var(--admin-input-bg)] text-[var(--admin-fg-muted)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]"
              }`}
              aria-label="Filter inventory"
              aria-expanded={filtersOpen}
              title="Filter"
              onClick={() => setFiltersOpen((open) => !open)}
            >
              <IconFilter />
              {filtersActive ? (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--admin-link)]" aria-hidden />
              ) : null}
            </button>
            <button
              type="button"
              className="inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg border border-[var(--admin-border-strong)] bg-[var(--admin-input-bg)] text-[var(--admin-fg-muted)] transition hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={exporting ? "Exporting inventory" : "Export inventory to CSV"}
              title={exporting ? "Exporting…" : "Export CSV"}
              disabled={exporting || loading}
              onClick={exportCsv}
            >
              {exporting ? <span className="text-xs font-semibold">…</span> : <IconDownload />}
            </button>
          </div>
        }
      >
        {filtersOpen ? (
          <div className="mb-4 flex flex-col gap-3 border-b border-[var(--admin-border)] pb-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-3">
            <div className="w-full sm:w-[12rem]">
              <label className="admin-caption mb-1.5 block">Category</label>
              <select
                value={categoryFilter}
                onChange={(event) => setCategory(event.target.value)}
                className="admin-input"
                aria-label="Filter by category"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-[11rem]">
              <label className="admin-caption mb-1.5 block">Stock</label>
              <select
                value={stockFilter}
                onChange={(event) => setStock(event.target.value)}
                className="admin-input"
                aria-label="Filter by stock status"
              >
                {STOCK_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-[11rem]">
              <label className="admin-caption mb-1.5 block">Product status</label>
              <select
                value={statusFilter}
                onChange={(event) => setStatus(event.target.value)}
                className="admin-input"
                aria-label="Filter by product status"
              >
                {STATUS_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-[12rem]">
              <label className="admin-caption mb-1.5 block">Sort by</label>
              <select
                value={sortValue}
                onChange={(event) => setSort(event.target.value)}
                className="admin-input"
                aria-label="Sort inventory"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {filtersActive ? (
              <button type="button" className="btn-ghost text-sm" onClick={clearFilters}>
                Clear filters
              </button>
            ) : null}
          </div>
        ) : null}

        {(query.trim() ||
          stockFilter !== "all" ||
          statusFilter !== "all" ||
          categoryFilter !== "all" ||
          productFilter ||
          hasNonDefaultSort) && (
          <div className="mb-4 flex flex-wrap gap-2">
            {query.trim() ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-1 text-xs font-semibold text-[var(--admin-fg)]">
                Search: {query}
                <button type="button" className="rounded-full p-0.5 text-[var(--admin-fg-muted)] transition hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]" aria-label="Remove search filter" onClick={clearSearch}>
                  <IconClear />
                </button>
              </span>
            ) : null}
            {stockFilter !== "all" ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-1 text-xs font-semibold text-[var(--admin-fg)]">
                {STOCK_FILTERS.find((filter) => filter.value === stockFilter)?.label ?? stockFilter}
                <button type="button" className="rounded-full p-0.5 text-[var(--admin-fg-muted)] transition hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]" aria-label="Remove stock filter" onClick={() => setStock("all")}>
                  <IconClear />
                </button>
              </span>
            ) : null}
            {statusFilter !== "all" ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-1 text-xs font-semibold text-[var(--admin-fg)]">
                {STATUS_FILTERS.find((filter) => filter.value === statusFilter)?.label}
                <button type="button" className="rounded-full p-0.5 text-[var(--admin-fg-muted)] transition hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]" aria-label="Remove status filter" onClick={() => setStatus("all")}>
                  <IconClear />
                </button>
              </span>
            ) : null}
            {productFilter ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-1 text-xs font-semibold text-[var(--admin-fg)]">
                Product: {productLabel || productFilter}
                <button type="button" className="rounded-full p-0.5 text-[var(--admin-fg-muted)] transition hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]" aria-label="Remove product filter" onClick={clearProductFilter}>
                  <IconClear />
                </button>
              </span>
            ) : null}
            {categoryFilter !== "all" ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-1 text-xs font-semibold text-[var(--admin-fg)]">
                {categories.find((category) => category.id === categoryFilter)?.label ?? categoryFilter}
                <button type="button" className="rounded-full p-0.5 text-[var(--admin-fg-muted)] transition hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]" aria-label="Remove category filter" onClick={() => setCategory("all")}>
                  <IconClear />
                </button>
              </span>
            ) : null}
            {hasNonDefaultSort ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-1 text-xs font-semibold text-[var(--admin-fg)]">
                {SORT_OPTIONS.find((option) => option.value === sortValue)?.label ?? sortValue}
                <button type="button" className="rounded-full p-0.5 text-[var(--admin-fg-muted)] transition hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]" aria-label="Reset sort" onClick={() => setSort("productName:asc")}>
                  <IconClear />
                </button>
              </span>
            ) : null}
          </div>
        )}

        {selectedIds.size > 0 ? (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-4 py-3">
            <span className="text-sm font-semibold text-[var(--admin-fg)]">{selectedIds.size} selected</span>
            <button type="button" className="btn-ghost text-sm" disabled={bulkWorking} onClick={() => setBulkStockTarget("in")}>
              Mark in stock
            </button>
            <button type="button" className="btn-ghost text-sm" disabled={bulkWorking} onClick={() => setBulkStockTarget("out")}>
              Mark out of stock
            </button>
            <button type="button" className="btn-ghost text-sm" disabled={bulkWorking} onClick={() => setSelectedIds(new Set())}>
              Clear selection
            </button>
          </div>
        ) : null}

        {loading ? (
          <LoadingState label="Loading inventory…" />
        ) : items.length === 0 ? (
          <p className="admin-muted px-5 py-12 text-center text-[15px]">
            {query.trim() || stockFilter !== "all" || categoryFilter !== "all"
              ? "No inventory items match your filters."
              : "No inventory items found."}
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--admin-border)]">
                    <th className="admin-caption w-10 px-3 py-3.5">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-[var(--admin-border-strong)]"
                        checked={allPageSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = somePageSelected && !allPageSelected;
                        }}
                        onChange={toggleSelectAllPage}
                        aria-label="Select all on this page"
                      />
                    </th>
                    {["SKU", "Product", "Category", "Available stock", "Reserved stock", "Status", "Updated", "Actions"].map((column) => (
                      <th key={column} className="admin-caption px-5 py-3.5">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--admin-border)]">
                  {items.map((item) => {
                    const storefrontHref =
                      customerStoreUrl && item.product.slug
                        ? `${customerStoreUrl}/product/${item.product.slug}`
                        : "";

                    return (
                      <DataRow key={item.id} className={selectedIds.has(item.id) ? "bg-[var(--admin-hover)]/40" : ""}>
                        <DataCell className="w-10 px-3">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-[var(--admin-border-strong)]"
                            checked={selectedIds.has(item.id)}
                            onChange={() => toggleSelected(item.id)}
                            aria-label={`Select ${item.sku}`}
                          />
                        </DataCell>
                        <DataCell className="font-mono text-xs">{item.sku}</DataCell>
                        <DataCell>
                          <div className="flex items-center gap-3">
                            <ProductThumb product={item.product} alt={item.product.name} />
                            <div className="min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() => setManageInventory({ item, mode: "view" })}
                                className="block w-full truncate text-left font-semibold text-[var(--admin-fg)] transition hover:text-[var(--admin-link)]"
                              >
                                {item.product.name}
                              </button>
                              {item.product.slug ? (
                                storefrontHref ? (
                                  <a
                                    href={storefrontHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="admin-muted inline-flex max-w-full items-center gap-1 truncate text-xs transition hover:text-[var(--admin-link)]"
                                    aria-label={`View ${item.product.name} on customer site`}
                                    title="View on customer site"
                                  >
                                    <span className="truncate">/product/{item.product.slug}</span>
                                    <IconExternalLink className="h-3 w-3 shrink-0" />
                                  </a>
                                ) : (
                                  <p className="admin-muted truncate text-xs">/product/{item.product.slug}</p>
                                )
                              ) : null}
                              {item.product.status === "draft" ? (
                                <p className="admin-muted text-[10px] font-semibold uppercase tracking-wide">Draft product</p>
                              ) : null}
                              {item.weight ? (
                                <p className="admin-muted text-xs">{item.weight}</p>
                              ) : null}
                            </div>
                          </div>
                        </DataCell>
                        <DataCell>
                          <Link
                            to={`/products?category=${encodeURIComponent(item.product.categoryId)}`}
                            className="font-medium text-[var(--admin-link)] transition hover:underline"
                          >
                            {item.product.categoryLabel}
                          </Link>
                        </DataCell>
                        <DataCell className="font-semibold text-[var(--admin-fg)]">
                          <InlineAvailableStockCell item={item} onSaved={load} onError={setError} />
                        </DataCell>
                        <DataCell className="admin-muted">{item.reservedQuantity ?? 0}</DataCell>
                        <DataCell>
                          <StockStatusButton
                            inStock={item.inStock}
                            isLowStock={item.isLowStock}
                            loading={togglingStockId === item.id}
                            onToggle={() => setStockTarget(item)}
                          />
                        </DataCell>
                        <DataCell className="admin-muted whitespace-nowrap text-sm">
                          {formatUpdatedAt(item.updatedAt)}
                        </DataCell>
                        <DataCell>
                          <div className="flex items-center justify-end gap-1">
                            <TableIconButton label="View inventory" onClick={() => setManageInventory({ item, mode: "view" })}>
                              <IconEye />
                            </TableIconButton>
                            <TableIconButton label="Edit stock" onClick={() => setManageInventory({ item, mode: "edit" })}>
                              <IconEdit />
                            </TableIconButton>
                          </div>
                        </DataCell>
                      </DataRow>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="-mx-5 -mb-5 flex flex-col gap-3 border-t border-[var(--admin-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="admin-muted text-sm">
                Showing {showingFrom} to {showingTo} of {total} variant{total === 1 ? "" : "s"}
                {summary.unitsOnHand > 0
                  ? ` · ${summary.unitsOnHand} on hand · ${summary.unitsReserved ?? 0} reserved · ${summary.unitsAvailable ?? 0} available`
                  : ""}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-[var(--admin-fg-muted)]">
                  <span className="whitespace-nowrap">Per page</span>
                  <div className="flex items-stretch overflow-hidden rounded-lg border border-[var(--admin-border-strong)] bg-[var(--admin-input-bg)]">
                    <select
                      value={pageSize}
                      onChange={(event) => {
                        const next = Number(event.target.value);
                        setPageSize(next);
                        syncUrlParams(query, categoryFilter, stockFilter, statusFilter, sortValue, 1, next);
                      }}
                      aria-label="Results per page"
                      className="admin-input admin-select !min-w-[4.5rem] w-auto rounded-none border-0 bg-transparent py-2.5 pl-3 pr-8"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </label>
                <div className="flex items-center gap-2">
                  <TableIconButton
                    label="Previous page"
                    disabled={safePage <= 1}
                    onClick={() =>
                      syncUrlParams(query, categoryFilter, stockFilter, statusFilter, sortValue, safePage - 1, pageSize)
                    }
                  >
                    <IconChevronLeft />
                  </TableIconButton>
                  <span className="admin-muted min-w-[5.5rem] text-center text-sm">
                    Page {safePage} of {totalPages}
                  </span>
                  <TableIconButton
                    label="Next page"
                    disabled={safePage >= totalPages}
                    onClick={() =>
                      syncUrlParams(query, categoryFilter, stockFilter, statusFilter, sortValue, safePage + 1, pageSize)
                    }
                  >
                    <IconChevronRight />
                  </TableIconButton>
                </div>
              </div>
            </div>
          </>
        )}
      </AdminCard>

      <InventoryManageModal
        open={Boolean(manageInventory)}
        item={manageInventory?.item ?? null}
        mode={manageInventory?.mode ?? "view"}
        onClose={() => setManageInventory(null)}
        onUpdated={load}
        onViewHistory={(entry) => {
          setManageInventory(null);
          setHistoryTarget(entry);
        }}
        onViewProduct={(productId) => {
          setManageInventory(null);
          setManageProduct({ id: productId, mode: "view" });
        }}
      />

      <ProductManageModal
        open={Boolean(manageProduct)}
        productId={manageProduct?.id ?? null}
        mode={manageProduct?.mode ?? "view"}
        categories={categories}
        onClose={() => setManageProduct(null)}
        onUpdated={load}
      />

      <InventoryHistoryModal
        open={Boolean(historyTarget)}
        item={historyTarget}
        onClose={() => setHistoryTarget(null)}
      />

      <ConfirmDialog
        open={Boolean(stockTarget)}
        title={stockTarget?.inStock ? "Mark out of stock?" : "Mark in stock?"}
        description={
          stockTarget
            ? stockTarget.inStock
              ? `Set "${stockTarget.sku}" to zero available stock? It will be unavailable on the shop.`
              : `Restock "${stockTarget.sku}"? On-hand quantity will be set to at least 10 units (or reserved + 10 if higher).`
            : ""
        }
        confirmLabel={stockTarget?.inStock ? "Mark out of stock" : "Mark in stock"}
        cancelLabel="Cancel"
        danger={Boolean(stockTarget?.inStock)}
        loading={Boolean(togglingStockId)}
        onClose={() => {
          if (!togglingStockId) setStockTarget(null);
        }}
        onConfirm={() => {
          if (stockTarget) toggleVariantStock(stockTarget);
        }}
      />

      <ConfirmDialog
        open={bulkStockTarget === "in"}
        title="Mark selected in stock?"
        description={`Set ${selectedIds.size} selected variant${selectedIds.size === 1 ? "" : "s"} back in stock? Variants at zero will be restocked to 10 units.`}
        confirmLabel="Mark in stock"
        cancelLabel="Cancel"
        loading={bulkWorking}
        onClose={() => {
          if (!bulkWorking) setBulkStockTarget(null);
        }}
        onConfirm={() => bulkPatchStock(true)}
      />

      <ConfirmDialog
        open={bulkStockTarget === "out"}
        title="Mark selected out of stock?"
        description={`Set ${selectedIds.size} selected variant${selectedIds.size === 1 ? "" : "s"} to zero stock? They will be unavailable on the shop.`}
        confirmLabel="Mark out of stock"
        cancelLabel="Cancel"
        danger
        loading={bulkWorking}
        onClose={() => {
          if (!bulkWorking) setBulkStockTarget(null);
        }}
        onConfirm={() => bulkPatchStock(false)}
      />
    </div>
  );
}
