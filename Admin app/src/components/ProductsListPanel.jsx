import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { buildProductsUrl, downloadProductsCsv, formatProductDate } from "../lib/productForm.js";
import { getCustomerStoreUrl } from "../config/adminApps.js";
import { AdminCard } from "./ui/AdminCard.jsx";
import { StatCard } from "./ui/StatCard.jsx";
import { DataRow, DataCell } from "./ui/DataTable.jsx";
import { LoadingState } from "./ui/LoadingState.jsx";
import { ConfirmDialog } from "./ConfirmDialog.jsx";
import { ProductThumb } from "./ui/ProductThumb.jsx";
import { IconPackage, IconProducts } from "./icons/AdminIcons.jsx";

function IconPlus() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
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

function IconTrash() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
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

function IconStockToggle({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

function IconDuplicate() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75m9 6H9.375a1.125 1.125 0 00-1.125 1.125v9.75m3-6.75h6.75a1.125 1.125 0 011.125 1.125v9.75a1.125 1.125 0 01-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V9.375c0-.621.504-1.125 1.125-1.125z" />
    </svg>
  );
}

function IconStatusToggle({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconSync() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
];

const STOCK_FILTERS = [
  { value: "all", label: "All stock" },
  { value: "in_stock", label: "In stock" },
  { value: "out_of_stock", label: "Out of stock" },
];

const FEATURED_FILTERS = [
  { value: "all", label: "All featured" },
  { value: "featured", label: "Featured only" },
  { value: "none", label: "Not featured" },
];

const TYPE_FILTERS = [
  { value: "all", label: "All types" },
  { value: "simple", label: "Simple" },
  { value: "variant", label: "Variant" },
];

const BADGE_FILTERS = [
  { value: "all", label: "All badges" },
  { value: "new", label: "New arrival" },
  { value: "best_seller", label: "Best seller" },
];

const SORT_OPTIONS = [
  { value: "name:asc", label: "Name (A–Z)" },
  { value: "name:desc", label: "Name (Z–A)" },
  { value: "priceValue:asc", label: "Price (low to high)" },
  { value: "priceValue:desc", label: "Price (high to low)" },
  { value: "variantCount:desc", label: "Most variants" },
  { value: "updatedAt:desc", label: "Recently updated" },
  { value: "createdAt:desc", label: "Recently created" },
];

function TableIconButton({ onClick, label, children, danger = false, disabled = false }) {
  const className = `inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--admin-border)] transition ${
    disabled
      ? "cursor-not-allowed opacity-40"
      : danger
        ? "text-[var(--admin-danger)] hover:border-[color-mix(in_srgb,var(--admin-danger)_35%,transparent)] hover:bg-[var(--admin-hover)]"
        : "text-[var(--admin-fg-muted)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]"
  }`;

  return (
    <button type="button" className={className} aria-label={label} title={label} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

function ProductStatusButton({ status, loading, onToggle }) {
  const active = status === "active";
  const actionLabel = active ? "Mark as draft" : "Activate product";

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={loading}
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
        active
          ? "border-[var(--admin-success-bg)] bg-[var(--admin-badge-bg)] text-[var(--admin-success)] hover:opacity-90"
          : "border-[var(--admin-border)] bg-[var(--admin-surface-2)] text-[var(--admin-fg-muted)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]"
      }`}
      aria-label={actionLabel}
      title={actionLabel}
    >
      {loading ? (
        "…"
      ) : (
        <>
          <IconStatusToggle className="h-3.5 w-3.5" />
          {active ? "Active" : "Draft"}
        </>
      )}
    </button>
  );
}

function StockStatusButton({ inStock, loading, onToggle }) {
  const actionLabel = inStock ? "Mark out of stock" : "Mark in stock";

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={loading}
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
        inStock
          ? "border-[var(--admin-success-bg)] bg-[var(--admin-badge-bg)] text-[var(--admin-success)] hover:opacity-90"
          : "border-[var(--admin-danger-bg)] bg-[var(--admin-danger-bg)] text-[var(--admin-danger)] hover:opacity-90"
      }`}
      aria-label={actionLabel}
      title={actionLabel}
    >
      {loading ? (
        "…"
      ) : (
        <>
          <IconStockToggle className="h-3.5 w-3.5" />
          {inStock ? "In stock" : "Out of stock"}
        </>
      )}
    </button>
  );
}

