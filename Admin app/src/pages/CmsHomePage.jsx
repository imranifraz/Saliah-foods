import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { cmsImageSrc, uploadCmsImage, uploadCmsImages } from "../lib/cmsUpload.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";

function newId(prefix) {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function ImagePreview({ src, alt, className = "" }) {
  if (!src) return null;
  return (
    <img
      src={cmsImageSrc(src)}
      alt={alt}
      className={`rounded-xl border border-emerald-900/10 object-cover ${className}`}
    />
  );
}

function ImageUploadField({ label, value, onChange, hint, multiple = false, onMultipleUpload }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(event) {
    const fileList = event.target.files;
    if (!fileList?.length) return;

    if (multiple && onMultipleUpload) {
      setUploading(true);
      setError("");
      try {
        await onMultipleUpload(Array.from(fileList));
      } catch (err) {
        setError(err.message);
      } finally {
        setUploading(false);
        event.target.value = "";
      }
      return;
    }

    const file = fileList[0];
    setUploading(true);
    setError("");
    try {
      const data = await uploadCmsImage(file);
      onChange(data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <span className="admin-label">{label}</span>
      {hint ? <p className="text-xs text-emerald-900/45">{hint}</p> : null}
      <ImagePreview src={value} alt="" className="h-28 w-full max-w-xs" />
      <div className="flex flex-wrap items-center gap-3">
        <label className="btn-ghost cursor-pointer text-xs">
          {uploading ? "Uploading…" : multiple ? "Choose images" : "Upload image"}
          <input
            type="file"
            accept="image/*"
            multiple={multiple}
            className="sr-only"
            onChange={handleFile}
            disabled={uploading}
          />
        </label>
        {!multiple ? (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="admin-input min-w-[220px] flex-1 text-xs"
            placeholder="/uploads/cms/… or /assets/…"
          />
        ) : null}
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function HeroBannersEditor({ banners, onChange }) {
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkError, setBulkError] = useState("");
  const slides = Array.isArray(banners) ? banners : [];

  async function handleBulkUpload(files) {
    setBulkUploading(true);
    setBulkError("");
    try {
      const urls = await uploadCmsImages(files);
      const newSlides = urls.map((url, index) => ({
        id: newId("banner"),
        image: url,
        alt: `Saliah Foods banner ${slides.length + index + 1}`,
      }));
      onChange([...slides, ...newSlides]);
    } catch (err) {
      setBulkError(err.message);
    } finally {
      setBulkUploading(false);
    }
  }

  return (
    <div className="mt-8 space-y-4 border-t border-emerald-900/10 pt-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-emerald-900">Home banner images</p>
          <p className="mt-1 text-xs text-emerald-900/45">
            Add one or many images. The customer home page shows them as a sliding banner with animation.
          </p>
          <p className="mt-1 text-xs font-medium text-emerald-800/60">
            {slides.filter((b) => b.image).length} image{slides.filter((b) => b.image).length === 1 ? "" : "s"}{" "}
            added
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="btn-primary cursor-pointer text-xs">
            {bulkUploading ? "Uploading…" : "+ Upload multiple images"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              disabled={bulkUploading}
              onChange={async (event) => {
                const files = event.target.files;
                if (!files?.length) return;
                await handleBulkUpload(Array.from(files));
                event.target.value = "";
              }}
            />
          </label>
          <button
            type="button"
            className="btn-ghost text-xs"
            onClick={() =>
              onChange([...slides, { id: newId("banner"), image: "", alt: "Saliah Foods banner" }])
            }
          >
            + Add one banner
          </button>
        </div>
      </div>

      {slides.some((b) => b.image) ? (
        <div className="flex flex-wrap gap-2">
          {slides
            .filter((b) => b.image)
            .map((banner, index) => (
              <ImagePreview
                key={banner.id}
                src={banner.image}
                alt=""
                className="h-16 w-24 shrink-0"
              />
            ))}
        </div>
      ) : null}

      {bulkError ? <p className="text-xs text-red-600">{bulkError}</p> : null}

      {slides.map((banner, index) => (
        <div
          key={banner.id}
          className="rounded-2xl border border-emerald-900/10 bg-cream-50/50 p-4 space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-900/50">
              Banner {index + 1}
            </p>
            <button
              type="button"
              className="text-xs text-red-600"
              onClick={() => onChange(slides.filter((b) => b.id !== banner.id))}
              disabled={slides.length <= 1}
            >
              Remove
            </button>
          </div>
          <ImageUploadField
            label="Banner image"
            value={banner.image}
            onChange={(url) =>
              onChange(slides.map((b) => (b.id === banner.id ? { ...b, image: url } : b)))
            }
          />
          <label className="block">
            <span className="admin-label">Image description (accessibility)</span>
            <input
              value={banner.alt}
              onChange={(e) =>
                onChange(slides.map((b) => (b.id === banner.id ? { ...b, alt: e.target.value } : b)))
              }
              className="admin-input"
            />
          </label>
        </div>
      ))}
    </div>
  );
}

export function CmsHomePage() {
  const [published, setPublished] = useState(true);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiFetch("/api/admin/cms/home")
      .then((d) => {
        setPublished(d.page.published);
        setContent(d.page.content);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function patchContent(path, value) {
    setContent((prev) => {
      const next = structuredClone(prev);
      const keys = path.split(".");
      let cursor = next;
      for (let i = 0; i < keys.length - 1; i += 1) {
        cursor = cursor[keys[i]];
      }
      cursor[keys[keys.length - 1]] = value;
      return next;
    });
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await apiFetch("/api/admin/cms/home", {
        method: "PUT",
        body: JSON.stringify({ published, content }),
      });
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !content) return <LoadingState />;

  const { hero, story, testimonials } = content;

  return (
    <div>
      <Link to="/cms/pages" className="btn-ghost mb-2 inline-flex px-0">
        ← Web content
      </Link>

      <PageHeader
        title="Homepage"
        subtitle="Manage site logo, hero banners, our story, and testimonials shown on the customer home page."
      />

      <form onSubmit={handleSave} className="space-y-6">
        <AdminCard title="Publish">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded border-emerald-900/20"
            />
            <span className="text-sm text-emerald-900">Published on customer site</span>
          </label>
        </AdminCard>

        <AdminCard title="Site logo">
          <ImageUploadField
            label="Logo image"
            value={content.siteLogo}
            onChange={(url) => patchContent("siteLogo", url)}
            hint="Shown in the website header and footer."
          />
        </AdminCard>

        <AdminCard title="Hero section">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="admin-label">Headline</span>
              <input
                value={hero.title}
                onChange={(e) => patchContent("hero.title", e.target.value)}
                className="admin-input"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="admin-label">Description</span>
              <textarea
                value={hero.subtitle}
                onChange={(e) => patchContent("hero.subtitle", e.target.value)}
                rows={3}
                className="admin-input"
              />
            </label>
            <label className="block">
              <span className="admin-label">Primary button label</span>
              <input
                value={hero.primaryCta.label}
                onChange={(e) => patchContent("hero.primaryCta", { ...hero.primaryCta, label: e.target.value })}
                className="admin-input"
              />
            </label>
            <label className="block">
              <span className="admin-label">Primary button link</span>
              <input
                value={hero.primaryCta.href}
                onChange={(e) => patchContent("hero.primaryCta", { ...hero.primaryCta, href: e.target.value })}
                className="admin-input"
              />
            </label>
            <label className="block">
              <span className="admin-label">Secondary button label</span>
              <input
                value={hero.secondaryCta.label}
                onChange={(e) =>
                  patchContent("hero.secondaryCta", { ...hero.secondaryCta, label: e.target.value })
                }
                className="admin-input"
              />
            </label>
            <label className="block">
              <span className="admin-label">Secondary button link</span>
              <input
                value={hero.secondaryCta.href}
                onChange={(e) =>
                  patchContent("hero.secondaryCta", { ...hero.secondaryCta, href: e.target.value })
                }
                className="admin-input"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="admin-label">Trust line (comma separated)</span>
              <input
                value={hero.trustLine.join(", ")}
                onChange={(e) =>
                  patchContent(
                    "hero.trustLine",
                    e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  )
                }
                className="admin-input"
              />
            </label>
          </div>

          <HeroBannersEditor
            banners={hero.banners}
            onChange={(banners) => patchContent("hero.banners", banners)}
          />
        </AdminCard>

        <AdminCard title="Our story section">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="admin-label">Small label</span>
              <input
                value={story.eyebrow}
                onChange={(e) => patchContent("story.eyebrow", e.target.value)}
                className="admin-input"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="admin-label">Heading</span>
              <input
                value={story.title}
                onChange={(e) => patchContent("story.title", e.target.value)}
                className="admin-input"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="admin-label">Paragraph</span>
              <textarea
                value={story.body}
                onChange={(e) => patchContent("story.body", e.target.value)}
                rows={4}
                className="admin-input"
              />
            </label>
            <div className="sm:col-span-2">
              <ImageUploadField
                label="Story image"
                value={story.image}
                onChange={(url) => patchContent("story.image", url)}
              />
            </div>
            <label className="block sm:col-span-2">
              <span className="admin-label">Image description</span>
              <input
                value={story.imageAlt}
                onChange={(e) => patchContent("story.imageAlt", e.target.value)}
                className="admin-input"
              />
            </label>
            <label className="block">
              <span className="admin-label">Button label</span>
              <input
                value={story.ctaLabel}
                onChange={(e) => patchContent("story.ctaLabel", e.target.value)}
                className="admin-input"
              />
            </label>
            <label className="block">
              <span className="admin-label">Button link</span>
              <input
                value={story.ctaHref}
                onChange={(e) => patchContent("story.ctaHref", e.target.value)}
                className="admin-input"
              />
            </label>
          </div>
        </AdminCard>

        <AdminCard title="Testimonials section">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="admin-label">Small label</span>
              <input
                value={testimonials.eyebrow}
                onChange={(e) => patchContent("testimonials.eyebrow", e.target.value)}
                className="admin-input"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="admin-label">Section heading</span>
              <input
                value={testimonials.title}
                onChange={(e) => patchContent("testimonials.title", e.target.value)}
                className="admin-input"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="admin-label">Section description</span>
              <textarea
                value={testimonials.subtitle}
                onChange={(e) => patchContent("testimonials.subtitle", e.target.value)}
                rows={2}
                className="admin-input"
              />
            </label>
          </div>

          <div className="mt-6 space-y-4 border-t border-emerald-900/10 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-medium text-emerald-900">Customer quotes</p>
              <button
                type="button"
                className="btn-ghost text-xs"
                onClick={() =>
                  patchContent("testimonials.items", [
                    ...testimonials.items,
                    { id: newId("t"), quote: "", name: "", role: "" },
                  ])
                }
              >
                + Add testimonial
              </button>
            </div>

            {testimonials.items.map((item, index) => (
              <div
                key={item.id}
                className="rounded-2xl border border-emerald-900/10 bg-cream-50/50 p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-900/50">
                    Testimonial {index + 1}
                  </p>
                  <button
                    type="button"
                    className="text-xs text-red-600"
                    onClick={() =>
                      patchContent(
                        "testimonials.items",
                        testimonials.items.filter((t) => t.id !== item.id)
                      )
                    }
                    disabled={testimonials.items.length <= 1}
                  >
                    Remove
                  </button>
                </div>
                <label className="block">
                  <span className="admin-label">Quote</span>
                  <textarea
                    value={item.quote}
                    onChange={(e) =>
                      patchContent(
                        "testimonials.items",
                        testimonials.items.map((t) =>
                          t.id === item.id ? { ...t, quote: e.target.value } : t
                        )
                      )
                    }
                    rows={3}
                    className="admin-input"
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="admin-label">Name</span>
                    <input
                      value={item.name}
                      onChange={(e) =>
                        patchContent(
                          "testimonials.items",
                          testimonials.items.map((t) =>
                            t.id === item.id ? { ...t, name: e.target.value } : t
                          )
                        )
                      }
                      className="admin-input"
                    />
                  </label>
                  <label className="block">
                    <span className="admin-label">City / role</span>
                    <input
                      value={item.role}
                      onChange={(e) =>
                        patchContent(
                          "testimonials.items",
                          testimonials.items.map((t) =>
                            t.id === item.id ? { ...t, role: e.target.value } : t
                          )
                        )
                      }
                      className="admin-input"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        {saved ? (
          <p className="rounded-xl bg-emerald-800/10 px-4 py-3 text-sm text-emerald-800">
            Saved. Refresh the customer home page to see updates.
          </p>
        ) : null}

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving…" : "Save homepage"}
        </button>
      </form>
    </div>
  );
}
