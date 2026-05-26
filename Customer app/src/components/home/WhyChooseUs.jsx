import { motion } from "framer-motion";
import { Reveal } from "../ui/Reveal";

const pillars = [
  {
    title: "Heritage sourcing",
    text: "Arabian date traditions meet rigorous selection — from black and seedless lines to Kimia, Ajwa, and Safawi.",
  },
  {
    title: "Sealed freshness",
    text: "Humidity-aware packaging designed for transit integrity and shelf presence worthy of gifting.",
  },
  {
    title: "Label clarity",
    text: "Honest weights, transparent ingredients, and packs that speak with quiet confidence.",
  },
  {
    title: "Global appeal",
    text: "International presentation standards — refined for export tables and discerning domestic patrons.",
  },
];

export function WhyChooseUs() {
  return (
    <section
      id="sourcing-quality"
      className="relative overflow-hidden bg-cream-100 py-24 md:py-32"
      aria-labelledby="why-title"
    >
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-gold-400/10 blur-3xl" aria-hidden />
      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-body text-[11px] font-medium uppercase tracking-[0.3em] text-gold-600">
            Why Saliah
          </p>
          <h2 id="why-title" className="mt-4 font-display text-[clamp(2rem,4vw,3rem)] font-medium text-emerald-900">
            Sourcing &amp; quality, without compromise
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              className="glass-luxury group rounded-2xl p-8 shadow-luxury transition-shadow duration-500 hover:shadow-luxury-lg"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
            >
              <span className="font-display text-4xl font-medium text-gold-500/40 transition-colors group-hover:text-gold-500/70">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-xl font-medium text-emerald-900">{p.title}</h3>
              <p className="mt-3 font-body text-sm leading-relaxed text-emerald-900/65">{p.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
