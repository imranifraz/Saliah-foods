import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { getBlogPostPath } from "../../data/blog";
import { OptimizedImage } from "../ui/OptimizedImage";

export function BlogPostCard({ post, index = 0, variant = "grid" }) {
  const reduce = useReducedMotion();
  const isEditorial = variant === "editorial";

  return (
    <motion.article
      className={`blog-post-card group ${isEditorial ? "blog-post-card--editorial" : ""}`}
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={getBlogPostPath(post.id)} className="blog-post-card__link">
        <div className="blog-post-card__media">
          <OptimizedImage
            src={post.img}
            alt=""
            className="blog-post-card__image"
            width={600}
            height={400}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="blog-post-card__shine" aria-hidden />
          <span className="blog-post-card__category">{post.category}</span>
        </div>

        <div className="blog-post-card__body">
          <div className="blog-post-card__meta-row">
            <time dateTime={post.dateISO} className="blog-post-card__date">
              {post.date}
            </time>
            <span className="blog-post-card__dot" aria-hidden>
              ·
            </span>
            <span className="blog-post-card__read">{post.readTime}</span>
          </div>
          <h3 className="blog-post-card__title">{post.title}</h3>
          <p className="blog-post-card__excerpt">{post.excerpt}</p>
          <span className="blog-read-link blog-read-link--sm">
            Read more
            <span className="blog-read-link__arrow" aria-hidden>
              →
            </span>
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
