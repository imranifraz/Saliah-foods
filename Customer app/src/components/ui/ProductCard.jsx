import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useCart } from "../../context/CartContext";
import { slugifyProduct } from "../../data/productCatalog";
import { WishlistButton } from "../account/WishlistButton";
import { ProductCardImage } from "./ProductCardImage";
import { ProductPrice } from "./ProductPrice";

/**
 * @typedef {Object} Product
 * @property {string} name
 * @property {string} [tagline]
 * @property {string} [description]
 * @property {number} [rating]
 * @property {number} [reviewCount]
 * @property {string} [tag]
 * @property {string} img
 * @property {string} price
 * @property {string} [salePrice]
 * @property {string} [packSize]
 * @property {string} [badge]
 * @property {'sm' | 'md' | 'lg' | 'wide' | 'tall'} [imageScale]
 * @property {'pouch' | 'box' | 'jar' | 'bottle' | 'tub'} [imageProfile]
 * @property {'contain'} [imageFit] — legacy; maps to smaller scale
 */

function StarRating({ rating, small = false }) {
  if (rating == null) return null;
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const size = small ? "h-2.5 w-2.5" : "h-3 w-3";

  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`${size} ${i < full ? "text-gold-500" : i === full && half ? "text-gold-400" : "text-cream-200"}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ProductCardRatingMeta({ rating, reviewCount, ratingClassName = "", countClassName = "" }) {
  if (rating == null || reviewCount <= 0) return null;

  return (
    <div className="product-card-meta">
      <StarRating rating={rating} small />
      <span className={`product-card-meta__rating ${ratingClassName}`.trim()}>{rating.toFixed(1)}</span>
      <span className={`product-card-meta__count ${countClassName}`.trim()}>({reviewCount})</span>
    </div>
  );
}

function HandPointerIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M10.5 3.75a1.5 1.5 0 0 1 3 0v5.25H18a1.5 1.5 0 0 1 1.5 1.5v2.25c0 .83-.67 1.5-1.5 1.5h-1.06l.28 1.69a1.5 1.5 0 0 1-1.48 1.81H9.75a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 9.75 3.75h.75Z" />
    </svg>
  );
}

export function ProductCard({
  product,
  index = 0,
  showPackSize = false,
  showTagline = true,
  compact = false,
  variant = "default",
  detailHref,
  className = "",
}) {
  const reduce = useReducedMotion();
  const { addItem } = useCart();
  const isPdpRelated = variant === "pdp-related";
  const isListing = variant === "listing";
  const isHomepage = variant === "homepage";
  const activeVariant =
    product.defaultVariant ??
    product.variants?.find((variantRow) => variantRow.id === product.defaultVariantId) ??
    product.variants?.find((variantRow) => variantRow.inStock) ??
    product.variants?.[0] ??
    null;
  const reviewCount = product.reviewCount ?? 0;
  const rating = reviewCount > 0 && product.rating != null ? product.rating : null;
  const description = product.description ?? product.tagline ?? "";
  const badge = product.badge || product.tag;
  const isOutOfStock = activeVariant ? activeVariant.inStock === false : product.inStock === false;
  const displayBadge = isOutOfStock ? "Out of stock" : badge;

  const wishlistProduct = {
    productId: product.id,
    variantId: activeVariant?.id ?? product.defaultVariantId ?? null,
    sku: activeVariant?.sku ?? null,
    slug: product.slug ?? slugifyProduct(product.name),
    name: product.name,
    img: activeVariant?.img || product.img,
    price: activeVariant?.price ?? product.price,
    priceValue: activeVariant?.priceValue ?? product.priceValue,
    mrp: activeVariant?.mrp ?? product.mrp,
    mrpValue: activeVariant?.mrpValue ?? product.mrpValue,
    discountPercent: activeVariant?.discountPercent ?? product.discountPercent,
    packSize: activeVariant?.packSize ?? product.packSize ?? "",
    tagline: product.tagline ?? "",
  };

  const addProductToCart = () => {
    if (isOutOfStock) return;
    addItem(wishlistProduct);
  };

  if (isPdpRelated) {
    const productHref = detailHref ?? (product.slug ? `/product/${product.slug}` : null);

    return (
      <motion.article
        className={`group flex h-full min-w-0 flex-col ${className}`}
        initial={reduce ? false : { opacity: 0, y: 10 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ duration: 0.38, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="pdp-related-card flex h-full flex-col overflow-hidden rounded-[1.125rem] border border-cream-200/80 bg-white/98">
          {productHref ? (
            <Link to={productHref} className="relative block min-h-0 flex-1">
              <WishlistButton product={wishlistProduct} className="absolute right-2 top-2 z-10" size="sm" />
              <ProductCardImage product={product} badge={displayBadge} size="related" />

              <div className="product-card-body product-card-body--tight">
                <h3 className="product-card-title text-[0.98rem]">
                  {product.name}
                </h3>

                {showTagline && product.tagline ? (
                  <p className="product-card-tagline">{product.tagline}</p>
                ) : null}

                <ProductCardRatingMeta
                  rating={rating}
                  reviewCount={reviewCount}
                  ratingClassName="font-body text-[10px] font-medium text-emerald-900/60"
                  countClassName="font-body text-[10px] text-emerald-900/25"
                />

                <div className="product-card-price-row flex flex-wrap items-end justify-between gap-1.5">
                  <ProductPrice
                    priceValue={product.priceValue}
                    mrpValue={product.mrpValue}
                    price={product.price}
                    mrp={product.mrp}
                    discountPercent={product.discountPercent}
                    size="sm"
                  />
                  {showPackSize && product.packSize ? (
                    <span className="font-body text-[9px] uppercase tracking-[0.14em] text-emerald-900/30">
                      {product.packSize}
                    </span>
                  ) : null}
                </div>
              </div>
            </Link>
          ) : null}

          <div className="product-card-cta-wrap mt-auto">
            <motion.button
              type="button"
              className={`product-card-cta ${isOutOfStock ? "cursor-not-allowed opacity-50" : ""}`}
              whileHover={reduce ? undefined : { y: -1 }}
              whileTap={reduce ? undefined : { scale: 0.985 }}
              onClick={addProductToCart}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? "Out of stock" : "Add to cart"}
            </motion.button>
          </div>
        </div>
      </motion.article>
    );
  }

  if (isListing) {
    const productHref = detailHref ?? (product.slug ? `/product/${product.slug}` : null);

    return (
      <motion.article
        className={`group flex h-full min-w-0 flex-col ${className}`}
        initial={reduce ? false : { opacity: 0, y: 14 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ duration: 0.4, delay: index * 0.035, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="plp-card-lift flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-cream-200/85 bg-white/95">
          {productHref ? (
            <Link to={productHref} className="relative flex min-h-0 flex-1 flex-col">
              <WishlistButton product={wishlistProduct} className="absolute right-2 top-2 z-10" size="sm" />
              <ProductCardImage product={product} badge={displayBadge} size="listing" />

              <div className="product-card-body product-card-body--listing flex flex-1 flex-col">
                <h3 className="product-card-title">{product.name}</h3>

                {showTagline && product.tagline ? (
                  <p className="product-card-tagline">{product.tagline}</p>
                ) : null}

                <ProductCardRatingMeta rating={rating} reviewCount={reviewCount} />

                {showPackSize && product.packSize ? (
                  <p className="product-card-packsize">{product.packSize}</p>
                ) : null}

                <div className="product-card-price-row">
                  <ProductPrice
                    priceValue={product.priceValue}
                    mrpValue={product.mrpValue}
                    price={product.price}
                    mrp={product.mrp}
                    discountPercent={product.discountPercent}
                    size="lg"
                    className="product-price--plp"
                  />
                </div>
              </div>
            </Link>
          ) : (
            <>
              <ProductCardImage product={product} badge={displayBadge} size="listing" />

              <div className="product-card-body product-card-body--listing flex flex-1 flex-col">
                <h3 className="product-card-title">{product.name}</h3>

                {showTagline && product.tagline ? (
                  <p className="product-card-tagline">{product.tagline}</p>
                ) : null}

                <ProductCardRatingMeta rating={rating} reviewCount={reviewCount} />

                {showPackSize && product.packSize ? (
                  <p className="product-card-packsize">{product.packSize}</p>
                ) : null}

                <div className="product-card-price-row">
                  <ProductPrice
                    priceValue={product.priceValue}
                    mrpValue={product.mrpValue}
                    price={product.price}
                    mrp={product.mrp}
                    discountPercent={product.discountPercent}
                    size="lg"
                    className="product-price--plp"
                  />
                </div>
              </div>
            </>
          )}

          <div className="product-card-cta-wrap product-card-cta-wrap--listing">
            <motion.button
              type="button"
              className={`product-card-cta ${isOutOfStock ? "cursor-not-allowed opacity-50" : ""}`}
              whileHover={reduce ? undefined : { y: -1 }}
              whileTap={reduce ? undefined : { scale: 0.985 }}
              onClick={addProductToCart}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? "Out of stock" : "Add to cart"}
            </motion.button>
          </div>
        </div>
      </motion.article>
    );
  }

  if (isHomepage) {
    const productHref = detailHref ?? (product.slug ? `/product/${product.slug}` : null);

    return (
      <motion.article
        className={`group home-product-card flex h-full min-w-0 flex-col ${className}`}
        initial={reduce ? false : { opacity: 0, y: 16 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-36px" }}
        transition={{ duration: 0.5, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="home-product-card__shell flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-cream-200/90 bg-white/98">
          <div className="home-product-card__media relative">
            <WishlistButton product={wishlistProduct} className="absolute right-2 top-2 z-10" size="sm" />
            <ProductCardImage product={product} badge={displayBadge} size="home" />

            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-[rgba(255,253,248,0.94)] via-[rgba(255,253,248,0.45)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
              aria-hidden
            />

            <div className="home-product-card__actions">
              <button
                type="button"
                className={`home-product-card__btn home-product-card__btn--primary ${isOutOfStock ? "cursor-not-allowed opacity-50" : ""}`}
                onClick={addProductToCart}
                disabled={isOutOfStock}
              >
                {isOutOfStock ? "Out of stock" : "Add to cart"}
              </button>
            </div>
          </div>

          <div className="product-card-body flex flex-1 flex-col sm:pb-3">
            {productHref ? (
              <Link to={productHref} className="block min-w-0">
                <h3 className="product-card-title">{product.name}</h3>
              </Link>
            ) : (
              <h3 className="product-card-title">{product.name}</h3>
            )}

            {showTagline && product.tagline ? (
              <p className="product-card-tagline line-clamp-2 text-[11px]">{product.tagline}</p>
            ) : null}

            <ProductCardRatingMeta
              rating={rating}
              reviewCount={reviewCount}
              ratingClassName="font-body text-[11px] font-medium text-emerald-900/60"
              countClassName="font-body text-[11px] text-emerald-900/28"
            />

            {showPackSize && product.packSize ? (
              <p className="mt-0.5 font-body text-[10px] uppercase tracking-[0.16em] text-emerald-900/30">
                {product.packSize}
              </p>
            ) : null}

            <div className="product-card-price-row">
              <ProductPrice
                priceValue={product.priceValue}
                mrpValue={product.mrpValue}
                price={product.price}
                mrp={product.mrp}
                discountPercent={product.discountPercent}
                size="md"
              />
            </div>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      className={`group flex h-full min-w-0 cursor-pointer flex-col ${className}`}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className={`relative overflow-hidden ${compact ? "rounded-lg shadow-md" : "rounded-2xl shadow-luxury"}`}
      >
        <ProductCardImage product={product} badge={displayBadge} size={compact ? "compact" : "grid"} />

          {detailHref ? (
            <Link
              to={detailHref}
              className="absolute inset-0 z-20 flex cursor-pointer items-center justify-center bg-emerald-950/0 opacity-0 transition-all duration-300 group-hover:bg-emerald-950/20 group-hover:opacity-100 focus-visible:bg-emerald-950/25 focus-visible:opacity-100"
              aria-label={`View ${product.name}`}
            >
              <span
                className={`flex scale-90 items-center justify-center rounded-full bg-cream-50 text-emerald-900 shadow-luxury-lg transition-transform duration-300 group-hover:scale-100 ${
                  compact ? "h-8 w-8" : "h-12 w-12"
                }`}
              >
                <HandPointerIcon size={compact ? 18 : 24} />
              </span>
            </Link>
          ) : (
            <button
              type="button"
              className="absolute inset-0 z-20 flex cursor-pointer items-center justify-center bg-emerald-950/0 opacity-0 transition-all duration-300 group-hover:bg-emerald-950/20 group-hover:opacity-100 focus-visible:bg-emerald-950/25 focus-visible:opacity-100"
              aria-label={`View ${product.name}`}
            >
              <span
                className={`flex scale-90 items-center justify-center rounded-full bg-cream-50 text-emerald-900 shadow-luxury-lg transition-transform duration-300 group-hover:scale-100 ${
                  compact ? "h-8 w-8" : "h-12 w-12"
                }`}
              >
                <HandPointerIcon size={compact ? 18 : 24} />
              </span>
            </button>
          )}
      </div>

      <div className={`flex flex-1 flex-col px-0.5 min-h-0 ${compact ? "pt-1.5" : "pt-2.5"}`}>
        <h3
          className={`font-display font-medium leading-snug text-emerald-900 group-hover:text-emerald-800 ${
            compact ? "text-sm sm:text-base" : "text-base sm:text-lg"
          }`}
        >
          {product.name}
        </h3>

        {description ? (
          <p
            className={`font-body leading-relaxed text-emerald-900/60 ${
              compact ? "mt-0.5 line-clamp-1 text-[11px]" : "mt-1.5 line-clamp-2 text-sm"
            }`}
          >
            {showTagline && product.tagline ? product.tagline : description}
          </p>
        ) : null}

        {rating != null && reviewCount > 0 ? (
          <div className={`flex flex-wrap items-center gap-1.5 ${compact ? "mt-1" : "mt-1.5"}`}>
            <StarRating rating={rating} small={compact} />
            <span className={`font-body font-medium text-emerald-900 ${compact ? "text-[10px]" : "text-xs"}`}>
              {rating.toFixed(1)}
            </span>
            {!compact ? (
              <span className="font-body text-xs text-emerald-900/45">({reviewCount} reviews)</span>
            ) : null}
          </div>
        ) : null}

        {showPackSize && product.packSize ? (
          <p
            className={`font-body uppercase tracking-[0.12em] text-emerald-900/45 ${
              compact ? "mt-1 text-[9px]" : "mt-2 text-[10px]"
            }`}
          >
            {product.packSize}
          </p>
        ) : null}

        <div className={compact ? "mt-1" : "mt-2"}>
          <ProductPrice
            priceValue={product.priceValue}
            mrpValue={product.mrpValue}
            price={product.price}
            mrp={product.mrp}
            discountPercent={product.discountPercent}
            size={compact ? "sm" : "md"}
          />
        </div>

        <motion.div className={`mt-auto pt-2 ${compact ? "pt-1.5" : ""}`}>
          <motion.button
            type="button"
            className={`product-card-cta ${compact ? "!py-2 !text-[9px]" : ""} ${isOutOfStock ? "cursor-not-allowed opacity-50" : ""}`}
            whileTap={reduce ? undefined : { scale: 0.99 }}
            onClick={addProductToCart}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? "Out of stock" : "Add to cart"}
          </motion.button>
        </motion.div>
      </div>
    </motion.article>
  );
}
