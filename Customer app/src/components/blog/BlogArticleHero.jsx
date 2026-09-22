import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { OptimizedImage } from "../ui/OptimizedImage";
import {
  BLOG_COVER_IMAGE_HEIGHT,
  BLOG_COVER_IMAGE_WIDTH,
} from "../../data/blogImageSpec.js";

/**
 * Mirrors admin Blog edit structure:
 * Cover → Category / Date / Read time → Title → Excerpt → Author
 */
export function BlogArticleHero({ post }) {
  const reduce = useReducedMotion();

  return (
    <header className="blog-article-hero">
      <nav className="blog-article-hero__breadcrumb" aria-label="Breadcrumb">
        <Link to="/" className="transition-colors hover:text-emerald-800/80">
          Home
        </Link>
        <span className="mx-2 opacity-40" aria-hidden>
          /
        </span>
        <Link to="/blog" className="transition-colors hover:text-emerald-800/80">
          Journal
        </Link>
        <span className="mx-2 opacity-40" aria-hidden>
          /
        </span>
        <span className="line-clamp-1 text-emerald-900/45">{post.title}</span>
      </nav>

      {post.img ? (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="blog-article-hero__cover"
        >
          <OptimizedImage
            src={post.img}
            alt={post.title}
            pictureClassName="absolute inset-0 block h-full w-full"
            className="blog-article-hero__image"
            width={BLOG_COVER_IMAGE_WIDTH}
            height={BLOG_COVER_IMAGE_HEIGHT}
            sizes="(max-width: 640px) 18rem, 22rem"
            priority
          />
        </motion.div>
      ) : null}

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className="blog-article-hero__meta"
      >
        {post.category ? (
          <span className="blog-article-hero__category">{post.category}</span>
        ) : null}
        {post.date ? (
          <>
            <span className="blog-article-hero__meta-dot" aria-hidden />
            <time dateTime={post.dateISO}>{post.date}</time>
          </>
        ) : null}
        {post.readTime ? (
          <>
            <span className="blog-article-hero__meta-dot" aria-hidden />
            <span>{post.readTime}</span>
          </>
        ) : null}
      </motion.div>

      <motion.h1
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.08 }}
        className="blog-article-hero__title"
      >
        {post.title}
      </motion.h1>

      {post.excerpt ? (
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="blog-article-hero__excerpt"
        >
          {post.excerpt}
        </motion.p>
      ) : null}

      {post.author ? (
        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={reduce ? undefined : { opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="blog-article-hero__byline"
        >
          <span className="blog-article-hero__byline-rule" aria-hidden />
          By <span>{post.author}</span>
        </motion.p>
      ) : null}

      <div className="blog-article-hero__rule" aria-hidden />
    </header>
  );
}
