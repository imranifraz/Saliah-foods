import { AdminModalLayout } from "./AdminModalLayout.jsx";

function stripHtml(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function ContactPagePreview({ open, settings, onClose, onSaveDraft, onPublish, saving }) {
  const subjects = String(settings.subjectsText ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <AdminModalLayout
      open={open}
      title="Preview — Contact Us"
      subtitle="Customer-page preview of your current edits (not saved yet)."
      titleId="contact-preview-title"
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
        <h1 className="font-display text-2xl font-medium text-emerald-900">
          {settings.title || "Contact Us"}
        </h1>
        <p className="mt-2 text-sm text-emerald-900/65">{stripHtml(settings.subtitle)}</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-900/8 bg-white p-4 text-sm">
            <p className="text-xs uppercase tracking-wider text-emerald-900/40">Email</p>
            <p className="mt-1 text-emerald-900">{settings.email || "—"}</p>
          </div>
          <div className="rounded-xl border border-emerald-900/8 bg-white p-4 text-sm">
            <p className="text-xs uppercase tracking-wider text-emerald-900/40">Phone</p>
            <p className="mt-1 text-emerald-900">{settings.phone || "—"}</p>
          </div>
          <div className="rounded-xl border border-emerald-900/8 bg-white p-4 text-sm sm:col-span-2">
            <p className="text-xs uppercase tracking-wider text-emerald-900/40">Address</p>
            <p className="mt-1 text-emerald-900">{settings.address || "—"}</p>
          </div>
          <div className="rounded-xl border border-emerald-900/8 bg-white p-4 text-sm sm:col-span-2">
            <p className="text-xs uppercase tracking-wider text-emerald-900/40">Hours</p>
            <p className="mt-1 text-emerald-900">{settings.hours || "—"}</p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-emerald-900/8 bg-white p-4">
          <p className="text-xs uppercase tracking-wider text-emerald-900/40">Form subjects</p>
          <p className="mt-2 text-sm text-emerald-900">{subjects.join(" · ") || "—"}</p>
          <p className="mt-3 text-xs text-emerald-900/55">
            Success message: {settings.formSuccessMessage || "—"}
          </p>
        </div>
      </div>
    </AdminModalLayout>
  );
}
