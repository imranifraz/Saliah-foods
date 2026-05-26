import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";

const PAGE_HINTS = {
  homepage: "Hero, trust strip & featured sections",
  "about-us": "Brand story, values & stats",
  faq: "FAQ categories and questions",
  "sourcing-quality": "Quality pillars & process",
  contact: "Email, phone, address & hours",
};

export function CmsPagesPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/admin/cms/pages")
      .then((d) => setPages(d.pages))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Web Content"
        subtitle="Manage static pages for the customer website — About, FAQ, Contact, Homepage & more."
      />

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <LoadingState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {pages.map((p) => (
            <AdminCard key={p.slug} className="transition hover:shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
                    {p.pageType}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-medium text-emerald-900">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-sm text-emerald-900/55">
                    {PAGE_HINTS[p.slug] ?? p.subtitle}
                  </p>
                  <p className="mt-2 text-xs text-emerald-900/40">
                    /{p.slug} · {p.published ? "Published" : "Draft"}
                  </p>
                </div>
                <Link to={`/cms/pages/${p.slug}`} className="btn-primary shrink-0 text-xs">
                  Edit
                </Link>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
}
