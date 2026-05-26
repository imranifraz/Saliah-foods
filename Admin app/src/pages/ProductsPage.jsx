import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { AdminFilterTabs } from "../components/ui/AdminFilterTabs.jsx";
import { StatCard } from "../components/ui/StatCard.jsx";
import { DataTable, DataRow, DataCell } from "../components/ui/DataTable.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";
import { IconPackage, IconProducts } from "../components/icons/AdminIcons.jsx";

function createVariant(overrides = {}) {
  return {
    id: null,
    weight: "",
    sku: "",
    priceValue: "",
    mrpValue: "",
    stockQuantity: "10",
    packaging: "Pouch",
    isDefault: false,
    ...overrides,
  };
}

function createEmptyForm(categoryId = "dates") {
  return {
    name: "",
    categoryId,
    productType: "simple",
    status: "active",
    tagline: "",
    fullDescription: "",
    tag: "",
    badge: "",
    benefits: "Natural Energy",
    featured: false,
    isNew: false,
    isBestSeller: false,
    existingImages: [],
    imageFiles: [],
    variants: [createVariant({ weight: "250g", packaging: "Pouch", isDefault: true })],
  };
}

function mapProductToForm(product) {
  return {
    name: product.name ?? "",
    categoryId: product.categoryId ?? "dates",
    productType: product.productType ?? "simple",
    status: product.status ?? "active",
    tagline: product.tagline ?? "",
    fullDescription: product.fullDescription ?? "",
    tag: product.tag ?? "",
    badge: product.badge ?? "",
    benefits: Array.isArray(product.benefits) ? product.benefits.join(", ") : "",
    featured: Boolean(product.featured),
    isNew: Boolean(product.isNew),
    isBestSeller: Boolean(product.isBestSeller),
    existingImages: Array.isArray(product.images) ? product.images : product.img ? [product.img] : [],
    imageFiles: [],
    variants:
      product.variants?.length > 0
        ? product.variants.map((variant) =>
            createVariant({
              id: variant.id,
              weight: variant.weight ?? variant.packSize ?? "",
              sku: variant.sku ?? "",
              priceValue: variant.priceValue != null ? String(variant.priceValue) : "",
              mrpValue: variant.mrpValue != null ? String(variant.mrpValue) : "",
              stockQuantity: variant.stockQuantity != null ? String(variant.stockQuantity) : "0",
              packaging: variant.packaging ?? "Pouch",
              isDefault: Boolean(variant.isDefault),
            })
          )
        : [createVariant({ weight: product.packSize ?? "250g", packaging: "Pouch", isDefault: true })],
  };
}

