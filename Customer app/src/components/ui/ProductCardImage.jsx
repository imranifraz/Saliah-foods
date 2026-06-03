import { resolveMediaUrl } from "../../lib/api.js";
import { inferImageProfile } from "../../data/productImagery.js";
import {
  PRODUCT_CARD_IMAGE_ASPECT,
  PRODUCT_CARD_IMAGE_HEIGHT,
  PRODUCT_CARD_IMAGE_WIDTH,
} from "../../data/productImageSpec.js";
import { OptimizedImage } from "./OptimizedImage";

const scaleClass = {
  fill: "product-card-image-scale--fill",
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

function isUploadedImage(src) {
  return typeof src === "string" && /\/uploads\//i.test(src);
}

/** Visual scale within the fixed 1:1 frame (keeps original aspect, balances grid) */
function resolveImageClass(product, size) {
  if (product.imageScale) {
    return scaleClass[product.imageScale] ?? scaleClass.md;
  }

  if (isUploadedImage(product.img)) {
    const profile = product.imageProfile ?? inferImageProfile(product);
    if (size === "home") {
      return profileClass[profile] ?? profileClass.pouch;
    }
    if (profile === "bottle") return scaleClass.lg;
    if (profile === "box") return scaleClass.wide;
    if (profile === "tall" || profile === "tub") return scaleClass.tall;
    return scaleClass.md;
  }

  if (size === "home" && product.imageProfile) {
    return profileClass[product.imageProfile] ?? profileClass.pouch;
  }

  if (size === "listing" || size === "grid" || size === "related" || size === "compact") {
    return scaleClass.md;
  }

  if (product.imageFit === "contain") return scaleClass.sm;
  return scaleClass.md;
}

/**
 * Premium product image frame — fixed 1200×1200 (1:1) packshot stage.
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
    <div
      className={`product-card-image-stage ${sizeClass} ${className}`.trim()}
      style={{ aspectRatio: PRODUCT_CARD_IMAGE_ASPECT }}
    >
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
            src={resolveMediaUrl(product.img)}
            alt={product.name}
            pictureClassName="product-card-image-picture"
            className={`product-card-image__img ${imageClass}`}
            width={PRODUCT_CARD_IMAGE_WIDTH}
            height={PRODUCT_CARD_IMAGE_HEIGHT}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          />
        </div>
      </div>
    </div>
  );
}
