import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";
import { RichTextEditor } from "../components/RichTextEditor.jsx";
import { useAdminToast } from "../context/AdminToastContext.jsx";

export function CmsPageEditPage() {
  const toast = useAdminToast();
  const { slug } = useParams();
  if (slug === "homepage") return <Navigate to="/cms/home" replace />;
  if (slug === "contact") return <Navigate to="/cms/contact" replace />;
  if (slug === "faq") return <Navigate to="/cms/faq" replace />;
  if (slug === "sourcing-quality") return <Navigate to="/cms/sourcing" replace />;
  if (slug === "our-legacy" || slug === "about-us") return <Navigate to="/cms/legacy" replace />;
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [published, setPublished] = useState(true);
  const [bodyJson, setBodyJson] = useState("{}");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/admin/cms/pages/${slug}`)
      .then((d) => {
        setTitle(d.page.title);
        setSubtitle(d.page.subtitle);
        setPublished(d.page.published);
        setBodyJson(JSON.stringify(d.page.body, null, 2));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSaved(false);
    let body;
    try {
      body = JSON.parse(bodyJson);
    } catch {
      setError("Invalid JSON in page content");
      toast.error("Could not save page", "Invalid JSON in page content");
      return;
    }
    try {
      await apiFetch(`/api/admin/cms/pages/${slug}`, {
        method: "PUT",
        body: JSON.stringify({ title, subtitle, published, body }),
      });
      setSaved(true);
      toast.success("Page saved");
    } catch (err) {
      setError(err.message);
      toast.error("Could not save page", err.message);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader title={title || slug} subtitle={`Edit page: /${slug}`} />

      <form onSubmit={handleSave} className="space-y-6">
        <AdminCard title="Page settings">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="admin-label">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="admin-input"
                placeholder="Page title"
              />
            </label>
            <div className="block sm:col-span-2">
              <span id={`cms-subtitle-label-${slug}`} className="admin-label">Subtitle</span>
              <RichTextEditor
                id={`cms-subtitle-${slug}`}
                labelId={`cms-subtitle-label-${slug}`}
                value={subtitle}
                onChange={setSubtitle}
                placeholder="Short intro shown below the page title"
                minHeight={80}
              />
            </div>
            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="rounded border-emerald-900/20"
              />
              <span className="text-sm text-emerald-900">Published on customer site</span>
            </label>
          </div>
        </AdminCard>

        <AdminCard title="Page content (JSON)">
          <p className="mb-3 text-xs text-emerald-900/50">
            Edit structured content. Keys depend on page type (faqItems, story, heroTitle, etc.).
          </p>
          <textarea
            value={bodyJson}
            onChange={(e) => setBodyJson(e.target.value)}
            rows={18}
            className="admin-input font-mono text-xs leading-relaxed"
            spellCheck={false}
          />
        </AdminCard>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {saved && (
          <p className="rounded-xl bg-emerald-800/10 px-4 py-3 text-sm text-emerald-800">Saved.</p>
        )}

        <button type="submit" className="btn-primary">
          Save page
        </button>
      </form>
    </div>
  );
}
