import { motion } from "framer-motion";
import { shopCollections } from "../../data/catalog";
import { Reveal } from "../ui/Reveal";

export function Collections() {
  return (
    <section id="collections" className="bg-emerald-950 py-24 md:py-32" aria-labelledby="collections-title">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-body text-[11px] font-medium uppercase tracking-[0.3em] text-gold-400">
            Curated lanes
          </p>
          <h2
            id="collections-title"
            className="mt-4 font-display text-[clamp(2rem,4vw,3.25rem)] font-medium text-cream-50"
          >
            Luxury collections
          </h2>
          <p className="mt-4 font-body text-cream-50/65">
            Editorial groupings drawn from your master catalogue — dates, preserves, and gourmet pantry.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:gap-6">
          {shopCollections.map((c, i) => (
            <motion.a
              key={c.label}
              href={c.href}
              className="group relative flex min-h-[280px] overflow-hidden rounded-2xl md:min-h-[340px]"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <img
                src={c.img}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/30 to-transparent" />
              <div className="relative mt-auto flex flex-col p-8 md:p-10">
                <span className="font-body text-[10px] uppercase tracking-[0.25em] text-gold-300">
                  Collection {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-display text-2xl font-medium text-cream-50 md:text-3xl">{c.label}</h3>
                <p className="mt-2 max-w-md font-body text-sm text-cream-50/70">{c.meta}</p>
                <span className="mt-6 inline-flex items-center gap-2 font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Discover <span aria-hidden>→</span>
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
