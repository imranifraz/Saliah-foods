import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { PageMeta } from "../components/pages/PageMeta";
import { BlogArticleHero } from "../components/blog/BlogArticleHero";
import { BlogArticleBody } from "../components/blog/BlogArticleBody";
import { BlogArticleCta } from "../components/blog/BlogArticleCta";
import { BlogPostCard } from "../components/blog/BlogPostCard";
import { BlogNewsletterCta } from "../components/blog/BlogNewsletterCta";
import { Reveal } from "../components/ui/Reveal";
import {
  fetchBlogPost,
  fetchBlogPosts,
  getRelatedFromList,
} from "../services/blogApi.js";

function BlogArticleSkeleton() {
  return (
    <div className="blog-article-page relative pb-24 pt-[calc(var(--site-header)+0.75rem)]" aria-busy="true">
      <div className="plp-atmosphere pointer-events-none absolute inset-0" aria-hidden />
      <div className="blog-article-page__inner relative">
        <div className="blog-article-skeleton blog-article-skeleton--stack">
          <div className="blog-article-skeleton__line blog-article-skeleton__line--sm" />
          <div className="blog-article-skeleton__cover blog-article-skeleton__cover--center" />
          <div className="blog-article-skeleton__line blog-article-skeleton__line--xs" />
          <div className="blog-article-skeleton__line blog-article-skeleton__line--title" />
          <div className="blog-article-skeleton__line" />
          <div className="blog-article-skeleton__line blog-article-skeleton__line--md" />
          <p className="sr-only">Loading article…</p>
        </div>
      </div>
    </div>
  );
}

export function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMissing(false);

    Promise.all([fetchBlogPost(slug), fetchBlogPosts("All")])
      .then(([nextPost, posts]) => {
        if (cancelled) return;
        if (!nextPost) {
          setMissing(true);
          setPost(null);
          setRelated([]);
          return;
        }
        setPost(nextPost);
        setRelated(getRelatedFromList(posts, slug, 3));
      })
      .catch(() => {
        if (!cancelled) setMissing(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!loading && missing) {
    return <Navigate to="/blog" replace />;
  }

  if (loading || !post) {
    return <BlogArticleSkeleton />;
  }

  return (
    <>
      <PageMeta title={post.title} description={post.excerpt} />

      <article className="blog-article-page relative pb-24 pt-[calc(var(--site-header)+0.75rem)] md:pb-32">
        <div className="plp-atmosphere pointer-events-none absolute inset-0" aria-hidden />
        <div className="blog-article-page__inner relative">
          {/* Admin structure: cover + meta + title + excerpt + author */}
          <BlogArticleHero post={post} />

          {/* Admin structure: content blocks (Heading / Paragraph) in saved order */}
          <div className="blog-article-layout">
            <BlogArticleBody content={post.content} />
            <BlogArticleCta category={post.category} />
          </div>

          {related.length > 0 ? (
            <section className="blog-related" aria-labelledby="blog-related-title">
              <Reveal>
                <div className="blog-related__head">
                  <p className="blog-related__eyebrow">Keep reading</p>
                  <h2 id="blog-related-title" className="blog-section__title">
                    More from the journal
                  </h2>
                </div>
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
