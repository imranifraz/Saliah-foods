import { motion, useReducedMotion } from "framer-motion";
import { useHomeContent } from "../../context/HomeContentContext.jsx";
import { Reveal } from "../ui/Reveal";

const SPARKLE_POSITIONS = [
  { top: "12%", left: "8%", size: 14, delay: 0 },
  { top: "68%", left: "92%", size: 10, delay: 0.6 },
  { top: "85%", left: "14%", size: 8, delay: 1.1 },
  { top: "20%", left: "88%", size: 12, delay: 0.3 },
  { top: "50%", left: "3%", size: 6, delay: 0.9 },
  { top: "35%", left: "96%", size: 9, delay: 1.4 },
];

function Sparkle({ top, left, size, delay, reduce }) {
  if (reduce) return null;
  return (
    <motion.div
      className="pointer-events-none absolute"
      style={{ top, left }}
      aria-hidden
      animate={{ scale: [0.7, 1.3, 0.7], opacity: [0.25, 0.85, 0.25], rotate: [0, 180, 360] }}
      transition={{ duration: 3.5, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-gold-400">
        <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" />
      </svg>
    </motion.div>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.94, filter: "blur(4px)" },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.75, delay: i * 0.13, ease: [0.22, 1, 0.36, 1] },
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
      className="relative section-pad bg-emerald-900 overflow-hidden"
      aria-labelledby="testimonials-title"
    >
      {/* Ambient glow blobs */}
      {!reduce ? (
        <>
          <motion.div
            className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gold-400/8 blur-3xl"
            animate={{ scale: [1, 1.18, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          />
          <motion.div
            className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-emerald-400/6 blur-3xl"
            animate={{ scale: [1, 1.22, 1], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            aria-hidden
          />
        </>
      ) : null}

      {SPARKLE_POSITIONS.map((sp, i) => (
        <Sparkle key={i} {...sp} reduce={reduce} />
      ))}

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
          <p className="mx-auto mt-4 max-w-xl font-body text-sm text-cream-50/65 sm:text-base">
            {testimonials.subtitle}
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
          {quotes.map((t, i) => (
            <motion.blockquote
              key={t.id ?? t.name}
              className="relative flex h-full flex-col rounded-2xl border border-cream-50/10 bg-emerald-950/40 p-5 backdrop-blur-sm sm:p-6 md:p-8"
              custom={i}
              variants={reduce ? {} : cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              whileHover={reduce ? {} : { y: -6, boxShadow: "0 20px 60px rgba(0,0,0,0.35)", borderColor: "rgba(212,168,69,0.3)" }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <motion.span
                className="font-display text-4xl leading-none text-gold-400/40"
                animate={reduce ? {} : { opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 3.5, delay: i * 0.4, repeat: Infinity }}
                aria-hidden
              >
                &ldquo;
              </motion.span>
              <p className="mt-2 flex-1 font-body text-sm leading-relaxed text-cream-50/90 sm:text-base">
                {t.quote}
              </p>
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
