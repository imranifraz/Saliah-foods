import { useMemo, useState } from "react";
import { PageMeta } from "../components/pages/PageMeta";
import { BlogHero } from "../components/blog/BlogHero";
import { BlogFeaturedCard } from "../components/blog/BlogFeaturedCard";
import { BlogPostCard } from "../components/blog/BlogPostCard";
import { BlogCategoryNav } from "../components/blog/BlogCategoryNav";
import { BlogQuoteStrip } from "../components/blog/BlogQuoteStrip";
import { BlogNewsletterCta } from "../components/blog/BlogNewsletterCta";
import { BLOG_CATEGORIES, blogPosts, getFeaturedPost } from "../data/blog";

export function BlogPage() {
  const [category, setCategory] = useState("All");
  const featured = getFeaturedPost();

  const filtered = useMemo(() => {
    if (category === "All") {
      return blogPosts.filter((p) => p.id !== featured?.id);
    }
    return blogPosts.filter((p) => p.category === category);
  }, [category, featured?.id]);

  return (
    <>
      <PageMeta
        title="Journal"
        description="The Saliah Journal — luxury editorials on premium dates, natural sweeteners, wellness foods, and timeless traditions."
      />

      <div className="blog-page relative pb-24 pt-[calc(var(--site-header)+0.75rem)] md:pb-32">
        <div className="plp-atmosphere pointer-events-none absolute inset-0" aria-hidden />
        <div className="blog-page__inner relative">
          <BlogHero postCount={blogPosts.length} />

          <div className="blog-page__content">
            {category === "All" && featured ? (
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
              ) : (
                <p className="blog-empty font-body text-sm text-emerald-900/50">
                  No articles in this category yet. Explore another topic above.
                </p>
              )}
            </section>

            <BlogQuoteStrip />
            <BlogNewsletterCta />
          </div>
        </div>
      </div>
    </>
  );
}
