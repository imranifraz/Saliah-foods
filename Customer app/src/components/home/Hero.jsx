import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useHomeContent } from "../../context/HomeContentContext.jsx";
import { resolveMediaUrl } from "../../lib/api.js";
import { OptimizedImage } from "../ui/OptimizedImage";
import { HeroShippingOffer } from "./HeroShippingOffer.jsx";
import { RichText } from "../ui/RichText.jsx";

const SLIDE_MS = 5500;
const HERO_POSTER_FALLBACK = "/assets/hero-banner.webp";

function isVideoSlide(slide) {
  if (!slide) return false;
  if (slide.type === "video" || slide.mediaType === "video" || slide.kind === "video") return true;
  const src = slide.src || slide.image || slide.video || "";
  return /\.(mp4|webm|mov|m4v)(?:$|\?)/i.test(src);
}

function slideSrc(slide) {
  return slide?.src || slide?.image || slide?.video || "";
}

function HeroBannerCarousel({ banners, reduce }) {
  const slides = useMemo(
    () => (Array.isArray(banners) ? banners : []).filter((b) => slideSrc(b)),
    [banners]
  );
  const slideKey = slides.map((s) => `${s.id ?? ""}:${slideSrc(s)}:${s.type ?? ""}`).join("|");
  const [index, setIndex] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const videoRefs = useRef({});

  useEffect(() => {
    setIndex(0);
  }, [slideKey]);

  // Defer video bytes until after first paint so LCP can be the poster/image.
  useEffect(() => {
    let idleId = 0;
    let timeoutId = 0;
    const enable = () => setVideoReady(true);
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(enable, { timeout: 1800 });
    } else {
      timeoutId = window.setTimeout(enable, 900);
    }
    return () => {
      if (idleId && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [slideKey]);

  const safeIndex = slides.length ? index % slides.length : 0;
  const activeSlide = slides[safeIndex];

  // Warm only the next image slide — avoid downloading the full carousel on first paint.
  useEffect(() => {
    if (typeof Image === "undefined" || slides.length <= 1) return;
    const next = slides[(safeIndex + 1) % slides.length];
    if (!next || isVideoSlide(next)) return;
    const url = resolveMediaUrl(slideSrc(next));
    if (!url) return;
    const img = new Image();
    img.src = url;
  }, [safeIndex, slideKey, slides]);

  // Auto-advance: timed for images; videos advance on ended (with timed fallback).
  useEffect(() => {
    if (slides.length <= 1) return undefined;
    if (isVideoSlide(activeSlide)) {
      if (!videoReady) {
        const timer = window.setTimeout(() => {
          setIndex((current) => (current + 1) % slides.length);
        }, SLIDE_MS);
        return () => window.clearTimeout(timer);
      }
      const fallback = window.setTimeout(() => {
        setIndex((current) => (current + 1) % slides.length);
      }, 20000);
      return () => window.clearTimeout(fallback);
    }
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [slides.length, slideKey, safeIndex, activeSlide, videoReady]);

  // Play active video; pause others.
  useEffect(() => {
    if (!videoReady) return;
    slides.forEach((slide, si) => {
      if (!isVideoSlide(slide)) return;
      const el = videoRefs.current[slide.id ?? si];
      if (!el) return;
      if (si === safeIndex) {
        el.currentTime = 0;
        const playPromise = el.play();
        if (playPromise?.catch) playPromise.catch(() => {});
      } else {
        el.pause();
      }
    });
  }, [safeIndex, slideKey, slides, videoReady]);

  if (slides.length === 0) return null;

  return (
    <>
      {slides.map((slide, si) => {
        const active = si === safeIndex;
        const src = slideSrc(slide);
        const video = isVideoSlide(slide);
        // Keep adjacent slide mounted for crossfade; skip distant videos/images.
        const near = Math.abs(si - safeIndex) <= 1 || (safeIndex === 0 && si === slides.length - 1);
        if (!active && !near) return null;
        const showVideo = video && videoReady && active;
        return (
          <div
            key={slide.id ?? src ?? si}
            className={`absolute inset-0 transition-opacity ease-out ${
              reduce ? "duration-0" : "duration-700"
            } ${active ? "opacity-100" : "opacity-0"}`}
            aria-hidden={!active}
          >
            {showVideo ? (
              <video
                ref={(node) => {
                  videoRefs.current[slide.id ?? si] = node;
                }}
                className="h-full w-full object-cover object-center max-sm:scale-[1.35] max-sm:origin-center sm:object-[68%_center] md:object-[70%_center]"
                src={resolveMediaUrl(src)}
                poster={slide.poster ? resolveMediaUrl(slide.poster) : undefined}
                muted
                playsInline
                loop={slides.length === 1}
                preload="metadata"
                onEnded={() => {
                  if (slides.length <= 1) return;
                  if (si === safeIndex) setIndex((current) => (current + 1) % slides.length);
                }}
                aria-label={slide.alt || "Saliah Foods banner video"}
              />
            ) : (
              <OptimizedImage
                src={video ? slide.poster || HERO_POSTER_FALLBACK : src}
                alt={slide.alt || "Saliah Foods hero banner"}
                className="h-full w-full object-cover object-center max-sm:scale-[1.35] max-sm:origin-center sm:object-[68%_center] md:object-[70%_center]"
                priority={si === 0 || active}
                sizes="100vw"
                width={1600}
                height={900}
              />
            )}
          </div>
        );
      })}

      {slides.length > 1 ? (
        <div className="absolute bottom-20 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-8 sm:left-auto sm:right-10 sm:translate-x-0">
          {slides.map((slide, si) => (
            <button
              key={slide.id ?? slideSrc(slide) ?? si}
              type="button"
              className={`h-2 rounded-full transition-[width,background-color] duration-300 ${
                si === safeIndex ? "w-7 bg-gold-400" : "w-2 bg-cream-50/70"
              }`}
              aria-label={`Show banner ${si + 1}`}
              aria-current={si === safeIndex}
              onClick={() => setIndex(si)}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}

export function Hero() {
  const reduce = useReducedMotion();
  const { content } = useHomeContent();
  const { hero } = content;

  return (
    <section
      className="relative min-h-[min(100svh,52rem)] overflow-hidden bg-cream-100 sm:min-h-[100svh]"
      aria-labelledby="hero-title"
    >
      <div className="absolute inset-0">
        <HeroBannerCarousel banners={hero.banners} reduce={reduce} />
        {/* Mobile: soft top, stronger mid/lower cream for type; desktop: left→right fade */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-cream-100/25 via-cream-100/70 to-cream-100/55 sm:bg-gradient-to-r sm:from-cream-100/90 sm:via-cream-100/55 sm:to-transparent md:via-cream-100/40"
          aria-hidden
        />
        <div
          className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-cream-100/80 to-transparent sm:hidden"
          aria-hidden
        />
      </div>

      <div className="section-container relative z-20 flex min-h-[min(100svh,52rem)] flex-col justify-end pb-14 pt-[calc(var(--site-header)+1rem)] sm:min-h-[100svh] sm:justify-center sm:pb-20 sm:pt-[calc(var(--site-header)+0.5rem)] md:pb-24">
        <div className="w-full max-w-xl sm:mt-6 md:mt-16 md:max-w-2xl lg:mt-20">
          <h1
            id="hero-title"
            className="max-w-[13ch] text-balance font-display text-[clamp(1.65rem,7.2vw,2.35rem)] font-medium leading-[1.12] tracking-tight text-emerald-950 sm:max-w-[16ch] sm:text-[clamp(1.875rem,5vw,4rem)] sm:leading-[1.1]"
          >
            {hero.title}
          </h1>

          <div className="mt-3 max-w-md font-body text-[0.9375rem] leading-relaxed text-emerald-900/80 sm:mt-5 sm:max-w-lg sm:text-base md:text-lg">
            <RichText html={hero.subtitle} />
          </div>

          <motion.div
            className="mt-6 flex w-full flex-col gap-2.5 sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:gap-3"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
          >
            <a
              href={hero.primaryCta.href}
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full gradient-gold px-6 py-3.5 font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-md shadow-gold-500/25 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] sm:w-auto sm:px-7 sm:text-[11px] sm:tracking-[0.16em]"
            >
              {hero.primaryCta.label}
            </a>
            <a
              href={hero.secondaryCta.href}
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-full border border-emerald-900/15 bg-cream-50/95 px-6 py-3.5 font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-900 transition-colors hover:bg-cream-50 sm:w-auto sm:px-7 sm:text-[11px] sm:tracking-[0.16em]"
            >
              {hero.secondaryCta.label}
            </a>
          </motion.div>

          {hero.trustLine?.length > 0 ? (
            <motion.ul
              className="mt-5 flex flex-wrap items-center gap-2 sm:mt-8 sm:gap-x-3 sm:gap-y-2"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              {hero.trustLine.map((line) => (
                <li
                  key={line}
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-900/10 bg-cream-50/85 px-2.5 py-1 font-body text-[9px] font-semibold uppercase tracking-[0.1em] text-emerald-900/65 sm:gap-2 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:text-[10px] sm:tracking-[0.16em]"
                >
                  <span className="h-1 w-1 shrink-0 rounded-full bg-gold-500 sm:hidden" aria-hidden />
                  {line}
                </li>
              ))}
            </motion.ul>
          ) : null}
        </div>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-10 overflow-hidden sm:h-16"
        aria-hidden
      >
        <svg
          viewBox="0 0 1440 56"
          preserveAspectRatio="none"
          className="absolute bottom-0 h-full w-full"
        >
          <path
            d="M0,32 C360,56 1080,8 1440,32 L1440,56 L0,56 Z"
            fill="var(--color-cream-100, #FAF7F2)"
          />
        </svg>
      </div>

      <HeroShippingOffer />
    </section>
  );
}
