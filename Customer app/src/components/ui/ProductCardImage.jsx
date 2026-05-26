import { OptimizedImage } from "./OptimizedImage";

const scaleClass = {
  sm: "product-card-image-scale--sm",
  md: "product-card-image-scale--md",
  lg: "product-card-image-scale--lg",
  wide: "product-card-image-scale--wide",
  tall: "product-card-image-scale--tall",
};

const profileClass = {
  pouch: "product-card-image-profile--pouch",
  box: "product-card-image-profile--box",
  jar: "product-card-image-profile--jar",
  bottle: "product-card-image-profile--bottle",
  tub: "product-card-image-profile--tub",
};

/** Visual scale within the fixed frame (keeps original aspect, balances grid) */
function resolveImageClass(product, size) {
  if (size === "home" && product.imageProfile) {
    return profileClass[product.imageProfile] ?? profileClass.pouch;
  }
  if (product.imageScale) {
    return scaleClass[product.imageScale] ?? scaleClass.md;
  }
  if (size === "listing") {
    return scaleClass.lg;
  }
  if (product.imageFit === "contain") return scaleClass.sm;
  return scaleClass.md;
}

/**
 * Premium product image frame — fixed stage, ivory canvas, centered packshot.
 */
export function ProductCardImage({ product, badge, size = "listing", className = "" }) {
  const imageClass = resolveImageClass(product, size);
  const isOutOfStockBadge = badge === "Out of stock";

  const sizeClass = {
    listing: "product-card-image-stage--listing",
    related: "product-card-image-stage--related",
    grid: "product-card-image-stage--grid",
    compact: "product-card-image-stage--compact",
    home: "product-card-image-stage--home",
  }[size];

  return (
    <div className={`product-card-image-stage ${sizeClass} ${className}`.trim()}>
      {badge ? (
        <span
          className={`absolute left-3 top-3 z-10 rounded-full px-2.5 py-1 font-body text-[9px] font-medium uppercase tracking-[0.16em] shadow-[0_2px_8px_rgba(22,49,42,0.06)] ${
            isOutOfStockBadge
              ? "border border-red-200 bg-red-50/95 text-red-700"
              : "border border-cream-200/80 bg-white/95 text-emerald-800/65"
          }`}
        >
          {badge}
        </span>
      ) : null}

      <div className="product-card-image-canvas" aria-hidden={false}>
        <div className="product-card-image-safe">
          <OptimizedImage
            src={product.img}
            alt={product.name}
            pictureClassName="product-card-image-picture"
            className={`product-card-image__img ${imageClass}`}
            width={460}
            height={460}
          />
        </div>
      </div>
    </div>
  );
}
