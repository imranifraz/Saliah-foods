import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useHomeContent } from "../../context/HomeContentContext.jsx";
import { resolveMediaUrl } from "../../lib/api.js";
import Threads from "../effects/Threads.jsx";
import { OptimizedImage } from "../ui/OptimizedImage";

const SLIDE_MS = 5500;

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size: 3 + (i % 5) * 2,
  x: 5 + ((i * 37) % 90),
  y: 10 + ((i * 53) % 80),
  delay: (i * 0.35) % 3,
  duration: 4 + (i % 4),
  opacity: 0.12 + (i % 3) * 0.06,
}));

function FloatingParticles({ reduce }) {
  if (reduce) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden>
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-gold-400"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -22, 0, 14, 0],
            x: [0, 8, -6, 4, 0],
            scale: [1, 1.3, 0.85, 1.15, 1],
            opacity: [p.opacity, p.opacity * 2.5, p.opacity, p.opacity * 1.8, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function HeroBannerCarousel({ banners, reduce }) {
  const [index, setIndex] = useState(0);
  const slides = banners.filter((b) => b.image);

  useEffect(() => {
    if (slides.length <= 1 || reduce) return undefined;
    const timer = window.setInterval(() => {
      setIndex((c) => (c + 1) % slides.length);
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [slides.length, reduce]);

  if (slides.length === 0) return null;
  const active = slides[index] ?? slides[0];

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id ?? active.image}
          className="absolute inset-0"
          initial={reduce ? false : { opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduce ? undefined : { opacity: 0, scale: 1.02 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <OptimizedImage
            src={resolveMediaUrl(active.image)}
            alt={active.alt || "Saliah Foods hero banner"}
            className="h-full w-full object-cover object-[72%_center] sm:object-[68%_center] md:object-[70%_center]"
            priority
            sizes="100vw"
            width={1600}
            height={900}
          />
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 ? (
        <div className="absolute bottom-6 right-6 z-20 flex gap-2 sm:bottom-8 sm:right-10">
          {slides.map((slide, si) => (
            <motion.button
              key={slide.id ?? slide.image}
              type="button"
              className={`h-2 rounded-full transition-all ${
                si === index ? "bg-gold-400" : "bg-cream-50/70"
              }`}
              animate={{ width: si === index ? 28 : 8 }}
              transition={{ duration: 0.35 }}
              aria-label={`Show banner ${si + 1}`}
              aria-current={si === index}
              onClick={() => setIndex(si)}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}

function WordReveal({ text, reduce, baseDelay = 0.15 }) {
  const words = text.split(" ");
  return (
    <span className="inline" aria-label={text}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="inline-block mr-[0.25em]"
          initial={reduce ? false : { opacity: 0, y: 28, rotateX: -40 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.65,
            delay: baseDelay + i * 0.07,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ transformOrigin: "bottom center" }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

export function Hero() {
  const reduce = useReducedMotion();
  const { content } = useHomeContent();
  const { hero } = content;
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] overflow-hidden bg-cream-100"
      aria-labelledby="hero-title"
    >
      <motion.div className="absolute inset-0" style={reduce ? {} : { y: bgY }}>
        <HeroBannerCarousel banners={hero.banners} reduce={reduce} />
        <div
          className="absolute inset-0 bg-gradient-to-r from-cream-100/95 via-cream-100/75 to-cream-100/20 sm:from-cream-100/90 sm:via-cream-100/55 sm:to-transparent md:via-cream-100/40"
          aria-hidden
        />
      </motion.div>

      {/* React Bits "Threads" shader overlay (subtle). */}
      <div className="pointer-events-none absolute inset-0 z-10 opacity-[0.22] mix-blend-soft-light">
        <Threads amplitude={1} distance={0} enableMouseInteraction={!reduce} />
      </div>

      <FloatingParticles reduce={reduce} />

      <motion.div
        className="section-container relative z-20 flex min-h-[calc(100svh-var(--site-header)-1rem)] flex-col justify-center pb-10 pt-[calc(var(--site-header)+1rem)] sm:pb-14 md:pb-16"
        style={reduce ? {} : { y: textY }}
      >
        <div style={{ perspective: 900 }}>
          <h1
            id="hero-title"
            className="max-w-[14ch] text-balance font-display text-[clamp(1.875rem,6vw,4rem)] font-medium leading-[1.1] text-emerald-950 sm:max-w-[16ch]"
          >
            {reduce ? hero.title : <WordReveal text={hero.title} reduce={reduce} baseDelay={0.1} />}
          </h1>
        </div>

        <motion.p
          className="mt-4 max-w-lg font-body text-[15px] leading-relaxed text-emerald-900/75 sm:mt-5 sm:text-base md:text-lg"
          initial={reduce ? false : { opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.85, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {hero.subtitle}
        </motion.p>

        <motion.div
          className="mt-7 flex w-full max-w-md flex-col gap-3 sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.72 }}
        >
          <motion.a
            href={hero.primaryCta.href}
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full gradient-gold px-7 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-md shadow-gold-500/25 sm:w-auto"
            whileHover={{ scale: 1.05, boxShadow: "0 8px 30px rgba(202,147,55,0.45)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
          >
            {hero.primaryCta.label}
          </motion.a>
          <motion.a
            href={hero.secondaryCta.href}
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-emerald-900/15 bg-cream-50/90 px-7 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-900 transition-colors hover:bg-cream-50 sm:w-auto"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
          >
            {hero.secondaryCta.label}
          </motion.a>
        </motion.div>

        {hero.trustLine?.length > 0 ? (
          <motion.p
            className="mt-6 flex max-w-md flex-wrap gap-x-3 gap-y-1 font-body text-[10px] font-medium uppercase tracking-[0.14em] text-emerald-900/50 sm:mt-8 sm:text-[11px] sm:tracking-[0.18em]"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            {hero.trustLine.map((line, li) => (
              <span key={line} className="inline-flex items-center gap-3">
                {li > 0 ? (
                  <span className="text-emerald-900/25" aria-hidden>·</span>
                ) : null}
                <motion.span
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.95 + li * 0.12 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </motion.p>
        ) : null}
      </motion.div>

      {/* Animated bottom wave */}
      {!reduce ? (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-16 overflow-hidden" aria-hidden>
          <motion.svg
            viewBox="0 0 1440 56"
            preserveAspectRatio="none"
            className="absolute bottom-0 h-16 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
          >
            <motion.path
              d="M0,32 C360,56 1080,8 1440,32 L1440,56 L0,56 Z"
              fill="var(--color-cream-100, #FAF7F2)"
              animate={{ d: [
                "M0,32 C360,56 1080,8 1440,32 L1440,56 L0,56 Z",
                "M0,20 C360,44 1080,20 1440,20 L1440,56 L0,56 Z",
                "M0,32 C360,56 1080,8 1440,32 L1440,56 L0,56 Z",
              ] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.svg>
        </div>
      ) : null}
    </section>
  );
}
