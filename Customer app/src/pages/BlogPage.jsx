import { useEffect, useMemo, useState } from "react";
import { PageMeta } from "../components/pages/PageMeta";
import { BlogHero } from "../components/blog/BlogHero";
import { BlogFeaturedCard } from "../components/blog/BlogFeaturedCard";
import { BlogPostCard } from "../components/blog/BlogPostCard";
import { BlogCategoryNav } from "../components/blog/BlogCategoryNav";
import { BlogQuoteStrip } from "../components/blog/BlogQuoteStrip";
import { BlogNewsletterCta } from "../components/blog/BlogNewsletterCta";
import {
  BLOG_CATEGORIES,
  fetchBlogPosts,
  getFeaturedFromList,
} from "../services/blogApi.js";

export function BlogPage() {
  const [category, setCategory] = useState("All");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchBlogPosts("All")
      .then((next) => {
        if (!cancelled) setPosts(next);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const featured = useMemo(() => getFeaturedFromList(posts), [posts]);

  const filtered = useMemo(() => {
    if (category === "All") {
      return posts.filter((p) => p.id !== featured?.id);
    }
    return posts.filter((p) => p.category === category);
  }, [category, featured?.id, posts]);

  return (
    <>
      <PageMeta
        title="Journal"
        description="The Saliah Journal — luxury editorials on premium dates, natural sweeteners, wellness foods, and timeless traditions."
      />

      <div className="blog-page relative pb-24 pt-[calc(var(--site-header)+0.75rem)] md:pb-32">
        <div className="plp-atmosphere pointer-events-none absolute inset-0" aria-hidden />
        <div className="blog-page__inner relative">
          <BlogHero postCount={posts.length} />

          <div className="blog-page__content">
            {loading ? (
              <p className="px-4 font-body text-sm text-emerald-900/55 sm:px-5 md:px-10">
                Loading journal…
              </p>
            ) : null}

            {!loading && category === "All" && featured ? (
              <section className="blog-section" aria-label="Featured article">
                <BlogFeaturedCard post={featured} />
              </section>
            ) : null}

            <section className="blog-section" aria-labelledby="blog-list-title">
              <div className="blog-section__head">
                <div>
                  <h2 id="blog-list-title" className="blog-section__title">
                    {category === "All" ? "Latest writings" : category}
                  </h2>
                  <p className="blog-section__desc">
                    {filtered.length} {filtered.length === 1 ? "article" : "articles"}
                    {category !== "All" ? ` in ${category}` : " from our kitchen and sourcing teams"}
                  </p>
                </div>
              </div>

              <BlogCategoryNav categories={BLOG_CATEGORIES} active={category} onSelect={setCategory} />

              {filtered.length > 0 ? (
                <div className="blog-grid">
                  {filtered.map((post, i) => (
                    <BlogPostCard key={post.id} post={post} index={i} />
                  ))}
                </div>
              ) : !loading ? (
                <p className="blog-empty font-body text-sm text-emerald-900/50">
                  No articles in this category yet. Explore another topic above.
                </p>
              ) : null}
            </section>

            <BlogQuoteStrip />
            <BlogNewsletterCta />
          </div>
        </div>
      </div>
    </>
  );
}
