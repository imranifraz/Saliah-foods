import { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "../lib/api.js";
import { cmsImageSrc, uploadCmsImage } from "../lib/cmsUpload.js";
import { ImageCropModal } from "./ImageCropModal.jsx";

export const emptyFeaturedPromo = {
  title: "",
  subtitle: "",
  cta: "Explore Collection",
  image: "",
};

export const emptyCategoryForm = {
  id: "",
  label: "",
  description: "",
  image: "",
  sortOrder: 0,
  isActive: true,
  featuredPromoEnabled: false,
  featuredPromo: { ...emptyFeaturedPromo },
};

export function mapCategoryToForm(category) {
  if (!category) return { ...emptyCategoryForm, featuredPromo: { ...emptyFeaturedPromo } };

  const promo = category.featuredPromo;
  const hasPromo = Boolean(promo && typeof promo === "object" && (promo.title || promo.image));

  return {
    id: category.id ?? "",
    label: category.label ?? "",
    description: category.description ?? "",
    image: category.image ?? "",
    sortOrder: category.sortOrder ?? 0,
    isActive: category.isActive !== false,
    featuredPromoEnabled: hasPromo,
    featuredPromo: hasPromo
      ? {
          title: promo.title ?? "",
          subtitle: promo.subtitle ?? "",
          cta: promo.cta ?? "Explore Collection",
          image: promo.image ?? "",
        }
      : { ...emptyFeaturedPromo },
  };
}

export function slugifyCategoryLabel(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CategoryForm({ categoryId, initial, onCancel, onSuccess }) {
  const isEditing = Boolean(categoryId);

  const [form, setForm] = useState(() => mapCategoryToForm(initial));
  const [slugManual, setSlugManual] = useState(isEditing);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingPromoImage, setUploadingPromoImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [promoImagePreview, setPromoImagePreview] = useState("");
  const [cropImage, setCropImage] = useState(null);
  const [cropTarget, setCropTarget] = useState("category");
  const previewObjectUrl = useRef(null);
  const promoPreviewObjectUrl = useRef(null);
  const cropObjectUrl = useRef(null);
  const fileInputRef = useRef(null);
  const promoFileInputRef = useRef(null);

  useEffect(() => {
    setForm(mapCategoryToForm(initial));
    setSlugManual(isEditing);
    setError("");
    setImagePreview("");
    setPromoImagePreview("");
    closeCrop();
  }, [initial, categoryId, isEditing]);

  useEffect(() => {
    return () => {
      if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);
      if (promoPreviewObjectUrl.current) URL.revokeObjectURL(promoPreviewObjectUrl.current);
      if (cropObjectUrl.current) URL.revokeObjectURL(cropObjectUrl.current);
    };
  }, []);

  const previewSrc = useMemo(() => {
    if (imagePreview) return imagePreview;
    if (form.image) return cmsImageSrc(form.image);
    return "";
  }, [form.image, imagePreview]);

  const promoPreviewSrc = useMemo(() => {
    if (promoImagePreview) return promoImagePreview;
    if (form.featuredPromo?.image) return cmsImageSrc(form.featuredPromo.image);
    return "";
  }, [form.featuredPromo?.image, promoImagePreview]);

  function updateFeaturedPromoField(key, value) {
    setForm((prev) => ({
      ...prev,
      featuredPromo: { ...prev.featuredPromo, [key]: value },
    }));
  }

  function toggleFeaturedPromo(enabled) {
    setForm((prev) => ({
      ...prev,
      featuredPromoEnabled: enabled,
      featuredPromo: enabled ? prev.featuredPromo : { ...emptyFeaturedPromo },
    }));
    if (!enabled) {
      if (promoPreviewObjectUrl.current) URL.revokeObjectURL(promoPreviewObjectUrl.current);
      promoPreviewObjectUrl.current = null;
      setPromoImagePreview("");
    }
  }

  function updateField(key, value) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "label" && !slugManual) {
        next.id = slugifyCategoryLabel(value);
      }
      return next;
    });
  }

  function updateSlug(value) {
    setSlugManual(true);
    setForm((prev) => ({ ...prev, id: slugifyCategoryLabel(value) }));
  }

  function closeCrop() {
    if (cropObjectUrl.current) {
      URL.revokeObjectURL(cropObjectUrl.current);
      cropObjectUrl.current = null;
    }
    setCropImage(null);
  }

  function openCropForFile(file) {
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG, or WebP).");
      return;
    }

    closeCrop();
    cropObjectUrl.current = URL.createObjectURL(file);
    const slug = slugifyCategoryLabel(form.id || form.label) || "category";
    setCropTarget("category");
    setCropImage({
      src: cropObjectUrl.current,
      fileName: `${slug}-category.jpg`,
    });
  }

  function openCropForExisting() {
    if (!previewSrc || formBusy) return;

    closeCrop();
    setCropTarget("category");
    setCropImage({
      src: previewSrc,
      fileName: `${slugifyCategoryLabel(form.id || form.label) || "category"}-category.jpg`,
    });
  }

  function openPromoCropForFile(file) {
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG, or WebP).");
      return;
    }

    closeCrop();
    cropObjectUrl.current = URL.createObjectURL(file);
    const slug = slugifyCategoryLabel(form.id || form.label) || "category";
    setCropTarget("promo");
    setCropImage({
      src: cropObjectUrl.current,
      fileName: `${slug}-promo.jpg`,
    });
  }

  function openPromoCropForExisting() {
    if (!promoPreviewSrc || formBusy) return;

    closeCrop();
    setCropTarget("promo");
    setCropImage({
      src: promoPreviewSrc,
      fileName: `${slugifyCategoryLabel(form.id || form.label) || "category"}-promo.jpg`,
    });
  }

  async function uploadImageFile(file) {
    if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);
    previewObjectUrl.current = URL.createObjectURL(file);
    setImagePreview(previewObjectUrl.current);

    setUploading(true);
    setError("");
    try {
      const data = await uploadCmsImage(file);
      setForm((prev) => ({ ...prev, image: data.url }));
    } catch (err) {
      setError(err.message ?? "Image upload failed");
      setImagePreview("");
    } finally {
      setUploading(false);
    }
  }

  async function uploadPromoImageFile(file) {
    if (promoPreviewObjectUrl.current) URL.revokeObjectURL(promoPreviewObjectUrl.current);
    promoPreviewObjectUrl.current = URL.createObjectURL(file);
    setPromoImagePreview(promoPreviewObjectUrl.current);

    setUploadingPromoImage(true);
    setError("");
    try {
      const data = await uploadCmsImage(file);
      updateFeaturedPromoField("image", data.url);
    } catch (err) {
      setError(err.message ?? "Promo image upload failed");
      setPromoImagePreview("");
    } finally {
      setUploadingPromoImage(false);
    }
  }

  async function handleCropConfirm(file) {
    closeCrop();
    if (cropTarget === "promo") {
      await uploadPromoImageFile(file);
      return;
    }
    await uploadImageFile(file);
  }

  function handlePromoImagePick(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) openPromoCropForFile(file);
  }

  function removePromoImage() {
    if (promoPreviewObjectUrl.current) URL.revokeObjectURL(promoPreviewObjectUrl.current);
    promoPreviewObjectUrl.current = null;
    setPromoImagePreview("");
    updateFeaturedPromoField("image", "");
  }

  function queueImageFile(file) {
    openCropForFile(file);
  }

  function handleImagePick(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) queueImageFile(file);
  }

  function handleDragOver(event) {
    event.preventDefault();
    if (!formBusy) setIsDragging(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    if (formBusy) return;
    const file = event.dataTransfer.files?.[0];
    if (file) queueImageFile(file);
  }

  function openFilePicker() {
    if (!formBusy) fileInputRef.current?.click();
  }

  function removeImage() {
    if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);
    previewObjectUrl.current = null;
    setImagePreview("");
    setForm((prev) => ({ ...prev, image: "" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      label: form.label.trim(),
      description: form.description.trim(),
      image: form.image,
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
      featuredPromo:
        form.featuredPromoEnabled && form.featuredPromo.title.trim()
          ? {
              title: form.featuredPromo.title.trim(),
              subtitle: form.featuredPromo.subtitle.trim(),
              cta: form.featuredPromo.cta.trim() || "Explore Collection",
              image: form.featuredPromo.image,
            }
          : null,
    };

    if (form.featuredPromoEnabled && !form.featuredPromo.title.trim()) {
      setError("Featured promo title is required when promo is enabled.");
      setSaving(false);
      return;
    }

    const slug = slugifyCategoryLabel(form.id || form.label);
    if (!slug) {
      setError("Category URL slug is required.");
      setSaving(false);
      return;
    }

    try {
      if (isEditing) {
        const data = await apiFetch(`/api/admin/categories/${categoryId}`, {
          method: "PATCH",
          body: JSON.stringify({ ...payload, id: slug }),
        });
        onSuccess?.(data.category);
      } else {
        const data = await apiFetch("/api/admin/categories", {
          method: "POST",
          body: JSON.stringify({ ...payload, id: slug }),
        });
        onSuccess?.(data.category);
      }
    } catch (err) {
      setError(err.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const formBusy = saving || uploading || uploadingPromoImage || Boolean(cropImage);

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <label className="block">
        <span className="admin-label">Display name</span>
        <input
          required
          value={form.label}
          onChange={(e) => updateField("label", e.target.value)}
          className="admin-input mt-1.5 w-full"
          placeholder="Premium Dates"
        />
      </label>

      <label className="block">
        <span className="admin-label">URL slug</span>
        <input
          required
          value={form.id}
          onChange={(e) => updateSlug(e.target.value)}
          className="admin-input mt-1.5 w-full"
          placeholder="premium-dates"
        />
        <p className="admin-muted mt-1.5 text-xs">Used in product URLs, e.g. /products/{form.id || "your-slug"}</p>
      </label>

      <label className="block">
        <span className="admin-label">Short description</span>
        <textarea
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          className="admin-input mt-1.5 w-full resize-none"
          rows={3}
          placeholder="Brief description for the customer app."
        />
      </label>

      <div className="block">
        <span className="admin-label">Category image</span>
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload category image"
          onClick={openFilePicker}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openFilePicker();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative mt-1.5 min-h-[9.5rem] overflow-hidden rounded-xl border-2 border-dashed transition ${
            formBusy ? "cursor-not-allowed opacity-60" : "cursor-pointer"
          } ${
            isDragging
              ? "border-[var(--admin-link)] bg-[var(--admin-tab-active-bg)]"
              : previewSrc
                ? "border-[var(--admin-border)] bg-[var(--admin-surface-2)]"
                : "border-[var(--admin-border-strong)] bg-[var(--admin-surface-2)] hover:border-[var(--admin-link)] hover:bg-[var(--admin-hover)]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={formBusy}
            onChange={handleImagePick}
          />

          {previewSrc ? (
            <>
              <img src={previewSrc} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/45 px-4 text-center text-white opacity-0 transition hover:opacity-100">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                <p className="text-sm font-semibold">{uploading ? "Uploading…" : "Click or drop to replace"}</p>
              </div>
              {!uploading ? (
                <div className="absolute right-2 top-2 z-10 flex gap-1.5">
                  <button
                    type="button"
                    className="rounded-lg border border-white/30 bg-black/55 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-black/70"
                    disabled={formBusy}
                    onClick={(event) => {
                      event.stopPropagation();
                      openCropForExisting();
                    }}
                  >
                    Crop
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-white/30 bg-black/55 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-black/70"
                    disabled={formBusy}
                    onClick={(event) => {
                      event.stopPropagation();
                      removeImage();
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="flex min-h-[9.5rem] flex-col items-center justify-center px-4 py-6 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-link)]">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
              </span>
              <p className="mt-3 text-sm font-semibold text-[var(--admin-fg)]">
                {uploading ? "Uploading…" : "Drag and drop an image here"}
              </p>
              <p className="admin-muted mt-1 text-xs">or click to browse · JPG, PNG, or WebP</p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={form.featuredPromoEnabled}
            onChange={(e) => toggleFeaturedPromo(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-[var(--admin-border-strong)]"
          />
          <span>
            <span className="admin-label">Featured promo in shop menu</span>
            <span className="admin-muted mt-1 block text-xs leading-relaxed">
              Optional promo panel shown in the customer site Products mega menu for this category.
            </span>
          </span>
        </label>

        {form.featuredPromoEnabled ? (
          <div className="mt-4 space-y-3 border-t border-[var(--admin-border)] pt-4">
            <label className="block">
              <span className="admin-label">Promo title</span>
              <input
                required={form.featuredPromoEnabled}
                value={form.featuredPromo.title}
                onChange={(e) => updateFeaturedPromoField("title", e.target.value)}
                className="admin-input mt-1.5 w-full"
                placeholder="Premium Medjool Collection"
              />
            </label>

            <label className="block">
              <span className="admin-label">Promo subtitle</span>
              <input
                value={form.featuredPromo.subtitle}
                onChange={(e) => updateFeaturedPromoField("subtitle", e.target.value)}
                className="admin-input mt-1.5 w-full"
                placeholder="Naturally Sweet • Imported"
              />
            </label>

            <label className="block">
              <span className="admin-label">Button label</span>
              <input
                value={form.featuredPromo.cta}
                onChange={(e) => updateFeaturedPromoField("cta", e.target.value)}
                className="admin-input mt-1.5 w-full"
                placeholder="Explore Collection"
              />
            </label>

            <div className="block">
              <span className="admin-label">Promo image</span>
              <div className="mt-1.5 flex flex-wrap items-center gap-3">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)]">
                  {promoPreviewSrc ? (
                    <img src={promoPreviewSrc} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <span className="admin-muted text-[10px]">No image</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <input
                    ref={promoFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    disabled={formBusy}
                    onChange={handlePromoImagePick}
                  />
                  <button
                    type="button"
                    className="btn-ghost text-xs"
                    disabled={formBusy}
                    onClick={() => promoFileInputRef.current?.click()}
                  >
                    {uploadingPromoImage ? "Uploading…" : "Upload image"}
                  </button>
                  {promoPreviewSrc ? (
                    <>
                      <button type="button" className="btn-ghost text-xs" disabled={formBusy} onClick={openPromoCropForExisting}>
                        Crop
                      </button>
                      <button type="button" className="btn-ghost text-xs" disabled={formBusy} onClick={removePromoImage}>
                        Remove
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
              <p className="admin-muted mt-1.5 text-xs">Shown in the mega menu promo panel. Square or product-style images work best.</p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="admin-label">Sort order</span>
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) => updateField("sortOrder", e.target.value)}
            className="admin-input mt-1.5 w-full"
            min={0}
          />
        </label>
        <label className="flex items-end gap-2 pb-2">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => updateField("isActive", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--admin-border-strong)]"
          />
          <span className="text-sm text-[var(--admin-fg)]">Visible on customer site</span>
        </label>
      </div>

      <div className="sticky bottom-0 -mx-4 flex flex-col-reverse gap-2 border-t border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 pb-1 pt-3 sm:-mx-5 sm:flex-row sm:justify-end sm:px-5 sm:pb-0">
        <button type="button" onClick={onCancel} className="btn-ghost w-full sm:w-auto" disabled={formBusy}>
          Cancel
        </button>
        <button type="submit" className="btn-primary w-full sm:w-auto" disabled={formBusy}>
          {saving ? "Saving…" : isEditing ? "Save category" : "Create category"}
        </button>
      </div>

      <ImageCropModal
        open={Boolean(cropImage)}
        imageSrc={cropImage?.src ?? ""}
        fileName={cropImage?.fileName ?? "category-image.jpg"}
        title={cropTarget === "promo" ? "Crop promo image" : "Crop image"}
        subtitle={
          cropTarget === "promo"
            ? "Adjust the promo image for the shop menu panel."
            : "Adjust the square crop for your category image."
        }
        onClose={closeCrop}
        onConfirm={handleCropConfirm}
      />
    </form>
  );
}
