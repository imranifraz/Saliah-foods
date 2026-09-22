import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";
import { RichTextEditor } from "../components/RichTextEditor.jsx";
import { FaqPagePreview } from "../components/FaqPagePreview.jsx";
import { useAdminToast } from "../context/AdminToastContext.jsx";

function emptyCategory() {
  return {
    category: "",
    questions: [{ q: "", a: "" }],
  };
}

function emptySettings(page) {
  const body = page?.body ?? {};
  return {
    title: page?.title ?? "FAQ",
    subtitle: page?.subtitle ?? "",
    published: page?.published !== false,
    ctaText: body.ctaText ?? "Still have a question?",
    ctaButtonLabel: body.ctaButtonLabel ?? "Contact us",
    ctaHref: body.ctaHref ?? "/contact",
    faqItems:
      Array.isArray(body.faqItems) && body.faqItems.length
        ? body.faqItems.map((item) => ({
            category: item.category ?? "",
            questions:
              Array.isArray(item.questions) && item.questions.length
                ? item.questions.map((question) => ({ q: question.q ?? "", a: question.a ?? "" }))
                : [{ q: "", a: "" }],
          }))
        : [emptyCategory()],
  };
}

export function FaqManagementPage() {
  const toast = useAdminToast();
  const [settings, setSettings] = useState(emptySettings());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/api/admin/faq/settings");
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

  function updateCategory(categoryIndex, patch) {
    setSettings((current) => ({
      ...current,
      faqItems: current.faqItems.map((item, index) =>
        index === categoryIndex ? { ...item, ...patch } : item
      ),
    }));
  }

  function updateQuestion(categoryIndex, questionIndex, patch) {
    setSettings((current) => ({
      ...current,
      faqItems: current.faqItems.map((item, index) =>
        index === categoryIndex
          ? {
              ...item,
              questions: item.questions.map((question, qIndex) =>
                qIndex === questionIndex ? { ...question, ...patch } : question
              ),
            }
          : item
      ),
    }));
  }

  function addCategory() {
    setSettings((current) => ({
      ...current,
      faqItems: [...current.faqItems, emptyCategory()],
    }));
  }

  function removeCategory(categoryIndex) {
    setSettings((current) => ({
      ...current,
      faqItems: current.faqItems.filter((_, index) => index !== categoryIndex),
    }));
  }

  function addQuestion(categoryIndex) {
    setSettings((current) => ({
      ...current,
      faqItems: current.faqItems.map((item, index) =>
        index === categoryIndex
          ? { ...item, questions: [...item.questions, { q: "", a: "" }] }
          : item
      ),
    }));
  }

  function removeQuestion(categoryIndex, questionIndex) {
    setSettings((current) => ({
      ...current,
      faqItems: current.faqItems.map((item, index) =>
        index === categoryIndex
          ? { ...item, questions: item.questions.filter((_, qIndex) => qIndex !== questionIndex) }
          : item
      ),
    }));
  }

  async function saveSettings({ published, closePreview = false } = {}) {
    const nextPublished = published ?? settings.published;
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const data = await apiFetch("/api/admin/faq/settings", {
        method: "PUT",
        body: JSON.stringify({
          title: settings.title,
          subtitle: settings.subtitle,
          published: nextPublished,
          body: {
            faqItems: settings.faqItems,
            ctaText: settings.ctaText,
            ctaButtonLabel: settings.ctaButtonLabel,
            ctaHref: settings.ctaHref,
          },
        }),
      });
      setSettings(emptySettings(data.page));
      setSaved(true);
      toast.success("FAQ page saved");
      if (closePreview) setPreviewOpen(false);
    } catch (err) {
      setError(err.message);
      toast.error("Could not save FAQ page", err.message);
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
        title="FAQ page"
        subtitle="Manage categories, questions, and the contact call-to-action on the customer FAQ page."
      />

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <form onSubmit={handleSave} className="space-y-6">
        <AdminCard title="Page settings" subtitle="Headline shown at the top of /faq on the customer site.">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="admin-label">Page title</span>
              <input
                value={settings.title}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                className="admin-input mt-1.5 w-full"
                placeholder="Frequently Asked Questions"
              />
            </label>
            <div className="block sm:col-span-2">
              <span id="faq-subtitle-label" className="admin-label">Subtitle</span>
              <RichTextEditor
                id="faq-subtitle"
                labelId="faq-subtitle-label"
                value={settings.subtitle}
                onChange={(subtitle) => setSettings({ ...settings, subtitle })}
                placeholder="Quick answers about ordering, delivery, storage, and customer support."
                minHeight={80}
              />
            </div>
            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={settings.published}
                onChange={(e) => setSettings({ ...settings, published: e.target.checked })}
                className="rounded border-emerald-900/20"
              />
              <span className="text-sm text-emerald-900">Published on customer site</span>
            </label>
          </div>
        </AdminCard>

        {settings.faqItems.map((category, categoryIndex) => (
          <AdminCard
            key={`category-${categoryIndex}`}
            title={`Category ${categoryIndex + 1}`}
            action={
              settings.faqItems.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeCategory(categoryIndex)}
                  className="btn-ghost text-sm text-[var(--admin-danger)]"
                >
                  Remove category
                </button>
              ) : null
            }
          >
            <div className="space-y-4">
              <label className="block">
                <span className="admin-label">Category name</span>
                <input
                  value={category.category}
                  onChange={(e) => updateCategory(categoryIndex, { category: e.target.value })}
                  className="admin-input mt-1.5 w-full"
                  placeholder="Orders & Delivery"
                />
              </label>

              <div className="space-y-4">
                {category.questions.map((question, questionIndex) => (
                  <div
                    key={`question-${categoryIndex}-${questionIndex}`}
                    className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="admin-caption">Question {questionIndex + 1}</p>
                      {category.questions.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeQuestion(categoryIndex, questionIndex)}
                          className="btn-ghost px-2 py-1 text-xs text-[var(--admin-danger)]"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                    <label className="block">
                      <span className="admin-label">Question</span>
                      <input
                        value={question.q}
                        onChange={(e) => updateQuestion(categoryIndex, questionIndex, { q: e.target.value })}
                        className="admin-input mt-1.5 w-full"
                        placeholder="How do I place an order?"
                      />
                    </label>
                    <div className="mt-3 block">
                      <span
                        id={`faq-answer-label-${categoryIndex}-${questionIndex}`}
                        className="admin-label"
                      >
                        Answer
                      </span>
                      <RichTextEditor
                        id={`faq-answer-${categoryIndex}-${questionIndex}`}
                        labelId={`faq-answer-label-${categoryIndex}-${questionIndex}`}
                        value={question.a}
                        onChange={(a) => updateQuestion(categoryIndex, questionIndex, { a })}
                        placeholder="Write the answer. You can bold text, add links, and use italics."
                        minHeight={100}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" onClick={() => addQuestion(categoryIndex)} className="btn-secondary">
                Add question
              </button>
            </div>
          </AdminCard>
        ))}

        <button type="button" onClick={addCategory} className="btn-secondary">
          Add category
        </button>

        <AdminCard title="Contact call-to-action" subtitle="Shown below the FAQ accordion on the customer site.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="block sm:col-span-2">
              <span id="faq-cta-text-label" className="admin-label">Text</span>
              <RichTextEditor
                id="faq-cta-text"
                labelId="faq-cta-text-label"
                value={settings.ctaText}
                onChange={(ctaText) => setSettings({ ...settings, ctaText })}
                placeholder="Still have a question?"
                minHeight={72}
              />
            </div>
            <label className="block">
              <span className="admin-label">Button label</span>
              <input
                value={settings.ctaButtonLabel}
                onChange={(e) => setSettings({ ...settings, ctaButtonLabel: e.target.value })}
                className="admin-input mt-1.5 w-full"
                placeholder="Contact us"
              />
            </label>
            <label className="block">
              <span className="admin-label">Button link</span>
              <input
                value={settings.ctaHref}
                onChange={(e) => setSettings({ ...settings, ctaHref: e.target.value })}
                className="admin-input mt-1.5 w-full"
                placeholder="/contact"
              />
            </label>
          </div>
        </AdminCard>

        {saved ? (
          <p className="rounded-xl bg-emerald-800/10 px-4 py-3 text-sm text-emerald-800">FAQ settings saved.</p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-ghost" onClick={() => setPreviewOpen(true)} disabled={saving}>
            Preview
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => saveSettings({ published: false })}
            disabled={saving}
          >
            Save draft
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save FAQ page"}
          </button>
        </div>
      </form>

      <FaqPagePreview
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
