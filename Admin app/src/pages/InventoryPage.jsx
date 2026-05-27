import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { AdminFilterTabs } from "../components/ui/AdminFilterTabs.jsx";
import { StatCard } from "../components/ui/StatCard.jsx";
import { DataTable, DataRow, DataCell } from "../components/ui/DataTable.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";
import { ProductThumb } from "../components/ui/ProductThumb.jsx";
import { IconPackage, IconProducts } from "../components/icons/AdminIcons.jsx";

const STOCK_FILTERS = [
  { value: "all", label: "All stock" },
  { value: "in_stock", label: "In stock" },
  { value: "out_of_stock", label: "Out of stock" },
];

function formatUpdatedAt(value) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function InventoryPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [search, setSearch] = useState("");
  const [stock, setStock] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");

  useEffect(() => {
    apiFetch("/api/admin/categories")
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      const query = new URLSearchParams();
      if (stock !== "all") query.set("stock", stock);
      if (search.trim()) query.set("q", search.trim());

      apiFetch(`/api/admin/inventory${query.size ? `?${query.toString()}` : ""}`, {
        signal: controller.signal,
      })
        .then((data) => {
          const nextItems = data.items ?? [];
          setItems(nextItems);
          setDrafts(
            Object.fromEntries(nextItems.map((item) => [item.id, String(item.stockQuantity ?? 0)]))
          );
          setError("");
        })
        .catch((err) => {
          if (err.name !== "AbortError") setError(err.message);
        })
        .finally(() => setLoading(false));
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [search, stock]);

  const categoryTabs = useMemo(
    () => [
      { value: "all", label: "All", count: items.length },
      ...categories.map((category) => ({
        value: category.id,
        label: category.label,
        count: items.filter((item) => item.product.categoryId === category.id).length,
      })),
    ],
    [categories, items]
  );
  const filteredItems = useMemo(
    () =>
      selectedCategory === "all"
        ? items
        : items.filter((item) => item.product.categoryId === selectedCategory),
    [items, selectedCategory]
  );
  const summary = useMemo(() => {
    const inStock = filteredItems.filter((item) => item.inStock).length;
    const unitsOnHand = filteredItems.reduce((sum, item) => sum + Number(item.stockQuantity ?? 0), 0);
    return {
      total: filteredItems.length,
      inStock,
      outOfStock: filteredItems.length - inStock,
      unitsOnHand,
    };
  }, [filteredItems]);

  async function saveStock(itemId) {
    setSavingId(itemId);
    setError("");

    try {
      const quantity = Number(drafts[itemId] ?? 0);
      const data = await apiFetch(`/api/admin/inventory/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify({ stockQuantity: quantity }),
      });

      setItems((current) =>
        current.map((item) => (item.id === itemId ? data.item : item))
      );
      setDrafts((current) => ({
        ...current,
        [itemId]: String(data.item.stockQuantity ?? 0),
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId("");
    }
  }

  return (
    <div>
      <PageHeader
        title="Inventory Management"
        subtitle="View SKU-wise stock for every product variant and update quantities quickly."
        action={
          <div className="flex flex-wrap gap-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search SKU or product"
              className="admin-input w-[220px]"
            />
            <select
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              className="admin-input w-auto min-w-[160px]"
            >
              {STOCK_FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <AdminFilterTabs items={categoryTabs} value={selectedCategory} onChange={setSelectedCategory} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Variants in view" value={summary.total} accent="emerald" icon={<IconProducts />} />
        <StatCard label="In stock" value={summary.inStock} accent="gold" icon={<IconPackage />} />
        <StatCard label="Out of stock" value={summary.outOfStock} accent="marble" icon={<IconPackage />} />
        <StatCard label="Units on hand" value={summary.unitsOnHand} accent="cream" icon={<IconProducts />} />
      </div>

      <AdminCard>
        {loading ? (
          <LoadingState label="Loading inventory…" />
        ) : (
          <DataTable
            columns={["SKU", "Product", "Variant", "Category", "Stock", "Status", "Updated", ""]}
            emptyMessage="No inventory items found"
          >
            {filteredItems.map((item) => (
              <DataRow key={item.id}>
                <DataCell className="font-mono text-xs">{item.sku}</DataCell>
                <DataCell>
                  <div className="flex items-center gap-3">
                    <ProductThumb
                      src={item.product.img}
                      product={item.product}
                      alt={item.product.name}
                    />
                    <div className="min-w-0">
                      <Link to="/products" className="font-semibold text-gold-400 hover:text-gold-300">
                        {item.product.name}
                      </Link>
                      {item.isDefault ? (
                        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-gold-400/80">
                          Default variant
                        </p>
                      ) : null}
                    </div>
                  </div>
                </DataCell>
                <DataCell>{item.weight}</DataCell>
                <DataCell className="text-emerald-900/65">{item.product.categoryLabel}</DataCell>
                <DataCell>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={drafts[item.id] ?? item.stockQuantity}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [item.id]: event.target.value,
                        }))
                      }
                      className="admin-input w-24"
                    />
                    <button
                      type="button"
                      onClick={() => saveStock(item.id)}
                      className="btn-secondary"
                      disabled={savingId === item.id}
                    >
                      {savingId === item.id ? "Saving..." : "Save"}
                    </button>
                  </div>
                </DataCell>
                <DataCell>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      item.inStock
                        ? "bg-emerald-800/12 text-emerald-800"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {item.inStock ? "In stock" : "Out of stock"}
                  </span>
                </DataCell>
                <DataCell className="text-emerald-900/55">{formatUpdatedAt(item.updatedAt)}</DataCell>
                <DataCell className="text-right">
                  <Link to="/products" className="btn-ghost">
                    Open product
                  </Link>
                </DataCell>
              </DataRow>
            ))}
          </DataTable>
        )}
      </AdminCard>
    </div>
  );
}
