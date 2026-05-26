import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { OptimizedImage } from "../ui/OptimizedImage";

export function BlogArticleHero({ post }) {
  const reduce = useReducedMotion();

  return (
    <header className="blog-article-hero">
      <nav className="blog-article-hero__breadcrumb" aria-label="Breadcrumb">
        <Link to="/" className="transition-colors hover:text-emerald-800/80">
          Home
        </Link>
        <span className="mx-2 opacity-40">/</span>
        <Link to="/blog" className="transition-colors hover:text-emerald-800/80">
          Journal
        </Link>
        <span className="mx-2 opacity-40">/</span>
        <span className="line-clamp-1 text-emerald-900/50">{post.title}</span>
      </nav>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="blog-article-hero__meta"
      >
        <span className="blog-post-card__category">{post.category}</span>
        <time dateTime={post.dateISO} className="blog-post-card__date">
          {post.date}
        </time>
        <span className="blog-post-card__read">{post.readTime}</span>
      </motion.div>

      <motion.h1
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="blog-article-hero__title"
      >
        {post.title}
      </motion.h1>

      <motion.p
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="blog-article-hero__excerpt"
      >
        {post.excerpt}
      </motion.p>

      <motion.p
        initial={reduce ? false : { opacity: 0 }}
        animate={reduce ? undefined : { opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.14 }}
        className="blog-article-hero__byline"
      >
        By <span className="font-medium text-emerald-900/65">{post.author}</span>
      </motion.p>

      <div className="blog-article-hero__cover">
        <OptimizedImage
          src={post.img}
          alt=""
          className="blog-article-hero__image"
          width={1400}
          height={780}
          sizes="100vw"
          priority
        />
        <div className="blog-article-hero__cover-overlay" aria-hidden />
      </div>
    </header>
  );
}
