import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";
import { CmsImageUploadField } from "../components/CmsImageUploadField.jsx";
import { RichTextEditor } from "../components/RichTextEditor.jsx";
import { useAdminToast } from "../context/AdminToastContext.jsx";

const empty = {
  id: "",
  title: "",
  excerpt: "",
  category: "Wellness",
  readTime: "5 min read",
  author: "Saliah Editorial",
  img: "",
  dateISO: new Date().toISOString().slice(0, 10),
  featured: false,
  blocks: [{ type: "p", text: "" }],
};

function toBlocks(content) {
  if (!Array.isArray(content) || !content.length) return [{ type: "p", text: "" }];
  return content.map((item) => ({
    type: item.type === "h2" ? "h2" : "p",
    text: String(item.text ?? ""),
  }));
}

export function BlogEditPage() {
  const toast = useAdminToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

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
          blocks: toBlocks(p.content),
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  function updateBlock(index, patch) {
    setForm((current) => ({
      ...current,
      blocks: current.blocks.map((block, i) => (i === index ? { ...block, ...patch } : block)),
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);

    const content = form.blocks
      .map((block) => ({
        type: block.type === "h2" ? "h2" : "p",
        text: String(block.text ?? "").trim(),
      }))
      .filter((block) => block.text);

    if (!content.length) {
      setError("Add at least one content block.");
      toast.error("Could not save post", "Add at least one content block.");
      setSaving(false);
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
        toast.success("Blog post created");
        navigate("/cms/blog");
      } else {
        await apiFetch(`/api/admin/cms/blog/${id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setSaved(true);
        toast.success("Blog post saved");
      }
    } catch (err) {
      setError(err.message);
      toast.error(isNew ? "Could not create post" : "Could not save post", err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title={isNew ? "New blog post" : "Edit blog post"}
        subtitle="Write journal articles shown on the customer Blog / Journal pages."
      />

      <form onSubmit={handleSave} className="space-y-6">
        <AdminCard title="Post details">
          <div className="grid gap-4 sm:grid-cols-2">
            {isNew ? (
              <label className="block sm:col-span-2">
                <span className="admin-label">URL slug (optional)</span>
                <input
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                  className="admin-input"
                  placeholder="auto-from-title"
                />
              </label>
            ) : null}
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

        <AdminCard
          title="Cover image"
          subtitle="Shown on the blog listing card and article hero."
        >
          <CmsImageUploadField
            label="Cover image"
            value={form.img}
            onChange={(img) => setForm({ ...form, img })}
            hint="Prefer a square image (about 1000×1000). The file uploads as-is — no crop step."
            previewClassName="aspect-square w-full max-w-sm object-cover"
            emptyClassName="aspect-square w-full max-w-sm"
            fileNamePrefix="blog-cover"
          />
        </AdminCard>

        <AdminCard title="Article content" subtitle="Add headings and formatted paragraphs (bold, lists, links).">
          <div className="space-y-4">
            {form.blocks.map((block, index) => (
              <div key={index} className="rounded-xl border border-emerald-900/10 bg-cream-50/40 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <select
                    value={block.type}
                    onChange={(e) => updateBlock(index, { type: e.target.value })}
                    className="admin-input w-auto min-w-[10rem]"
                  >
                    <option value="p">Paragraph</option>
                    <option value="h2">Heading</option>
                  </select>
                  <button
                    type="button"
                    className="btn-ghost px-0 text-xs text-red-700"
                    disabled={form.blocks.length <= 1}
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        blocks: current.blocks.filter((_, i) => i !== index),
                      }))
                    }
                  >
                    Remove
                  </button>
                </div>
                {block.type === "h2" ? (
                  <input
                    value={block.text}
                    onChange={(e) => updateBlock(index, { text: e.target.value })}
                    className="admin-input w-full"
                    placeholder="Heading text"
                  />
                ) : (
                  <RichTextEditor
                    id={`blog-block-${index}`}
                    value={block.text}
                    onChange={(text) => updateBlock(index, { text })}
                    placeholder="Paragraph text — bold, italic, lists, and links supported"
                    minHeight={120}
                  />
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn-ghost"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  blocks: [...current.blocks, { type: "p", text: "" }],
                }))
              }
            >
              + Add block
            </button>
          </div>
        </AdminCard>

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        {saved ? (
          <p className="rounded-xl bg-emerald-800/10 px-4 py-3 text-sm text-emerald-800">Saved.</p>
        ) : null}

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving…" : isNew ? "Publish post" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
