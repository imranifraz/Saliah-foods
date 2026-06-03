import { useEffect, useState } from "react";
import { resolveMediaUrl } from "../../lib/api.js";

/**
 * Product / CMS images: resolves /uploads and /assets via API, prefers .webp for catalog assets.
 */
export function OptimizedImage({
  src,
  alt,
  className = "",
  pictureClassName = "block h-full w-full",
  priority = false,
  sizes,
  width,
  height,
  ...props
}) {
  const resolved = resolveMediaUrl(src);
  const [imgSrc, setImgSrc] = useState(resolved);

  useEffect(() => {
    setImgSrc(resolveMediaUrl(src));
  }, [src]);

  const webpCandidate =
    resolved && /\/assets\//i.test(resolved) && /\.png$/i.test(resolved)
      ? resolved.replace(/\.png$/i, ".webp")
      : null;

  const primarySrc =
    webpCandidate && /\/assets\//i.test(resolved) ? webpCandidate : resolved;

  function handleError() {
    if (webpCandidate && imgSrc === primarySrc && resolved !== primarySrc) {
      setImgSrc(resolved);
      return;
    }
    if (resolved && /\.webp$/i.test(resolved) && /\.png$/i.test(src ?? "")) {
      const png = resolveMediaUrl(String(src).replace(/\.webp$/i, ".png"));
      if (png && png !== imgSrc) setImgSrc(png);
    }
  }

  if (!primarySrc) {
    return (
      <div
        className={`flex items-center justify-center bg-cream-100 text-emerald-900/30 ${className}`}
        aria-hidden={!alt}
      >
        <span className="text-xs">No image</span>
      </div>
    );
  }

  return (
    <picture className={pictureClassName}>
      {webpCandidate && webpCandidate !== primarySrc ? (
        <source srcSet={webpCandidate} type="image/webp" />
      ) : null}
      <img
        src={imgSrc || primarySrc}
        alt={alt}
        className={className}
        width={width}
        height={height}
        sizes={sizes}
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        onError={handleError}
        {...props}
      />
    </picture>
  );
}
