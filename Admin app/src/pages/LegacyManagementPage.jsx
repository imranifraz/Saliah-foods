import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api.js";
import { getCustomerStoreUrl } from "../config/adminApps.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";
import { CmsImageUploadField } from "../components/CmsImageUploadField.jsx";
import { LegacyPagePreview } from "../components/LegacyPagePreview.jsx";
import { RichTextEditor } from "../components/RichTextEditor.jsx";
import { useAdminToast } from "../context/AdminToastContext.jsx";

function emptyHighlight() {
  return { title: "", text: "" };
}

function emptySettings(page) {
  const body = page?.body ?? {};
  return {
    title: page?.title ?? "Our Legacy",
    subtitle: page?.subtitle ?? "",
    published: page?.published !== false,
    metaDescription: body.metaDescription ?? "",
    heroEyebrow: body.heroEyebrow ?? "Our Legacy",
    heroTitle: body.heroTitle ?? "",
    heroText: body.heroText ?? "",
    heroImage: body.heroImage ?? "",
    heroImageAlt: body.heroImageAlt ?? "",
    founderEyebrow: body.founderEyebrow ?? "Our Root",
    founderTitle: body.founderTitle ?? "",
    founderText: body.founderText ?? "",
    founderImage: body.founderImage ?? "",
    founderImageAlt: body.founderImageAlt ?? "",
    highlights:
      Array.isArray(body.highlights) && body.highlights.length
        ? body.highlights.map((item) => ({
            title: item.title ?? "",
            text: item.text ?? "",
          }))
        : [emptyHighlight()],
    storyLabel: body.storyLabel ?? "The Saliah Way",
    storyQuote: body.storyQuote ?? "",
    storyParagraphs:
      Array.isArray(body.storyParagraphs) && body.storyParagraphs.length
        ? body.storyParagraphs.map((item) => String(item ?? ""))
        : [""],
    signatureImage: body.signatureImage ?? "",
    signatureName: body.signatureName ?? "",
    signatureRole: body.signatureRole ?? "Founder",
  };
}

