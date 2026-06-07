import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../lib/api.js";
import { AdminModalLayout } from "./AdminModalLayout.jsx";
import { ProductForm, mapProductToForm } from "./ProductForm.jsx";
import { ViewProductPanel, ProductVariantsPanel } from "./ViewProductPanel.jsx";
import { LoadingState } from "./ui/LoadingState.jsx";

export function ProductManageModal({
  open,
  productId,
  mode = "view",
  categories,
  onClose,
  onUpdated,
  onModeChange,
}) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formBusy, setFormBusy] = useState(false);
  const openedInEditModeRef = useRef(false);
  const loadTokenRef = useRef(0);
  const prevOpenRef = useRef(false);
  const prevProductIdRef = useRef(null);

  useEffect(() => {
    const justOpened = open && !prevOpenRef.current;
    const productChanged = open && productId != null && productId !== prevProductIdRef.current;

    if (open && (justOpened || productChanged)) {
      openedInEditModeRef.current = mode === "edit";
    }

    prevOpenRef.current = open;
    prevProductIdRef.current = productId;
  }, [open, productId, mode]);

  useEffect(() => {
    if (mode !== "edit") setFormBusy(false);
  }, [mode, productId]);

  useEffect(() => {
    if (!open || !productId) {
      setProduct(null);
      setError("");
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
  }, [open, productId]);

  if (!open) return null;

  const isEdit = mode === "edit";
  const isPrices = mode === "prices";
  const title = isEdit ? "Edit product" : isPrices ? "Variant prices" : "Product details";
  const subtitle = isEdit
    ? "Update catalog information, images, and variants."
    : isPrices
      ? product?.name ?? "Review selling price and MRP for each variant."
      : "Review catalog information, variants, and stock.";

  function handleCancelEdit() {
    if (openedInEditModeRef.current) {
      onClose();
      return;
    }
    onModeChange?.("view");
  }

  function handleEditSuccess(updatedProduct) {
    setProduct(updatedProduct);
    onModeChange?.("view");
    setFormBusy(false);
    onUpdated?.();
  }

  const editFormId = product ? `edit-product-form-${product.id}` : "edit-product-form";

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
        ) : product && isEdit ? (
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="btn-ghost w-full sm:w-auto"
              disabled={formBusy}
            >
              Cancel
            </button>
            <button type="submit" form={editFormId} className="btn-primary w-full sm:w-auto" disabled={formBusy}>
              {formBusy ? "Saving…" : "Save product"}
            </button>
          </div>
        ) : product && !isEdit ? (
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="btn-ghost w-full sm:w-auto">
              Close
            </button>
            <button
              type="button"
              onClick={() => onModeChange?.("edit")}
              className="btn-primary w-full sm:w-auto"
            >
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
      ) : product && isEdit ? (
        <ProductForm
          key={`${product.id}-edit`}
          formId={editFormId}
          productId={product.id}
          initial={mapProductToForm(product)}
          categories={categories}
          onBusyChange={setFormBusy}
          onSuccess={handleEditSuccess}
        />
      ) : product && isPrices ? (
        <ProductVariantsPanel product={product} showStock={false} />
      ) : product ? (
        <ViewProductPanel key={`${product.id}-view`} product={product} />
      ) : null}
    </AdminModalLayout>
  );
}
