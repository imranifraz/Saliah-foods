import { AdminModalLayout } from "./AdminModalLayout.jsx";
import { resolveAdminMediaUrl } from "../lib/mediaUrl.js";
import { RichText } from "./RichText.jsx";

export function SourcingPagePreview({ open, settings, onClose, onSaveDraft, onPublish, saving }) {
  const bannerSrc = resolveAdminMediaUrl(settings.bannerImage);

  return (
    <AdminModalLayout
      open={open}
      title="Preview — Sourcing & Quality"
      subtitle="This is how the customer page will look with your current edits (not saved yet)."
      titleId="sourcing-preview-title"
      onClose={onClose}
      maxWidthClass="max-w-5xl"
      maxHeightClass="sm:max-h-[min(52rem,calc(100dvh-2rem))]"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-emerald-900/50">
            {settings.published
              ? "Published is checked — Publish will make this live."
              : "Published is unchecked — use Save draft to keep it unpublished."}
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-ghost" onClick={onClose} disabled={saving}>
              Close
            </button>
            <button type="button" className="btn-ghost" onClick={onSaveDraft} disabled={saving}>
              {saving ? "Saving…" : "Save draft"}
            </button>
            <button type="button" className="btn-primary" onClick={onPublish} disabled={saving}>
              {saving ? "Publishing…" : "Publish"}
            </button>
          </div>
        </div>
      }
    >
      <div className="overflow-hidden rounded-2xl border border-emerald-900/10 bg-[#fffdf8] text-emerald-950 shadow-inner">
        <div className="border-b border-emerald-900/8 bg-gradient-to-br from-[#f7f1e8] to-[#fffdf8] px-5 py-6 sm:px-8 sm:py-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-900/35">
            Customer preview · /sourcing-and-quality
          </p>
          <h1 className="mt-3 font-display text-[clamp(1.5rem,3vw,2.25rem)] font-medium text-emerald-900">
            {settings.title || "Sourcing & Quality"}
          </h1>
          <RichText
            html={settings.subtitle}
            className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-emerald-900/65 sm:text-base"
          />
        </div>

        <div className="space-y-10 px-5 py-6 sm:px-8 sm:py-8">
          <RichText
            html={settings.intro}
            className="max-w-3xl font-body text-sm leading-relaxed text-emerald-900/70 sm:text-base"
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(settings.pillars ?? []).map((item, index) => (
              <article
                key={`preview-pillar-${index}`}
                className="rounded-2xl border border-emerald-900/8 bg-white p-4 shadow-sm"
              >
                <h2 className="font-display text-base font-medium text-emerald-900">
                  {item.title || `Pillar ${index + 1}`}
                </h2>
                <RichText
                  html={item.text}
                  className="mt-2 font-body text-xs leading-relaxed text-emerald-900/65 sm:text-sm"
                />
              </article>
            ))}
          </div>

          {bannerSrc ? (
            <div className="overflow-hidden rounded-2xl border border-emerald-900/8">
              <img
                src={bannerSrc}
                alt={settings.bannerAlt || ""}
                className="aspect-[21/9] w-full object-cover"
              />
            </div>
          ) : null}

          <section>
            <h2 className="font-display text-xl font-medium text-emerald-900">
              {settings.journeyTitle || "Our quality journey"}
            </h2>
            <ol className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {(settings.steps ?? []).map((item, index) => (
                <li
                  key={`preview-step-${index}`}
                  className="rounded-2xl border border-emerald-900/8 bg-[#f7f4eb] p-4"
                >
                  <span className="font-display text-2xl font-medium text-[#b6814e]/80">
                    {item.step || String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 font-display text-base font-medium text-emerald-900">
                    {item.title || `Step ${index + 1}`}
                  </h3>
                  <RichText
                    html={item.text}
                    className="mt-1.5 font-body text-xs leading-relaxed text-emerald-900/65 sm:text-sm"
                  />
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-2xl border border-emerald-900/8 bg-[#f5f2ec] p-5 sm:p-6">
            <h2 className="font-display text-lg font-medium text-emerald-900">
              {settings.commitmentsTitle || "Our commitments"}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {(settings.commitments ?? []).map((item, index) => (
                <li key={index} className="flex gap-3 font-body text-sm text-emerald-900/70">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b6814e]" aria-hidden />
                  <RichText html={item} className="min-w-0 flex-1" />
                </li>
              ))}
            </ul>
            <span className="mt-6 inline-flex rounded-full bg-gradient-to-r from-[#c99868] to-[#9a6b3f] px-6 py-3 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              {settings.ctaLabel || "Shop premium dates"}
            </span>
            {settings.ctaHref ? (
              <p className="mt-2 text-xs text-emerald-900/40">Links to {settings.ctaHref}</p>
            ) : null}
          </section>
        </div>
      </div>
    </AdminModalLayout>
  );
}
