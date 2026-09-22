import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";

const REQUIRED_PAGES = [
  {
    slug: "homepage",
    title: "Home Page",
    hint: "Hero banners & copy, site logo, our story, testimonials",
    to: "/cms/home",
    customerPath: "/",
  },
  {
    slug: "sourcing-quality",
    title: "Sourcing & Quality",
    hint: "Pillars, quality journey, commitments & banner",
    to: "/cms/sourcing",
    customerPath: "/sourcing-and-quality",
  },
  {
    slug: "our-legacy",
    title: "Our Legacy",
    hint: "Hero, founder story, highlights & signature",
    to: "/cms/legacy",
    customerPath: "/our-legacy",
  },
  {
    slug: "faq",
    title: "FAQ",
    hint: "Categories, questions and contact CTA",
    to: "/cms/faq",
    customerPath: "/faq",
  },
  {
    slug: "contact",
    title: "Contact Us",
    hint: "Email, phone, address, hours & map",
    to: "/cms/contact",
    customerPath: "/contact",
  },
];

export function CmsPagesPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/admin/cms/pages")
      .then((d) => setPages(d.pages ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const pageBySlug = Object.fromEntries((pages ?? []).map((page) => [page.slug, page]));

  return (
    <div>
      <PageHeader
        title="Web Content"
        subtitle="Manage the customer website pages: Home, Sourcing & Quality, Our Legacy, FAQ, and Contact Us. Blog posts are under CMS → Blog."
      />

      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {loading ? (
        <LoadingState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {REQUIRED_PAGES.map((item) => {
            const live = pageBySlug[item.slug];
            const published = live?.published !== false;
            return (
              <AdminCard key={item.slug} className="transition hover:shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gold-600">
                      {live?.pageType || "content"}
                    </p>
                    <h3 className="mt-1 font-display text-xl font-medium text-emerald-900">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-emerald-900/55">{item.hint}</p>
                    <p className="mt-2 text-xs text-emerald-900/40">
                      {item.customerPath} · {published ? "Published" : "Draft"}
                    </p>
                  </div>
                  <Link to={item.to} className="btn-primary shrink-0 text-xs">
                    Edit
                  </Link>
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
