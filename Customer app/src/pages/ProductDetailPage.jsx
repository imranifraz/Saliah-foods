import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PageMeta } from "../components/pages/PageMeta";
import { ProductCard } from "../components/ui/ProductCard";
import { ProductDetailGallery } from "../components/products/ProductDetailGallery";
import { ProductDetailFixedPackSize } from "../components/products/ProductDetailFixedPackSize";
import { ProductDetailPackSelector } from "../components/products/ProductDetailPackSelector";
import { ProductDetailStickyBar } from "../components/products/ProductDetailStickyBar";
import { ProductPrice } from "../components/ui/ProductPrice";
import { WishlistButton } from "../components/account/WishlistButton";
import { useCart } from "../context/CartContext";
import { useCatalog } from "../context/CatalogContext.jsx";
import { getProductDetailPath } from "../data/productCatalog";
import {
  getDefaultPackId,
  getFixedPackSizeLabel,
  getPremiumPackOptions,
  getProductDescription,
  getProductGallery,
  PDP_HIGHLIGHTS,
  requiresPackSelection,
} from "../data/productDetail";

function StarRating({ rating = 4.8 }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;

  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-3.5 w-3.5 ${i < full ? "text-gold-500" : i === full && half ? "text-gold-400" : "text-cream-200"}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function formatReviewDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function ProductDetailPage() {
  const { productSlug } = useParams();
  const reduce = useReducedMotion();
  const { addItem } = useCart();
  const { loading: catalogLoading, getProductBySlug, getRelatedProducts } = useCatalog();
  const product = getProductBySlug(productSlug ?? "");
  const related = product ? getRelatedProducts(product) : [];

  const packOptions = useMemo(
    () => (product && requiresPackSelection(product) ? getPremiumPackOptions(product) : []),
    [product]
  );
  const needsPackSelection = packOptions.length > 0;

  const ctaRef = useRef(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState(null);
  const [packError, setPackError] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setShowStickyBar(false);
    setPackError("");

    const nextProduct = getProductBySlug(productSlug ?? "");
    const nextOptions =
      nextProduct && requiresPackSelection(nextProduct) ? getPremiumPackOptions(nextProduct) : [];

    if (nextOptions.length) {
      setSelectedPackId(getDefaultPackId(nextProduct, nextOptions));
    } else {
      setSelectedPackId(null);
    }
  }, [productSlug]);

  useEffect(() => {
    const target = ctaRef.current;
    if (!target) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0, rootMargin: "0px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [productSlug]);

  if (catalogLoading) {
    return (
      <div className="mx-auto max-w-[1480px] px-4 py-28 text-center sm:px-5 md:px-10">
        <p className="font-body text-sm text-emerald-900/55">Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-[1480px] px-4 py-28 sm:px-5 md:px-10">
        <h1 className="font-display text-2xl font-medium text-emerald-900">Product not found</h1>
        <Link to="/products/all" className="mt-4 inline-block font-body text-sm text-emerald-800 underline">
          Browse all products
        </Link>
      </div>
    );
  }

  const rating = product.rating ?? 4.8;
  const reviewCount = product.reviewCount ?? 0;
  const approvedReviews = Array.isArray(product.approvedReviews) ? product.approvedReviews : [];
  const categoryHref = `/products/${product.categoryId}`;
  const description = getProductDescription(product);

  const selectedVariant =
    packOptions.find((option) => option.id === selectedPackId) ??
    product.defaultVariant ??
    product.variants?.find((variant) => variant.id === product.defaultVariantId) ??
    product.variants?.find((variant) => variant.inStock) ??
    product.variants?.[0] ??
    null;
  const gallery = getProductGallery(product, selectedVariant);
  const displayPriceValue = selectedVariant?.priceValue ?? product.priceValue;
  const displayMrpValue = selectedVariant?.mrpValue ?? product.mrpValue;
  const displayPrice = selectedVariant?.price ?? product.price;
  const fixedPackSize = !needsPackSelection ? getFixedPackSizeLabel(product) : null;
  const displayPackSize = needsPackSelection ? selectedVariant?.label : fixedPackSize;
  const isOutOfStock = selectedVariant ? selectedVariant.inStock === false : product.inStock === false;

  const linePricing = {
    price: displayPrice,
    priceValue: displayPriceValue,
    mrp: selectedVariant?.mrp ?? product.mrp,
    mrpValue: displayMrpValue,
    discountPercent: selectedVariant?.discountPercent ?? product.discountPercent,
  };

  const wishlistProduct = {
    productId: product.id,
    variantId: selectedVariant?.variantId ?? selectedVariant?.id ?? product.defaultVariantId ?? null,
    sku: selectedVariant?.sku ?? null,
    slug: product.slug,
    name: product.name,
    img: selectedVariant?.img || product.img,
    ...linePricing,
    packSize: displayPackSize ?? "",
    tagline: product.tagline ?? "",
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    if (needsPackSelection && !selectedPackId) {
      setPackError("Please select a pack size to continue.");
      return;
    }
    setPackError("");
    addItem({
      productId: product.id,
      variantId: selectedVariant?.variantId ?? selectedVariant?.id ?? product.defaultVariantId ?? null,
      sku: selectedVariant?.sku ?? null,
      slug: product.slug,
      name: product.name,
      img: selectedVariant?.img || product.img,
      ...linePricing,
      packSize: displayPackSize ?? "",
    });
  };

  return (
    <>
      <PageMeta title={product.name} description={description} />

      <div className="relative pb-24 pt-[calc(var(--site-header)+0.75rem)] md:pb-28 md:pt-[calc(var(--site-header)+1rem)]">
        <div className="pdp-atmosphere pointer-events-none absolute inset-0" aria-hidden />
        <div className="plp-texture pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative mx-auto max-w-[1480px] px-4 sm:px-5 md:px-10">
          <nav className="mb-4 font-body text-[11px] uppercase tracking-[0.16em] text-emerald-900/35" aria-label="Breadcrumb">
            <Link to="/" className="transition-colors hover:text-emerald-800">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link to="/products/all" className="transition-colors hover:text-emerald-800">
              Products
            </Link>
            <span className="mx-2">/</span>
            <Link to={categoryHref} className="transition-colors hover:text-emerald-800">
              {product.categoryLabel}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-emerald-900/60">{product.name}</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
            <ProductDetailGallery images={gallery} productName={product.name} badge={product.badge} />

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.06 }}
              className="flex flex-col lg:pt-1"
            >
              <p className="font-body text-[10px] font-medium uppercase tracking-[0.22em] text-emerald-800/45">
                {product.categoryLabel}
              </p>
              <div className="mt-2 flex items-start justify-between gap-3">
                <h1 className="font-display text-[clamp(1.875rem,3.5vw,2.75rem)] font-medium leading-tight tracking-tight text-emerald-900">
                  {product.name}
                </h1>
                <WishlistButton product={wishlistProduct} size="lg" />
              </div>
              {product.tagline ? (
                <p className="mt-2 font-body text-[15px] leading-relaxed text-emerald-900/52">{product.tagline}</p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <StarRating rating={rating} />
                <span className="font-body text-sm font-medium text-emerald-900/70">{rating.toFixed(1)}</span>
                {reviewCount > 0 ? (
                  <span className="font-body text-sm text-emerald-900/35">({reviewCount} reviews)</span>
                ) : null}
              </div>

              {needsPackSelection ? (
                <ProductDetailPackSelector
                  options={packOptions}
                  value={selectedPackId}
                  onChange={(id) => {
                    setSelectedPackId(id);
                    setPackError("");
                  }}
                  error={packError}
                />
              ) : (
                <ProductDetailFixedPackSize label={fixedPackSize} />
              )}

              <div className="mt-5 flex flex-wrap items-end gap-4">
                <motion.div
                  key={selectedVariant?.id ?? selectedPackId ?? product.slug}
                  initial={reduce ? false : { opacity: 0, y: 4 }}
                  animate={reduce ? undefined : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProductPrice
                    priceValue={displayPriceValue}
                    mrpValue={displayMrpValue}
                    price={displayPrice}
                    mrp={linePricing.mrp}
                    discountPercent={linePricing.discountPercent}
                    size="xl"
                  />
                </motion.div>
                {displayPackSize ? (
                  <span className="font-body text-[11px] uppercase tracking-[0.16em] text-emerald-900/35">
                    {displayPackSize}
                  </span>
                ) : null}
                <span
                  className={`rounded-full px-3 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.14em] ${
                    isOutOfStock
                      ? "bg-red-50 text-red-700"
                      : "bg-emerald-900/8 text-emerald-800"
                  }`}
                >
                  {isOutOfStock ? "Out of stock" : "In stock"}
                </span>
              </div>

              {product.benefits?.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {product.benefits.map((benefit) => (
                    <span
                      key={benefit}
                      className="rounded-full border border-cream-200/80 bg-white/70 px-3 py-1 font-body text-[10px] uppercase tracking-[0.12em] text-emerald-900/55"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              ) : null}

              <div ref={ctaRef} className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:items-stretch">
                <motion.button
                  type="button"
                  className={`pdp-btn-primary inline-flex min-h-[50px] flex-1 items-center justify-center rounded-full px-8 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-white ${
                    isOutOfStock ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  whileHover={reduce ? undefined : { y: -2 }}
                  whileTap={reduce ? undefined : { scale: 0.985 }}
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                >
                  {isOutOfStock ? "Out of stock" : "Add to cart"}
                </motion.button>
                <motion.button
                  type="button"
                  className={`pdp-btn-ghost inline-flex min-h-[50px] flex-1 items-center justify-center rounded-full px-8 py-3.5 font-body text-[11px] font-medium uppercase tracking-[0.15em] text-emerald-900/42 ${
                    isOutOfStock ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  whileHover={reduce ? undefined : { y: -1 }}
                  whileTap={reduce ? undefined : { scale: 0.99 }}
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                >
                  {isOutOfStock ? "Unavailable" : "Buy now"}
                </motion.button>
              </div>

              <p className="mt-6 font-body text-[13px] leading-relaxed text-emerald-900/48">{description}</p>

              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {PDP_HIGHLIGHTS.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center gap-2.5 rounded-xl border border-cream-200/60 bg-white/50 px-3.5 py-2.5 font-body text-[12px] text-emerald-900/55"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500/70" aria-hidden />
                    {item.label}
                  </li>
                ))}
              </ul>

              {approvedReviews.length > 0 ? (
                <section className="mt-8 rounded-[28px] border border-cream-200/70 bg-white/75 p-5 sm:p-6">
                  <div className="flex flex-wrap items-end justify-between gap-3 border-b border-cream-200/70 pb-4">
                    <div>
                      <p className="font-display text-xl text-emerald-900">Customer reviews</p>
                      <p className="mt-1 font-body text-sm text-emerald-900/45">
                        Approved reviews from delivered purchases only.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={rating} />
                      <span className="font-body text-sm font-medium text-emerald-900/70">
                        {rating.toFixed(1)} · {reviewCount} review{reviewCount === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    {approvedReviews.map((review) => (
                      <article
                        key={review.id}
                        className="rounded-2xl border border-cream-200/70 bg-cream-50/80 px-4 py-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-body text-sm font-semibold text-emerald-900">
                              {review.customerName}
                            </p>
                            <p className="mt-0.5 font-body text-xs text-emerald-900/40">
                              {formatReviewDate(review.submittedAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <StarRating rating={review.rating} />
                            <span className="font-body text-sm font-medium text-emerald-900/65">
                              {review.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        {review.title ? (
                          <p className="mt-3 font-body text-sm font-semibold text-emerald-900">
                            {review.title}
                          </p>
                        ) : null}
                        <p className="mt-2 font-body text-sm leading-relaxed text-emerald-900/60">
                          {review.comment}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}
            </motion.div>
          </div>

          {related.length > 0 ? (
            <section className="mt-14 md:mt-16" aria-labelledby="related-products-title">
              <div className="mb-6 flex items-end justify-between gap-4 border-b border-cream-200/50 pb-4">
                <h2 id="related-products-title" className="font-display text-xl font-medium text-emerald-900 md:text-[1.35rem]">
                  You may also like
                </h2>
                <Link
                  to={categoryHref}
                  className="font-body text-[10px] uppercase tracking-[0.18em] text-emerald-800/50 transition-colors hover:text-emerald-900"
                >
                  View collection
                </Link>
              </div>
              <ul className="pdp-related-grid grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6" role="list">
                {related.map((item, i) => (
                  <motion.li
                    key={item.catalogId}
                    className="flex min-w-0"
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <ProductCard
                      product={item}
                      index={i}
                      variant="pdp-related"
                      showPackSize
                      showTagline={false}
                      detailHref={getProductDetailPath(item)}
                      className="w-full"
                    />
                  </motion.li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>

      <ProductDetailStickyBar
        visible={showStickyBar}
        product={product}
        priceValue={displayPriceValue}
        mrpValue={displayMrpValue}
        price={displayPrice}
        mrp={linePricing.mrp}
        packSize={displayPackSize}
        onAddToCart={handleAddToCart}
        inStock={!isOutOfStock}
      />
    </>
  );
}