function formatProductTypeLabel(product) {
  if (product.productType === "variant") {
    return `Variant – ${product.variantCount ?? 0}`;
  }
  return "Simple";
}

function getProductVariantLabels(product) {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const weights = variants
    .map((variant) => (variant.weight || variant.packSize || "").trim())
    .filter(Boolean);

  if (product.productType === "variant" && weights.length > 1) {
    return { text: weights.join(" · "), isMulti: true };
  }

  return { text: weights[0] || product.packSize || "", isMulti: false };
}

function getProductSkuInfo(product) {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const skus = variants.map((variant) => variant.sku).filter(Boolean);
  const inventoryTo = `/inventory?product=${encodeURIComponent(product.id)}&productLabel=${encodeURIComponent(product.name || "")}`;

  if (product.productType === "variant" && skus.length > 1) {
    return {
      isMulti: true,
      skus,
      inventoryTo,
      linkLabel: `View SKUs (${skus.length})`,
    };
  }

  return {
    isMulti: false,
    skus,
    inventoryTo,
    linkLabel: skus[0] || product.catalogId || null,
  };
}

function ProductPriceCell({ product, onViewPrices }) {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const isMultiVariant =
    product.productType === "variant" && (product.variantCount ?? variants.length) > 1;

  if (isMultiVariant) {
    const count = product.variantCount ?? variants.length;
    return (
      <button
        type="button"
        onClick={() => onViewPrices?.(product)}
        className="text-left text-xs font-semibold text-[var(--admin-link)] transition hover:underline"
        aria-label={`View prices for ${product.name}`}
        title="View variant prices"
      >
        View prices ({count})
      </button>
    );
  }

  const sellingPrice = Number(product.priceValue);
  const mrp = Number(product.mrpValue);
  const hasSellingPrice = Number.isFinite(sellingPrice) && sellingPrice > 0;
  const hasMrp = Number.isFinite(mrp) && mrp > 0;

  if (!hasSellingPrice && hasMrp) {
    return <p className="font-semibold text-[var(--admin-fg)]">{product.mrp}</p>;
  }

  if (hasSellingPrice && hasMrp && sellingPrice < mrp) {
    return (
      <div>
        <p className="admin-muted text-xs whitespace-nowrap line-through">{product.mrp}</p>
        <p className="font-semibold text-[var(--admin-fg)]">{product.price}</p>
        {product.discountPercent ? (
          <p className="admin-muted text-xs whitespace-nowrap">{product.discountPercent}% off</p>
        ) : null}
      </div>
    );
  }

  if (hasSellingPrice) {
    return <p className="font-semibold text-[var(--admin-fg)]">{product.price}</p>;
  }

  return <p className="admin-muted">—</p>;
}

