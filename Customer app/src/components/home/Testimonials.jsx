import { motion, useReducedMotion } from "framer-motion";
import { useHomeContent } from "../../context/HomeContentContext.jsx";
import { Reveal } from "../ui/Reveal";
import { RichText } from "../ui/RichText.jsx";

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function Testimonials() {
  const { content } = useHomeContent();
  const { testimonials } = content;
  const quotes = testimonials.items ?? [];
  const reduce = useReducedMotion();

  return (
    <section
      id="testimonials"
      className="relative section-pad overflow-hidden bg-emerald-900"
      aria-labelledby="testimonials-title"
    >
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gold-400/10" aria-hidden />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-emerald-700/30" aria-hidden />

      <div className="section-container relative z-10">
        <Reveal className="text-center">
          <p className="font-body text-[11px] font-medium uppercase tracking-[0.28em] text-gold-400">
            {testimonials.eyebrow}
          </p>
          <h2
            id="testimonials-title"
            className="mt-3 font-display text-[clamp(1.75rem,4vw,2.75rem)] font-medium text-cream-50"
          >
            {testimonials.title}
          </h2>
          <RichText
            html={testimonials.subtitle}
            className="mx-auto mt-4 max-w-xl font-body text-sm text-cream-50/65 sm:text-base"
          />
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {quotes.map((t, i) => (
            <motion.blockquote
              key={t.id ?? t.name}
              className="relative flex h-full flex-col rounded-2xl border border-cream-50/10 bg-emerald-950/55 p-5 sm:p-6 md:p-8"
              custom={i}
              variants={reduce ? undefined : cardVariants}
              initial={reduce ? false : "hidden"}
              whileInView={reduce ? undefined : "visible"}
              viewport={{ once: true, margin: "-40px" }}
            >
              <span className="font-display text-4xl leading-none text-gold-400/40" aria-hidden>
                &ldquo;
              </span>
              <RichText
                html={t.quote}
                className="mt-2 flex-1 font-body text-sm leading-relaxed text-cream-50/90 sm:text-base"
              />
              <footer className="mt-5 border-t border-cream-50/10 pt-4 sm:pt-5">
                <cite className="not-italic">
                  <span className="block font-body text-sm font-semibold text-cream-50">{t.name}</span>
                  <span className="font-body text-[10px] uppercase tracking-[0.18em] text-gold-400/80">
                    {t.role}
                  </span>
                </cite>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
