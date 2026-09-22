import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { blogPosts, getBlogPostPath } from "../../data/blog";
import {
  BLOG_COVER_IMAGE_HEIGHT,
  BLOG_COVER_IMAGE_WIDTH,
} from "../../data/blogImageSpec.js";
import { OptimizedImage } from "../ui/OptimizedImage";
import { SectionHeader } from "../ui/SectionHeader";
import { Reveal } from "../ui/Reveal";

export function BlogPosts() {
  return (
    <section id="blog" className="section-pad bg-cream-50" aria-labelledby="blog-title">
      <div className="section-container">
        <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <SectionHeader
            id="blog-title"
            align="left"
            title="From Our Journal"
            subtitle="Tips on dates, natural sweeteners, and traditional wellness foods for everyday living."
            className="max-w-3xl"
          />
          <Link
            to="/blog"
            className="shrink-0 self-start font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-800 underline-offset-4 hover:underline sm:self-auto"
          >
            View all posts
          </Link>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-12 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          {blogPosts.map((post, i) => (
            <motion.article
              key={post.id}
              className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-luxury transition-shadow hover:shadow-luxury-lg"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.65, delay: i * 0.08 }}
            >
              <Link
                to={getBlogPostPath(post.id)}
                className="relative block aspect-square overflow-hidden bg-cream-100"
              >
                <OptimizedImage
                  src={post.img}
                  alt={post.title}
                  pictureClassName="absolute inset-0 block h-full w-full"
                  className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                  width={BLOG_COVER_IMAGE_WIDTH}
                  height={BLOG_COVER_IMAGE_HEIGHT}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={i < 3}
                />
                <span className="absolute left-3 top-3 rounded-full bg-cream-50/95 px-2.5 py-1 font-body text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-900">
                  {post.category}
                </span>
              </Link>

              <div className="flex flex-1 flex-col p-4 sm:p-5 md:p-6">
                <time className="font-body text-[10px] uppercase tracking-[0.16em] text-emerald-900/45">
                  {post.date}
                </time>
                <h3 className="mt-2 font-display text-base font-medium leading-snug text-emerald-900 group-hover:text-emerald-800 sm:text-lg">
                  <Link to={getBlogPostPath(post.id)}>{post.title}</Link>
                </h3>
                <p className="mt-2 flex-1 font-body text-sm leading-relaxed text-emerald-900/65">{post.excerpt}</p>
                <Link
                  to={getBlogPostPath(post.id)}
                  className="mt-4 inline-flex font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-600 transition-colors hover:text-emerald-800"
                >
                  Read more →
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
