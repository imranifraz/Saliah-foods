import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { cmsImageSrc } from "../lib/cmsUpload.js";
import { getCustomerStoreUrl } from "../config/adminApps.js";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { DataRow, DataCell } from "../components/ui/DataTable.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";
import { StatCard } from "../components/ui/StatCard.jsx";
import { CreateCategoryModal } from "../components/CreateCategoryModal.jsx";
import { CategoryManageModal } from "../components/CategoryManageModal.jsx";
import { ConfirmDialog } from "../components/ConfirmDialog.jsx";
import { IconCategory, IconPackage, IconProducts } from "../components/icons/AdminIcons.jsx";

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

function IconEyeSlash({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
    </svg>
  );
}

function IconEyeOpen({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
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

function IconDuplicate() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75m9 6H9.375a1.125 1.125 0 00-1.125 1.125v9.75m3-6.75h6.75a1.125 1.125 0 011.125 1.125v9.75a1.125 1.125 0 01-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V9.375c0-.621.504-1.125 1.125-1.125z" />
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

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Hidden" },
];

const PROMO_FILTERS = [
  { value: "all", label: "All promo" },
  { value: "featured", label: "With featured promo" },
  { value: "none", label: "No promo" },
];

const SORT_OPTIONS = [
  { value: "sortOrder:asc", label: "Display order" },
  { value: "label:asc", label: "Name (A–Z)" },
  { value: "label:desc", label: "Name (Z–A)" },
  { value: "productCount:desc", label: "Most products" },
  { value: "productCount:asc", label: "Fewest products" },
  { value: "updatedAt:desc", label: "Recently updated" },
  { value: "updatedAt:asc", label: "Oldest updated" },
  { value: "createdAt:desc", label: "Recently created" },
  { value: "createdAt:asc", label: "Oldest created" },
];

function formatCategoryDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function hasFeaturedPromo(category) {
  const promo = category.featuredPromo;
  return Boolean(promo && typeof promo === "object" && (promo.title || promo.image));
}

function parseSortValue(value) {
  const [field, direction] = value.split(":");
  return { field, direction: direction === "desc" ? "desc" : "asc" };
}

function buildCategoriesUrl({ query, statusFilter, promoFilter, sortValue, page, pageSize, all }) {
  const { field, direction } = parseSortValue(sortValue);
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (statusFilter !== "all") params.set("status", statusFilter);
  if (promoFilter !== "all") params.set("promo", promoFilter);
  params.set("sort", field);
  params.set("direction", direction);
  if (all) {
    params.set("all", "true");
  } else {
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
  }
  return `/api/admin/categories?${params.toString()}`;
}

function escapeCsv(value) {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function downloadCategoriesCsv(categories) {
  const header = ["id", "label", "description", "sortOrder", "status", "productCount", "featuredPromo", "createdAt", "updatedAt"];
  const lines = [
    header.join(","),
    ...categories.map((category) =>
      [
        escapeCsv(category.id),
        escapeCsv(category.label),
        escapeCsv(category.description ?? ""),
        escapeCsv(category.sortOrder ?? 0),
        escapeCsv(category.isActive ? "active" : "hidden"),
        escapeCsv(category.productCount ?? 0),
        escapeCsv(hasFeaturedPromo(category) ? "yes" : "no"),
        escapeCsv(category.createdAt ?? ""),
        escapeCsv(category.updatedAt ?? ""),
      ].join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `categories-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function IconGrip() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <circle cx="9" cy="7" r="1.4" />
      <circle cx="15" cy="7" r="1.4" />
      <circle cx="9" cy="12" r="1.4" />
      <circle cx="15" cy="12" r="1.4" />
      <circle cx="9" cy="17" r="1.4" />
      <circle cx="15" cy="17" r="1.4" />
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

function CategoryStatusButton({ active, loading, onToggle }) {
  const actionLabel = active ? "Hide category" : "Show category";

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
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
          {active ? <IconEyeSlash className="h-3.5 w-3.5" /> : <IconEyeOpen className="h-3.5 w-3.5" />}
          {active ? "Visible" : "Hidden"}
        </>
      )}
    </button>
  );
}

function TableIconButton({ onClick, label, children, danger = false, disabled = false }) {
  const className = `inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--admin-border)] transition ${
    disabled
      ? "cursor-not-allowed opacity-40"
      : danger
        ? "text-[var(--admin-danger)] hover:border-[color-mix(in_srgb,var(--admin-danger)_35%,transparent)] hover:bg-[var(--admin-hover)]"
        : "text-[var(--admin-fg-muted)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]"
  }`;

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

export function CategoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [statusFilter, setStatusFilter] = useState("all");
  const [promoFilter, setPromoFilter] = useState("all");
  const [sortValue, setSortValue] = useState("sortOrder:asc");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({ total: 0, active: 0, inactive: 0, linkedProducts: 0, featured: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [manageCategory, setManageCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [duplicateTarget, setDuplicateTarget] = useState(null);
  const [visibilityTarget, setVisibilityTarget] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [duplicatingId, setDuplicatingId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkWorking, setBulkWorking] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [dragId, setDragId] = useState(null);

  const customerStoreUrl = getCustomerStoreUrl();

  const hasActiveFilters =
    statusFilter !== "all" || promoFilter !== "all" || Boolean(query.trim());
  const hasNonDefaultSort = sortValue !== "sortOrder:asc";
  const filtersActive = statusFilter !== "all" || promoFilter !== "all" || hasNonDefaultSort;
  const useAllResults =
    !query.trim() && statusFilter === "all" && promoFilter === "all" && sortValue === "sortOrder:asc";
  const canReorder = useAllResults && !reordering;

  const load = useCallback(() => {
    setLoading(true);
    const url = buildCategoriesUrl({
      query,
      statusFilter,
      promoFilter,
      sortValue,
      page,
      pageSize,
      all: useAllResults,
    });

    apiFetch(url)
      .then((data) => {
        setCategories(data.categories ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
        setSummary(data.summary ?? { total: 0, active: 0, inactive: 0, linkedProducts: 0, featured: 0 });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [query, statusFilter, promoFilter, sortValue, page, pageSize, useAllResults]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const urlQuery = searchParams.get("q") ?? "";
    setSearch(urlQuery);
    setQuery(urlQuery);
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [query, pageSize, statusFilter, promoFilter, sortValue]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [query, statusFilter, promoFilter, sortValue, page, pageSize]);

  useEffect(() => {
    if (filtersActive) setFiltersOpen(true);
  }, [filtersActive]);

  const visibleCategories = categories;
  const safePage = Math.min(page, totalPages);
  const allFilteredSelected =
    visibleCategories.length > 0 && visibleCategories.every((category) => selectedIds.has(category.id));
  const someFilteredSelected = visibleCategories.some((category) => selectedIds.has(category.id));
  const showingFrom = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const showingTo = useAllResults ? total : total === 0 ? 0 : Math.min(safePage * pageSize, total);
  const selectedCategories = useMemo(
    () => visibleCategories.filter((category) => selectedIds.has(category.id)),
    [visibleCategories, selectedIds]
  );
  const bulkDeleteBlockedCount = selectedCategories.filter((category) => category.productCount > 0).length;

  function handleSearch(event) {
    event.preventDefault();
    const nextQuery = search.trim();
    setQuery(nextQuery);
    setPage(1);
    if (nextQuery) {
      setSearchParams({ q: nextQuery }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }

  function clearSearch() {
    setSearch("");
    setQuery("");
    setPage(1);
    setSearchParams({}, { replace: true });
  }

  function clearStatusFilter() {
    setStatusFilter("all");
    setPage(1);
  }

  function clearPromoFilter() {
    setPromoFilter("all");
    setPage(1);
  }

  function clearAllFilters() {
    setSearch("");
    setQuery("");
    setStatusFilter("all");
    setPromoFilter("all");
    setPage(1);
    setSearchParams({}, { replace: true });
  }

  function openManageCategory(category, mode) {
    setManageCategory({ id: category.id, mode });
  }

  function toggleSelected(categoryId) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  }

  function toggleSelectAllFiltered() {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(visibleCategories.map((category) => category.id)));
  }

  async function bulkSetActive(isActive) {
    const ids = [...selectedIds];
    if (!ids.length) return;

    setError("");
    setBulkWorking(true);
    try {
      await Promise.all(
        ids.map((id) =>
          apiFetch(`/api/admin/categories/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ isActive }),
          })
        )
      );
      setSelectedIds(new Set());
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBulkWorking(false);
    }
  }

  async function saveCategoryOrder(orderedList) {
    setError("");
    setReordering(true);
    try {
      await Promise.all(
        orderedList.map((category, index) => {
          if (Number(category.sortOrder) === index) return Promise.resolve();
          return apiFetch(`/api/admin/categories/${category.id}`, {
            method: "PATCH",
            body: JSON.stringify({ sortOrder: index }),
          });
        })
      );
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setReordering(false);
      setDragId(null);
    }
  }

  function handleReorder(fromId, toId) {
    if (!fromId || !toId || fromId === toId || reordering) return;

    const list = [...categories];
    const fromIndex = list.findIndex((category) => category.id === fromId);
    const toIndex = list.findIndex((category) => category.id === toId);
    if (fromIndex < 0 || toIndex < 0) return;

    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
    saveCategoryOrder(list);
  }

  async function duplicateCategory(category) {
    setError("");
    setDuplicatingId(category.id);
    try {
      await apiFetch(`/api/admin/categories/${category.id}/duplicate`, { method: "POST" });
      setDuplicateTarget(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDuplicatingId(null);
    }
  }

  async function exportCsv() {
    setError("");
    setExporting(true);
    try {
      const url = buildCategoriesUrl({
        query,
        statusFilter,
        promoFilter,
        sortValue,
        page: 1,
        pageSize,
        all: true,
      });
      const data = await apiFetch(url);
      downloadCategoriesCsv(data.categories ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  }

  async function bulkDelete() {
    const deletable = selectedCategories.filter((category) => category.productCount === 0);
    if (!deletable.length) {
      setError("Selected categories still have products and cannot be deleted.");
      setBulkDeleteOpen(false);
      return;
    }

    setError("");
    setBulkWorking(true);
    try {
      const results = await Promise.allSettled(
        deletable.map((category) =>
          apiFetch(`/api/admin/categories/${category.id}`, { method: "DELETE" })
        )
      );
      const failed = results.filter((result) => result.status === "rejected").length;
      if (failed > 0) {
        setError(`${failed} categor${failed === 1 ? "y" : "ies"} could not be deleted.`);
      }
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBulkWorking(false);
    }
  }

  async function toggleActive(category) {
    setError("");
    setTogglingId(category.id);
    try {
      await apiFetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !category.isActive }),
      });
      setVisibilityTarget(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(category) {
    setError("");
    setDeletingId(category.id);
    try {
      await apiFetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  const tableColumns = ["Category", "Products", "List order", "Promo", "Created", "Updated", "Status", "Actions"];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="admin-card admin-page-intro p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <span className="admin-page-intro__icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] text-[var(--admin-link)]">
              <IconCategory />
            </span>
            <div className="min-w-0">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--admin-fg)]">
                Category Management
              </h1>
              <p className="admin-muted mt-2 max-w-2xl text-[15px] leading-relaxed">
                Product categories shown in the customer app menu and listings.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="btn-primary inline-flex shrink-0 items-center gap-2"
          >
            <IconPlus />
            Add category
          </button>
        </div>
      </section>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total categories" value={summary.total} accent="emerald" icon={<IconCategory />} />
        <StatCard label="Active" value={summary.active} accent="gold" icon={<IconCategory />} />
        <StatCard label="Inactive" value={summary.inactive} accent="marble" icon={<IconProducts />} />
        <StatCard label="Total products" value={summary.linkedProducts} accent="cream" icon={<IconPackage />} />
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <AdminCard
        title="Categories"
        subtitle="Search, review, and manage product categories."
        action={
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
                  placeholder="Search name or slug…"
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
              aria-label="Filter and sort categories"
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
              aria-label={exporting ? "Exporting categories" : "Export categories to CSV"}
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
          <div className="mb-4 flex flex-col gap-3 border-b border-[var(--admin-border)] pb-4 sm:flex-row sm:items-center sm:gap-3">
            <div className="w-full sm:w-[11rem]">
              <label className="admin-caption mb-1.5 block">Status</label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="admin-input"
                aria-label="Filter by status"
              >
                {STATUS_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-[11rem]">
              <label className="admin-caption mb-1.5 block">Promo</label>
              <select
                value={promoFilter}
                onChange={(event) => setPromoFilter(event.target.value)}
                className="admin-input"
                aria-label="Filter by featured promo"
              >
                {PROMO_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-[11rem]">
              <label className="admin-caption mb-1.5 block">Sort by</label>
              <select
                value={sortValue}
                onChange={(event) => setSortValue(event.target.value)}
                className="admin-input"
                aria-label="Sort categories"
              >
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
            {statusFilter !== "all" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-1 text-xs font-medium text-[var(--admin-fg)]">
                {STATUS_FILTERS.find((filter) => filter.value === statusFilter)?.label}
                <button
                  type="button"
                  className="rounded-full p-0.5 text-[var(--admin-fg-muted)] transition hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]"
                  aria-label="Remove status filter"
                  onClick={clearStatusFilter}
                >
                  <IconClear />
                </button>
              </span>
            ) : null}
            {promoFilter !== "all" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-1 text-xs font-medium text-[var(--admin-fg)]">
                {PROMO_FILTERS.find((filter) => filter.value === promoFilter)?.label}
                <button
                  type="button"
                  className="rounded-full p-0.5 text-[var(--admin-fg-muted)] transition hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]"
                  aria-label="Remove promo filter"
                  onClick={clearPromoFilter}
                >
                  <IconClear />
                </button>
              </span>
            ) : null}
            {query.trim() ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-1 text-xs font-medium text-[var(--admin-fg)]">
                {query.trim()}
                <button
                  type="button"
                  className="rounded-full p-0.5 text-[var(--admin-fg-muted)] transition hover:bg-[var(--admin-hover)] hover:text-[var(--admin-fg)]"
                  aria-label="Remove search filter"
                  onClick={clearSearch}
                >
                  <IconClear />
                </button>
              </span>
            ) : null}
          </div>
        ) : null}

        {selectedIds.size > 0 ? (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-4 py-3">
            <span className="text-sm font-semibold text-[var(--admin-fg)]">
              {selectedIds.size} selected
            </span>
            <button
              type="button"
              className="btn-ghost text-sm"
              disabled={bulkWorking}
              onClick={() => bulkSetActive(true)}
            >
              Show selected
            </button>
            <button
              type="button"
              className="btn-ghost text-sm"
              disabled={bulkWorking}
              onClick={() => bulkSetActive(false)}
            >
              Hide selected
            </button>
            <button
              type="button"
              className="btn-ghost text-sm text-[var(--admin-danger)]"
              disabled={bulkWorking || selectedCategories.every((category) => category.productCount > 0)}
              onClick={() => setBulkDeleteOpen(true)}
            >
              Delete selected
            </button>
            <button
              type="button"
              className="btn-ghost text-sm"
              disabled={bulkWorking}
              onClick={() => setSelectedIds(new Set())}
            >
              Clear selection
            </button>
          </div>
        ) : null}

        {canReorder ? (
          <p className="admin-muted mb-4 text-sm">
            Drag rows by the grip handle to change menu display order on the customer site.
        </p>
      ) : null}

        {loading ? (
          <LoadingState label="Loading categories..." />
        ) : total === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] text-[var(--admin-link)]">
              <IconCategory />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold text-[var(--admin-fg)]">
              {hasActiveFilters ? "No categories match your filters" : "No categories yet"}
            </h3>
            <p className="admin-muted mt-2 max-w-sm text-sm leading-relaxed">
              {hasActiveFilters
                ? "Try a different search term or status filter."
                : "Create your first category for the customer shop menu."}
            </p>
            {!hasActiveFilters ? (
              <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                className="btn-primary mt-5 inline-flex items-center gap-2"
              >
                <IconPlus />
                Add category
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
              <table className="w-full min-w-[880px] text-left text-sm">
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
                        aria-label="Select all filtered categories"
                      />
                    </th>
                    <th className="admin-caption w-10 px-2 py-3.5" aria-label="Reorder" />
                    {tableColumns.map((column) => (
                      <th key={column} className="admin-caption px-5 py-3.5">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--admin-border)]">
                  {visibleCategories.map((category) => {
                    const deleteDisabled = category.productCount > 0;
                    const storefrontHref = customerStoreUrl ? `${customerStoreUrl}/products/${category.id}` : "";

                    return (
                      <DataRow
                        key={category.id}
                        className={`${dragId === category.id ? "opacity-50" : ""} ${selectedIds.has(category.id) ? "bg-[var(--admin-hover)]/40" : ""}`}
                        draggable={canReorder && !reordering}
                        onDragStart={() => setDragId(category.id)}
                        onDragOver={(event) => {
                          if (!canReorder || reordering) return;
                          event.preventDefault();
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          handleReorder(dragId, category.id);
                        }}
                        onDragEnd={() => setDragId(null)}
                      >
                        <DataCell className="w-10 px-3">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-[var(--admin-border-strong)]"
                            checked={selectedIds.has(category.id)}
                            onChange={() => toggleSelected(category.id)}
                            aria-label={`Select ${category.label}`}
                          />
                        </DataCell>
                        <DataCell className="w-10 px-2">
                          {canReorder ? (
                            <span
                              className="inline-flex cursor-grab text-[var(--admin-fg-faint)] active:cursor-grabbing"
                              title="Drag to reorder"
                            >
                              <IconGrip />
                            </span>
                          ) : (
                            <span className="inline-block w-4" aria-hidden />
                          )}
                        </DataCell>
                <DataCell>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => openManageCategory(category, "view")}
                              className="shrink-0 transition hover:opacity-90"
                              aria-label={`View ${category.label}`}
                            >
                              <div className="category-table-thumb">
                                {category.image ? (
                                  <img src={cmsImageSrc(category.image)} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <span className="flex h-full w-full items-center justify-center text-[10px] font-bold uppercase tracking-wider text-[var(--admin-fg-faint)]">
                                    —
                                  </span>
                                )}
                              </div>
                            </button>
                            <div className="min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() => openManageCategory(category, "view")}
                                className="block w-full truncate text-left font-semibold text-[var(--admin-fg)] transition hover:opacity-90"
                              >
                                {category.label}
                              </button>
                              {storefrontHref ? (
                                <a
                                  href={storefrontHref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="admin-muted inline-flex max-w-full items-center gap-1 truncate text-xs transition hover:text-[var(--admin-link)]"
                                  aria-label={`View ${category.label} on customer site`}
                                  title="View on customer site"
                                >
                                  <span className="truncate">/products/{category.id}</span>
                                  <IconExternalLink className="h-3 w-3 shrink-0" />
                                </a>
                              ) : (
                                <p className="admin-muted truncate text-xs">/products/{category.id}</p>
                              )}
                            </div>
                          </div>
                        </DataCell>
                        <DataCell>
                          <div className="space-y-1">
                            {category.productCount > 0 ? (
                              <Link
                                to={`/products?category=${encodeURIComponent(category.id)}`}
                                className="block font-semibold text-[var(--admin-link)] transition hover:underline"
                              >
                                {category.productCount}
                              </Link>
                            ) : (
                              <span className="admin-muted">0</span>
                            )}
                            {(category.variantCount ?? 0) > 0 ? (
                              <Link
                                to={`/inventory?category=${encodeURIComponent(category.id)}`}
                                className="admin-muted block text-xs transition hover:text-[var(--admin-link)]"
                                title="View inventory for this category"
                              >
                                {category.variantCount} variant{category.variantCount === 1 ? "" : "s"}
                              </Link>
                            ) : null}
                          </div>
                        </DataCell>
                        <DataCell className="admin-muted whitespace-nowrap">{category.sortOrder}</DataCell>
                        <DataCell>
                          {hasFeaturedPromo(category) ? (
                            <span className="inline-flex rounded-full border border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--admin-link)]">
                              Featured
                            </span>
                          ) : (
                            <span className="admin-muted text-xs">—</span>
                          )}
                        </DataCell>
                        <DataCell className="admin-muted whitespace-nowrap text-sm">
                          {formatCategoryDate(category.createdAt)}
                        </DataCell>
                        <DataCell className="admin-muted whitespace-nowrap text-sm">
                          {formatCategoryDate(category.updatedAt)}
                        </DataCell>
                        <DataCell>
                          <CategoryStatusButton
                            active={category.isActive}
                            loading={togglingId === category.id}
                            onToggle={() => setVisibilityTarget(category)}
                          />
                        </DataCell>
                        <DataCell>
                          <div className="flex items-center justify-end gap-1.5">
                            <TableIconButton
                              label="View category"
                              onClick={() => openManageCategory(category, "view")}
                            >
                              <IconEye />
                            </TableIconButton>
                            <TableIconButton
                              label="Edit category"
                              onClick={() => openManageCategory(category, "edit")}
                            >
                              <IconEdit />
                            </TableIconButton>
                            <TableIconButton
                              label="Duplicate category"
                              disabled={duplicatingId === category.id}
                              onClick={() => setDuplicateTarget(category)}
                            >
                              {duplicatingId === category.id ? <span className="text-xs">…</span> : <IconDuplicate />}
                            </TableIconButton>
                            <TableIconButton
                              label={
                                deleteDisabled
                                  ? "Remove products from this category first"
                                  : "Delete category"
                              }
                              danger
                              disabled={deleteDisabled}
                              onClick={() => setDeleteTarget(category)}
                            >
                              {deletingId === category.id ? <span className="text-xs">…</span> : <IconTrash />}
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
                {useAllResults
                  ? `Showing all ${total} categor${total === 1 ? "y" : "ies"}`
                  : `Showing ${showingFrom} to ${showingTo} of ${total} categor${total === 1 ? "y" : "ies"}`}
              </p>
              {!useAllResults ? (
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
                  <TableIconButton
                    label="Previous page"
                    disabled={safePage <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    <IconChevronLeft />
                  </TableIconButton>
                  <span className="admin-muted min-w-[5.5rem] text-center text-sm">
                    Page {safePage} of {totalPages}
                  </span>
                  <TableIconButton
                    label="Next page"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  >
                    <IconChevronRight />
                  </TableIconButton>
                </div>
              </div>
              ) : null}
            </div>
          </>
        )}
      </AdminCard>

      <CreateCategoryModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} onCreated={load} />

      <CategoryManageModal
        open={Boolean(manageCategory)}
        categoryId={manageCategory?.id ?? null}
        mode={manageCategory?.mode ?? "view"}
        onClose={() => setManageCategory(null)}
        onUpdated={load}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        title="Delete selected categories?"
        description={
          bulkDeleteBlockedCount > 0
            ? `${selectedIds.size} selected. ${bulkDeleteBlockedCount} have products and will be skipped. ${selectedCategories.length - bulkDeleteBlockedCount} empty categor${selectedCategories.length - bulkDeleteBlockedCount === 1 ? "y" : "ies"} will be deleted permanently.`
            : `Permanently delete ${selectedIds.size} selected categor${selectedIds.size === 1 ? "y" : "ies"}? This cannot be undone.`
        }
        confirmLabel="Delete selected"
        cancelLabel="Cancel"
        danger
        loading={bulkWorking}
        onClose={() => {
          if (!bulkWorking) setBulkDeleteOpen(false);
        }}
        onConfirm={bulkDelete}
      />

      <ConfirmDialog
        open={Boolean(duplicateTarget)}
        title="Duplicate category?"
        description={
          duplicateTarget
            ? `Create a copy of "${duplicateTarget.label}"? The duplicate will be hidden until you publish it.`
            : ""
        }
        confirmLabel="Duplicate category"
        cancelLabel="Cancel"
        loading={Boolean(duplicatingId)}
        onClose={() => {
          if (!duplicatingId) setDuplicateTarget(null);
        }}
        onConfirm={() => {
          if (duplicateTarget) duplicateCategory(duplicateTarget);
        }}
      />

      <ConfirmDialog
        open={Boolean(visibilityTarget)}
        title={visibilityTarget?.isActive ? "Hide category?" : "Show category?"}
        description={
          visibilityTarget
            ? visibilityTarget.isActive
              ? `Hide "${visibilityTarget.label}" on the customer site? Shoppers will no longer browse products under this category.`
              : `Show "${visibilityTarget.label}" on the customer site again?`
            : ""
        }
        confirmLabel={visibilityTarget?.isActive ? "Hide category" : "Show category"}
        cancelLabel="Cancel"
        loading={Boolean(togglingId)}
        onClose={() => {
          if (!togglingId) setVisibilityTarget(null);
        }}
        onConfirm={() => {
          if (visibilityTarget) toggleActive(visibilityTarget);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete category?"
        description={
          deleteTarget
            ? `Remove "${deleteTarget.label}" permanently? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete category"
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
