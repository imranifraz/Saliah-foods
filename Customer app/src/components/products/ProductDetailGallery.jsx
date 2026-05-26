import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { OptimizedImage } from "../ui/OptimizedImage";

export function ProductDetailGallery({ images, productName, badge }) {
  const reduce = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];
  const isCloseup = active?.type === "closeup";

  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  return (
    <div className="flex flex-col gap-3">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="pdp-gallery-main group overflow-hidden rounded-2xl border border-cream-200/80 shadow-[0_10px_40px_rgba(22,49,42,0.08)]"
      >
        <div className="relative flex min-h-[26rem] items-center justify-center px-3 py-4 sm:min-h-[30rem] sm:px-5 sm:py-5 lg:min-h-[32rem]">
          {badge ? (
            <span className="absolute left-4 top-4 z-10 rounded-full border border-cream-200/80 bg-white/95 px-3 py-1 font-body text-[9px] font-medium uppercase tracking-[0.16em] text-emerald-800/65 shadow-sm">
              {badge}
            </span>
          ) : null}

          <OptimizedImage
            key={active?.id}
            src={active?.src}
            alt={active?.alt ?? productName}
            className={`max-h-[28rem] max-w-[98%] object-contain drop-shadow-[0_24px_48px_rgba(22,49,42,0.18)] transition-transform duration-700 ease-out group-hover:scale-[1.04] sm:max-h-[30rem] lg:max-h-[31rem] ${
              isCloseup ? "scale-[1.12] group-hover:scale-[1.16]" : ""
            } ${active?.type === "lifestyle" ? "max-h-full w-full rounded-lg object-cover" : ""}`}
            width={680}
            height={680}
          />
        </div>
      </motion.div>

      <div className="flex gap-2 overflow-x-auto pb-1 sm:gap-2.5" role="tablist" aria-label="Product images">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            role="tab"
            aria-selected={activeIndex === index}
            aria-label={image.alt}
            className={`pdp-gallery-thumb shrink-0 overflow-hidden rounded-xl border transition-all duration-300 ${
              activeIndex === index
                ? "border-emerald-900/25 bg-white shadow-[0_4px_16px_rgba(22,49,42,0.08)]"
                : "border-cream-200/70 bg-white/60 hover:border-cream-200 hover:bg-white"
            }`}
            onClick={() => setActiveIndex(index)}
          >
            <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center bg-gradient-to-b from-cream-100/60 to-cream-50/30 p-1.5 sm:h-[5rem] sm:w-[5rem]">
              <OptimizedImage
                src={image.src}
                alt=""
                className={`max-h-full max-w-full object-contain ${image.type === "lifestyle" ? "h-full w-full object-cover rounded-md" : ""}`}
                width={80}
                height={80}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
