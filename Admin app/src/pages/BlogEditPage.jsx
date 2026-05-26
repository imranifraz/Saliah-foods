import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";

const empty = {
  id: "",
  title: "",
  excerpt: "",
  category: "Wellness",
  readTime: "5 min read",
  author: "Saliah Editorial",
  img: "/assets/kimia-dates.png",
  dateISO: new Date().toISOString().slice(0, 10),
  featured: false,
  contentJson: '[{"type":"p","text":""}]',
};

export function BlogEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (isNew) return;
    apiFetch(`/api/admin/cms/blog/${id}`)
      .then((d) => {
        const p = d.post;
        setForm({
          id: p.id,
          title: p.title,
          excerpt: p.excerpt,
          category: p.category,
          readTime: p.readTime,
          author: p.author,
          img: p.img,
          dateISO: p.dateISO,
          featured: p.featured,
          contentJson: JSON.stringify(p.content, null, 2),
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSaved(false);
    let content;
    try {
      content = JSON.parse(form.contentJson);
    } catch {
      setError("Invalid JSON in content");
      return;
    }

    const payload = {
      title: form.title,
      excerpt: form.excerpt,
      category: form.category,
      readTime: form.readTime,
      author: form.author,
      img: form.img,
      dateISO: form.dateISO,
      featured: form.featured,
      content,
    };

    try {
      if (isNew) {
        await apiFetch("/api/admin/cms/blog", {
          method: "POST",
          body: JSON.stringify({ ...payload, id: form.id || undefined }),
        });
        navigate("/cms/blog");
      } else {
        await apiFetch(`/api/admin/cms/blog/${id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setSaved(true);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      <Link to="/cms/blog" className="btn-ghost mb-2 inline-flex px-0">
        ← Blog posts
      </Link>

      <PageHeader title={isNew ? "New blog post" : "Edit blog post"} />

      <form onSubmit={handleSave} className="space-y-6">
        <AdminCard title="Post details">
          <div className="grid gap-4 sm:grid-cols-2">
            {isNew && (
              <label className="block sm:col-span-2">
                <span className="admin-label">URL slug (optional)</span>
                <input
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                  className="admin-input"
                  placeholder="auto-from-title"
                />
              </label>
            )}
            <label className="block sm:col-span-2">
              <span className="admin-label">Title</span>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="admin-input"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="admin-label">Excerpt</span>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                rows={2}
                className="admin-input resize-none"
              />
            </label>
            <label className="block">
              <span className="admin-label">Category</span>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="admin-input"
              />
            </label>
            <label className="block">
              <span className="admin-label">Date</span>
              <input
                type="date"
                value={form.dateISO}
                onChange={(e) => setForm({ ...form, dateISO: e.target.value })}
                className="admin-input"
              />
            </label>
            <label className="block">
              <span className="admin-label">Author</span>
              <input
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="admin-input"
              />
            </label>
            <label className="block">
              <span className="admin-label">Read time</span>
              <input
                value={form.readTime}
                onChange={(e) => setForm({ ...form, readTime: e.target.value })}
                className="admin-input"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="admin-label">Cover image path</span>
              <input
                value={form.img}
                onChange={(e) => setForm({ ...form, img: e.target.value })}
                className="admin-input"
              />
            </label>
            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              <span className="text-sm">Featured on blog homepage</span>
            </label>
          </div>
        </AdminCard>

        <AdminCard title="Article content (JSON blocks)">
          <textarea
            value={form.contentJson}
            onChange={(e) => setForm({ ...form, contentJson: e.target.value })}
            rows={14}
            className="admin-input font-mono text-xs"
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
          {isNew ? "Publish post" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
