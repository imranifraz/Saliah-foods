import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { DataTable, DataRow, DataCell } from "../components/ui/DataTable.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";
import { useAdminToast } from "../context/AdminToastContext.jsx";

export function BlogPostsPage() {
  const toast = useAdminToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    apiFetch("/api/admin/cms/blog")
      .then((d) => setPosts(d.posts))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id) {
    if (!confirm("Delete this blog post?")) return;
    try {
      await apiFetch(`/api/admin/cms/blog/${id}`, { method: "DELETE" });
      toast.success("Blog post deleted");
      load();
    } catch (err) {
      setError(err.message);
      toast.error("Could not delete post", err.message);
    }
  }

  return (
    <div>
      <PageHeader
        title="Blog Posts"
        subtitle="Create and manage articles for the customer app blog section."
        action={
          <Link to="/cms/blog/new" className="btn-primary">
            + New post
          </Link>
        }
      />

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <AdminCard>
        {loading ? (
          <LoadingState />
        ) : (
          <DataTable columns={["Title", "Category", "Date", "Featured", ""]} emptyMessage="No posts">
            {posts.map((p) => (
              <DataRow key={p.id}>
                <DataCell>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-xs text-emerald-900/45">{p.id}</p>
                </DataCell>
                <DataCell>{p.category}</DataCell>
                <DataCell className="text-emerald-900/60">{p.date}</DataCell>
                <DataCell>{p.featured ? "Yes" : "—"}</DataCell>
                <DataCell className="text-right">
                  <Link to={`/cms/blog/${p.id}`} className="btn-ghost mr-2">
                    Edit
                  </Link>
                  <button type="button" onClick={() => handleDelete(p.id)} className="btn-ghost text-red-700">
                    Delete
                  </button>
                </DataCell>
              </DataRow>
            ))}
          </DataTable>
        )}
      </AdminCard>
    </div>
  );
}