export function LegacyManagementPage() {
  const toast = useAdminToast();
  const [settings, setSettings] = useState(emptySettings());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const customerUrl = getCustomerStoreUrl();
  const livePageUrl = customerUrl ? `${customerUrl}/our-legacy` : "";

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/api/admin/legacy/settings");
      setSettings(emptySettings(data.page));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveSettings({ published, closePreview = false } = {}) {
    const nextPublished = published ?? settings.published;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const data = await apiFetch("/api/admin/legacy/settings", {
        method: "PUT",
        body: JSON.stringify({
          title: settings.title,
          subtitle: settings.subtitle || settings.heroTitle,
          published: nextPublished,
          body: {
            metaDescription: settings.metaDescription,
            heroEyebrow: settings.heroEyebrow,
            heroTitle: settings.heroTitle,
            heroText: settings.heroText,
            heroImage: settings.heroImage,
            heroImageAlt: settings.heroImageAlt,
            founderEyebrow: settings.founderEyebrow,
            founderTitle: settings.founderTitle,
            founderText: settings.founderText,
            founderImage: settings.founderImage,
            founderImageAlt: settings.founderImageAlt,
            highlights: settings.highlights,
            storyLabel: settings.storyLabel,
            storyQuote: settings.storyQuote,
            storyParagraphs: settings.storyParagraphs,
            signatureImage: settings.signatureImage,
            signatureName: settings.signatureName,
            signatureRole: settings.signatureRole,
          },
        }),
      });
      setSettings(emptySettings(data.page));
      setSaved(true);
      toast.success("Legacy page saved");
      if (closePreview) setPreviewOpen(false);
      return true;
    } catch (err) {
      setError(err.message);
      toast.error("Could not save legacy page", err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Our Legacy page"
        subtitle="Edit the same content shown on the customer site at /our-legacy."
      />

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          saveSettings({ published: settings.published });
        }}
        className="space-y-6"
      >
        <AdminCard title="Page settings">
          <div className="grid gap-4">
            <label className="block">
              <span className="admin-label">Admin / browser title</span>
              <input
                value={settings.title}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                className="admin-input mt-1.5 w-full"
              />
            </label>
            <label className="block">
              <span className="admin-label">Meta description</span>
              <input
                value={settings.metaDescription}
                onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
                className="admin-input mt-1.5 w-full"
              />
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.published}
                onChange={(e) => setSettings({ ...settings, published: e.target.checked })}
                className="rounded border-emerald-900/20"
              />
              <span className="text-sm text-emerald-900/75">
                Published on the customer website (use Preview before publishing)
              </span>
            </label>
          </div>
        </AdminCard>

        <AdminCard title="Hero banner" subtitle="Top section of the Our Legacy page.">
          <div className="space-y-4">
            <CmsImageUploadField
              label="Hero image"
              value={settings.heroImage}
              alt={settings.heroImageAlt}
              onChange={(heroImage) => setSettings({ ...settings, heroImage })}
            />
            <input
              value={settings.heroImageAlt}
              onChange={(e) => setSettings({ ...settings, heroImageAlt: e.target.value })}
              className="admin-input w-full"
              placeholder="Image description"
            />
            <input
              value={settings.heroEyebrow}
              onChange={(e) => setSettings({ ...settings, heroEyebrow: e.target.value })}
              className="admin-input w-full"
              placeholder="Eyebrow"
            />
            <input
              value={settings.heroTitle}
              onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
              className="admin-input w-full"
              placeholder="Headline"
            />
            <div>
              <span id="legacy-hero-text-label" className="admin-label">
                Supporting text
              </span>
              <RichTextEditor
                id="legacy-hero-text"
                labelId="legacy-hero-text-label"
                value={settings.heroText}
                onChange={(heroText) => setSettings({ ...settings, heroText })}
                placeholder="Supporting text"
                minHeight={90}
              />
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Founder section">
          <div className="space-y-4">
            <CmsImageUploadField
              label="Founder image"
              value={settings.founderImage}
              alt={settings.founderImageAlt}
              onChange={(founderImage) => setSettings({ ...settings, founderImage })}
              previewClassName="aspect-square w-full max-w-sm object-cover"
            />
            <input
              value={settings.founderImageAlt}
              onChange={(e) => setSettings({ ...settings, founderImageAlt: e.target.value })}
              className="admin-input w-full"
              placeholder="Image description"
            />
            <input
              value={settings.founderEyebrow}
              onChange={(e) => setSettings({ ...settings, founderEyebrow: e.target.value })}
              className="admin-input w-full"
              placeholder="Eyebrow"
            />
            <input
              value={settings.founderTitle}
              onChange={(e) => setSettings({ ...settings, founderTitle: e.target.value })}
              className="admin-input w-full"
              placeholder="Title"
            />
            <div>
              <span id="legacy-founder-text-label" className="admin-label">
                Founder story
              </span>
              <RichTextEditor
                id="legacy-founder-text"
                labelId="legacy-founder-text-label"
                value={settings.founderText}
                onChange={(founderText) => setSettings({ ...settings, founderText })}
                placeholder="Founder story"
                minHeight={120}
              />
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Highlights">
          <div className="space-y-4">
            {settings.highlights.map((item, index) => (
              <div key={index} className="rounded-xl border border-emerald-900/10 bg-cream-50/50 p-4">
                <div className="mb-3 flex justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
                    Highlight {index + 1}
                  </p>
                  <button
                    type="button"
                    className="btn-ghost px-0 text-xs text-red-700"
                    disabled={settings.highlights.length <= 1}
                    onClick={() =>
                      setSettings((current) => ({
                        ...current,
                        highlights: current.highlights.filter((_, i) => i !== index),
                      }))
                    }
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-3">
                  <input
                    value={item.title}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        highlights: current.highlights.map((row, i) =>
                          i === index ? { ...row, title: e.target.value } : row
                        ),
                      }))
                    }
                    className="admin-input w-full"
                    placeholder="Title"
                  />
                  <RichTextEditor
                    id={`legacy-highlight-text-${index}`}
                    value={item.text}
                    onChange={(text) =>
                      setSettings((current) => ({
                        ...current,
                        highlights: current.highlights.map((row, i) =>
                          i === index ? { ...row, text } : row
                        ),
                      }))
                    }
                    placeholder="Text"
                    minHeight={80}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn-ghost"
              onClick={() =>
                setSettings((current) => ({
                  ...current,
                  highlights: [...current.highlights, emptyHighlight()],
                }))
              }
            >
              + Add highlight
            </button>
          </div>
        </AdminCard>

        <AdminCard title="Story & signature">
          <div className="space-y-4">
            <input
              value={settings.storyLabel}
              onChange={(e) => setSettings({ ...settings, storyLabel: e.target.value })}
              className="admin-input w-full"
              placeholder="Story label"
            />
            <div>
              <span id="legacy-story-quote-label" className="admin-label">
                Quote
              </span>
              <RichTextEditor
                id="legacy-story-quote"
                labelId="legacy-story-quote-label"
                value={settings.storyQuote}
                onChange={(storyQuote) => setSettings({ ...settings, storyQuote })}
                placeholder="Quote"
                minHeight={80}
              />
            </div>
            {settings.storyParagraphs.map((paragraph, index) => (
              <div key={index} className="flex gap-2">
                <div className="min-w-0 flex-1">
                  <span id={`legacy-story-p-label-${index}`} className="admin-label">
                    Paragraph {index + 1}
                  </span>
                  <RichTextEditor
                    id={`legacy-story-p-${index}`}
                    labelId={`legacy-story-p-label-${index}`}
                    value={paragraph}
                    onChange={(value) =>
                      setSettings((current) => ({
                        ...current,
                        storyParagraphs: current.storyParagraphs.map((row, i) =>
                          i === index ? value : row
                        ),
                      }))
                    }
                    placeholder={`Paragraph ${index + 1}`}
                    minHeight={90}
                  />
                </div>
                <button
                  type="button"
                  className="btn-ghost shrink-0 self-start text-xs text-red-700"
                  disabled={settings.storyParagraphs.length <= 1}
                  onClick={() =>
                    setSettings((current) => ({
                      ...current,
                      storyParagraphs: current.storyParagraphs.filter((_, i) => i !== index),
                    }))
                  }
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn-ghost"
              onClick={() =>
                setSettings((current) => ({
                  ...current,
                  storyParagraphs: [...current.storyParagraphs, ""],
                }))
              }
            >
              + Add paragraph
            </button>
            <CmsImageUploadField
              label="Signature image"
              value={settings.signatureImage}
              onChange={(signatureImage) => setSettings({ ...settings, signatureImage })}
              previewClassName="h-16 w-auto object-contain"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={settings.signatureName}
                onChange={(e) => setSettings({ ...settings, signatureName: e.target.value })}
                className="admin-input w-full"
                placeholder="Name"
              />
              <input
                value={settings.signatureRole}
                onChange={(e) => setSettings({ ...settings, signatureRole: e.target.value })}
                className="admin-input w-full"
                placeholder="Role"
              />
            </div>
          </div>
        </AdminCard>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn-ghost" onClick={() => setPreviewOpen(true)} disabled={saving}>
            Preview
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => saveSettings({ published: false })}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save draft"}
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : settings.published ? "Save & keep published" : "Save"}
          </button>
          {livePageUrl ? (
            <a href={livePageUrl} target="_blank" rel="noreferrer" className="btn-ghost text-xs">
              Open live page ↗
            </a>
          ) : null}
          {saved ? (
            <p className="text-sm text-emerald-700">
              Saved{settings.published ? " and published" : " as draft"}.
            </p>
          ) : null}
        </div>
      </form>

      <LegacyPagePreview
        open={previewOpen}
        settings={settings}
        saving={saving}
        onClose={() => setPreviewOpen(false)}
        onSaveDraft={() => saveSettings({ published: false, closePreview: true })}
        onPublish={() => saveSettings({ published: true, closePreview: true })}
      />
    </div>
  );
}
