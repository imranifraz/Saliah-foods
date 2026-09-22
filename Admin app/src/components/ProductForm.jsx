import { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "../lib/api.js";
import { resolveAdminMediaUrl } from "../lib/mediaUrl.js";
import { useAdminToast } from "../context/AdminToastContext.jsx";
import {
  buildAutoSku,
  buildStoryPayloadFromForm,
  createEmptyForm,
  createVariant,
  mapProductToForm,
  slugifySkuPart,
  validateProductImageFile,
} from "../lib/productForm.js";

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

function IconImageUpload() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
      />
    </svg>
  );
}

function IconGrip() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
      <path d="M7 4a1 1 0 11-2 0 1 1 0 012 0zm0 6a1 1 0 11-2 0 1 1 0 012 0zm0 6a1 1 0 11-2 0 1 1 0 012 0zm8-12a1 1 0 11-2 0 1 1 0 012 0zm0 6a1 1 0 11-2 0 1 1 0 012 0zm0 6a1 1 0 11-2 0 1 1 0 012 0z" />
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

export function ProductForm({ productId, initial, categories = [], formId = "product-form", onBusyChange, onSuccess }) {
  const toast = useAdminToast();
  const isEditing = Boolean(productId);
  const defaultCategoryId = categories[0]?.id ?? "dates";

  const [form, setForm] = useState(() => initial ?? createEmptyForm(defaultCategoryId));
  const [slugManual, setSlugManual] = useState(isEditing);
  const [error, setError] = useState("");
  const [warn, setWarn] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageItems, setImageItems] = useState(() => buildImageItemsFromForm(initial ?? createEmptyForm(defaultCategoryId)));
  const [pendingImageSaveHint, setPendingImageSaveHint] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [dropTargetIndex, setDropTargetIndex] = useState(null);
  const [fileDragOver, setFileDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const previewUrls = useRef(new Set());
  const errorRef = useRef(null);

  // Hydrate once from `initial` on mount. Parent must remount with a stable `key`
  // when switching products (ProductEditPage / CreateProductModal already do).
  // Do NOT reset on `initial` identity or categories load — that wiped new images.
  useEffect(() => {
    return () => {
      revokePreviewUrls();
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

  function showError(message) {
    setError(message);
    Promise.resolve().then(() => {
      errorRef.current?.scrollIntoView?.({ behavior: "smooth", block: "nearest" });
    });
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
      setPendingImageSaveHint(true);
      return next;
    });
  }

  function setCoverImage(index) {
    if (index <= 0) return;
    setImageItems((current) => {
      if (index >= current.length) return current;
      const next = [...current];
      const [picked] = next.splice(index, 1);
      next.unshift(picked);
      setForm((prev) => formFromImageItems(prev, next));
      setPendingImageSaveHint(true);
      return next;
    });
  }

  function reorderImageItems(fromIndex, toIndex) {
    if (fromIndex == null || toIndex == null || fromIndex === toIndex) return;
    setImageItems((current) => {
      if (fromIndex < 0 || fromIndex >= current.length || toIndex < 0 || toIndex >= current.length) {
        return current;
      }
      const next = [...current];
      const [picked] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, picked);
      setForm((prev) => formFromImageItems(prev, next));
      setPendingImageSaveHint(true);
      return next;
    });
  }

  function preserveModalScroll(run) {
    const scrollParent = document.querySelector(".admin-modal__panel .overflow-y-auto");
    const scrollTop = scrollParent?.scrollTop ?? null;
    run();
    if (scrollParent != null && scrollTop != null) {
      requestAnimationFrame(() => {
        scrollParent.scrollTop = scrollTop;
        requestAnimationFrame(() => {
          scrollParent.scrollTop = scrollTop;
        });
      });
    }
  }

  function addImageFiles(fileList, { asCover = false } = {}) {
    const files = Array.from(fileList || []).filter((file) => file instanceof Blob);
    if (!files.length) return;

    const maxImages = 8;
    const prepared = [];
    for (const file of files) {
      const validation = validateProductImageFile(file);
      if (!validation.ok) {
        showError(validation.error);
        return;
      }
      if (validation.warn) setWarn(validation.warn);
      let previewUrl = "";
      try {
        previewUrl = trackPreviewUrl(URL.createObjectURL(file));
      } catch {
        showError("Could not read one of the selected images. Try another file.");
        return;
      }
      prepared.push({
        type: "new",
        file,
        previewUrl,
      });
    }

    setImageItems((current) => {
      const room = Math.max(0, maxImages - current.length);
      if (room <= 0) {
        prepared.forEach((item) => {
          URL.revokeObjectURL(item.previewUrl);
          previewUrls.current.delete(item.previewUrl);
        });
        // Defer error so we are not calling setState inside this updater.
        queueMicrotask(() => showError("You can upload at most 8 product images."));
        return current;
      }

      const batch = prepared.slice(0, room);
      if (batch.length < prepared.length) {
        prepared.slice(batch.length).forEach((item) => {
          URL.revokeObjectURL(item.previewUrl);
          previewUrls.current.delete(item.previewUrl);
        });
        queueMicrotask(() =>
          setWarn(`Only ${room} more image(s) can be added (max ${maxImages}). Extra files were ignored.`)
        );
      }

      // Append by default so existing images stay. asCover only promotes new files to the front.
      const next = asCover || current.length === 0 ? [...batch, ...current] : [...current, ...batch];
      const capped = next.slice(0, maxImages);
      setForm((prev) => formFromImageItems(prev, capped));
      return capped;
    });

    setError("");
    setPendingImageSaveHint(true);
    setWarn((prev) =>
      prepared.length > 1
        ? `${prepared.length} images added. Click Save product to store them.`
        : prev || "Image added. Click Save product to store it."
    );
  }

  function handleImagePick(event) {
    // FileList is live — copy before clearing the input or length becomes 0.
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    event.target.blur();
    if (!files.length) return;
    preserveModalScroll(() => addImageFiles(files));
  }

  function handleCoverPick(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    event.target.blur();
    // First selected file becomes cover; any additional files join the gallery.
    if (!files.length) return;
    preserveModalScroll(() => addImageFiles(files, { asCover: true }));
  }

  function handleGalleryPick(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    event.target.blur();
    if (!files.length) return;
    preserveModalScroll(() => addImageFiles(files, { asCover: false }));
  }

  function handleTileDragStart(index) {
    if (formBusy) return;
    setDragIndex(index);
  }

  function handleTileDragOver(event, index) {
    if (formBusy || dragIndex == null) return;
    event.preventDefault();
    if (dropTargetIndex !== index) setDropTargetIndex(index);
  }

  function handleTileDrop(event, index) {
    event.preventDefault();
    if (formBusy) return;
    reorderImageItems(dragIndex, index);
    setDragIndex(null);
    setDropTargetIndex(null);
  }

  function handleTileDragEnd() {
    setDragIndex(null);
    setDropTargetIndex(null);
  }

  function handleFileDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!formBusy) setFileDragOver(true);
  }

  function handleFileDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    setFileDragOver(false);
  }

  function handleFileDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    setFileDragOver(false);
    if (formBusy || dragIndex != null) return;
    const files = event.dataTransfer?.files;
    if (files?.length) preserveModalScroll(() => addImageFiles(files));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }

    setSaving(true);
    setPendingImageSaveHint(false);

    try {
      const slug = slugifySkuPart(form.slug || form.name);
      if (!slug) {
        showError("URL slug is required.");
        setSaving(false);
        return;
      }

      if (imageItems.length === 0) {
        showError("At least one product image is required.");
        setSaving(false);
        return;
      }

      const newImageFiles = imageItems.filter((item) => item.type === "new");
      for (const item of newImageFiles) {
        if (!(item.file instanceof File) || item.file.size <= 0) {
          showError("A new image failed to prepare for upload. Remove it and upload again.");
          setSaving(false);
          return;
        }
        if (item.file.size > 8 * 1024 * 1024) {
          showError("Each image must be 8 MB or smaller.");
          setSaving(false);
          return;
        }
      }

      for (const [index, variant] of form.variants.entries()) {
        const variantLabel =
          form.productType === "variant"
            ? variant.weight.trim() || `Variant ${index + 1}`
            : "Product";
        const pricingError = getVariantPricingError(variant, variantLabel);
        if (pricingError) {
          showError(pricingError);
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
      const storyPayload = buildStoryPayloadFromForm(form);
      formData.append("fullDescription", storyPayload.fullDescription);
      formData.append("tag", form.tag.trim());
      formData.append("badge", form.badge.trim());
      formData.append("benefits", JSON.stringify(storyPayload.benefits));
      formData.append("featured", String(form.featured));
      formData.append("isNew", String(form.isNew));
      formData.append("bogoEnabled", String(Boolean(form.bogoEnabled)));

      const existingImages = imageItems
        .filter((item) => item.type === "existing")
        .map((item) => item.url);
      const imageOrder = imageItems.map((item) => (item.type === "existing" ? item.url : "__new__"));
      const newFiles = imageItems.filter((item) => item.type === "new").map((item) => item.file);

      formData.append("existingImages", JSON.stringify(existingImages));
      formData.append("imageOrder", JSON.stringify(imageOrder));
      for (const file of newFiles) {
        formData.append("images", file, file.name || "product-image.jpg");
      }

      if (newFiles.length > 0 && imageOrder.filter((slot) => slot === "__new__").length !== newFiles.length) {
        showError("Image list is out of sync. Remove and re-add the new images, then save again.");
        setSaving(false);
        return;
      }

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
        if (!simpleVariant) {
          showError("Add product pricing details before saving.");
          setSaving(false);
          return;
        }
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

      if (!data?.product) {
        throw new Error("Save succeeded but no product was returned. Refresh and verify the catalog.");
      }

      // Clear local new-file state after successful upload so cancel/reopen does not re-upload blobs.
      const savedImages = Array.isArray(data.product.images)
        ? data.product.images
        : data.product.img
          ? [data.product.img]
          : [];
      revokePreviewUrls();
      const syncedItems = savedImages.map((url) => ({ type: "existing", url }));
      setImageItems(syncedItems);
      setForm((prev) => formFromImageItems(prev, syncedItems));
      setPendingImageSaveHint(false);
      setWarn("");

      toast.success(isEditing ? "Product updated" : "Product created");
      onSuccess?.(data.product);
    } catch (err) {
      const message = err.message ?? "Save failed";
      showError(message);
      toast.error(isEditing ? "Could not save product" : "Could not create product", message);
    } finally {
      setSaving(false);
    }
  }

  const isVariantProduct = form.productType === "variant";
  const formBusy = saving;
  const onBusyChangeRef = useRef(onBusyChange);
  onBusyChangeRef.current = onBusyChange;

  useEffect(() => {
    onBusyChangeRef.current?.({
      busy: formBusy,
      saving,
      cropping: false,
    });
  }, [formBusy, saving]);

  const imagePreviewItems = useMemo(
    () =>
      imageItems.map((item, index) => ({
        key: item.type === "existing" ? item.url : item.previewUrl || `new-${index}`,
        index,
        src: item.type === "existing" ? resolveAdminMediaUrl(item.url) : item.previewUrl,
        label:
          item.type === "new"
            ? item.file?.name || `Image ${index + 1}`
            : index === 0
              ? "Cover"
              : `Image ${index + 1}`,
        isCover: index === 0,
      })),
    [imageItems]
  );

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      {error ? (
        <p
          ref={errorRef}
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {warn ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800" role="status">
          {warn}
        </p>
      ) : null}
      {pendingImageSaveHint ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
          Image added to this form. Click <strong>Save product</strong> below to store it in the catalog.
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
            placeholder="Naturally sweet Middle Eastern dates"
          />
          <p className="admin-muted mt-1.5 text-xs">One short line under the product name on the storefront.</p>
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
      </div>

      <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-4 space-y-4">
        <div>
          <p className="admin-label">Product details</p>
          <p className="admin-muted mt-1 text-xs leading-relaxed">
            Same structure as the storefront product page: overview, highlights, at-a-glance, nutrition, and product
            information.
          </p>
        </div>

        <label className="block">
          <span className="admin-label">Overview</span>
          <textarea
            rows={4}
            value={form.overview}
            onChange={(event) => setForm((current) => ({ ...current, overview: event.target.value }))}
            className="admin-input mt-1.5 min-h-[110px] w-full"
            placeholder={"Paragraph 1 about taste and sourcing.\n\nParagraph 2 about how to enjoy it."}
          />
          <p className="admin-muted mt-1.5 text-xs">Separate paragraphs with a blank line.</p>
        </label>

        <label className="block">
          <span className="admin-label">Highlights</span>
          <textarea
            rows={5}
            value={form.highlightsText}
            onChange={(event) => setForm((current) => ({ ...current, highlightsText: event.target.value }))}
            className="admin-input mt-1.5 min-h-[110px] w-full"
            placeholder={"100% natural dates\nNo added sugar\nCholesterol free"}
          />
          <p className="admin-muted mt-1.5 text-xs">One highlight per line. Shown as chips on the product page.</p>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="admin-label">Ingredients</span>
            <input
              value={form.ingredients}
              onChange={(event) => setForm((current) => ({ ...current, ingredients: event.target.value }))}
              className="admin-input mt-1.5 w-full"
              placeholder="Dates"
            />
          </label>
          <label className="block">
            <span className="admin-label">Country of origin</span>
            <input
              value={form.origin}
              onChange={(event) => setForm((current) => ({ ...current, origin: event.target.value }))}
              className="admin-input mt-1.5 w-full"
              placeholder="Iraq"
            />
          </label>
          <label className="block">
            <span className="admin-label">Storage</span>
            <input
              value={form.storage}
              onChange={(event) => setForm((current) => ({ ...current, storage: event.target.value }))}
              className="admin-input mt-1.5 w-full"
              placeholder="Keep in a dry and cool area..."
            />
          </label>
          <label className="block">
            <span className="admin-label">Best before</span>
            <input
              value={form.bestBefore}
              onChange={(event) => setForm((current) => ({ ...current, bestBefore: event.target.value }))}
              className="admin-input mt-1.5 w-full"
              placeholder="9 months from packaging"
            />
          </label>
        </div>

        <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3 sm:p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="admin-label">Nutrition information</p>
              <p className="admin-muted mt-1 text-xs leading-relaxed">
                Optional. Turn on only if you want nutrition facts on the product page.
              </p>
            </div>
            <label className="product-form-switch">
              <span className="product-form-switch__label">
                {form.nutritionEnabled ? "Enabled" : "Disabled"}
              </span>
              <input
                type="checkbox"
                role="switch"
                aria-checked={Boolean(form.nutritionEnabled)}
                aria-label="Enable nutrition information"
                checked={Boolean(form.nutritionEnabled)}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    nutritionEnabled: event.target.checked,
                    nutritionText: current.nutritionText ?? "",
                    nutritionNote: current.nutritionNote ?? "",
                  }))
                }
              />
              <span className="product-form-switch__track" aria-hidden="true">
                <span className="product-form-switch__thumb" />
              </span>
            </label>
          </div>

          {form.nutritionEnabled ? (
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="admin-label">Nutrition values (per 100g)</span>
                <textarea
                  rows={6}
                  value={form.nutritionText ?? ""}
                  onChange={(event) => setForm((current) => ({ ...current, nutritionText: event.target.value }))}
                  className="admin-input mt-1.5 min-h-[130px] w-full"
                  placeholder={"Energy: 380 kcal\nProtein: 3.2g\nCarbohydrates: 80g\nTotal Sugars: 60g"}
                />
                <p className="admin-muted mt-1.5 text-xs">One nutrient per line as Label: value</p>
              </label>

              <label className="block">
                <span className="admin-label">Nutrition note</span>
                <input
                  value={form.nutritionNote ?? ""}
                  onChange={(event) => setForm((current) => ({ ...current, nutritionNote: event.target.value }))}
                  className="admin-input mt-1.5 w-full"
                  placeholder="Values are approximate as stated on the product packaging."
                />
              </label>
            </div>
          ) : (
            <p className="admin-muted mt-3 rounded-lg border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-2.5 text-xs">
              Nutrition section is off — it will not appear on the shop product page.
            </p>
          )}
        </div>

        <label className="block">
          <span className="admin-label">Important information</span>
          <textarea
            rows={3}
            value={form.important}
            onChange={(event) => setForm((current) => ({ ...current, important: event.target.value }))}
            className="admin-input mt-1.5 min-h-[80px] w-full"
            placeholder="May contain traces of nuts. Sorted and packed under hygienic conditions."
          />
        </label>

        <label className="block">
          <span className="admin-label">Product information</span>
          <textarea
            rows={5}
            value={form.factsText}
            onChange={(event) => setForm((current) => ({ ...current, factsText: event.target.value }))}
            className="admin-input mt-1.5 min-h-[110px] w-full"
            placeholder={"Brand: Saliah Dates\nProduct: Zahidi Dates\nFSSAI License No.: 10020042006883"}
          />
          <p className="admin-muted mt-1.5 text-xs">
            One fact per line as Label: value. Net Weight is taken automatically from the pack size / variant
            weights in the pricing section below.
          </p>
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
          <label className="inline-flex items-center gap-2 text-sm text-[var(--admin-fg)]">
            <input
              type="checkbox"
              checked={Boolean(form.bogoEnabled)}
              onChange={(event) =>
                setForm((current) => ({ ...current, bogoEnabled: event.target.checked }))
              }
              className="h-4 w-4 rounded border-[var(--admin-border-strong)]"
            />
            Buy 1 Get 1 Free
          </label>
        </div>
        <p className="admin-muted mt-2 text-xs leading-relaxed">
          Best seller is set automatically from order sales and cannot be toggled manually. BOGO applies
          per pack/variant — every 2nd unit is free.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="admin-label">Product images</p>
            <p className="admin-muted text-xs">
              Cover shows on shop cards. Select multiple images at once, drag to reorder, or hover Make cover.
            </p>
            <p className="admin-muted mt-1 text-xs">
              Use finished 1000×1000 px (1:1) PNG, JPG, or WebP — max 8 MB each, up to 8 images.
            </p>
          </div>
        </div>

        {/* Hidden inputs for programmatic buttons — keep them locally positioned so focus
            after the OS file dialog does not scroll the modal to a blank area. */}
        <div className="relative h-0 w-0 overflow-hidden" aria-hidden>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            tabIndex={-1}
            disabled={formBusy}
            onChange={handleImagePick}
          />
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            tabIndex={-1}
            disabled={formBusy}
            onChange={handleCoverPick}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            tabIndex={-1}
            disabled={formBusy}
            onChange={handleGalleryPick}
          />
        </div>

        <div
          className={`mt-4 rounded-xl border border-dashed px-4 py-5 transition ${
            fileDragOver
              ? "border-[var(--admin-link)] bg-[var(--admin-link)]/5"
              : "border-[var(--admin-border)] bg-[var(--admin-surface)]"
          }`}
          onDragEnter={handleFileDragOver}
          onDragOver={handleFileDragOver}
          onDragLeave={handleFileDragLeave}
          onDrop={handleFileDrop}
        >
          <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--admin-surface-2)] text-[var(--admin-link)]">
                <IconImageUpload />
              </span>
              <div>
                <p className="text-sm font-medium text-[var(--admin-fg)]">
                  {fileDragOver ? "Drop images to upload" : "Drag & drop multiple product images here"}
                </p>
                <p className="admin-muted text-xs">Hold Ctrl/Cmd to select several files, or drop a batch</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <label
                className={`btn-primary relative inline-flex cursor-pointer items-center overflow-hidden ${formBusy ? "pointer-events-none opacity-60" : ""}`}
              >
                Upload images
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="absolute inset-0 cursor-pointer opacity-0"
                  disabled={formBusy}
                  onChange={handleImagePick}
                />
              </label>
              <label
                className={`btn-secondary relative inline-flex cursor-pointer items-center overflow-hidden ${formBusy ? "pointer-events-none opacity-60" : ""}`}
              >
                Set cover (+ extras)
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="absolute inset-0 cursor-pointer opacity-0"
                  disabled={formBusy}
                  onChange={handleCoverPick}
                />
              </label>
              <label
                className={`btn-ghost relative inline-flex cursor-pointer items-center overflow-hidden ${formBusy ? "pointer-events-none opacity-60" : ""}`}
              >
                Add gallery images
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="absolute inset-0 cursor-pointer opacity-0"
                  disabled={formBusy}
                  onChange={handleGalleryPick}
                />
              </label>
            </div>
          </div>
        </div>

        {imagePreviewItems.length > 0 ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,14rem)_1fr]">
            <div>
              <p className="admin-caption mb-2">Cover image</p>
              {imagePreviewItems[0] ? (
                <div
                  className={`group relative overflow-hidden rounded-xl border bg-[var(--admin-surface)] ${
                    dropTargetIndex === 0 && dragIndex !== 0
                      ? "border-[var(--admin-link)] ring-2 ring-[var(--admin-link)]/30"
                      : "border-[var(--admin-border)]"
                  } ${dragIndex === 0 ? "opacity-60" : ""}`}
                  draggable={!formBusy}
                  onDragStart={() => handleTileDragStart(0)}
                  onDragOver={(event) => handleTileDragOver(event, 0)}
                  onDrop={(event) => handleTileDrop(event, 0)}
                  onDragEnd={handleTileDragEnd}
                >
                  <img
                    src={imagePreviewItems[0].src}
                    alt=""
                    className="aspect-square w-full object-cover"
                    draggable={false}
                  />
                  <div className="absolute left-2 top-2 rounded-full bg-emerald-800 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                    Cover
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/55 to-transparent p-2 pt-8">
                    <span className="inline-flex items-center gap-1 text-[11px] text-white/90">
                      <IconGrip /> Drag to reorder
                    </span>
                    <button
                      type="button"
                      className="rounded-lg bg-white/95 px-2 py-1 text-[11px] font-medium text-red-700"
                      disabled={formBusy}
                      onClick={() => removeImageItem(0)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : null}
              <button
                type="button"
                className="btn-ghost mt-2 w-full text-xs"
                disabled={formBusy}
                onClick={() => coverInputRef.current?.click()}
              >
                Replace cover / upload more
              </button>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="admin-caption">Gallery images</p>
                <button
                  type="button"
                  className="text-xs font-medium text-[var(--admin-link)] hover:underline"
                  disabled={formBusy}
                  onClick={() => galleryInputRef.current?.click()}
                >
                  + Add
                </button>
              </div>
              {imagePreviewItems.length > 1 ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {imagePreviewItems.slice(1).map((preview) => (
                    <div
                      key={preview.key}
                      className={`group relative overflow-hidden rounded-xl border bg-[var(--admin-surface)] ${
                        dropTargetIndex === preview.index && dragIndex !== preview.index
                          ? "border-[var(--admin-link)] ring-2 ring-[var(--admin-link)]/30"
                          : "border-[var(--admin-border)]"
                      } ${dragIndex === preview.index ? "opacity-60" : ""}`}
                      draggable={!formBusy}
                      onDragStart={() => handleTileDragStart(preview.index)}
                      onDragOver={(event) => handleTileDragOver(event, preview.index)}
                      onDrop={(event) => handleTileDrop(event, preview.index)}
                      onDragEnd={handleTileDragEnd}
                    >
                      <img
                        src={preview.src}
                        alt=""
                        className="aspect-square w-full object-cover"
                        draggable={false}
                      />
                      <div className="absolute left-1.5 top-1.5 rounded bg-black/45 px-1.5 py-0.5 text-[10px] text-white sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                        <IconGrip />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-1.5 pt-6 sm:translate-y-1 sm:opacity-0 sm:transition sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                        <button
                          type="button"
                          className="rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-emerald-900"
                          disabled={formBusy}
                          onClick={() => setCoverImage(preview.index)}
                        >
                          Make cover
                        </button>
                        <button
                          type="button"
                          className="rounded-md bg-white/95 px-2 py-1 text-[10px] font-medium text-red-700"
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
                <button
                  type="button"
                  disabled={formBusy}
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex min-h-[7.5rem] w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-4 text-center transition hover:border-[var(--admin-link)] hover:bg-[var(--admin-hover)]"
                >
                  <span className="text-sm font-medium text-[var(--admin-fg)]">No gallery images yet</span>
                  <span className="admin-muted text-xs">Optional extra photos for the product page</span>
                </button>
              )}
              {imagePreviewItems.length > 1 ? (
                <p className="admin-muted mt-2 text-xs">
                  Tip: drag any gallery image onto Cover to promote it, or use Make cover on hover.
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="admin-muted mt-4 text-sm">No images yet. Upload a cover image to continue.</p>
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
    </form>
  );
}

export { createEmptyForm, mapProductToForm };
