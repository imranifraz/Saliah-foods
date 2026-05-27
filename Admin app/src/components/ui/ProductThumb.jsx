import { useEffect, useState } from "react";
import {
  pickProductCoverImage,
  resolveAdminMediaFallback,
  resolveAdminMediaUrl,
} from "../../lib/mediaUrl.js";

const SIZES = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-14 w-14",
};

export function ProductThumb({ src, product, alt = "", size = "md", className = "" }) {
  const raw = src ?? pickProductCoverImage(product);
  const [imgSrc, setImgSrc] = useState(() => resolveAdminMediaUrl(raw));

  useEffect(() => {
    setImgSrc(resolveAdminMediaUrl(raw));
  }, [raw]);

  function handleError() {
    const fallback = resolveAdminMediaFallback(raw);
    if (fallback && fallback !== imgSrc) {
      setImgSrc(fallback);
    }
  }

  return (
    <div
      className={`${SIZES[size] ?? SIZES.md} shrink-0 overflow-hidden rounded-lg border border-white/10 bg-admin-bg ${className}`}
    >
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={alt}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={handleError}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-cream-50/40">
          No img
        </div>
      )}
    </div>
  );
}
