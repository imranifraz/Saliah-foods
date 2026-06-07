import { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "../lib/api.js";
import { resolveAdminMediaUrl } from "../lib/mediaUrl.js";
import {
  buildAutoSku,
  createEmptyForm,
  createVariant,
  mapProductToForm,
  slugifySkuPart,
  validateProductImageFile,
} from "../lib/productForm.js";
import { ImageCropModal } from "./ImageCropModal.jsx";

function parseOptionalAmount(value) {
  if (value === "" || value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getVariantPricingError(variant, variantLabel) {
  const price = Number(variant.priceValue);
  const mrp = parseOptionalAmount(variant.mrpValue);
  if (mrp == null || mrp <= 0 || !Number.isFinite(price) || price <= 0) return null;
  if (price > mrp) {
    return `${variantLabel}: selling price cannot exceed MRP (₹${mrp.toLocaleString("en-IN")}).`;
  }
  return null;
}

function IconChevronUp() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function buildImageItemsFromForm(form) {
  const existing = (form.existingImages ?? []).map((url) => ({ type: "existing", url }));
  const fresh = (form.imageFiles ?? []).map((file) => ({
    type: "new",
    file,
    previewUrl: URL.createObjectURL(file),
  }));
  return [...existing, ...fresh];
}

function formFromImageItems(baseForm, imageItems) {
  const existingImages = imageItems.filter((item) => item.type === "existing").map((item) => item.url);
  const imageFiles = imageItems.filter((item) => item.type === "new").map((item) => item.file);
  return { ...baseForm, existingImages, imageFiles };
}

export function ProductForm({ productId, initial, categories, formId = "product-form", onBusyChange, onSuccess }) {
  const isEditing = Boolean(productId);
  const defaultCategoryId = categories[0]?.id ?? "dates";

  const [form, setForm] = useState(() => initial ?? createEmptyForm(defaultCategoryId));
  const [slugManual, setSlugManual] = useState(isEditing);
  const [error, setError] = useState("");
  const [warn, setWarn] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageItems, setImageItems] = useState(() => buildImageItemsFromForm(initial ?? createEmptyForm(defaultCategoryId)));
  const [cropImage, setCropImage] = useState(null);
  const cropObjectUrl = useRef(null);
  const fileInputRef = useRef(null);
  const previewUrls = useRef(new Set());

  useEffect(() => {
    const nextForm = initial ?? createEmptyForm(defaultCategoryId);
    setForm(nextForm);
    setSlugManual(isEditing);
    setError("");
    setWarn("");
    revokePreviewUrls();
    setImageItems(buildImageItemsFromForm(nextForm));
    closeCrop();
  }, [initial, productId, isEditing, defaultCategoryId]);

  useEffect(() => {
    return () => {
      revokePreviewUrls();
      closeCrop();
    };
  }, []);

  function revokePreviewUrls() {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrls.current.clear();
  }

  function trackPreviewUrl(url) {
    previewUrls.current.add(url);
    return url;
  }

  function closeCrop() {
    if (cropObjectUrl.current) {
      URL.revokeObjectURL(cropObjectUrl.current);
      cropObjectUrl.current = null;
    }
    setCropImage(null);
  }

  function handleNameChange(value) {
    setForm((current) => ({
      ...current,
      name: value,
      ...(!slugManual ? { slug: slugifySkuPart(value) } : {}),
    }));
  }

  function handleSlugChange(value) {
    setSlugManual(true);
    setForm((current) => ({ ...current, slug: slugifySkuPart(value) }));
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

  function resolveVariantSku(variant) {
    if (variant.id && variant.sku) return variant.sku;
    return buildAutoSku({
      categoryId: form.categoryId,
      productName: form.slug || form.name,
      weight: variant.weight,
    });
  }

  function removeImageItem(index) {
    setImageItems((current) => {
      const removed = current[index];
      if (removed?.type === "new" && removed.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
        previewUrls.current.delete(removed.previewUrl);
      }
      const next = current.filter((_, itemIndex) => itemIndex !== index);
      setForm((prev) => formFromImageItems(prev, next));
      return next;
    });
  }

  function moveImageItem(index, direction) {
    const targetIndex = index + direction;
    setImageItems((current) => {
      if (targetIndex < 0 || targetIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      setForm((prev) => formFromImageItems(prev, next));
      return next;
    });
  }

  function openCropForFile(file) {
    const validation = validateProductImageFile(file);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    setWarn(validation.warn ?? "");
    closeCrop();
    cropObjectUrl.current = URL.createObjectURL(file);
    const slug = slugifySkuPart(form.slug || form.name) || "product";
    setCropImage({
      src: cropObjectUrl.current,
      fileName: `${slug}-product.jpg`,
    });
  }

  function handleImagePick(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) openCropForFile(file);
  }

  async function handleCropConfirm(file) {
    closeCrop();
    const validation = validateProductImageFile(file);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    if (validation.warn) setWarn(validation.warn);

    const previewUrl = trackPreviewUrl(URL.createObjectURL(file));
    setImageItems((current) => {
      const next = [...current, { type: "new", file, previewUrl }];
      setForm((prev) => formFromImageItems(prev, next));
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }

    setSaving(true);

    try {
      const slug = slugifySkuPart(form.slug || form.name);
      if (!slug) {
        setError("URL slug is required.");
        setSaving(false);
        return;
      }

      if (imageItems.length === 0) {
        setError("At least one product image is required.");
        setSaving(false);
        return;
      }

      for (const [index, variant] of form.variants.entries()) {
        const variantLabel =
          form.productType === "variant"
            ? variant.weight.trim() || `Variant ${index + 1}`
            : "Product";
        const pricingError = getVariantPricingError(variant, variantLabel);
        if (pricingError) {
          setError(pricingError);
          setSaving(false);
          return;
        }
      }

      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("slug", slug);
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

      const existingImages = imageItems.filter((item) => item.type === "existing").map((item) => item.url);
      formData.append("existingImages", JSON.stringify(existingImages));
      imageItems
        .filter((item) => item.type === "new")
        .forEach((item) => {
          formData.append("images", item.file);
        });

      const cleanedVariants = form.variants.map((variant, index) => ({
        ...(variant.id ? { id: variant.id } : {}),
        weight: variant.weight.trim(),
        sku: resolveVariantSku(variant),
        priceValue: Number(variant.priceValue),
        mrpValue: Number(variant.mrpValue),
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
        formData.append("mrpValue", String(simpleVariant.mrpValue));
        formData.append("stockQuantity", String(simpleVariant.stockQuantity));
        formData.append("packaging", simpleVariant.packaging);
        formData.append("inStock", String(simpleVariant.stockQuantity > 0));
      }

      const data = await apiFetch(
        isEditing ? `/api/admin/products/${productId}` : "/api/admin/products",
        {
          method: isEditing ? "PATCH" : "POST",
          body: formData,
        }
      );

      onSuccess?.(data.product);
    } catch (err) {
      setError(err.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const isVariantProduct = form.productType === "variant";
  const formBusy = saving || Boolean(cropImage);

  useEffect(() => {
    onBusyChange?.(formBusy);
  }, [formBusy, onBusyChange]);

  const imagePreviewItems = useMemo(
    () =>
      imageItems.map((item, index) => ({
        key: item.type === "existing" ? item.url : item.previewUrl,
        index,
        src: item.type === "existing" ? resolveAdminMediaUrl(item.url) : item.previewUrl,
        label: item.type === "new" ? item.file.name : index === 0 ? "Cover" : `Image ${index + 1}`,
        isCover: index === 0,
      })),
    [imageItems]
  );

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {warn ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800" role="status">
          {warn}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="admin-label">Product name</span>
          <input
            required
            value={form.name}
            onChange={(event) => handleNameChange(event.target.value)}
            className="admin-input mt-1.5 w-full"
            placeholder="Ajwa Dates"
          />
        </label>

        <label className="block">
          <span className="admin-label">URL slug</span>
          <input
            required
            value={form.slug}
            onChange={(event) => handleSlugChange(event.target.value)}
            className="admin-input mt-1.5 w-full"
            placeholder="ajwa-dates"
          />
          <p className="admin-muted mt-1.5 text-xs">Customer URL: /product/{form.slug || "your-slug"}</p>
        </label>

        <label className="block">
          <span className="admin-label">Category</span>
          <select
            value={form.categoryId}
            onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}
            className="admin-input mt-1.5 w-full"
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
            className="admin-input mt-1.5 w-full"
          >
            <option value="simple">Simple product</option>
            <option value="variant">Variant product</option>
          </select>
        </label>

        <label className="block">
          <span className="admin-label">Status</span>
          <select
            value={form.status}
            onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
            className="admin-input mt-1.5 w-full"
          >
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
        </label>

        <label className="block">
          <span className="admin-label">Short description</span>
          <input
            value={form.tagline}
            onChange={(event) => setForm((current) => ({ ...current, tagline: event.target.value }))}
            className="admin-input mt-1.5 w-full"
            placeholder="Rich & Premium"
          />
        </label>

        <label className="block">
          <span className="admin-label">Tag</span>
          <input
            value={form.tag}
            onChange={(event) => setForm((current) => ({ ...current, tag: event.target.value }))}
            className="admin-input mt-1.5 w-full"
            placeholder="Premium"
          />
        </label>

        <label className="block">
          <span className="admin-label">Badge</span>
          <input
            value={form.badge}
            onChange={(event) => setForm((current) => ({ ...current, badge: event.target.value }))}
            className="admin-input mt-1.5 w-full"
            placeholder="e.g. Premium Quality, New arrival"
          />
          <p className="admin-muted mt-1.5 text-xs">
            Optional label on the shop card. Best seller is applied automatically from sales.
          </p>
        </label>

        <label className="block sm:col-span-2">
          <span className="admin-label">Benefits</span>
          <input
            value={form.benefits}
            onChange={(event) => setForm((current) => ({ ...current, benefits: event.target.value }))}
            className="admin-input mt-1.5 w-full"
            placeholder="Natural Energy, High Fiber"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="admin-label">Full description</span>
          <textarea
            rows={4}
            value={form.fullDescription}
            onChange={(event) => setForm((current) => ({ ...current, fullDescription: event.target.value }))}
            className="admin-input mt-1.5 min-h-[120px] w-full"
            placeholder="Tell customers about sourcing, taste, and usage."
          />
        </label>
      </div>

      <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-4">
        <div className="flex flex-wrap gap-5">
          <label className="inline-flex items-center gap-2 text-sm text-[var(--admin-fg)]">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))}
              className="h-4 w-4 rounded border-[var(--admin-border-strong)]"
            />
            Featured
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-[var(--admin-fg)]">
            <input
              type="checkbox"
              checked={form.isNew}
              onChange={(event) => setForm((current) => ({ ...current, isNew: event.target.checked }))}
              className="h-4 w-4 rounded border-[var(--admin-border-strong)]"
            />
            New arrival
          </label>
        </div>
        <p className="admin-muted mt-2 text-xs leading-relaxed">
          Best seller is set automatically from order sales and cannot be toggled manually.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="admin-label">Product images</p>
            <p className="admin-muted text-xs">Upload packshots on a light background. First image is the shop cover.</p>
            <p className="admin-muted mt-1 text-xs">
              Recommended: 1200×1200 px (1:1), PNG or JPG, max 5 MB each.
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary"
            disabled={formBusy}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload image
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={formBusy}
            onChange={handleImagePick}
          />
        </div>

        {imagePreviewItems.length > 0 ? (
          <div className="mt-4 space-y-2">
            {imagePreviewItems.map((preview) => (
              <div
                key={preview.key}
                className="flex items-center gap-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-2"
              >
                <img src={preview.src} alt="" className="h-16 w-16 shrink-0 rounded-lg object-contain" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--admin-fg)]">
                    {preview.isCover ? "Cover image" : preview.label}
                  </p>
                  {preview.isCover ? (
                    <p className="admin-muted text-xs">Shown on listing cards</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--admin-border)] text-[var(--admin-fg-muted)] transition hover:bg-[var(--admin-hover)]"
                    aria-label="Move image up"
                    disabled={preview.index === 0 || formBusy}
                    onClick={() => moveImageItem(preview.index, -1)}
                  >
                    <IconChevronUp />
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--admin-border)] text-[var(--admin-fg-muted)] transition hover:bg-[var(--admin-hover)]"
                    aria-label="Move image down"
                    disabled={preview.index === imagePreviewItems.length - 1 || formBusy}
                    onClick={() => moveImageItem(preview.index, 1)}
                  >
                    <IconChevronDown />
                  </button>
                  <button
                    type="button"
                    className="btn-ghost px-2 py-1 text-xs text-[var(--admin-danger)]"
                    disabled={formBusy}
                    onClick={() => removeImageItem(preview.index)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="admin-muted mt-4 text-sm">No images yet. Upload at least one product image.</p>
        )}
      </div>

      <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="admin-label">{isVariantProduct ? "Variants" : "Simple product details"}</p>
            <p className="admin-muted text-xs">
              {isVariantProduct
                ? "Each row is a purchasable SKU with its own stock and price."
                : "A simple product still creates one default variant for inventory."}
            </p>
          </div>
          {isVariantProduct ? (
            <button type="button" onClick={addVariant} className="btn-secondary" disabled={formBusy}>
              + Add variant
            </button>
          ) : null}
        </div>

        <div className="space-y-3">
          {form.variants.map((variant, index) => {
            const variantLabel = isVariantProduct
              ? variant.weight.trim() || `Variant ${index + 1}`
              : "Product";
            const mrpAmount = parseOptionalAmount(variant.mrpValue);
            const pricingError = getVariantPricingError(variant, variantLabel);

            return (
            <div
              key={variant.id ?? `variant-${index}`}
              className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-medium text-[var(--admin-fg)]">
                  {isVariantProduct ? `Variant ${index + 1}` : "Default variant"}
                </p>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 text-xs text-[var(--admin-fg-muted)]">
                    <input
                      type="radio"
                      name="default-variant"
                      checked={variant.isDefault}
                      onChange={() => setDefaultVariant(index)}
                    />
                    Default
                  </label>
                  {form.variants.length > 1 ? (
                    <button
                      type="button"
                      className="text-xs text-[var(--admin-danger)]"
                      onClick={() => removeVariant(index)}
                    >
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
                    className="admin-input mt-1.5 w-full"
                    placeholder="250g"
                  />
                </label>

                <label className="block">
                  <span className="admin-label">SKU (auto-generated)</span>
                  <input
                    value={resolveVariantSku(variant)}
                    readOnly
                    className="admin-input mt-1.5 w-full bg-[var(--admin-surface-2)] text-[var(--admin-fg-muted)]"
                  />
                </label>

                <label className="block">
                  <span className="admin-label">Packaging</span>
                  <input
                    value={variant.packaging}
                    onChange={(event) => updateVariant(index, { packaging: event.target.value })}
                    className="admin-input mt-1.5 w-full"
                    placeholder="Pouch"
                  />
                </label>

                <label className="block">
                  <span className="admin-label">
                    MRP / cost price (₹) <span className="text-[var(--admin-danger)]">*</span>
                  </span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={variant.mrpValue}
                    onChange={(event) => updateVariant(index, { mrpValue: event.target.value })}
                    className={`admin-input mt-1.5 w-full ${pricingError ? "border-[var(--admin-danger)]" : ""}`}
                    aria-invalid={pricingError ? "true" : undefined}
                  />
                </label>

                <label className="block">
                  <span className="admin-label">Selling price (₹)</span>
                  <input
                    type="number"
                    min="0"
                    max={mrpAmount != null && mrpAmount > 0 ? mrpAmount : undefined}
                    required
                    value={variant.priceValue}
                    onChange={(event) => updateVariant(index, { priceValue: event.target.value })}
                    className={`admin-input mt-1.5 w-full ${pricingError ? "border-[var(--admin-danger)]" : ""}`}
                    aria-invalid={pricingError ? "true" : undefined}
                  />
                  {pricingError ? (
                    <p className="mt-1 text-xs text-[var(--admin-danger)]">{pricingError}</p>
                  ) : (
                    <p className="admin-muted mt-1 text-xs">Must be at or below MRP.</p>
                  )}
                </label>

                <label className="block">
                  <span className="admin-label">Stock quantity</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={variant.stockQuantity}
                    onChange={(event) => updateVariant(index, { stockQuantity: event.target.value })}
                    className="admin-input mt-1.5 w-full"
                  />
                </label>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      <ImageCropModal
        open={Boolean(cropImage)}
        imageSrc={cropImage?.src ?? ""}
        fileName={cropImage?.fileName ?? "product-image.jpg"}
        title="Crop product image"
        subtitle="Adjust the 1:1 square crop for your product packshot."
        aspect={1}
        onClose={closeCrop}
        onConfirm={handleCropConfirm}
      />
    </form>
  );
}

export { createEmptyForm, mapProductToForm };
