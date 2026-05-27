import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PageMeta } from "../components/pages/PageMeta";
import { ProductDetailGallery } from "../components/products/ProductDetailGallery";
import { ProductDetailPurchasePanel } from "../components/products/ProductDetailPurchasePanel";
import { ProductDetailReviewsSection } from "../components/products/ProductDetailReviewsSection";
import { ProductDetailRelatedSection } from "../components/products/ProductDetailRelatedSection";
import { ProductDetailStickyBar } from "../components/products/ProductDetailStickyBar";
import { WishlistButton } from "../components/account/WishlistButton";
import { useCart } from "../context/CartContext";
import { useCatalog } from "../context/CatalogContext.jsx";
import {
  getDefaultPackId,
  getFixedPackSizeLabel,
  getPremiumPackOptions,
  getProductDescription,
  getProductGallery,
  requiresPackSelection,
} from "../data/productDetail";

export function ProductDetailPage() {
  const { productSlug } = useParams();
  const navigate = useNavigate();
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

  function buildCartLine() {
    return {
      productId: product.id,
      variantId: selectedVariant?.variantId ?? selectedVariant?.id ?? product.defaultVariantId ?? null,
      sku: selectedVariant?.sku ?? null,
      slug: product.slug,
      name: product.name,
      img: selectedVariant?.img || product.img,
      ...linePricing,
      packSize: displayPackSize ?? "",
    };
  }

  function validatePurchase() {
    if (isOutOfStock) return false;
    if (needsPackSelection && !selectedPackId) {
      setPackError("Please select a pack size to continue.");
      return false;
    }
    setPackError("");
    return true;
  }

  const handleAddToCart = () => {
    if (!validatePurchase()) return;
    addItem(buildCartLine());
  };

  const handleBuyNow = () => {
    if (!validatePurchase()) return;
    addItem(buildCartLine());
    navigate("/checkout");
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

              <ProductDetailPurchasePanel
                rating={rating}
                reviewCount={reviewCount}
                needsPackSelection={needsPackSelection}
                packOptions={packOptions}
                selectedPackId={selectedPackId}
                onPackChange={(id) => {
                  setSelectedPackId(id);
                  setPackError("");
                }}
                packError={packError}
                fixedPackSize={fixedPackSize}
                displayPriceValue={displayPriceValue}
                displayMrpValue={displayMrpValue}
                displayPrice={displayPrice}
                displayMrp={linePricing.mrp}
                priceKey={selectedVariant?.id ?? selectedPackId ?? product.slug}
                isOutOfStock={isOutOfStock}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                ctaRef={ctaRef}
              />

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

              <p className="mt-6 font-body text-[13px] leading-relaxed text-emerald-900/48">{description}</p>
            </motion.div>
          </div>

          <section className="pdp-bottom-stack mt-14 md:mt-16" aria-label="Reviews and recommendations">
            <div className="pdp-bottom-stack__reviews" id="pdp-reviews">
              <ProductDetailReviewsSection
                productSlug={product.slug}
                fallbackRating={rating}
                fallbackCount={reviewCount}
              />
            </div>

            {related.length > 0 ? (
              <ProductDetailRelatedSection products={related} />
            ) : null}
          </section>
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
