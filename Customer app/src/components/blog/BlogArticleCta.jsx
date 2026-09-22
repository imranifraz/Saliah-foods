import { Link } from "react-router-dom";
import { Reveal } from "../ui/Reveal";

export function BlogArticleCta({ category }) {
  const shopHref =
    category && /wellness/i.test(category) ? "/products/wellness-traditional" : "/products/dates";

  return (
    <Reveal>
      <aside className="blog-article-cta" aria-label="Next steps">
        <div className="blog-article-cta__copy">
          <p className="blog-article-cta__eyebrow">From the pantry</p>
          <p className="blog-article-cta__title">Taste what you just read about</p>
          <p className="blog-article-cta__desc">
            Explore Saliah dates and wellness foods selected for the same care described in this
            journal.
          </p>
        </div>
        <div className="blog-article-cta__actions">
          <Link to={shopHref} className="blog-article-cta__primary">
            Shop collection
          </Link>
          <Link to="/blog" className="blog-article-cta__secondary">
            ← Back to journal
          </Link>
        </div>
      </aside>
    </Reveal>
  );
}
