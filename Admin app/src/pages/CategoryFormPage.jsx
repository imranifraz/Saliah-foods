import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { cmsImageSrc, uploadCmsImage } from "../lib/cmsUpload.js";
import { LoadingState } from "../components/ui/LoadingState.jsx";

const emptyForm = {
  id: "",
  label: "",
  description: "",
  image: "",
  sortOrder: 0,
  isActive: true,
};

function slugifyLabel(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CategoryFormPage() {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(routeId);
  const fileInputId = useId();

  const [loading, setLoading] = useState(isEditing);
  const [form, setForm] = useState(emptyForm);
  const [slugManual, setSlugManual] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const previewObjectUrl = useRef(null);

  useEffect(() => {
    return () => {
      if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);
    };
  }, []);

  useEffect(() => {
    if (!isEditing) {
      setLoading(false);
      return;
    }

    setLoading(true);
    apiFetch(`/api/admin/categories/${routeId}`)
      .then((data) => {
        const cat = data.category;
        setForm({
          id: cat.id,
          label: cat.label,
          description: cat.description ?? "",
          image: cat.image ?? "",
          sortOrder: cat.sortOrder ?? 0,
          isActive: cat.isActive !== false,
        });
        setSlugManual(false);
      })
      .catch((err) => setError(err.message ?? "Category not found"))
      .finally(() => setLoading(false));
  }, [isEditing, routeId]);

  const previewSrc = useMemo(() => {
    if (imagePreview) return imagePreview;
    if (form.image) return cmsImageSrc(form.image);
    return "";
  }, [form.image, imagePreview]);

  function updateField(key, value) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "label" && !slugManual) {
        next.id = slugifyLabel(value);
      }
      return next;
    });
  }

  function updateSlug(value) {
    setSlugManual(true);
    setForm((prev) => ({ ...prev, id: slugifyLabel(value) }));
  }

  async function handleImagePick(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG, or WebP).");
      return;
    }

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
    };

    try {
      if (isEditing) {
        const slug = slugifyLabel(form.id || form.label);
        await apiFetch(`/api/admin/categories/${routeId}`, {
          method: "PATCH",
          body: JSON.stringify({ ...payload, id: slug }),
        });
      } else {
        const slug = slugifyLabel(form.id || form.label);
        if (!slug) {
          setError("Category URL slug is required.");
          setSaving(false);
          return;
        }
        await apiFetch("/api/admin/categories", {
          method: "POST",
          body: JSON.stringify({ ...payload, id: slug }),
        });
      }
      navigate("/categories", { replace: true });
    } catch (err) {
      setError(err.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState label="Loading category…" />;

  return (
    <div className="category-form-page">
      <Link to="/categories" className="category-form-page__back">
        ← Back to categories
      </Link>

      <div className="category-form-cinematic">
        <aside className="category-form-cinematic__visual" aria-hidden={false}>
          <div className="category-form-cinematic__visual-inner">
            <p className="category-form-cinematic__eyebrow">Saliah Foods</p>
            <h1 className="category-form-cinematic__headline">
              {isEditing ? "Refine category" : "Create category"}
            </h1>
            <p className="category-form-cinematic__lede">
              Shown in the shop menu, category pages, and product filters on the customer site.
            </p>

            <div className="category-form-cinematic__preview">
              {previewSrc ? (
                <img src={previewSrc} alt="" className="category-form-cinematic__preview-img" />
              ) : (
                <div className="category-form-cinematic__preview-empty">
                  <span>Category image preview</span>
                </div>
              )}
              <div className="category-form-cinematic__preview-meta">
                <p className="category-form-cinematic__preview-label">{form.label || "Category name"}</p>
                <p className="category-form-cinematic__preview-slug">
                  saliahfoods.com/products/{form.id || "your-slug"}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div className="category-form-cinematic__panel">
          <form onSubmit={handleSubmit} className="category-form-cinematic__form">
            <header className="category-form-cinematic__form-head">
              <h2 className="category-form-cinematic__form-title">
                {isEditing ? "Edit details" : "New category"}
              </h2>
              <p className="category-form-cinematic__form-sub">
                Fill in the essentials. Upload a square image for best results.
              </p>
            </header>

            {error ? <p className="category-form-cinematic__error">{error}</p> : null}

            <label className="category-form-field">
              <span className="category-form-field__label">Display name</span>
              <input
                required
                value={form.label}
                onChange={(e) => updateField("label", e.target.value)}
                className="admin-input"
                placeholder="Premium Dates"
              />
            </label>

            <div className="category-form-field">
              <span className="category-form-field__label">URL slug (ID)</span>
              <input
                required
                value={form.id}
                onChange={(e) => updateSlug(e.target.value)}
                className="admin-input"
                placeholder="premium-dates"
              />
              <p className="category-form-field__hint">
                Updates from the display name (e.g.{" "}
                <code className="category-form-field__code">/products/premium-dates</code>). Edit this
                field only if you need a custom URL slug.
              </p>
            </div>

            <label className="category-form-field">
              <span className="category-form-field__label">Short description</span>
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                className="admin-input min-h-[88px] resize-y"
                placeholder="Hand-picked premium dates for gifting and everyday wellness."
                rows={3}
              />
            </label>

            <div className="category-form-field">
              <span className="category-form-field__label">Category image</span>
              <div className="category-form-upload">
                {previewSrc ? (
                  <img src={previewSrc} alt="Category preview" className="category-form-upload__thumb" />
                ) : (
                  <div className="category-form-upload__placeholder">No image yet</div>
                )}
                <div className="category-form-upload__actions">
                  <input
                    id={fileInputId}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={handleImagePick}
                  />
                  <label htmlFor={fileInputId} className="btn-secondary cursor-pointer">
                    {uploading ? "Uploading…" : "Upload image"}
                  </label>
                  {form.image ? (
                    <button type="button" className="btn-ghost" onClick={removeImage}>
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
              <p className="category-form-field__hint">
                Recommended: square image, at least 800×800px. Appears on the shop-by-category section.
              </p>
            </div>

            <div className="category-form-cinematic__row">
              <label className="category-form-field">
                <span className="category-form-field__label">Sort order</span>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => updateField("sortOrder", e.target.value)}
                  className="admin-input"
                  min={0}
                />
              </label>

              <label className="category-form-field category-form-field--checkbox">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => updateField("isActive", e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--admin-border-strong)]"
                />
                <span>Visible on customer site</span>
              </label>
            </div>

            <div className="category-form-cinematic__actions">
              <button type="submit" className="btn-primary" disabled={saving || uploading}>
                {saving ? "Saving…" : isEditing ? "Save category" : "Create category"}
              </button>
              <Link to="/categories" className="btn-secondary text-center">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
