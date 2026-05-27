import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { cmsImageSrc } from "../lib/cmsUpload.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { StatCard } from "../components/ui/StatCard.jsx";
import { DataTable, DataRow, DataCell } from "../components/ui/DataTable.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";
import { IconCategory, IconPackage, IconProducts } from "../components/icons/AdminIcons.jsx";

export function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    apiFetch("/api/admin/categories")
      .then((d) => setCategories(d.categories))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const metrics = useMemo(() => {
    const activeCategories = categories.filter((category) => category.isActive).length;
    const totalProducts = categories.reduce((sum, category) => sum + Number(category.productCount ?? 0), 0);

    return {
      total: categories.length,
      active: activeCategories,
      hidden: categories.length - activeCategories,
      linkedProducts: totalProducts,
    };
  }, [categories]);

  async function toggleActive(cat) {
    setError("");
    try {
      await apiFetch(`/api/admin/categories/${cat.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !cat.isActive }),
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(cat) {
    if (cat.productCount > 0) {
      setError(`Cannot delete "${cat.label}": ${cat.productCount} product(s) still use this category.`);
      return;
    }
    if (!confirm(`Delete category "${cat.label}"? This cannot be undone.`)) return;

    setError("");
    try {
      await apiFetch(`/api/admin/categories/${cat.id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader
        title="Category Management"
        subtitle="Product categories shown in the customer app menu and listings."
        action={
          <Link to="/categories/new" className="btn-primary">
            + Add category
          </Link>
        }
      />

      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total categories" value={metrics.total} accent="emerald" icon={<IconCategory />} />
        <StatCard label="Visible" value={metrics.active} accent="gold" icon={<IconCategory />} />
        <StatCard label="Hidden" value={metrics.hidden} accent="marble" icon={<IconProducts />} />
        <StatCard label="Assigned products" value={metrics.linkedProducts} accent="cream" icon={<IconPackage />} />
      </div>

      <AdminCard>
        {loading ? (
          <LoadingState />
        ) : (
          <DataTable
            columns={["Category", "Products", "Order", "Status", "Actions"]}
            emptyMessage="No categories yet. Create your first category."
          >
            {categories.map((c) => (
              <DataRow key={c.id}>
                <DataCell>
                  <div className="flex items-center gap-3">
                    <div className="category-table-thumb">
                      {c.image ? (
                        <img src={cmsImageSrc(c.image)} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--admin-fg-faint)]">
                          —
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{c.label}</p>
                      <p className="text-xs text-[var(--admin-fg-subtle)]">{c.id}</p>
                    </div>
                  </div>
                </DataCell>
                <DataCell>{c.productCount}</DataCell>
                <DataCell>{c.sortOrder}</DataCell>
                <DataCell>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      c.isActive
                        ? "bg-[var(--admin-badge-bg)] text-[var(--admin-badge-fg)]"
                        : "bg-[var(--admin-danger-bg)] text-[var(--admin-danger)]"
                    }`}
                  >
                    {c.isActive ? "Active" : "Hidden"}
                  </span>
                </DataCell>
                <DataCell className="text-right">
                  <Link to={`/categories/${c.id}/edit`} className="btn-ghost mr-1">
                    Edit
                  </Link>
                  <button type="button" onClick={() => toggleActive(c)} className="btn-ghost mr-1">
                    {c.isActive ? "Hide" : "Show"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c)}
                    className="btn-ghost text-[var(--admin-danger)]"
                    title={c.productCount > 0 ? "Remove products from this category first" : undefined}
                  >
                    Delete
                  </button>
                </DataCell>
              </DataRow>
            ))}
          </DataTable>
        )}
      </AdminCard>
    </div>
  );
}
