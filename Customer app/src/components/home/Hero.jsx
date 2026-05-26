import { motion, useReducedMotion } from "framer-motion";
import { homepageImages } from "../../data/homepage";
import { OptimizedImage } from "../ui/OptimizedImage";

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section
      className="relative min-h-[100svh] overflow-hidden bg-cream-100"
      aria-labelledby="hero-title"
    >
      <div className="absolute inset-0">
        <OptimizedImage
          src={homepageImages.hero}
          alt="Saliah Foods premium dates with nuts, figs, and grapes on marble"
          className="h-full w-full object-cover object-[72%_center] sm:object-[68%_center] md:object-[70%_center]"
          priority
          sizes="100vw"
          width={1600}
          height={900}
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-cream-100/95 via-cream-100/75 to-cream-100/20 sm:from-cream-100/90 sm:via-cream-100/55 sm:to-transparent md:via-cream-100/40"
          aria-hidden
        />
      </div>

      <div className="section-container relative z-10 flex min-h-[calc(100svh-var(--site-header)-1rem)] flex-col justify-center pb-10 pt-[calc(var(--site-header)+1rem)] sm:pb-14 md:pb-16">
        <motion.h1
          id="hero-title"
          className="max-w-[14ch] text-balance font-display text-[clamp(1.875rem,6vw,4rem)] font-medium leading-[1.1] text-emerald-950 sm:max-w-[16ch]"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.1 }}
        >
          Premium Dates &amp; Natural Wellness Foods
        </motion.h1>

        <motion.p
          className="mt-4 max-w-lg font-body text-[15px] leading-relaxed text-emerald-900/75 sm:mt-5 sm:text-base md:text-lg"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.2 }}
        >
          Discover carefully selected dates, date-based products, traditional wellness foods, and naturally
          sweet everyday essentials from Saliah Foods.
        </motion.p>

        <motion.div
          className="mt-7 flex w-full max-w-md flex-col gap-3 sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.3 }}
        >
          <a
            href="#premium-dates"
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full gradient-gold px-7 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-md shadow-gold-500/25 sm:w-auto"
          >
            Shop Premium Dates
          </a>
          <a
            href="#wellness-products"
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-emerald-900/15 bg-cream-50/90 px-7 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-900 transition-colors hover:bg-cream-50 sm:w-auto"
          >
            Explore Wellness Foods
          </a>
        </motion.div>

        <motion.p
          className="mt-6 flex max-w-md flex-wrap gap-x-3 gap-y-1 font-body text-[10px] font-medium uppercase tracking-[0.14em] text-emerald-900/50 sm:mt-8 sm:text-[11px] sm:tracking-[0.18em]"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.85, delay: 0.45 }}
        >
          <span>Freshly Packed</span>
          <span className="text-emerald-900/25" aria-hidden>
            ·
          </span>
          <span>Natural Ingredients</span>
          <span className="text-emerald-900/25" aria-hidden>
            ·
          </span>
          <span>Secure Checkout</span>
        </motion.p>
      </div>
    </section>
  );
}
