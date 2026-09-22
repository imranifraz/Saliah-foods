import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { OptimizedImage } from "../ui/OptimizedImage";

export function ProductDetailGallery({ images, productName, badge }) {
  const reduce = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];
  const isCloseup = active?.type === "closeup";
  const total = images.length;

  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  function go(delta) {
    if (total < 2) return;
    setActiveIndex((current) => (current + delta + total) % total);
  }

  return (
    <div className="pdp-gallery">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="pdp-gallery-stage group"
      >
        <div className="pdp-gallery-stage__glow" aria-hidden />
        <div className="pdp-gallery-stage__frame" aria-hidden />

        <div className="pdp-gallery-stage__canvas">
          {badge ? <span className="pdp-gallery-badge">{badge}</span> : null}

          {total > 1 ? (
            <span className="pdp-gallery-count" aria-live="polite">
              {String(activeIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          ) : null}

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active?.id ?? activeIndex}
              className="pdp-gallery-stage__image-wrap"
              initial={reduce ? false : { opacity: 0, scale: 0.985 }}
              animate={reduce ? undefined : { opacity: 1, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, scale: 1.01 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <OptimizedImage
                src={active?.src}
                alt={active?.alt ?? productName}
                className={`pdp-gallery-stage__image ${
                  isCloseup ? "pdp-gallery-stage__image--closeup" : ""
                } ${active?.type === "lifestyle" ? "pdp-gallery-stage__image--lifestyle" : ""}`}
                width={720}
                height={720}
              />
            </motion.div>
          </AnimatePresence>

          {total > 1 ? (
            <>
              <button
                type="button"
                className="pdp-gallery-nav pdp-gallery-nav--prev"
                aria-label="Previous image"
                onClick={() => go(-1)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                type="button"
                className="pdp-gallery-nav pdp-gallery-nav--next"
                aria-label="Next image"
                onClick={() => go(1)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </>
          ) : null}
        </div>
      </motion.div>

      {total > 1 ? (
        <div className="pdp-gallery-thumbs" role="tablist" aria-label="Product images">
          {images.map((image, index) => {
            const selected = activeIndex === index;
            return (
              <button
                key={image.id}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-label={image.alt}
                className={`pdp-gallery-thumb ${selected ? "pdp-gallery-thumb--active" : ""}`}
                onClick={() => setActiveIndex(index)}
              >
                <OptimizedImage
                  src={image.src}
                  alt=""
                  className={`pdp-gallery-thumb__img ${
                    image.type === "lifestyle" ? "pdp-gallery-thumb__img--cover" : ""
                  }`}
                  width={96}
                  height={96}
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
