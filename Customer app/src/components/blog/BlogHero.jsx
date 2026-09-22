import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { OptimizedImage } from "../ui/OptimizedImage";

export function BlogHero({ postCount = 0 }) {
  const reduce = useReducedMotion();

  return (
    <section className="blog-hero" aria-labelledby="blog-hero-title">
      <div className="blog-hero__panel">
        <div className="blog-hero__glow blog-hero__glow--gold" aria-hidden />
        <div className="blog-hero__glow blog-hero__glow--emerald" aria-hidden />
        <div className="blog-hero__grid">
          <div className="blog-hero__content">
            <nav className="blog-hero__breadcrumb" aria-label="Breadcrumb">
              <Link to="/" className="transition-colors hover:text-emerald-800/80">
                Home
              </Link>
              <span className="mx-2 opacity-40">/</span>
              <span className="text-emerald-900/50">Journal</span>
            </nav>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="blog-hero__eyebrow"
            >
              The Saliah Journal
            </motion.p>

            <motion.h1
              id="blog-hero-title"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.04 }}
              className="blog-hero__title"
            >
              Stories of dates, wellness &amp; tradition
            </motion.h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="blog-hero__desc"
            >
              Curated essays on premium dates, natural sweeteners, and timeless foods — written for
              the modern table with heritage at heart.
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12 }}
              className="blog-hero__meta"
            >
              <span className="blog-hero__stat">
                <span className="blog-hero__stat-value">{postCount}</span>
                <span className="blog-hero__stat-label">Articles</span>
              </span>
              <span className="blog-hero__divider-v" aria-hidden />
              <span className="blog-hero__tagline font-display italic text-emerald-900/45">
                Craft · Nourish · Savour
              </span>
            </motion.div>

            <div className="blog-hero__rule" aria-hidden />
          </div>

          <div className="blog-hero__visual" aria-hidden>
            <OptimizedImage
              src="/assets/premium-dates-category.webp"
              alt=""
              pictureClassName="absolute inset-0 block h-full w-full"
              className="blog-hero__image"
              width={800}
              height={560}
            />
            <div className="blog-hero__visual-overlay" />
            <div className="blog-hero__frame" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
