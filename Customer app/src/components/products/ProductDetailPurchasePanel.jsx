import { motion, useReducedMotion } from "framer-motion";
import { ProductDetailFixedPackSize } from "./ProductDetailFixedPackSize";
import { ProductDetailPackSelector } from "./ProductDetailPackSelector";
import { ProductDetailTrustGrid } from "./ProductDetailTrustGrid";

function StarRating({ rating }) {
  if (rating == null) return null;
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;

  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < full ? "text-gold-500" : i === full && half ? "text-gold-400" : "text-cream-200"}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function formatInr(value) {
  if (value == null) return "";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function CartIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
    </svg>
  );
}

export function ProductDetailPurchasePanel({
  rating,
  reviewCount,
  needsPackSelection,
  packOptions,
  selectedPackId,
  onPackChange,
  packError,
  fixedPackSize,
  displayPriceValue,
  displayMrpValue,
  displayPrice,
  displayMrp,
  priceKey,
  isOutOfStock,
  onAddToCart,
  onBuyNow,
  ctaRef,
}) {
  const reduce = useReducedMotion();
  const hasDiscount =
    displayMrpValue != null && displayPriceValue != null && displayMrpValue > displayPriceValue;
  const selling = displayPrice ?? formatInr(displayPriceValue);
  const list = displayMrp ?? formatInr(displayMrpValue);

  return (
    <section className="pdp-purchase-panel" aria-label="Purchase options">
      {rating != null && reviewCount > 0 ? (
        <div className="pdp-purchase-panel__rating">
          <StarRating rating={rating} />
          <span className="pdp-purchase-panel__rating-text">
            <strong>{rating.toFixed(1)}</strong>
            <a href="#pdp-reviews" className="pdp-purchase-panel__review-count">
              {" "}
              ({reviewCount} review{reviewCount === 1 ? "" : "s"})
            </a>
          </span>
        </div>
      ) : (
        <p className="pdp-purchase-panel__rating-text font-body text-sm text-emerald-900/45">No reviews yet</p>
      )}

      {needsPackSelection ? (
        <ProductDetailPackSelector
          variant="pills"
          options={packOptions}
          value={selectedPackId}
          onChange={onPackChange}
          error={packError}
        />
      ) : fixedPackSize ? (
        <ProductDetailFixedPackSize label={fixedPackSize} variant="inline" />
      ) : null}

      <motion.div
        key={priceKey}
        className="pdp-purchase-panel__price"
        initial={reduce ? false : { opacity: 0, y: 4 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <span className="pdp-purchase-panel__price-current">{selling}</span>
        {hasDiscount && list ? (
          <span className="pdp-purchase-panel__price-mrp">{list}</span>
        ) : null}
        {isOutOfStock ? (
          <span className="pdp-purchase-panel__stock pdp-purchase-panel__stock--out">Out of stock</span>
        ) : (
          <span className="pdp-purchase-panel__stock">In stock</span>
        )}
      </motion.div>

      <div ref={ctaRef} className="pdp-purchase-panel__actions">
        <motion.button
          type="button"
          className={`pdp-btn-cart ${isOutOfStock ? "cursor-not-allowed opacity-50" : ""}`}
          whileHover={reduce ? undefined : { y: -1 }}
          whileTap={reduce ? undefined : { scale: 0.985 }}
          onClick={onAddToCart}
          disabled={isOutOfStock}
        >
          <CartIcon />
          {isOutOfStock ? "Out of stock" : "Add to cart"}
        </motion.button>
        <motion.button
          type="button"
          className={`pdp-btn-buy ${isOutOfStock ? "cursor-not-allowed opacity-50" : ""}`}
          whileHover={reduce ? undefined : { y: -1 }}
          whileTap={reduce ? undefined : { scale: 0.985 }}
          onClick={onBuyNow}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? "Unavailable" : "Buy now"}
        </motion.button>
      </div>

      <div className="pdp-purchase-panel__divider" aria-hidden />

      <ProductDetailTrustGrid />
    </section>
  );
}
