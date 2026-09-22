import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api.js";
import { getCustomerStoreUrl } from "../config/adminApps.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";
import { RichTextEditor } from "../components/RichTextEditor.jsx";
import { SourcingPagePreview } from "../components/SourcingPagePreview.jsx";
import { CmsImageUploadField } from "../components/CmsImageUploadField.jsx";
import { useAdminToast } from "../context/AdminToastContext.jsx";

function emptyPillar() {
  return { title: "", text: "" };
}

function emptyStep(index = 0) {
  return {
    step: String(index + 1).padStart(2, "0"),
    title: "",
    text: "",
  };
}

function emptySettings(page) {
  const body = page?.body ?? {};
  return {
    title: page?.title ?? "Sourcing & Quality",
    subtitle: page?.subtitle ?? "",
    published: page?.published !== false,
    intro: body.intro ?? "",
    pillars:
      Array.isArray(body.pillars) && body.pillars.length
        ? body.pillars.map((item) => ({ title: item.title ?? "", text: item.text ?? "" }))
        : [emptyPillar()],
    journeyTitle: body.journeyTitle ?? "Our quality journey",
    steps:
      Array.isArray(body.steps) && body.steps.length
        ? body.steps.map((item, index) => ({
            step: item.step ?? String(index + 1).padStart(2, "0"),
            title: item.title ?? "",
            text: item.text ?? "",
          }))
        : [emptyStep()],
    commitmentsTitle: body.commitmentsTitle ?? "Our commitments",
    commitments:
      Array.isArray(body.commitments) && body.commitments.length
        ? body.commitments.map((item) => String(item ?? ""))
        : [""],
    bannerImage: body.bannerImage ?? "/assets/brand-legacy.png",
    bannerAlt: body.bannerAlt ?? "",
    ctaLabel: body.ctaLabel ?? "Shop premium dates",
    ctaHref: body.ctaHref ?? "/products/premium-dates",
    metaDescription: body.metaDescription ?? "",
  };
}

