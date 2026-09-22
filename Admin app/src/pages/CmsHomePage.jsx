import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { getCustomerStoreUrl } from "../config/adminApps.js";
import { cmsImageSrc, uploadCmsImage, uploadCmsImages } from "../lib/cmsUpload.js";
import { useSiteBrand } from "../context/SiteBrandContext.jsx";
import { useAdminToast } from "../context/AdminToastContext.jsx";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";
import { RichTextEditor } from "../components/RichTextEditor.jsx";

function newId(prefix) {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function isVideoUrl(url = "") {
  return /\.(mp4|webm|mov|m4v)(?:$|\?)/i.test(String(url));
}

function MediaPreview({ src, type, alt, className = "" }) {
  if (!src) return null;
  const resolved = cmsImageSrc(src);
  const isVideo = type === "video" || isVideoUrl(src);
  if (isVideo) {
    return (
      <video
        src={resolved}
        className={`rounded-xl border border-emerald-900/10 object-cover ${className}`}
        muted
        playsInline
        preload="metadata"
        aria-label={alt || "Video preview"}
      />
    );
  }
  return (
    <img
      src={resolved}
      alt={alt}
      className={`rounded-xl border border-emerald-900/10 object-cover ${className}`}
    />
  );
}

function ImagePreview({ src, alt, className = "" }) {
  return <MediaPreview src={src} alt={alt} className={className} />;
}

function MediaUploadField({ label, value, type = "image", onChange, hint }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const data = await uploadCmsImage(file);
      const nextType = data.mediaType || data.kind || (file.type?.startsWith("video/") ? "video" : "image");
      onChange({ url: data.url, type: nextType });
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
      <MediaPreview src={value} type={type} alt="" className="h-28 w-full max-w-xs" />
      <div className="flex flex-wrap items-center gap-3">
        <label className="btn-ghost cursor-pointer text-xs">
          {uploading ? "Uploading…" : "Upload image or video"}
          <input
            type="file"
            accept="image/*,video/mp4,video/webm,video/quicktime"
            className="sr-only"
            onChange={handleFile}
            disabled={uploading}
          />
        </label>
        <input
          value={value}
          onChange={(e) =>
            onChange({
              url: e.target.value,
              type: isVideoUrl(e.target.value) ? "video" : type || "image",
            })
          }
          className="admin-input min-w-[220px] flex-1 text-xs"
          placeholder="/uploads/cms/… (image or .mp4/.webm)"
        />
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
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

function moveBanner(slides, index, direction) {
  const next = [...slides];
  const target = index + direction;
  if (target < 0 || target >= next.length) return slides;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function emptyBanner() {
  return { id: newId("banner"), type: "image", src: "", image: "", alt: "Saliah Foods banner", poster: "" };
}

function HeroBannersEditor({ banners, onChange }) {
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkError, setBulkError] = useState("");
  const slides = Array.isArray(banners) ? banners : [];
  const mediaCount = slides.filter((b) => b.src || b.image).length;

  async function handleBulkUpload(files) {
    setBulkUploading(true);
    setBulkError("");
    try {
      const uploaded = await uploadCmsImages(files);
      const newSlides = uploaded.map((item, index) => ({
        id: newId("banner"),
        type: item.type,
        src: item.url,
        image: item.url,
        alt: `Saliah Foods banner ${slides.length + index + 1}`,
        poster: "",
      }));
      onChange([...slides, ...newSlides]);
    } catch (err) {
      setBulkError(err.message);
    } finally {
      setBulkUploading(false);
    }
  }

  function patchBanner(id, patch) {
    onChange(slides.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-emerald-900">Hero banner media</p>
          <p className="mt-1 text-xs text-emerald-900/45">
            Upload images and/or videos. They rotate as a carousel on the customer home hero.
          </p>
          <p className="mt-1 text-xs font-medium text-emerald-800/60">
            {mediaCount} item{mediaCount === 1 ? "" : "s"} added · images ~1920×1080 · videos MP4/WebM up to 50MB
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="btn-primary cursor-pointer text-xs">
            {bulkUploading ? "Uploading…" : "+ Upload media"}
            <input
              type="file"
              accept="image/*,video/mp4,video/webm,video/quicktime"
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
            onClick={() => onChange([...slides, emptyBanner()])}
          >
            + Add one slide
          </button>
        </div>
      </div>

      {mediaCount ? (
        <div className="flex flex-wrap gap-2">
          {slides
            .filter((b) => b.src || b.image)
            .map((banner) => (
              <MediaPreview
                key={banner.id}
                src={banner.src || banner.image}
                type={banner.type}
                alt=""
                className="h-16 w-24 shrink-0"
              />
            ))}
        </div>
      ) : null}

      {bulkError ? <p className="text-xs text-red-600">{bulkError}</p> : null}

      {slides.map((banner, index) => {
        const src = banner.src || banner.image || "";
        const type = banner.type || (isVideoUrl(src) ? "video" : "image");
        return (
          <div
            key={banner.id}
            className="space-y-3 rounded-2xl border border-emerald-900/10 bg-cream-50/50 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-900/50">
                Banner {index + 1} · {type}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="text-xs text-emerald-800/70 disabled:opacity-40"
                  onClick={() => onChange(moveBanner(slides, index, -1))}
                  disabled={index === 0}
                >
                  Move up
                </button>
                <button
                  type="button"
                  className="text-xs text-emerald-800/70 disabled:opacity-40"
                  onClick={() => onChange(moveBanner(slides, index, 1))}
                  disabled={index === slides.length - 1}
                >
                  Move down
                </button>
                <button
                  type="button"
                  className="text-xs text-red-600 disabled:opacity-40"
                  onClick={() => onChange(slides.filter((b) => b.id !== banner.id))}
                  disabled={slides.length <= 1}
                >
                  Remove
                </button>
              </div>
            </div>
            <MediaUploadField
              label="Banner image or video"
              value={src}
              type={type}
              hint="Images: JPG/WebP ~1920×1080. Videos: MP4 or WebM, muted autoplay-friendly, under 50MB."
              onChange={({ url, type: nextType }) =>
                patchBanner(banner.id, {
                  src: url,
                  image: url,
                  type: nextType,
                })
              }
            />
            <label className="block">
              <span className="admin-label">Description (accessibility)</span>
              <input
                value={banner.alt || ""}
                onChange={(e) => patchBanner(banner.id, { alt: e.target.value })}
                className="admin-input"
              />
            </label>
          </div>
        );
      })}
    </div>
  );
}

export function CmsHomePage() {
  const toast = useAdminToast();
  const { applySiteLogo, refresh: refreshSiteBrand } = useSiteBrand();
  const [published, setPublished] = useState(true);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const customerUrl = getCustomerStoreUrl();
  const liveHomeUrl = customerUrl || "";

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
      applySiteLogo(content?.siteLogo);
      await refreshSiteBrand();
      setSaved(true);
      toast.success("Home page saved");
    } catch (err) {
      setError(err.message);
      toast.error("Could not save home page", err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !content) return <LoadingState />;

  const { hero, story, testimonials } = content;

  return (
    <div>
      <PageHeader
        title="Home Page"
        subtitle="Manage static home content only: hero banners & copy, site logo, our story, and testimonials. Product and category sections stay in Product & Category Management."
        action={
          liveHomeUrl ? (
            <a href={liveHomeUrl} target="_blank" rel="noreferrer" className="btn-ghost text-xs">
              Open live home
            </a>
          ) : null
        }
      />

      <div className="mb-6 rounded-2xl border border-emerald-900/10 bg-emerald-900/[0.03] px-4 py-3 text-sm text-emerald-900/70">
        Shop by category, premium dates, wellness products, and favourites pull from the catalog — edit those under{" "}
        <Link to="/categories" className="font-medium text-emerald-900 underline-offset-2 hover:underline">
          Categories
        </Link>{" "}
        and{" "}
        <Link to="/products" className="font-medium text-emerald-900 underline-offset-2 hover:underline">
          Products
        </Link>
        .
      </div>

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
            hint="Updates the customer site header/footer and the admin panel logo together. Prefer a transparent PNG (~1024×333)."
          />
        </AdminCard>

        <AdminCard title="Hero section">
          <p className="mb-6 text-sm text-emerald-900/55">
            Control the first screen of the storefront: carousel images, headline, description, and buttons.
          </p>

          <HeroBannersEditor
            banners={hero.banners}
            onChange={(banners) => patchContent("hero.banners", banners)}
          />

          <div className="mt-8 grid gap-4 border-t border-emerald-900/10 pt-6 sm:grid-cols-2">
            <p className="font-medium text-emerald-900 sm:col-span-2">Hero content</p>
            <label className="block sm:col-span-2">
              <span className="admin-label">Headline</span>
              <input
                value={hero.title}
                onChange={(e) => patchContent("hero.title", e.target.value)}
                className="admin-input"
              />
            </label>
            <div className="block sm:col-span-2">
              <span id="home-hero-subtitle-label" className="admin-label">
                Description
              </span>
              <RichTextEditor
                id="home-hero-subtitle"
                labelId="home-hero-subtitle-label"
                value={hero.subtitle}
                onChange={(subtitle) => patchContent("hero.subtitle", subtitle)}
                minHeight={90}
              />
            </div>
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
            <div className="block sm:col-span-2">
              <span id="home-story-body-label" className="admin-label">
                Paragraph
              </span>
              <RichTextEditor
                id="home-story-body"
                labelId="home-story-body-label"
                value={story.body}
                onChange={(body) => patchContent("story.body", body)}
                minHeight={120}
              />
            </div>
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
            <div className="block sm:col-span-2">
              <span id="home-testimonials-subtitle-label" className="admin-label">
                Section description
              </span>
              <RichTextEditor
                id="home-testimonials-subtitle"
                labelId="home-testimonials-subtitle-label"
                value={testimonials.subtitle}
                onChange={(subtitle) => patchContent("testimonials.subtitle", subtitle)}
                minHeight={72}
              />
            </div>
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
                className="space-y-3 rounded-2xl border border-emerald-900/10 bg-cream-50/50 p-4"
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
                <div>
                  <span className="admin-label">Quote</span>
                  <RichTextEditor
                    id={`home-testimonial-quote-${item.id}`}
                    value={item.quote}
                    onChange={(quote) =>
                      patchContent(
                        "testimonials.items",
                        testimonials.items.map((t) =>
                          t.id === item.id ? { ...t, quote } : t
                        )
                      )
                    }
                    minHeight={90}
                  />
                </div>
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
          {saving ? "Saving…" : "Save home page"}
        </button>
      </form>
    </div>
  );
}
