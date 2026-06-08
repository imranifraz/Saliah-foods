import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../lib/api.js";
import { CreateProductModal } from "../components/CreateProductModal.jsx";
import { ProductManageModal } from "../components/ProductManageModal.jsx";
import { ProductsListPanel } from "../components/ProductsListPanel.jsx";
import { IconProducts } from "../components/icons/AdminIcons.jsx";

function IconPlus() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

export function ProductsPage() {
  const listRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [manageProduct, setManageProduct] = useState(null);

  useEffect(() => {
    apiFetch("/api/admin/categories")
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => {});
  }, []);

  function reload() {
    listRef.current?.reload?.();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="admin-card admin-page-intro p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <span className="admin-page-intro__icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] text-[var(--admin-link)]">
              <IconProducts />
            </span>
            <div className="min-w-0">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--admin-fg)]">
                Product Management
              </h1>
              <p className="admin-muted mt-2 max-w-2xl text-[15px] leading-relaxed">
                Manage your catalog — prices, stock, variants, and categories.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="btn-primary inline-flex shrink-0 items-center gap-2"
          >
            <IconPlus />
            Add product
          </button>
        </div>
      </section>

      <ProductsListPanel
        ref={listRef}
        categories={categories}
        onViewProduct={(product) => setManageProduct({ id: product.id, mode: "view" })}
        onViewPrices={(product) => setManageProduct({ id: product.id, mode: "prices" })}
        onEditProduct={(product) => setManageProduct({ id: product.id, mode: "edit" })}
        onCreateClick={() => setCreateModalOpen(true)}
      />

      <CreateProductModal
        open={createModalOpen}
        categories={categories}
        onClose={() => setCreateModalOpen(false)}
        onCreated={reload}
      />

      <ProductManageModal
        open={Boolean(manageProduct)}
        productId={manageProduct?.id ?? null}
        mode={manageProduct?.mode ?? "view"}
        categories={categories}
        onClose={() => setManageProduct(null)}
        onUpdated={reload}
      />
    </div>
  );
}
