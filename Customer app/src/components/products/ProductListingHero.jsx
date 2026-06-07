import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { OptimizedImage } from "../ui/OptimizedImage";

const HERO_IMAGES = {
  all: "/assets/premium-dates-category.png",
  dates: "/assets/premium-dates-category.png",
  "premium-dates": "/assets/kimia-dates.png",
  "wellness-traditional": "/assets/wellness-foods-category.png",
  "best-sellers": "/assets/ajwa-dates.png",
};

export function ProductListingHero({ label, description, categoryId = "all", endRef }) {
  const reduce = useReducedMotion();
  const image = HERO_IMAGES[categoryId] ?? HERO_IMAGES.all;

  return (
    <section className="mb-3" aria-labelledby="plp-hero-title">
      <div className="overflow-hidden rounded-xl border border-cream-200/80 bg-gradient-to-br from-[#f5ebe0]/90 via-cream-50/95 to-white/75 shadow-[0_3px_20px_rgba(22,49,42,0.05)]">
        <div className="grid md:grid-cols-[1fr_38%]">
          <div className="flex flex-col justify-center px-5 py-5 sm:px-6 sm:py-6 md:py-7">
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="font-body text-[10px] font-medium uppercase tracking-[0.24em] text-emerald-800/45"
            >
              Collection
            </motion.p>
            <motion.h1
              id="plp-hero-title"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.04 }}
              className="mt-2 font-display text-[clamp(2rem,3.5vw,2.875rem)] font-medium leading-[1.08] tracking-tight text-emerald-900"
            >
              {label}
            </motion.h1>
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="mt-2.5 max-w-md font-body text-[14px] leading-relaxed tracking-wide text-emerald-900/52"
            >
              {description}
            </motion.p>
            <div className="mt-4 h-px w-12 bg-gradient-to-r from-gold-500/60 to-transparent" aria-hidden />
          </div>

          <div className="relative hidden min-h-[9.5rem] overflow-hidden md:block lg:min-h-[10.5rem]">
            <OptimizedImage
              src={image}
              alt=""
              className="h-full w-full scale-[1.02] object-cover object-center brightness-[1.03] contrast-[1.06] saturate-[1.08]"
              width={600}
              height={400}
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-[#f5ebe0]/95 via-cream-50/35 to-amber-900/10"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-amber-950/15 via-transparent to-amber-100/10"
              aria-hidden
            />
          </div>
        </div>
      </div>
      <div ref={endRef} className="h-px w-full" aria-hidden />
    </section>
  );
}

export function ProductListingBreadcrumb({ label, categoryId = "all" }) {
  const showCategory = categoryId !== "all";

  return (
    <nav className="mb-2.5 font-body text-[11px] uppercase tracking-[0.16em] text-emerald-900/35" aria-label="Breadcrumb">
      <Link to="/" className="transition-colors hover:text-emerald-800">
        Home
      </Link>
      <span className="mx-2">/</span>
      {showCategory ? (
        <Link to="/products" className="transition-colors hover:text-emerald-800">
          Products
        </Link>
      ) : (
        <span className="text-emerald-900/60">Products</span>
      )}
      {showCategory ? (
        <>
          <span className="mx-2">/</span>
          <span className="text-emerald-900/60">{label}</span>
        </>
      ) : null}
    </nav>
  );
}