function ProductBadges({ product }) {
  const badges = [];
  if (product.featured) badges.push({ key: "featured", label: "Featured" });
  if (product.isNew) badges.push({ key: "new", label: "New" });
  if (product.isBestSeller) badges.push({ key: "best", label: "Best seller" });
  if (product.badge) badges.push({ key: "custom", label: product.badge });

  if (!badges.length) return <span className="admin-muted text-xs">—</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {badges.map((badge) => (
        <span
          key={badge.key}
          className="inline-flex rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-2 py-0.5 text-[10px] font-semibold text-[var(--admin-fg)]"
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}

export const ProductsListPanel = forwardRef(function ProductsListPanel(
  { categories, onViewProduct, onViewPrices, onEditProduct, onCreateClick },
  ref
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [categoryFilter, setCategoryFilter] = useState(() => searchParams.get("category") ?? "all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [badgeFilter, setBadgeFilter] = useState("all");
  const [sortValue, setSortValue] = useState("name:asc");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    draft: 0,
    inStock: 0,
    outOfStock: 0,
    variants: 0,
    featured: 0,
    simple: 0,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [syncingBestSellers, setSyncingBestSellers] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkWorking, setBulkWorking] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [duplicateTarget, setDuplicateTarget] = useState(null);
  const [stockTarget, setStockTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [duplicatingId, setDuplicatingId] = useState(null);
  const [togglingStockId, setTogglingStockId] = useState(null);
  const [togglingStatusId, setTogglingStatusId] = useState(null);

  const customerStoreUrl = getCustomerStoreUrl();

  const categoryOptions = useMemo(
    () => [
      { value: "all", label: "All categories" },
      ...categories.map((category) => ({ value: category.id, label: category.label })),
    ],
    [categories]
  );

  const hasActiveFilters =
    categoryFilter !== "all" ||
    statusFilter !== "all" ||
    stockFilter !== "all" ||
    featuredFilter !== "all" ||
    typeFilter !== "all" ||
    badgeFilter !== "all" ||
    Boolean(query.trim());
  const hasNonDefaultSort = sortValue !== "name:asc";
  const filtersActive =
    categoryFilter !== "all" ||
    statusFilter !== "all" ||
    stockFilter !== "all" ||
    featuredFilter !== "all" ||
    typeFilter !== "all" ||
    badgeFilter !== "all" ||
    hasNonDefaultSort;

  const loadProducts = useCallback(() => {
    setLoading(true);
    const url = buildProductsUrl({
      query,
      categoryFilter,
      statusFilter,
      stockFilter,
      featuredFilter,
      typeFilter,
      badgeFilter,
      sortValue,
      page,
      pageSize,
      all: false,
    });

    apiFetch(url)
      .then((data) => {
        setProducts(data.products ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
        setSummary(
          data.summary ?? {
            total: 0,
            active: 0,
            draft: 0,
            inStock: 0,
            outOfStock: 0,
            variants: 0,
            featured: 0,
            simple: 0,
          }
        );
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [
    query,
    categoryFilter,
    statusFilter,
    stockFilter,
    featuredFilter,
    typeFilter,
    badgeFilter,
    sortValue,
    page,
    pageSize,
  ]);

  useImperativeHandle(ref, () => ({ reload: loadProducts }), [loadProducts]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const urlQuery = searchParams.get("q") ?? "";
    const urlCategory = searchParams.get("category") ?? "all";
    setSearch(urlQuery);
    setQuery(urlQuery);
    setCategoryFilter(urlCategory);
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [query, categoryFilter, statusFilter, stockFilter, featuredFilter, typeFilter, badgeFilter, sortValue, pageSize]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [query, categoryFilter, statusFilter, stockFilter, featuredFilter, typeFilter, badgeFilter, sortValue, page, pageSize]);

  useEffect(() => {
    if (filtersActive) setFiltersOpen(true);
  }, [filtersActive]);

  const safePage = Math.min(page, totalPages);
  const showingFrom = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const showingTo = total === 0 ? 0 : Math.min(safePage * pageSize, total);
  const allFilteredSelected = products.length > 0 && products.every((product) => selectedIds.has(product.id));
  const someFilteredSelected = products.some((product) => selectedIds.has(product.id));

  function syncUrlParams(nextQuery, nextCategory) {
    const next = new URLSearchParams(searchParams);
    if (nextQuery) next.set("q", nextQuery);
    else next.delete("q");
    if (nextCategory && nextCategory !== "all") next.set("category", nextCategory);
    else next.delete("category");
    setSearchParams(next, { replace: true });
  }

  function handleSearch(event) {
    event.preventDefault();
    const nextQuery = search.trim();
    setQuery(nextQuery);
    setPage(1);
    syncUrlParams(nextQuery, categoryFilter);
  }

  function clearSearch() {
    setSearch("");
    setQuery("");
    setPage(1);
    syncUrlParams("", categoryFilter);
  }

  function setCategory(value) {
    setCategoryFilter(value);
    setPage(1);
    syncUrlParams(query, value);
  }

  function clearFilter(setter) {
    setter("all");
    setPage(1);
  }

  function clearAllFilters() {
    setSearch("");
    setQuery("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setStockFilter("all");
    setFeaturedFilter("all");
    setTypeFilter("all");
    setBadgeFilter("all");
    setPage(1);
    syncUrlParams("", "all");
  }

  async function exportCsv() {
    setError("");
    setExporting(true);
    try {
      const url = buildProductsUrl({
        query,
        categoryFilter,
        statusFilter,
        stockFilter,
        featuredFilter,
        typeFilter,
        badgeFilter,
        sortValue,
        page: 1,
        pageSize,
        all: true,
      });
      const data = await apiFetch(url);
      downloadProductsCsv(data.products ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  }

  async function syncBestSellers() {
    setError("");
    setSyncingBestSellers(true);
    try {
      await apiFetch("/api/admin/products/sync-best-sellers", { method: "POST" });
      loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncingBestSellers(false);
    }
  }

  function toggleSelected(productId) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }

  function toggleSelectAllFiltered() {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(products.map((product) => product.id)));
  }

  async function bulkPatch(patch) {
    const ids = [...selectedIds];
    if (!ids.length) return;

    setError("");
    setBulkWorking(true);
    try {
      await apiFetch("/api/admin/products/bulk", {
        method: "PATCH",
        body: JSON.stringify({ ids, patch }),
      });
      setSelectedIds(new Set());
      loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setBulkWorking(false);
    }
  }

  async function bulkDelete() {
    const ids = [...selectedIds];
    if (!ids.length) return;

    setError("");
    setBulkWorking(true);
    try {
      const results = await Promise.allSettled(
        ids.map((id) => apiFetch(`/api/admin/products/${id}`, { method: "DELETE" }))
      );
      const failed = results.filter((result) => result.status === "rejected").length;
      if (failed > 0) {
        setError(`${failed} product${failed === 1 ? "" : "s"} could not be deleted.`);
      }
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
      loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setBulkWorking(false);
    }
  }

  async function toggleStock(product) {
    setError("");
    setTogglingStockId(product.id);
    try {
      await apiFetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        body: JSON.stringify({ inStock: !product.inStock }),
      });
      setStockTarget(null);
      loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setTogglingStockId(null);
    }
  }

  async function toggleStatus(product) {
    setError("");
    setTogglingStatusId(product.id);
    try {
      const nextStatus = product.status === "active" ? "draft" : "active";
      await apiFetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      setStatusTarget(null);
      loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setTogglingStatusId(null);
    }
  }

  async function duplicateProduct(product) {
    setError("");
    setDuplicatingId(product.id);
    try {
      await apiFetch(`/api/admin/products/${product.id}/duplicate`, { method: "POST" });
      setDuplicateTarget(null);
      loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setDuplicatingId(null);
    }
  }

  async function handleDelete(product) {
    setError("");
    setDeletingId(product.id);
    try {
      await apiFetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  const tableColumns = [
    "Product",
    "Category",
    "Type",
    "Price",
    "Badges",
    "Stock",
    "Status",
    "Created",
    "Updated",
    "Actions",
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total" value={summary.total} accent="emerald" icon={<IconProducts />} />
        <StatCard label="Active" value={summary.active} accent="gold" icon={<IconProducts />} />
        <StatCard label="Draft" value={summary.draft} accent="marble" icon={<IconProducts />} />
        <StatCard label="In stock" value={summary.inStock} accent="cream" icon={<IconPackage />} />
        <StatCard label="Out of stock" value={summary.outOfStock} accent="marble" icon={<IconPackage />} />
        <StatCard label="Variants" value={summary.variants} accent="emerald" icon={<IconPackage />} />
        <StatCard label="Simple" value={summary.simple} accent="marble" icon={<IconProducts />} />
        <StatCard label="Featured" value={summary.featured} accent="gold" icon={<IconProducts />} />
      </div>

      {summary.outOfStock > 0 ? (
        <div className="rounded-xl border border-[var(--admin-danger-bg)] bg-[var(--admin-danger-bg)] px-4 py-3 text-sm text-[var(--admin-danger)]">
          <strong>{summary.outOfStock}</strong> product{summary.outOfStock === 1 ? "" : "s"} in this view{" "}
          {summary.outOfStock === 1 ? "is" : "are"} out of stock. Review inventory or mark items back in stock.
        </div>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}


      <AdminCard
        title="Products"
        subtitle="Search, filter, and manage catalog items."
        action={
          <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              className="btn-ghost inline-flex items-center gap-2 text-sm"
              disabled={syncingBestSellers || loading}
              onClick={syncBestSellers}
            >
              <IconSync />
              {syncingBestSellers ? "Syncing…" : "Sync best sellers"}
            </button>
            <div className="flex w-full min-w-0 items-center gap-2 sm:max-w-md">
              <form onSubmit={handleSearch} className="min-w-0 flex-1">
                <div className="flex w-full min-w-0 items-stretch overflow-hidden rounded-lg border border-[var(--admin-border-strong)] bg-[var(--admin-input-bg)]">
                  <span className="flex shrink-0 items-center pl-3 text-[var(--admin-fg-muted)]">
                    <IconSearch />
                  </span>
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, slug, SKU, or catalog ID…"
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
                aria-label="Filter and sort products"
                aria-expanded={filtersOpen}
                title="Filter and sort"
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
                aria-label={exporting ? "Exporting products" : "Export products to CSV"}
                title={exporting ? "Exporting…" : "Export CSV"}
                disabled={exporting || loading}
                onClick={exportCsv}
              >
                {exporting ? <span className="text-xs font-semibold">…</span> : <IconDownload />}
              </button>
            </div>
          </div>
        }
      >
        {filtersOpen ? (
          <div className="mb-4 grid gap-3 border-b border-[var(--admin-border)] pb-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="admin-caption mb-1.5 block">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategory(e.target.value)}
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
            <div>
              <label className="admin-caption mb-1.5 block">Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="admin-input" aria-label="Filter by status">
                {STATUS_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="admin-caption mb-1.5 block">Stock</label>
              <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="admin-input" aria-label="Filter by stock">
                {STOCK_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="admin-caption mb-1.5 block">Featured</label>
              <select value={featuredFilter} onChange={(e) => setFeaturedFilter(e.target.value)} className="admin-input" aria-label="Filter by featured">
                {FEATURED_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="admin-caption mb-1.5 block">Type</label>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="admin-input" aria-label="Filter by type">
                {TYPE_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="admin-caption mb-1.5 block">Badge</label>
              <select value={badgeFilter} onChange={(e) => setBadgeFilter(e.target.value)} className="admin-input" aria-label="Filter by badge">
                {BADGE_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="admin-caption mb-1.5 block">Sort by</label>
              <select value={sortValue} onChange={(e) => setSortValue(e.target.value)} className="admin-input" aria-label="Sort products">
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}

        {hasActiveFilters ? (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="admin-muted text-sm">Filtered by</span>
            {categoryFilter !== "all" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-1 text-xs font-medium text-[var(--admin-fg)]">
                {categories.find((category) => category.id === categoryFilter)?.label ?? categoryFilter}
                <button type="button" className="rounded-full p-0.5 text-[var(--admin-fg-muted)] transition hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]" aria-label="Remove category filter" onClick={() => setCategory("all")}>
                  <IconClear />
                </button>
              </span>
            ) : null}
            {statusFilter !== "all" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-1 text-xs font-medium text-[var(--admin-fg)]">
                {STATUS_FILTERS.find((filter) => filter.value === statusFilter)?.label}
                <button type="button" className="rounded-full p-0.5 text-[var(--admin-fg-muted)] transition hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]" aria-label="Remove status filter" onClick={() => clearFilter(setStatusFilter)}>
                  <IconClear />
                </button>
              </span>
            ) : null}
            {stockFilter !== "all" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-1 text-xs font-medium text-[var(--admin-fg)]">
                {STOCK_FILTERS.find((filter) => filter.value === stockFilter)?.label}
                <button type="button" className="rounded-full p-0.5 text-[var(--admin-fg-muted)] transition hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]" aria-label="Remove stock filter" onClick={() => clearFilter(setStockFilter)}>
                  <IconClear />
                </button>
              </span>
            ) : null}
            {featuredFilter !== "all" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-1 text-xs font-medium text-[var(--admin-fg)]">
                {FEATURED_FILTERS.find((filter) => filter.value === featuredFilter)?.label}
                <button type="button" className="rounded-full p-0.5 text-[var(--admin-fg-muted)] transition hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]" aria-label="Remove featured filter" onClick={() => clearFilter(setFeaturedFilter)}>
                  <IconClear />
                </button>
              </span>
            ) : null}
            {typeFilter !== "all" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-1 text-xs font-medium text-[var(--admin-fg)]">
                {TYPE_FILTERS.find((filter) => filter.value === typeFilter)?.label}
                <button type="button" className="rounded-full p-0.5 text-[var(--admin-fg-muted)] transition hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]" aria-label="Remove type filter" onClick={() => clearFilter(setTypeFilter)}>
                  <IconClear />
                </button>
              </span>
            ) : null}
            {badgeFilter !== "all" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-1 text-xs font-medium text-[var(--admin-fg)]">
                {BADGE_FILTERS.find((filter) => filter.value === badgeFilter)?.label}
                <button type="button" className="rounded-full p-0.5 text-[var(--admin-fg-muted)] transition hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]" aria-label="Remove badge filter" onClick={() => clearFilter(setBadgeFilter)}>
                  <IconClear />
                </button>
              </span>
            ) : null}
            {query.trim() ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-1 text-xs font-medium text-[var(--admin-fg)]">
                {query.trim()}
                <button type="button" className="rounded-full p-0.5 text-[var(--admin-fg-muted)] transition hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]" aria-label="Remove search filter" onClick={clearSearch}>
                  <IconClear />
                </button>
              </span>
            ) : null}
            <button type="button" onClick={clearAllFilters} className="btn-ghost px-2 py-1 text-xs">
              Clear all
            </button>
          </div>
        ) : null}

        {selectedIds.size > 0 ? (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-4 py-3">
            <span className="text-sm font-semibold text-[var(--admin-fg)]">{selectedIds.size} selected</span>
            <button type="button" className="btn-ghost text-sm" disabled={bulkWorking} onClick={() => bulkPatch({ status: "active" })}>
              Activate
            </button>
            <button type="button" className="btn-ghost text-sm" disabled={bulkWorking} onClick={() => bulkPatch({ status: "draft" })}>
              Draft
            </button>
            <button type="button" className="btn-ghost text-sm" disabled={bulkWorking} onClick={() => bulkPatch({ inStock: true })}>
              Mark in stock
            </button>
            <button type="button" className="btn-ghost text-sm" disabled={bulkWorking} onClick={() => bulkPatch({ inStock: false })}>
              Mark out of stock
            </button>
            <button type="button" className="btn-ghost text-sm text-[var(--admin-danger)]" disabled={bulkWorking} onClick={() => setBulkDeleteOpen(true)}>
              Delete selected
            </button>
            <button type="button" className="btn-ghost text-sm" disabled={bulkWorking} onClick={() => setSelectedIds(new Set())}>
              Clear selection
            </button>
          </div>
        ) : null}

        {loading ? (
          <LoadingState label="Loading products…" />
        ) : total === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] text-[var(--admin-link)]">
              <IconProducts />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold text-[var(--admin-fg)]">
              {hasActiveFilters ? "No products match your filters" : "No products yet"}
            </h3>
            <p className="admin-muted mt-2 max-w-sm text-sm leading-relaxed">
              {hasActiveFilters
                ? "Try a different search term or filter."
                : "Create your first product for the customer shop."}
            </p>
            {!hasActiveFilters ? (
              <button type="button" onClick={onCreateClick} className="btn-primary mt-5 inline-flex items-center gap-2">
                <IconPlus />
                Add product
              </button>
            ) : (
              <button type="button" onClick={clearAllFilters} className="btn-ghost mt-5">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1020px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--admin-border)]">
                    <th className="admin-caption w-10 px-3 py-3.5">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-[var(--admin-border-strong)]"
                        checked={allFilteredSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = someFilteredSelected && !allFilteredSelected;
                        }}
                        onChange={toggleSelectAllFiltered}
                        aria-label="Select all filtered products"
                      />
                    </th>
                    {tableColumns.map((column) => (
                      <th key={column} className="admin-caption px-5 py-3.5">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--admin-border)]">
                  {products.map((product) => {
                    const storefrontHref =
                      customerStoreUrl && product.slug ? `${customerStoreUrl}/product/${product.slug}` : "";

                    return (
                      <DataRow
                        key={product.id}
                        className={selectedIds.has(product.id) ? "bg-[var(--admin-hover)]/40" : ""}
                      >
                        <DataCell className="w-10 px-3">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-[var(--admin-border-strong)]"
                            checked={selectedIds.has(product.id)}
                            onChange={() => toggleSelected(product.id)}
                            aria-label={`Select ${product.name}`}
                          />
                        </DataCell>
                        <DataCell>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => onViewProduct?.(product)}
                              className="shrink-0 transition hover:opacity-90"
                              aria-label={`View ${product.name}`}
                            >
                              <ProductThumb product={product} alt={product.name} />
                            </button>
                            <div className="min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() => onViewProduct?.(product)}
                                className="block w-full truncate text-left font-semibold text-[var(--admin-fg)] transition hover:opacity-90"
                              >
                                {product.name}
                              </button>
                              <div className="mt-0.5 space-y-1">
                              {product.slug ? (
                                storefrontHref ? (
                                  <a
                                    href={storefrontHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="admin-muted flex max-w-full items-center gap-1 truncate text-xs transition hover:text-[var(--admin-link)]"
                                    aria-label={`View ${product.name} on customer site`}
                                    title="View on customer site"
                                  >
                                    <span className="truncate">/product/{product.slug}</span>
                                    <IconExternalLink className="h-3 w-3 shrink-0" />
                                  </a>
                                ) : (
                                  <p className="admin-muted truncate text-xs">/product/{product.slug}</p>
                                )
                              ) : null}
                              {(() => {
                                const skuInfo = getProductSkuInfo(product);
                                if (!skuInfo.linkLabel) return null;
                                return (
                                  <Link
                                    to={skuInfo.inventoryTo}
                                    className="admin-muted block max-w-full truncate text-xs transition hover:text-[var(--admin-link)]"
                                    aria-label={
                                      skuInfo.isMulti
                                        ? `View SKUs for ${product.name}`
                                        : `View inventory for ${product.name}`
                                    }
                                    title={skuInfo.isMulti ? "View all SKUs in inventory" : "View inventory"}
                                  >
                                    {skuInfo.linkLabel}
                                  </Link>
                                );
                              })()}
                              {(() => {
                                const { text, isMulti } = getProductVariantLabels(product);
                                if (!text) return null;
                                return (
                                  <p className={`admin-muted text-xs ${isMulti ? "leading-relaxed" : "truncate"}`}>
                                    {text}
                                  </p>
                                );
                              })()}
                              </div>
                            </div>
                          </div>
                        </DataCell>
                        <DataCell>
                          <Link
                            to={`/products?category=${encodeURIComponent(product.categoryId)}`}
                            className="font-medium text-[var(--admin-link)] transition hover:underline"
                          >
                            {product.categoryLabel}
                          </Link>
                        </DataCell>
                        <DataCell className="admin-muted whitespace-nowrap">{formatProductTypeLabel(product)}</DataCell>
                        <DataCell>
                          <ProductPriceCell product={product} onViewPrices={onViewPrices} />
                        </DataCell>
                        <DataCell>
                          <ProductBadges product={product} />
                        </DataCell>
                        <DataCell>
                          <StockStatusButton
                            inStock={product.inStock}
                            loading={togglingStockId === product.id}
                            onToggle={() => setStockTarget(product)}
                          />
                        </DataCell>
                        <DataCell>
                          <ProductStatusButton
                            status={product.status}
                            loading={togglingStatusId === product.id}
                            onToggle={() => setStatusTarget(product)}
                          />
                        </DataCell>
                        <DataCell className="admin-muted whitespace-nowrap text-sm">
                          {formatProductDate(product.createdAt)}
                        </DataCell>
                        <DataCell className="admin-muted whitespace-nowrap text-sm">
                          {formatProductDate(product.updatedAt)}
                        </DataCell>
                        <DataCell>
                          <div className="flex flex-nowrap items-center justify-end gap-1.5">
                            <TableIconButton label="View product" onClick={() => onViewProduct?.(product)}>
                              <IconEye />
                            </TableIconButton>
                            <TableIconButton label="Edit product" onClick={() => onEditProduct?.(product)}>
                              <IconEdit />
                            </TableIconButton>
                            <TableIconButton
                              label="Duplicate product"
                              disabled={duplicatingId === product.id}
                              onClick={() => setDuplicateTarget(product)}
                            >
                              {duplicatingId === product.id ? <span className="text-xs">…</span> : <IconDuplicate />}
                            </TableIconButton>
                            <TableIconButton label="Delete product" danger onClick={() => setDeleteTarget(product)}>
                              {deletingId === product.id ? <span className="text-xs">…</span> : <IconTrash />}
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
                Showing {showingFrom} to {showingTo} of {total} product{total === 1 ? "" : "s"}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-[var(--admin-fg-muted)]">
                  <span className="whitespace-nowrap">Per page</span>
                  <div className="flex items-stretch overflow-hidden rounded-lg border border-[var(--admin-border-strong)] bg-[var(--admin-input-bg)]">
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setPage(1);
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
                  <TableIconButton label="Previous page" disabled={safePage <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
                    <IconChevronLeft />
                  </TableIconButton>
                  <span className="admin-muted min-w-[5.5rem] text-center text-sm">
                    Page {safePage} of {totalPages}
                  </span>
                  <TableIconButton label="Next page" disabled={safePage >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
                    <IconChevronRight />
                  </TableIconButton>
                </div>
              </div>
            </div>
          </>
        )}
      </AdminCard>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete product?"
        description={
          deleteTarget
            ? `Remove "${deleteTarget.name}" and all its variants permanently? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete product"
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

      <ConfirmDialog
        open={Boolean(duplicateTarget)}
        title="Duplicate product?"
        description={
          duplicateTarget
            ? `Create a copy of "${duplicateTarget.name}"? The duplicate will be saved as a draft with zero stock.`
            : ""
        }
        confirmLabel="Duplicate product"
        cancelLabel="Cancel"
        loading={Boolean(duplicatingId)}
        onClose={() => {
          if (!duplicatingId) setDuplicateTarget(null);
        }}
        onConfirm={() => {
          if (duplicateTarget) duplicateProduct(duplicateTarget);
        }}
      />

      <ConfirmDialog
        open={Boolean(stockTarget)}
        title={stockTarget?.inStock ? "Mark out of stock?" : "Mark in stock?"}
        description={
          stockTarget
            ? stockTarget.inStock
              ? `Set "${stockTarget.name}" and all variants to out of stock?`
              : `Set "${stockTarget.name}" and all variants back in stock?`
            : ""
        }
        confirmLabel={stockTarget?.inStock ? "Mark out of stock" : "Mark in stock"}
        cancelLabel="Cancel"
        loading={Boolean(togglingStockId)}
        onClose={() => {
          if (!togglingStockId) setStockTarget(null);
        }}
        onConfirm={() => {
          if (stockTarget) toggleStock(stockTarget);
        }}
      />

      <ConfirmDialog
        open={Boolean(statusTarget)}
        title={statusTarget?.status === "active" ? "Mark as draft?" : "Activate product?"}
        description={
          statusTarget
            ? statusTarget.status === "active"
              ? `Hide "${statusTarget.name}" from the customer shop by marking it as draft?`
              : `Publish "${statusTarget.name}" on the customer shop?`
            : ""
        }
        confirmLabel={statusTarget?.status === "active" ? "Mark as draft" : "Activate"}
        cancelLabel="Cancel"
        loading={Boolean(togglingStatusId)}
        onClose={() => {
          if (!togglingStatusId) setStatusTarget(null);
        }}
        onConfirm={() => {
          if (statusTarget) toggleStatus(statusTarget);
        }}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        title="Delete selected products?"
        description={`Permanently delete ${selectedIds.size} selected product${selectedIds.size === 1 ? "" : "s"}? This cannot be undone.`}
        confirmLabel="Delete selected"
        cancelLabel="Cancel"
        danger
        loading={bulkWorking}
        onClose={() => {
          if (!bulkWorking) setBulkDeleteOpen(false);
        }}
        onConfirm={bulkDelete}
      />
    </>
  );
});
