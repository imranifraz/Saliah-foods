import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { StatCard } from "../components/ui/StatCard.jsx";
import { DataTable, DataRow, DataCell } from "../components/ui/DataTable.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";
import { IconCategory, IconPackage, IconProducts } from "../components/icons/AdminIcons.jsx";

const emptyForm = {
  id: "",
  label: "",
  description: "",
  image: "/assets/premium-dates-category.png",
  sortOrder: 0,
};

function formFromCategory(cat) {
  return {
    id: cat.id,
    label: cat.label,
    description: cat.description ?? "",
    image: cat.image ?? "",
    sortOrder: cat.sortOrder ?? 0,
  };
}

export function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(editingId);

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

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setError("");
  }

  function openEdit(cat) {
    setShowForm(false);
    setEditingId(cat.id);
    setForm(formFromCategory(cat));
    setError("");
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

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

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await apiFetch("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          sortOrder: Number(form.sortOrder) || 0,
        }),
      });
      cancelForm();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await apiFetch(`/api/admin/categories/${editingId}`, {
        method: "PATCH",
        body: JSON.stringify({
          label: form.label,
          description: form.description,
          image: form.image,
          sortOrder: Number(form.sortOrder) || 0,
        }),
      });
      cancelForm();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

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
      if (editingId === cat.id) cancelForm();
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const formCard = (isEditing ? (
    <AdminCard title={`Edit category — ${editingId}`} className="mb-6">
      <form onSubmit={handleUpdate} className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="admin-label">ID (slug)</span>
          <input value={form.id} className="admin-input bg-cream-100/80" disabled readOnly />
        </label>
        <label className="block">
          <span className="admin-label">Sort order</span>
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            className="admin-input"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="admin-label">Label</span>
          <input
            required
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            className="admin-input"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="admin-label">Description</span>
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="admin-input"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="admin-label">Image path</span>
          <input
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="admin-input"
          />
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button type="button" onClick={cancelForm} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </AdminCard>
  ) : showForm ? (
    <AdminCard title="New category" className="mb-6">
      <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="admin-label">ID (slug)</span>
          <input
            required
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
            className="admin-input"
            placeholder="premium-dates"
          />
        </label>
        <label className="block">
          <span className="admin-label">Sort order</span>
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            className="admin-input"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="admin-label">Label</span>
          <input
            required
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            className="admin-input"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="admin-label">Description</span>
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="admin-input"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="admin-label">Image path</span>
          <input
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="admin-input"
          />
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Creating…" : "Create category"}
          </button>
          <button type="button" onClick={cancelForm} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </AdminCard>
  ) : null);

  return (
    <div>
      <PageHeader
        title="Category Management"
        subtitle="Product categories shown in the customer app menu and listings."
        action={
          <button
            type="button"
            onClick={() => (showForm || isEditing ? cancelForm() : openCreate())}
            className={showForm || isEditing ? "btn-secondary" : "btn-primary"}
          >
            {showForm || isEditing ? "Cancel" : "+ Add category"}
          </button>
        }
      />

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total categories" value={metrics.total} accent="emerald" icon={<IconCategory />} />
        <StatCard label="Visible" value={metrics.active} accent="gold" icon={<IconCategory />} />
        <StatCard label="Hidden" value={metrics.hidden} accent="marble" icon={<IconProducts />} />
        <StatCard label="Assigned products" value={metrics.linkedProducts} accent="cream" icon={<IconPackage />} />
      </div>

      {formCard}

      <AdminCard>
        {loading ? (
          <LoadingState />
        ) : (
          <DataTable
            columns={["Category", "Products", "Order", "Status", "Actions"]}
            emptyMessage="No categories"
          >
            {categories.map((c) => (
              <DataRow key={c.id}>
                <DataCell>
                  <p className="font-medium">{c.label}</p>
                  <p className="text-xs text-emerald-900/45">{c.id}</p>
                </DataCell>
                <DataCell>{c.productCount}</DataCell>
                <DataCell>{c.sortOrder}</DataCell>
                <DataCell>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      c.isActive ? "bg-emerald-800/10 text-emerald-800" : "bg-red-50 text-red-600"
                    }`}
                  >
                    {c.isActive ? "Active" : "Hidden"}
                  </span>
                </DataCell>
                <DataCell className="text-right">
                  <button type="button" onClick={() => openEdit(c)} className="btn-ghost mr-1">
                    Edit
                  </button>
                  <button type="button" onClick={() => toggleActive(c)} className="btn-ghost mr-1">
                    {c.isActive ? "Hide" : "Show"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c)}
                    className="btn-ghost text-red-700"
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