function slugifySkuPart(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildAutoSku({ categoryId, productName, weight }) {
  const parts = [
    slugifySkuPart(categoryId),
    slugifySkuPart(productName),
    slugifySkuPart(weight || "default"),
  ].filter(Boolean);

  return parts.join("-").toUpperCase();
}

export function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [error, setError] = useState("");
  const [form, setForm] = useState(createEmptyForm());
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);

  function clearImagePreviews() {
    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    setImagePreviews([]);
  }

  function load() {
    setLoading(true);
    Promise.all([apiFetch("/api/admin/products"), apiFetch("/api/admin/categories")])
      .then(([productData, categoryData]) => {
        setProducts(productData.products ?? []);
        setCategories(categoryData.categories ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!showForm) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowForm(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showForm]);

  useEffect(
    () => () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    },
    [imagePreviews]
  );

  function closeForm() {
    setShowForm(false);
    setEditingProductId(null);
    clearImagePreviews();
    setForm(createEmptyForm(categories[0]?.id ?? "dates"));
  }

  function openCreate() {
    setEditingProductId(null);
    clearImagePreviews();
    setError("");
    setForm(createEmptyForm(categories[0]?.id ?? "dates"));
    setShowForm(true);
  }

  function openEdit(product) {
    setEditingProductId(product.id);
    clearImagePreviews();
    setError("");
    setForm(mapProductToForm(product));
    setShowForm(true);
  }

  function updateVariant(index, patch) {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, ...patch } : variant
      ),
    }));
  }

  function setDefaultVariant(index) {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) => ({
        ...variant,
        isDefault: variantIndex === index,
      })),
    }));
  }

  function addVariant() {
    setForm((current) => ({
      ...current,
      variants: [...current.variants, createVariant({ packaging: "Pouch" })],
    }));
  }

  function removeVariant(index) {
    setForm((current) => {
      const nextVariants = current.variants.filter((_, variantIndex) => variantIndex !== index);
      if (nextVariants.length === 0) {
        return {
          ...current,
          variants: [createVariant({ weight: "250g", packaging: "Pouch", isDefault: true })],
        };
      }

      if (!nextVariants.some((variant) => variant.isDefault)) {
        nextVariants[0] = { ...nextVariants[0], isDefault: true };
      }

      return { ...current, variants: nextVariants };
    });
  }

  function handleImageChange(event) {
    const files = Array.from(event.target.files ?? []);
    clearImagePreviews();
    setImagePreviews(files.map((file) => ({ file, url: URL.createObjectURL(file) })));
    setForm((current) => ({ ...current, imageFiles: files }));
  }

  function removeExistingImage(image) {
    setForm((current) => ({
      ...current,
      existingImages: current.existingImages.filter((entry) => entry !== image),
    }));
  }

  function resolveVariantSku(variant) {
    if (variant.id && variant.sku) return variant.sku;
    return buildAutoSku({
      categoryId: form.categoryId,
      productName: form.name,
      weight: variant.weight,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("categoryId", form.categoryId);
      formData.append("productType", form.productType);
      formData.append("status", form.status);
      formData.append("tagline", form.tagline.trim());
      formData.append("fullDescription", form.fullDescription.trim());
      formData.append("tag", form.tag.trim());
      formData.append("badge", form.badge.trim());
      formData.append("benefits", form.benefits);
      formData.append("featured", String(form.featured));
      formData.append("isNew", String(form.isNew));
      formData.append("isBestSeller", String(form.isBestSeller));
      formData.append("existingImages", JSON.stringify(form.existingImages));

      form.imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      const cleanedVariants = form.variants.map((variant, index) => ({
        ...(variant.id ? { id: variant.id } : {}),
        weight: variant.weight.trim(),
        sku: resolveVariantSku(variant),
        priceValue: Number(variant.priceValue),
        mrpValue: variant.mrpValue ? Number(variant.mrpValue) : null,
        stockQuantity: Number(variant.stockQuantity || 0),
        packaging: variant.packaging.trim() || "Pouch",
        isDefault: variant.isDefault,
        sortOrder: index,
      }));

      if (form.productType === "variant") {
        formData.append("variants", JSON.stringify(cleanedVariants));
      } else {
        const simpleVariant = cleanedVariants[0];
        formData.append("variantId", simpleVariant.id ?? "");
        formData.append("weight", simpleVariant.weight);
        formData.append("sku", simpleVariant.sku);
        formData.append("priceValue", String(simpleVariant.priceValue));
        formData.append("mrpValue", simpleVariant.mrpValue == null ? "" : String(simpleVariant.mrpValue));
        formData.append("stockQuantity", String(simpleVariant.stockQuantity));
        formData.append("packaging", simpleVariant.packaging);
        formData.append("inStock", String(simpleVariant.stockQuantity > 0));
      }

      const savedProduct = await apiFetch(
        editingProductId ? `/api/admin/products/${editingProductId}` : "/api/admin/products",
        {
        method: editingProductId ? "PATCH" : "POST",
        body: formData,
        }
      );

      setSelectedCategory(savedProduct.product?.categoryId ?? form.categoryId ?? "all");
      closeForm();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleStock(product) {
    try {
      await apiFetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        body: JSON.stringify({ inStock: !product.inStock }),
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete ${product.name}? This will remove all its variants.`)) return;
    try {
      await apiFetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const isVariantProduct = form.productType === "variant";
  const categoryTabs = useMemo(
    () => [
      { value: "all", label: "All", count: products.length },
      ...categories.map((category) => ({
        value: category.id,
        label: category.label,
        count: products.filter((product) => product.categoryId === category.id).length,
      })),
    ],
    [categories, products]
  );
  const filteredProducts = useMemo(
    () =>
      selectedCategory === "all"
        ? products
        : products.filter((product) => product.categoryId === selectedCategory),
    [products, selectedCategory]
  );
  const metrics = useMemo(() => {
    const activeProducts = filteredProducts.filter((product) => product.status === "active").length;
    const inStockProducts = filteredProducts.filter((product) => product.inStock).length;
    const totalVariants = filteredProducts.reduce(
      (sum, product) => sum + Number(product.variantCount ?? product.variants?.length ?? 0),
      0
    );

    return {
      total: filteredProducts.length,
      active: activeProducts,
      inStock: inStockProducts,
      variants: totalVariants,
    };
  }, [filteredProducts]);

  return (
    <div>
      <PageHeader
        title="Product Management"
        subtitle="Manage your catalog — prices, stock, and categories."
        action={
          <button type="button" onClick={() => (showForm ? closeForm() : openCreate())} className={showForm ? "btn-secondary" : "btn-primary"}>
            {showForm ? "Cancel" : "+ Add product"}
          </button>
        }
      />

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <AdminFilterTabs items={categoryTabs} value={selectedCategory} onChange={setSelectedCategory} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Products in view" value={metrics.total} accent="emerald" icon={<IconProducts />} />
        <StatCard label="Active" value={metrics.active} accent="gold" icon={<IconProducts />} />
        <StatCard label="In stock" value={metrics.inStock} accent="cream" icon={<IconPackage />} />
        <StatCard label="Total variants" value={metrics.variants} accent="marble" icon={<IconPackage />} />
      </div>

      <AdminCard>
        {loading ? (
          <LoadingState label="Loading products…" />
        ) : (
          <DataTable columns={["Product", "Category", "Type", "Price", "Stock", "Variants", ""]} emptyMessage="No products">
            {filteredProducts.map((product) => (
              <DataRow key={product.id}>
                <DataCell className="font-medium">
                  <div>
                    <p>{product.name}</p>
                    {product.packSize ? <p className="mt-1 text-xs text-emerald-900/45">{product.packSize}</p> : null}
                  </div>
                </DataCell>
                <DataCell className="text-emerald-900/70">{product.categoryLabel}</DataCell>
                <DataCell className="capitalize text-emerald-900/70">{product.productType}</DataCell>
                <DataCell className="font-medium">{product.price}</DataCell>
                <DataCell>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      product.inStock ? "bg-emerald-800/12 text-emerald-800" : "bg-red-50 text-red-600"
                    }`}
                  >
                    {product.inStock ? "In stock" : "Out of stock"}
                  </span>
                </DataCell>
                <DataCell className="text-emerald-900/70">{product.variantCount ?? product.variants?.length ?? 0}</DataCell>
                <DataCell className="text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <button type="button" onClick={() => openEdit(product)} className="btn-ghost">
                      Edit
                    </button>
                    <button type="button" onClick={() => toggleStock(product)} className="btn-ghost">
                      Toggle stock
                    </button>
                    <button type="button" onClick={() => handleDelete(product)} className="btn-ghost text-red-700">
                      Delete
                    </button>
                  </div>
                </DataCell>
              </DataRow>
            ))}
          </DataTable>
        )}
      </AdminCard>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/55 p-4" onClick={closeForm}>
          <div className="w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <AdminCard
              title={editingProductId ? "Edit product" : "New product"}
              className="max-h-[92vh] overflow-y-auto shadow-2xl"
              action={
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-emerald-900/10 px-3 py-1.5 text-sm text-emerald-900/70 transition hover:bg-white"
                  aria-label="Close product form"
                >
                  Close
                </button>
              }
            >
              <p className="mb-4 text-sm text-emerald-900/55">
                Create or update parent products with one or more purchasable variants.
              </p>

              <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="admin-label">Product name</span>
                  <input
                    required
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    className="admin-input"
                    placeholder="Ajwa Dates"
                  />
                </label>

                <label className="block">
                  <span className="admin-label">Category</span>
                  <select
                    value={form.categoryId}
                    onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
                    className="admin-input"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="admin-label">Product type</span>
                  <select
                    value={form.productType}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        productType: event.target.value,
                        variants:
                          event.target.value === "simple" && current.variants.length > 1
                            ? [{ ...current.variants[0], isDefault: true }]
                            : current.variants.length
                              ? current.variants
                              : [createVariant({ weight: "250g", packaging: "Pouch", isDefault: true })],
                      }))
                    }
                    className="admin-input"
                  >
                    <option value="simple">Simple Product</option>
                    <option value="variant">Variant Product</option>
                  </select>
                </label>

                <label className="block">
                  <span className="admin-label">Status</span>
                  <select
                    value={form.status}
                    onChange={(event) => setForm({ ...form, status: event.target.value })}
                    className="admin-input"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                  </select>
                </label>

                <label className="block">
                  <span className="admin-label">Short description</span>
                  <input
                    value={form.tagline}
                    onChange={(event) => setForm({ ...form, tagline: event.target.value })}
                    className="admin-input"
                    placeholder="Rich & Premium"
                  />
                </label>

                <label className="block">
                  <span className="admin-label">Tag</span>
                  <input
                    value={form.tag}
                    onChange={(event) => setForm({ ...form, tag: event.target.value })}
                    className="admin-input"
                    placeholder="Premium"
                  />
                </label>

                <label className="block">
                  <span className="admin-label">Badge</span>
                  <input
                    value={form.badge}
                    onChange={(event) => setForm({ ...form, badge: event.target.value })}
                    className="admin-input"
                    placeholder="Bestseller"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="admin-label">Benefits</span>
                  <input
                    value={form.benefits}
                    onChange={(event) => setForm({ ...form, benefits: event.target.value })}
                    className="admin-input"
                    placeholder="Natural Energy, High Fiber"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="admin-label">Full description</span>
                  <textarea
                    rows={4}
                    value={form.fullDescription}
                    onChange={(event) => setForm({ ...form, fullDescription: event.target.value })}
                    className="admin-input min-h-[120px]"
                    placeholder="Tell customers about sourcing, taste, and usage."
                  />
                </label>

                <div className="sm:col-span-2 rounded-2xl border border-emerald-900/10 bg-emerald-50/30 p-4">
                  <div className="flex flex-wrap gap-5">
                    <label className="inline-flex items-center gap-2 text-sm text-emerald-900/70">
                      <input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} />
                      Featured
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-emerald-900/70">
                      <input type="checkbox" checked={form.isNew} onChange={(event) => setForm({ ...form, isNew: event.target.checked })} />
                      New arrival
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-emerald-900/70">
                      <input
                        type="checkbox"
                        checked={form.isBestSeller}
                        onChange={(event) => setForm({ ...form, isBestSeller: event.target.checked })}
                      />
                      Best seller
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-2 rounded-2xl border border-emerald-900/10 bg-white/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="admin-label">Product images</p>
                      <p className="text-xs text-emerald-900/45">Upload one or more images. The first image becomes the cover.</p>
                    </div>
                    <label className="btn-secondary cursor-pointer">
                      Upload images
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                    </label>
                  </div>

                  {form.existingImages.length > 0 ? (
                    <div className="mt-4">
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-900/35">Saved images</p>
                      <div className="mt-2 grid gap-3 sm:grid-cols-3">
                        {form.existingImages.map((image) => (
                          <div key={image} className="overflow-hidden rounded-2xl border border-emerald-900/10 bg-cream-50/60 p-2">
                            <img src={image} alt="" className="h-28 w-full rounded-xl object-cover" />
                            <button type="button" className="mt-2 text-xs text-red-700" onClick={() => removeExistingImage(image)}>
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {imagePreviews.length > 0 ? (
                    <div className="mt-4">
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-900/35">New uploads</p>
                      <div className="mt-2 grid gap-3 sm:grid-cols-3">
                        {imagePreviews.map((preview) => (
                          <div key={preview.url} className="overflow-hidden rounded-2xl border border-emerald-900/10 bg-cream-50/60 p-2">
                            <img src={preview.url} alt="" className="h-28 w-full rounded-xl object-cover" />
                            <p className="mt-2 truncate text-xs text-emerald-900/55">{preview.file.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="sm:col-span-2 rounded-2xl border border-emerald-900/10 bg-white/85 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="admin-label">{isVariantProduct ? "Variants" : "Simple product details"}</p>
                      <p className="text-xs text-emerald-900/45">
                        {isVariantProduct
                          ? "Each row is a purchasable SKU with its own stock and price."
                          : "A simple product still creates one default variant for inventory."}
                      </p>
                    </div>
                    {isVariantProduct ? (
                      <button type="button" onClick={addVariant} className="btn-secondary">
                        + Add variant
                      </button>
                    ) : null}
                  </div>

                  <div className="space-y-3">
                    {form.variants.map((variant, index) => (
                      <div key={variant.id ?? `variant-${index}`} className="rounded-2xl border border-emerald-900/10 bg-cream-50/40 p-4">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm font-medium text-emerald-900">
                            {isVariantProduct ? `Variant ${index + 1}` : "Default variant"}
                          </p>
                          <div className="flex items-center gap-3">
                            <label className="inline-flex items-center gap-2 text-xs text-emerald-900/55">
                              <input type="radio" name="default-variant" checked={variant.isDefault} onChange={() => setDefaultVariant(index)} />
                              Default
                            </label>
                            {form.variants.length > 1 ? (
                              <button type="button" className="text-xs text-red-700" onClick={() => removeVariant(index)}>
                                Remove
                              </button>
                            ) : null}
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <label className="block">
                            <span className="admin-label">Weight / pack label</span>
                            <input
                              required
                              value={variant.weight}
                              onChange={(event) => updateVariant(index, { weight: event.target.value })}
                              className="admin-input"
                              placeholder="250g"
                            />
                          </label>

                          <label className="block">
                            <span className="admin-label">SKU (auto-generated)</span>
                            <input
                              value={resolveVariantSku(variant)}
                              readOnly
                              className="admin-input bg-cream-100/80 text-emerald-900/70"
                              placeholder="Generated after name and weight"
                            />
                            <p className="mt-1 text-xs text-emerald-900/45">
                              Generated from category, product name, and weight.
                            </p>
                          </label>

                          <label className="block">
                            <span className="admin-label">Packaging</span>
                            <input
                              value={variant.packaging}
                              onChange={(event) => updateVariant(index, { packaging: event.target.value })}
                              className="admin-input"
                              placeholder="Pouch"
                            />
                          </label>

                          <label className="block">
                            <span className="admin-label">Selling price (₹)</span>
                            <input
                              type="number"
                              min="0"
                              required
                              value={variant.priceValue}
                              onChange={(event) => updateVariant(index, { priceValue: event.target.value })}
                              className="admin-input"
                            />
                          </label>

                          <label className="block">
                            <span className="admin-label">MRP (₹)</span>
                            <input
                              type="number"
                              min="0"
                              value={variant.mrpValue}
                              onChange={(event) => updateVariant(index, { mrpValue: event.target.value })}
                              className="admin-input"
                            />
                          </label>

                          <label className="block">
                            <span className="admin-label">Stock quantity</span>
                            <input
                              type="number"
                              min="0"
                              required
                              value={variant.stockQuantity}
                              onChange={(event) => updateVariant(index, { stockQuantity: event.target.value })}
                              className="admin-input"
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:col-span-2">
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? "Saving..." : editingProductId ? "Update product" : "Create product"}
                  </button>
                  <button type="button" onClick={closeForm} className="btn-secondary" disabled={saving}>
                    Cancel
                  </button>
                </div>
              </form>
            </AdminCard>
          </div>
        </div>
      )}
    </div>
  );
}
