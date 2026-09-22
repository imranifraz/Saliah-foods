import { AdminModalLayout } from "./AdminModalLayout.jsx";
import { resolveAdminMediaUrl } from "../lib/mediaUrl.js";
import { RichText } from "./RichText.jsx";

export function LegacyPagePreview({ open, settings, onClose, onSaveDraft, onPublish, saving }) {
  const heroSrc = resolveAdminMediaUrl(settings.heroImage);
  const founderSrc = resolveAdminMediaUrl(settings.founderImage);
  const signatureSrc = resolveAdminMediaUrl(settings.signatureImage);

  return (
    <AdminModalLayout
      open={open}
      title="Preview — Our Legacy"
      subtitle="Customer-page preview of your current edits (not saved yet)."
      titleId="legacy-preview-title"
      onClose={onClose}
      maxWidthClass="max-w-5xl"
      maxHeightClass="sm:max-h-[min(52rem,calc(100dvh-2rem))]"
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2">
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
      }
    >
      <div className="overflow-hidden rounded-2xl border border-emerald-900/10 bg-[#fffdf8] text-emerald-950">
        <div className="relative min-h-[12rem] overflow-hidden bg-emerald-950">
          {heroSrc ? (
            <img src={heroSrc} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
          ) : null}
          <div className="relative px-6 py-8 text-cream-50 sm:px-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-300/90">
              {settings.heroEyebrow || "Our Legacy"}
            </p>
            <h1 className="mt-2 font-display text-2xl font-medium sm:text-3xl">
              {settings.heroTitle || "Our Legacy"}
            </h1>
            <RichText html={settings.heroText} className="mt-3 max-w-2xl text-sm text-cream-50/80" />
          </div>
        </div>

        <div className="space-y-8 px-5 py-6 sm:px-8">
          <div className="grid gap-6 md:grid-cols-2 md:items-center">
            {founderSrc ? (
              <img src={founderSrc} alt="" className="aspect-square w-full rounded-2xl object-cover" />
            ) : null}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-600">
                {settings.founderEyebrow}
              </p>
              <h2 className="mt-2 font-display text-xl font-medium text-emerald-900">
                {settings.founderTitle}
              </h2>
              <RichText
                html={settings.founderText}
                className="mt-3 text-sm leading-relaxed text-emerald-900/70"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {(settings.highlights ?? []).map((item, index) => (
              <article key={index} className="rounded-xl border border-emerald-900/8 bg-white p-4">
                <h3 className="font-display text-base font-medium text-emerald-900">{item.title}</h3>
                <RichText
                  html={item.text}
                  className="mt-2 text-xs leading-relaxed text-emerald-900/65"
                />
              </article>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-2xl bg-[#f7f4eb] p-5">
              <p className="font-display text-2xl font-medium text-gold-600">{settings.storyLabel}</p>
              <RichText
                as="blockquote"
                html={settings.storyQuote}
                className="mt-4 font-display text-lg italic text-emerald-900"
              />
            </div>
            <div>
              {(settings.storyParagraphs ?? []).map((paragraph, index) => (
                <RichText
                  key={index}
                  html={paragraph}
                  className="mt-3 text-sm leading-relaxed text-emerald-900/70 first:mt-0"
                />
              ))}
              <div className="mt-5">
                {signatureSrc ? (
                  <img src={signatureSrc} alt="" className="h-10 w-auto opacity-90" />
                ) : null}
                <p className="mt-2 text-sm font-semibold text-emerald-900">
                  {settings.signatureName}{" "}
                  <span className="font-normal uppercase tracking-wider text-emerald-900/45">
                    / {settings.signatureRole}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminModalLayout>
  );
}
