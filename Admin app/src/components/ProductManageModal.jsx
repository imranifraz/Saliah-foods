import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api.js";
import { AdminModalLayout } from "./AdminModalLayout.jsx";
import { ProductForm, mapProductToForm } from "./ProductForm.jsx";
import { ViewProductPanel, ProductVariantsPanel } from "./ViewProductPanel.jsx";
import { LoadingState } from "./ui/LoadingState.jsx";

export function ProductManageModal({ open, productId, mode = "view", categories, onClose, onUpdated }) {
  const [product, setProduct] = useState(null);
  const [currentMode, setCurrentMode] = useState(mode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formBusy, setFormBusy] = useState(false);
  const [openedInEditMode, setOpenedInEditMode] = useState(false);

  useEffect(() => {
    if (open) {
      setCurrentMode(mode);
      setOpenedInEditMode(mode === "edit");
    }
  }, [open, mode, productId]);

  useEffect(() => {
    if (currentMode !== "edit") setFormBusy(false);
  }, [currentMode, productId]);

  useEffect(() => {
    if (!open || !productId) {
      setProduct(null);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    apiFetch(`/api/admin/products/${productId}`)
      .then((data) => setProduct(data.product))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [open, productId]);

  if (!open) return null;

  const isEdit = currentMode === "edit";
  const isPrices = currentMode === "prices";
  const title = isEdit ? "Edit product" : isPrices ? "Variant prices" : "Product details";
  const subtitle = isEdit
    ? "Update catalog information, images, and variants."
    : isPrices
      ? product?.name ?? "Review selling price and MRP for each variant."
      : "Review catalog information, variants, and stock.";

  function handleCancelEdit() {
    if (openedInEditMode) {
      onClose();
      return;
    }
    setCurrentMode("view");
  }

  function handleEditSuccess(updatedProduct) {
    setProduct(updatedProduct);
    setCurrentMode("view");
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
            <button type="button" onClick={() => setCurrentMode("edit")} className="btn-primary w-full sm:w-auto">
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
