import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../lib/api.js";
import { AdminModalLayout } from "./AdminModalLayout.jsx";
import { ViewProductPanel, ProductVariantsPanel } from "./ViewProductPanel.jsx";
import { LoadingState } from "./ui/LoadingState.jsx";

/**
 * Product details / prices modal.
 * Edit always goes through /products/:id/edit (ProductEditPage + ProductForm) — not a second form here.
 */
export function ProductManageModal({
  open,
  productId,
  mode = "view",
  categories = [],
  onClose,
  onUpdated,
  onModeChange,
}) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const loadTokenRef = useRef(0);

  useEffect(() => {
    if (!open || !productId) {
      setProduct(null);
      setError("");
      return;
    }

    // Edit is a dedicated page — hand off immediately (same ProductForm as listing Edit).
    if (mode === "edit") {
      onModeChange?.("edit");
      return;
    }

    const loadToken = ++loadTokenRef.current;
    setLoading(true);
    setError("");

    apiFetch(`/api/admin/products/${productId}`)
      .then((data) => {
        if (loadToken !== loadTokenRef.current) return;
        setProduct(data.product);
      })
      .catch((err) => {
        if (loadToken !== loadTokenRef.current) return;
        setError(err.message);
        setProduct(null);
      })
      .finally(() => {
        if (loadToken !== loadTokenRef.current) return;
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid loops from inline onModeChange
  }, [open, productId, mode]);

  if (!open) return null;
  if (mode === "edit") return null;

  const isPrices = mode === "prices";
  const title = isPrices ? "Variant prices" : "Product details";
  const subtitle = isPrices
    ? product?.name ?? "Review selling price and MRP for each variant."
    : "Review catalog information, variants, and stock.";

  function handleEnterEditMode(event) {
    event.preventDefault();
    event.stopPropagation();
    onModeChange?.("edit");
  }

  return (
    <AdminModalLayout
      open={open}
      title={title}
      subtitle={subtitle}
      titleId="product-manage-title"
      onClose={onClose}
      maxWidthClass={isPrices ? "max-w-lg" : "max-w-3xl"}
      maxHeightClass="sm:max-h-[min(48rem,calc(100dvh-2rem))]"
      footer={
        product && isPrices ? (
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="btn-ghost w-full sm:w-auto">
              Close
            </button>
          </div>
        ) : product ? (
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="btn-ghost w-full sm:w-auto">
              Close
            </button>
            <button type="button" onClick={handleEnterEditMode} className="btn-primary w-full sm:w-auto">
              Edit product
            </button>
          </div>
        ) : null
      }
    >
      {loading ? (
        <LoadingState label="Loading product…" />
      ) : error && !product ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : product && isPrices ? (
        <ProductVariantsPanel product={product} showStock={false} />
      ) : product ? (
        <ViewProductPanel key={`${product.id}-view`} product={product} />
      ) : null}
    </AdminModalLayout>
  );
}
