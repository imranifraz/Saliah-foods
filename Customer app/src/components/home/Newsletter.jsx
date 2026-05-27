import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "../ui/Reveal";

export function Newsletter() {
  const [focused, setFocused] = useState(false);
  const reduce = useReducedMotion();

  return (
    <section id="newsletter" className="section-pad bg-cream-100" aria-labelledby="newsletter-title">
      <div className="section-container">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl marble-texture px-4 py-10 shadow-luxury sm:px-8 sm:py-12 md:px-14 md:py-16">
            {/* Shimmer sweep */}
            {!reduce ? (
              <motion.div
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)",
                  backgroundSize: "200% 100%",
                }}
                animate={{ backgroundPositionX: ["200%", "-200%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                aria-hidden
              />
            ) : null}

            <div
              className="absolute inset-0 bg-gradient-to-br from-gold-400/10 via-transparent to-emerald-800/5"
              aria-hidden
            />

            <div className="relative z-10 mx-auto max-w-xl text-center">
              <motion.p
                className="font-body text-[11px] font-medium uppercase tracking-[0.28em] text-gold-600"
                initial={reduce ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Newsletter
              </motion.p>
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
                <motion.input
                  id="newsletter-email"
                  type="email"
                  required
                  placeholder="Your email address"
                  className="min-h-[48px] w-full flex-1 rounded-full border border-emerald-900/10 bg-white/80 px-5 font-body text-sm text-emerald-900 outline-none transition-shadow focus:border-gold-500/40 focus:ring-2 focus:ring-gold-400/20 sm:min-h-[52px] sm:px-6"
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  animate={reduce ? {} : { scale: focused ? 1.02 : 1 }}
                  transition={{ type: "spring", stiffness: 340, damping: 22 }}
                />

                <div className="relative shrink-0">
                  <motion.button
                    type="submit"
                    className="relative min-h-[48px] w-full overflow-hidden rounded-full gradient-gold px-8 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-md shadow-gold-500/25 sm:min-h-[52px] sm:w-auto"
                    whileHover={reduce ? {} : { scale: 1.05, boxShadow: "0 8px 30px rgba(202,147,55,0.5)" }}
                    whileTap={reduce ? {} : { scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 380, damping: 20 }}
                  >
                    {/* Pulse ring */}
                    {!reduce ? (
                      <motion.span
                        className="pointer-events-none absolute inset-0 rounded-full border-2 border-gold-400/60"
                        animate={{ scale: [1, 1.35], opacity: [0.7, 0] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                        aria-hidden
                      />
                    ) : null}
                    Subscribe
                  </motion.button>
                </div>
              </form>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
