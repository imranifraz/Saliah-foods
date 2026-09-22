import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";
import { RichTextEditor } from "../components/RichTextEditor.jsx";
import { ContactPagePreview } from "../components/ContactPagePreview.jsx";
import { useAdminToast } from "../context/AdminToastContext.jsx";

function emptySettings(page) {
  const body = page?.body ?? {};
  return {
    title: page?.title ?? "Contact Us",
    subtitle: page?.subtitle ?? "",
    published: page?.published !== false,
    email: body.email ?? "",
    phone: body.phone ?? "",
    phoneTel: body.phoneTel ?? "",
    address: body.address ?? "",
    hours: body.hours ?? "",
    subjectsText: (body.subjects ?? []).join("\n"),
    formSuccessMessage: body.formSuccessMessage ?? "",
    mapEmbedUrl: body.mapEmbedUrl ?? "",
    googleMapsUrl: body.googleMapsUrl ?? "",
    placeLabel: body.placeLabel ?? "Saliah Dates",
  };
}

export function ContactManagementPage() {
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
      const settingsData = await apiFetch("/api/admin/contact/settings");
      setSettings(emptySettings(settingsData.page));
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

    const subjects = settings.subjectsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    try {
      const data = await apiFetch("/api/admin/contact/settings", {
        method: "PUT",
        body: JSON.stringify({
          title: settings.title,
          subtitle: settings.subtitle,
          published: nextPublished,
          body: {
            email: settings.email,
            phone: settings.phone,
            phoneTel: settings.phoneTel,
            address: settings.address,
            hours: settings.hours,
            subjects,
            formSuccessMessage: settings.formSuccessMessage,
            mapEmbedUrl: settings.mapEmbedUrl,
            googleMapsUrl: settings.googleMapsUrl,
            placeLabel: settings.placeLabel,
          },
        }),
      });
      setSettings(emptySettings(data.page));
      setSaved(true);
      toast.success("Contact page saved");
      if (closePreview) setPreviewOpen(false);
    } catch (err) {
      setError(err.message);
      toast.error("Could not save contact page", err.message);
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
        title="Contact page"
        subtitle="Manage customer-facing contact details and map links shown on the Contact Us page."
      />

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <form onSubmit={handleSave} className="space-y-6">
        <AdminCard title="Contact details" subtitle="Shown on the customer Contact Us page and site footer.">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="admin-label">Page title</span>
              <input
                value={settings.title}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                className="admin-input mt-1.5 w-full"
                placeholder="Contact Us"
              />
            </label>
            <div className="block sm:col-span-2">
              <span id="contact-subtitle-label" className="admin-label">Subtitle</span>
              <RichTextEditor
                id="contact-subtitle"
                labelId="contact-subtitle-label"
                value={settings.subtitle}
                onChange={(subtitle) => setSettings({ ...settings, subtitle })}
                placeholder="e.g. We would love to hear from you — orders, partnerships, or general enquiries."
                minHeight={80}
              />
            </div>
            <label className="block">
              <span className="admin-label">Email</span>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="admin-input mt-1.5 w-full"
                placeholder="support@saliahfoods.com"
              />
            </label>
            <label className="block">
              <span className="admin-label">Phone (display)</span>
              <input
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="admin-input mt-1.5 w-full"
                placeholder="094423 37717"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="admin-label">Phone (tel link)</span>
              <input
                value={settings.phoneTel}
                onChange={(e) => setSettings({ ...settings, phoneTel: e.target.value })}
                className="admin-input mt-1.5 w-full"
                placeholder="+919442337717"
              />
            </label>
            <div className="block sm:col-span-2">
              <span id="contact-address-label" className="admin-label">Address</span>
              <RichTextEditor
                id="contact-address"
                labelId="contact-address-label"
                value={settings.address}
                onChange={(address) => setSettings({ ...settings, address })}
                placeholder="Street, area, city, state, PIN"
                minHeight={100}
              />
            </div>
            <div className="block sm:col-span-2">
              <span id="contact-hours-label" className="admin-label">Business hours</span>
              <RichTextEditor
                id="contact-hours"
                labelId="contact-hours-label"
                value={settings.hours}
                onChange={(hours) => setSettings({ ...settings, hours })}
                placeholder="Open 9:00 AM – 4:00 PM IST, all days"
                minHeight={72}
              />
            </div>
            <label className="block sm:col-span-2">
              <span className="admin-label">Form subjects (one per line)</span>
              <textarea
                rows={5}
                value={settings.subjectsText}
                onChange={(e) => setSettings({ ...settings, subjectsText: e.target.value })}
                className="admin-input mt-1.5 w-full resize-none font-mono text-xs"
              />
            </label>
            <div className="block sm:col-span-2">
              <span id="contact-success-message-label" className="admin-label">Form success message</span>
              <RichTextEditor
                id="contact-success-message"
                labelId="contact-success-message-label"
                value={settings.formSuccessMessage}
                onChange={(formSuccessMessage) => setSettings({ ...settings, formSuccessMessage })}
                placeholder="We have received your message and will respond within one business day."
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

        <AdminCard title="Google Maps" subtitle="Optional map embed and external Google Maps link.">
          <div className="grid gap-4">
            <label className="block">
              <span className="admin-label">Place label</span>
              <input
                value={settings.placeLabel}
                onChange={(e) => setSettings({ ...settings, placeLabel: e.target.value })}
                className="admin-input mt-1.5 w-full"
                placeholder="Saliah Dates"
              />
            </label>
            <label className="block">
              <span className="admin-label">Map embed URL</span>
              <input
                value={settings.mapEmbedUrl}
                onChange={(e) => setSettings({ ...settings, mapEmbedUrl: e.target.value })}
                className="admin-input mt-1.5 w-full"
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
              <p className="admin-muted mt-1 text-xs">
                From Google Maps → Share → Embed a map (iframe src URL).
              </p>
            </label>
            <label className="block">
              <span className="admin-label">Google Maps link</span>
              <input
                value={settings.googleMapsUrl}
                onChange={(e) => setSettings({ ...settings, googleMapsUrl: e.target.value })}
                className="admin-input mt-1.5 w-full"
                placeholder="https://www.google.com/maps/place/..."
              />
              <p className="admin-muted mt-1 text-xs">
                The &quot;Open in Google Maps&quot; link shown below the map on the Contact page.
              </p>
            </label>
          </div>
        </AdminCard>

        {saved ? (
          <p className="rounded-xl bg-emerald-800/10 px-4 py-3 text-sm text-emerald-800">Contact settings saved.</p>
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
            {saving ? "Saving…" : "Save contact settings"}
          </button>
        </div>
      </form>

      <ContactPagePreview
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