export function SourcingManagementPage() {
  const toast = useAdminToast();
  const [settings, setSettings] = useState(emptySettings());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const customerUrl = getCustomerStoreUrl();
  const livePageUrl = customerUrl ? `${customerUrl}/sourcing-and-quality` : "";

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/api/admin/sourcing/settings");
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

  function updatePillar(index, patch) {
    setSettings((current) => ({
      ...current,
      pillars: current.pillars.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  function updateStep(index, patch) {
    setSettings((current) => ({
      ...current,
      steps: current.steps.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  async function saveSettings({ published, closePreview = false } = {}) {
    const nextPublished = published ?? settings.published;
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const data = await apiFetch("/api/admin/sourcing/settings", {
        method: "PUT",
        body: JSON.stringify({
          title: settings.title,
          subtitle: settings.subtitle,
          published: nextPublished,
          body: {
            intro: settings.intro,
            pillars: settings.pillars,
            journeyTitle: settings.journeyTitle,
            steps: settings.steps,
            commitmentsTitle: settings.commitmentsTitle,
            commitments: settings.commitments,
            bannerImage: settings.bannerImage,
            bannerAlt: settings.bannerAlt,
            ctaLabel: settings.ctaLabel,
            ctaHref: settings.ctaHref,
            metaDescription: settings.metaDescription,
          },
        }),
      });
      setSettings(emptySettings(data.page));
      setSaved(true);
      toast.success("Sourcing page saved");
      if (closePreview) setPreviewOpen(false);
      return true;
    } catch (err) {
      setError(err.message);
      toast.error("Could not save sourcing page", err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    await saveSettings({ published: settings.published });
  }

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sourcing & Quality page"
        subtitle="Edit the same content shown on the customer site at /sourcing-and-quality."
      />

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <form onSubmit={handleSave} className="space-y-6">
        <AdminCard
          title="Page settings"
          subtitle="Headline and SEO description for /sourcing-and-quality."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="admin-label">Page title</span>
              <input
                value={settings.title}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                className="admin-input mt-1.5 w-full"
                placeholder="Sourcing & Quality"
              />
            </label>
            <div className="block sm:col-span-2">
              <span id="sourcing-subtitle-label" className="admin-label">
                Subtitle
              </span>
              <RichTextEditor
                id="sourcing-subtitle"
                labelId="sourcing-subtitle-label"
                value={settings.subtitle}
                onChange={(subtitle) => setSettings({ ...settings, subtitle })}
                placeholder="From trusted growers to your table…"
                minHeight={80}
              />
            </div>
            <div className="block sm:col-span-2">
              <span id="sourcing-intro-label" className="admin-label">
                Intro
              </span>
              <RichTextEditor
                id="sourcing-intro"
                labelId="sourcing-intro-label"
                value={settings.intro}
                onChange={(intro) => setSettings({ ...settings, intro })}
                placeholder="At Saliah Foods, quality begins at the source…"
                minHeight={110}
              />
            </div>
            <label className="block sm:col-span-2">
              <span className="admin-label">Meta description</span>
              <input
                value={settings.metaDescription}
                onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
                className="admin-input mt-1.5 w-full"
              />
            </label>
            <label className="flex items-center gap-2 sm:col-span-2">
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

        <AdminCard title="Quality pillars" subtitle="Four cards under the intro on the customer page.">
          <div className="space-y-4">
            {settings.pillars.map((pillar, index) => (
              <div key={`pillar-${index}`} className="rounded-xl border border-emerald-900/10 bg-cream-50/50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
                    Pillar {index + 1}
                  </p>
                  <button
                    type="button"
                    className="btn-ghost px-0 text-xs text-red-700"
                    onClick={() =>
                      setSettings((current) => ({
                        ...current,
                        pillars: current.pillars.filter((_, i) => i !== index),
                      }))
                    }
                    disabled={settings.pillars.length <= 1}
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-3">
                  <input
                    value={pillar.title}
                    onChange={(e) => updatePillar(index, { title: e.target.value })}
                    className="admin-input w-full"
                    placeholder="Title"
                  />
                  <RichTextEditor
                    id={`sourcing-pillar-text-${index}`}
                    value={pillar.text}
                    onChange={(text) => updatePillar(index, { text })}
                    placeholder="Description"
                    minHeight={90}
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
                  pillars: [...current.pillars, emptyPillar()],
                }))
              }
            >
              + Add pillar
            </button>
          </div>
        </AdminCard>

        <AdminCard
          title="Banner image"
          subtitle="Wide image between pillars and the quality journey. Upload a photo — no technical URL needed."
        >
          <div className="space-y-4">
            <CmsImageUploadField
              label="Page banner"
              value={settings.bannerImage}
              alt={settings.bannerAlt}
              onChange={(bannerImage) => setSettings({ ...settings, bannerImage })}
              hint="Recommended: wide landscape image (about 1400×600). JPG, PNG, or WebP."
            />
            <label className="block">
              <span className="admin-label">Image description (for accessibility)</span>
              <input
                value={settings.bannerAlt}
                onChange={(e) => setSettings({ ...settings, bannerAlt: e.target.value })}
                className="admin-input mt-1.5 w-full"
                placeholder="Describe what the image shows"
              />
            </label>
          </div>
        </AdminCard>

        <AdminCard title="Quality journey" subtitle="Numbered process steps on the customer page.">
          <label className="mb-4 block">
            <span className="admin-label">Section title</span>
            <input
              value={settings.journeyTitle}
              onChange={(e) => setSettings({ ...settings, journeyTitle: e.target.value })}
              className="admin-input mt-1.5 w-full"
            />
          </label>
          <div className="space-y-4">
            {settings.steps.map((step, index) => (
              <div key={`step-${index}`} className="rounded-xl border border-emerald-900/10 bg-cream-50/50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
                    Step {index + 1}
                  </p>
                  <button
                    type="button"
                    className="btn-ghost px-0 text-xs text-red-700"
                    onClick={() =>
                      setSettings((current) => ({
                        ...current,
                        steps: current.steps.filter((_, i) => i !== index),
                      }))
                    }
                    disabled={settings.steps.length <= 1}
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    value={step.step}
                    onChange={(e) => updateStep(index, { step: e.target.value })}
                    className="admin-input w-full"
                    placeholder="01"
                  />
                  <input
                    value={step.title}
                    onChange={(e) => updateStep(index, { title: e.target.value })}
                    className="admin-input w-full sm:col-span-2"
                    placeholder="Title"
                  />
                  <div className="sm:col-span-3">
                    <RichTextEditor
                      id={`sourcing-step-text-${index}`}
                      value={step.text}
                      onChange={(text) => updateStep(index, { text })}
                      placeholder="Description"
                      minHeight={90}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn-ghost"
              onClick={() =>
                setSettings((current) => ({
                  ...current,
                  steps: [...current.steps, emptyStep(current.steps.length)],
                }))
              }
            >
              + Add step
            </button>
          </div>
        </AdminCard>

        <AdminCard title="Commitments & CTA" subtitle="Final commitments list and shop button.">
          <label className="mb-4 block">
            <span className="admin-label">Section title</span>
            <input
              value={settings.commitmentsTitle}
              onChange={(e) => setSettings({ ...settings, commitmentsTitle: e.target.value })}
              className="admin-input mt-1.5 w-full"
            />
          </label>
          <div className="space-y-3">
            {settings.commitments.map((item, index) => (
              <div key={`commitment-${index}`} className="flex gap-2">
                <div className="min-w-0 flex-1">
                  <RichTextEditor
                    id={`sourcing-commitment-${index}`}
                    value={item}
                    onChange={(value) =>
                      setSettings((current) => ({
                        ...current,
                        commitments: current.commitments.map((row, i) =>
                          i === index ? value : row
                        ),
                      }))
                    }
                    placeholder="Commitment text"
                    minHeight={64}
                  />
                </div>
                <button
                  type="button"
                  className="btn-ghost shrink-0 self-start text-xs text-red-700"
                  onClick={() =>
                    setSettings((current) => ({
                      ...current,
                      commitments: current.commitments.filter((_, i) => i !== index),
                    }))
                  }
                  disabled={settings.commitments.length <= 1}
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
                  commitments: [...current.commitments, ""],
                }))
              }
            >
              + Add commitment
            </button>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="admin-label">CTA label</span>
              <input
                value={settings.ctaLabel}
                onChange={(e) => setSettings({ ...settings, ctaLabel: e.target.value })}
                className="admin-input mt-1.5 w-full"
              />
            </label>
            <label className="block">
              <span className="admin-label">CTA link</span>
              <input
                value={settings.ctaHref}
                onChange={(e) => setSettings({ ...settings, ctaHref: e.target.value })}
                className="admin-input mt-1.5 w-full"
                placeholder="/products/premium-dates"
              />
            </label>
          </div>
        </AdminCard>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setPreviewOpen(true)}
            disabled={saving}
          >
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
            <a
              href={livePageUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost text-xs"
            >
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

      <SourcingPagePreview
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
