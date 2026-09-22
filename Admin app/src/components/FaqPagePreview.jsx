import { AdminModalLayout } from "./AdminModalLayout.jsx";

function stripHtml(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function FaqPagePreview({ open, settings, onClose, onSaveDraft, onPublish, saving }) {
  return (
    <AdminModalLayout
      open={open}
      title="Preview — FAQ"
      subtitle="Customer-page preview of your current edits (not saved yet)."
      titleId="faq-preview-title"
      onClose={onClose}
      maxWidthClass="max-w-3xl"
      maxHeightClass="sm:max-h-[min(48rem,calc(100dvh-2rem))]"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
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
      <div className="rounded-2xl border border-emerald-900/10 bg-[#fffdf8] p-5 sm:p-6">
        <h1 className="font-display text-2xl font-medium text-emerald-900">{settings.title || "FAQ"}</h1>
        <p className="mt-2 text-sm text-emerald-900/65">{stripHtml(settings.subtitle)}</p>
        <div className="mt-6 space-y-5">
          {(settings.faqItems ?? []).map((category, index) => (
            <section key={index}>
              <h2 className="font-display text-lg font-medium text-emerald-900">
                {category.category || `Category ${index + 1}`}
              </h2>
              <ul className="mt-3 space-y-3">
                {(category.questions ?? []).map((question, qIndex) => (
                  <li key={qIndex} className="rounded-xl border border-emerald-900/8 bg-white p-3">
                    <p className="text-sm font-semibold text-emerald-900">{question.q || "Question"}</p>
                    <p className="mt-1 text-sm text-emerald-900/65">{stripHtml(question.a) || "—"}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <div className="mt-8 rounded-xl bg-[#f7f4eb] p-5 text-center">
          <p className="text-sm text-emerald-900/65">{stripHtml(settings.ctaText)}</p>
          <span className="mt-3 inline-flex rounded-full bg-gradient-to-r from-[#c99868] to-[#9a6b3f] px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
            {settings.ctaButtonLabel || "Contact us"}
          </span>
        </div>
      </div>
    </AdminModalLayout>
  );
}
