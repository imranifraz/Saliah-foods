import { motion } from "framer-motion";
import { Reveal } from "../ui/Reveal";

export function Newsletter() {
  return (
    <section id="newsletter" className="section-pad bg-cream-100" aria-labelledby="newsletter-title">
      <div className="section-container">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl marble-texture px-4 py-10 shadow-luxury sm:px-8 sm:py-12 md:px-14 md:py-16">
            <div
              className="absolute inset-0 bg-gradient-to-br from-gold-400/10 via-transparent to-emerald-800/5"
              aria-hidden
            />
            <div className="relative mx-auto max-w-xl text-center">
              <p className="font-body text-[11px] font-medium uppercase tracking-[0.28em] text-gold-600">
                Newsletter
              </p>
              <h2
                id="newsletter-title"
                className="mt-3 font-display text-[clamp(1.5rem,4vw,2.75rem)] font-medium text-emerald-900"
              >
                Stay Connected with Saliah Foods
              </h2>
              <p className="mt-3 font-body text-sm text-emerald-900/65 sm:text-base">
                Get updates on new products, seasonal offers, and simple wellness tips — straight to your inbox.
              </p>
              <form
                className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-stretch sm:justify-center"
                onSubmit={(e) => e.preventDefault()}
              >
                <label className="sr-only" htmlFor="newsletter-email">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  placeholder="Your email address"
                  className="min-h-[48px] w-full flex-1 rounded-full border border-emerald-900/10 bg-white/80 px-5 font-body text-sm text-emerald-900 outline-none transition-shadow focus:border-gold-500/40 focus:ring-2 focus:ring-gold-400/20 sm:min-h-[52px] sm:px-6"
                />
                <motion.button
                  type="submit"
                  className="min-h-[48px] w-full shrink-0 rounded-full gradient-gold px-8 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-md shadow-gold-500/25 sm:min-h-[52px] sm:w-auto"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Subscribe
                </motion.button>
              </form>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
