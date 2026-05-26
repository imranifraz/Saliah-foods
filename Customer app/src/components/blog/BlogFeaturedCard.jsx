import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { getBlogPostPath } from "../../data/blog";
import { OptimizedImage } from "../ui/OptimizedImage";

export function BlogFeaturedCard({ post }) {
  const reduce = useReducedMotion();
  if (!post) return null;

  return (
    <motion.article
      className="blog-featured group"
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={getBlogPostPath(post.id)} className="blog-featured__link">
        <div className="blog-featured__media">
          <OptimizedImage
            src={post.img}
            alt=""
            className="blog-featured__image"
            width={1200}
            height={720}
            sizes="(max-width: 1024px) 100vw, 65vw"
          />
          <div className="blog-featured__overlay" aria-hidden />
          <span className="blog-featured__badge">Featured story</span>
        </div>

        <div className="blog-featured__body">
          <div className="blog-featured__meta">
            <span className="blog-post-card__category">{post.category}</span>
            <time dateTime={post.dateISO} className="blog-post-card__date">
              {post.date}
            </time>
            <span className="blog-post-card__read">{post.readTime}</span>
          </div>
          <h2 className="blog-featured__title">{post.title}</h2>
          <p className="blog-featured__excerpt">{post.excerpt}</p>
          <span className="blog-read-link">
            Read editorial
            <span className="blog-read-link__arrow" aria-hidden>
              →
            </span>
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
