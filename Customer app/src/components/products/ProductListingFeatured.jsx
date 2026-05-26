import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { OptimizedImage } from "../ui/OptimizedImage";

export function ProductListingFeatured() {
  const reduce = useReducedMotion();

  return (
    <motion.li
      className="col-span-full my-2 sm:my-3"
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="group relative overflow-hidden rounded-2xl border border-cream-200/70 shadow-[0_8px_32px_rgba(22,49,42,0.08)]">
        <div className="relative min-h-[14rem] sm:min-h-[16rem] md:min-h-[18rem]">
          <OptimizedImage
            src="/assets/premium-dates-category.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            width={1200}
            height={600}
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-emerald-950/75 via-emerald-900/45 to-emerald-900/15"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-emerald-950/30 via-transparent to-transparent"
            aria-hidden
          />

          <div className="relative flex h-full min-h-[inherit] flex-col justify-center px-6 py-8 sm:px-10 sm:py-10 md:px-14">
            <p className="font-body text-[10px] font-medium uppercase tracking-[0.24em] text-cream-50/55">
              Curated Selection
            </p>
            <h2 className="mt-2 max-w-md font-display text-[clamp(1.5rem,2.8vw,2.125rem)] font-medium leading-tight tracking-tight text-cream-50">
              Premium Gift Collection
            </h2>
            <p className="mt-3 max-w-lg font-body text-[13px] leading-relaxed tracking-wide text-cream-50/70 sm:text-[14px]">
              Thoughtfully curated gourmet date selections for luxury gifting and festive occasions.
            </p>
            <Link
              to="/products/premium-dates"
              className="mt-6 inline-flex w-fit items-center rounded-full border border-cream-50/25 bg-cream-50/10 px-7 py-3 font-body text-[10px] font-medium uppercase tracking-[0.2em] text-cream-50 backdrop-blur-sm transition-all duration-300 hover:border-cream-50/40 hover:bg-cream-50/20"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </div>
    </motion.li>
  );
}
