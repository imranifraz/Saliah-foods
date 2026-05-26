import { motion } from "framer-motion";
import { Reveal } from "../ui/Reveal";

export function BrandStory() {
  return (
    <section id="about-us" className="relative overflow-hidden py-24 md:py-32" aria-labelledby="story-title">
      <motion.div className="marble-texture absolute inset-0 opacity-60" aria-hidden />
      <div className="relative mx-auto grid max-w-[1440px] gap-16 px-5 md:grid-cols-2 md:items-center md:gap-20 md:px-10">
        <Reveal className="order-2 md:order-1">
          <p className="font-body text-[11px] font-medium uppercase tracking-[0.3em] text-gold-600">
            Our heritage
          </p>
          <h2
            id="story-title"
            className="mt-4 font-display text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-tight text-emerald-900"
          >
            Rooted in Arabian tradition. Refined for the modern gourmet.
          </h2>
          <p className="mt-6 font-body text-base leading-relaxed text-emerald-900/70 md:text-lg">
            Saliah Foods brings together generations of date cultivation with contemporary packaging and
            international standards. From black and seedless varieties to Kimia, Ajwa, and Safawi — each
            selection is chosen for depth of flavour, honest labelling, and presentation worthy of gifting.
          </p>
          <p className="mt-4 font-accent text-xl italic text-emerald-800/80">
            &ldquo;Quiet luxury begins at the harvest.&rdquo;
          </p>
          <a
            href="#sourcing-quality"
            className="mt-8 inline-flex items-center gap-3 font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-800 transition-colors hover:text-gold-600"
          >
            Sourcing &amp; quality
            <span aria-hidden>→</span>
          </a>
        </Reveal>

        <Reveal className="order-1 md:order-2" delay={0.15}>
          <div className="relative">
            <div
              className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-gold-400/20 to-emerald-800/10 blur-2xl"
              aria-hidden
            />
            <motion.div
              className="relative overflow-hidden rounded-[1.75rem] shadow-luxury-lg"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <img
                src="https://images.unsplash.com/photo-1607623488235-d48b4c652a95?auto=format&fit=crop&w=1100&q=85"
                alt="Premium dates arranged on marble"
                className="aspect-[4/5] w-full object-cover"
                loading="lazy"
              />
            </motion.div>
            <motion.div
              className="absolute -bottom-6 -left-4 glass-luxury rounded-2xl px-6 py-5 shadow-luxury md:-left-8"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.7 }}
            >
              <p className="font-display text-3xl font-medium text-emerald-900">50+</p>
              <p className="font-body text-[10px] uppercase tracking-[0.2em] text-emerald-800/70">
                Curated SKUs
              </p>
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
