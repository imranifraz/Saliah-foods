import { Link, Navigate, useParams } from "react-router-dom";
import { PageMeta } from "../components/pages/PageMeta";
import { BlogArticleHero } from "../components/blog/BlogArticleHero";
import { BlogArticleBody } from "../components/blog/BlogArticleBody";
import { BlogPostCard } from "../components/blog/BlogPostCard";
import { BlogNewsletterCta } from "../components/blog/BlogNewsletterCta";
import { getBlogPost, getRelatedPosts } from "../data/blog";
import { Reveal } from "../components/ui/Reveal";

export function BlogPostPage() {
  const { slug } = useParams();
  const post = getBlogPost(slug);
  const related = getRelatedPosts(slug, 3);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <>
      <PageMeta title={post.title} description={post.excerpt} />

      <article className="blog-article-page relative pb-24 pt-[calc(var(--site-header)+0.75rem)] md:pb-32">
        <div className="plp-atmosphere pointer-events-none absolute inset-0" aria-hidden />
        <div className="blog-article-page__inner relative">
          <BlogArticleHero post={post} />

          <div className="blog-article-layout">
            <BlogArticleBody content={post.content} />

            <aside className="blog-article-aside" aria-label="Article actions">
              <Reveal>
                <div className="blog-article-aside__card">
                  <p className="blog-article-aside__label">Continue exploring</p>
                  <Link to="/blog" className="blog-article-aside__link">
                    ← All journal posts
                  </Link>
                  <Link
                    to="/products/dates"
                    className="blog-article-aside__btn"
                  >
                    Shop premium dates
                  </Link>
                </div>
              </Reveal>
            </aside>
          </div>

          {related.length > 0 ? (
            <section className="blog-related" aria-labelledby="blog-related-title">
              <Reveal>
                <h2 id="blog-related-title" className="blog-section__title">
                  Related readings
                </h2>
              </Reveal>
              <div className="blog-grid blog-grid--related">
                {related.map((item, i) => (
                  <BlogPostCard key={item.id} post={item} index={i} />
                ))}
              </div>
            </section>
          ) : null}

          <BlogNewsletterCta />
        </div>
      </article>
    </>
  );
}
