/**
 * Serves WebP when available (generated via npm run optimize:images), PNG fallback.
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
  const canUseGeneratedWebp =
    typeof src === "string" &&
    /\.png$/i.test(src) &&
    /(^\/assets\/|\/assets\/)/i.test(src) &&
    !/\/uploads\//i.test(src);
  const webpSrc = canUseGeneratedWebp ? src.replace(/\.png$/i, ".webp") : null;

  return (
    <picture className={pictureClassName}>
      {webpSrc ? <source srcSet={webpSrc} type="image/webp" /> : null}
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        sizes={sizes}
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        {...props}
      />
    </picture>
  );
}
