import { resolveMediaUrl } from "../../lib/api.js";
import {
  PRODUCT_CARD_IMAGE_ASPECT,
  PRODUCT_CARD_IMAGE_HEIGHT,
  PRODUCT_CARD_IMAGE_WIDTH,
} from "../../data/productImageSpec.js";
import { OptimizedImage } from "./OptimizedImage";

/**
 * Premium product image frame — fixed 1000×1000 (1:1) packshot stage.
 * Images fill the square edge-to-edge (object-fit: cover).
 */
export function ProductCardImage({ product, badge, size = "listing", className = "" }) {
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

      <div className="product-card-image-canvas">
        <div className="product-card-image-safe">
          <OptimizedImage
            src={resolveMediaUrl(product.img)}
            alt={product.name}
            pictureClassName="product-card-image-picture"
            className="product-card-image__img product-card-image-scale--fill"
            width={PRODUCT_CARD_IMAGE_WIDTH}
            height={PRODUCT_CARD_IMAGE_HEIGHT}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          />
        </div>
      </div>
    </div>
  );
}
