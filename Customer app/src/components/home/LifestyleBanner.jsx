import { motion } from "framer-motion";
import { Reveal } from "../ui/Reveal";

export function LifestyleBanner() {
  return (
    <section className="relative overflow-hidden py-8 md:py-12" aria-label="Lifestyle">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <Reveal>
          <motion.div
            className="relative min-h-[420px] overflow-hidden rounded-[2rem] md:min-h-[520px]"
            whileHover={{ scale: 1.005 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src="https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1600&q=85"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/85 via-emerald-950/50 to-transparent" />
            <div className="relative flex min-h-[420px] flex-col justify-center px-8 py-16 md:min-h-[520px] md:px-16 md:py-20">
              <p className="font-body text-[11px] uppercase tracking-[0.3em] text-gold-300">
                The Saliah ritual
              </p>
              <h2 className="mt-4 max-w-lg font-display text-[clamp(2rem,4vw,3rem)] font-medium leading-tight text-cream-50">
                From morning nourishment to evening hospitality
              </h2>
              <p className="mt-4 max-w-md font-body text-base text-cream-50/75">
                Dates, nuts, and preserves that elevate everyday moments into ceremonies of taste — crafted for
                homes that value authenticity and grace.
              </p>
              <a
                href="#collections"
                className="mt-8 inline-flex w-fit rounded-full border border-cream-50/30 px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-cream-50 transition-colors hover:bg-cream-50/10"
              >
                Discover the collection
              </a>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
