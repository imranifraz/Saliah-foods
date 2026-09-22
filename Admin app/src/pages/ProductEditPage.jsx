import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { ProductForm, mapProductToForm } from "../components/ProductForm.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
const EDIT_FORM_ID = "product-edit-page-form";

/**
 * Single source of truth for Product Edit.
 * Opened from listing Edit icon OR Product Details → Edit Product (same route + same ProductForm).
 */
export function ProductEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formBusy, setFormBusy] = useState(false);
  const [formSaving, setFormSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setProduct(null);

    Promise.all([
      apiFetch(`/api/admin/products/${id}`),
      apiFetch("/api/admin/categories").catch(() => ({ categories: [] })),
    ])
      .then(([productRes, categoriesRes]) => {
        if (cancelled) return;
        setProduct(productRes.product);
        setCategories(categoriesRes.categories ?? []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message ?? "Failed to load product");
        setProduct(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  function handleSuccess(updatedProduct) {
    setProduct(updatedProduct);
    setFormBusy(false);
    setFormSaving(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl py-10">
        <LoadingState label="Loading product…" />
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <PageHeader title="Edit product" subtitle="Could not load this product." />
        <AdminCard className="p-4">
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          <Link to="/products" className="btn-secondary mt-4 inline-flex">
            Back to products
          </Link>
        </AdminCard>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-10">
      <PageHeader
        title="Edit product"
        subtitle={`Update ${product.name} — catalog details, cover, and gallery images.`}
      />

      <AdminCard className="p-4 sm:p-5">
        <ProductForm
          key={`edit-${product.id}`}
          formId={EDIT_FORM_ID}
          productId={product.id}
          initial={mapProductToForm(product)}
          categories={categories}
          onBusyChange={({ busy, saving }) => {
            setFormBusy(Boolean(busy));
            setFormSaving(Boolean(saving));
          }}
          onSuccess={handleSuccess}
        />
      </AdminCard>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          className="btn-ghost w-full sm:w-auto"
          disabled={formBusy}
          onClick={() => navigate("/products")}
        >
          Cancel
        </button>
        <button type="submit" form={EDIT_FORM_ID} className="btn-primary w-full sm:w-auto" disabled={formBusy}>
          {formSaving ? "Saving…" : "Save product"}
        </button>
      </div>
    </div>
  );
}
