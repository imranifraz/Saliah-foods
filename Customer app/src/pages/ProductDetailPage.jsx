import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PageMeta } from "../components/pages/PageMeta";
import { ProductDetailGallery } from "../components/products/ProductDetailGallery";
import { ProductDetailPurchasePanel } from "../components/products/ProductDetailPurchasePanel";
import { ProductDetailReviewsSection } from "../components/products/ProductDetailReviewsSection";
import { ProductDetailRelatedSection } from "../components/products/ProductDetailRelatedSection";
import { ProductDetailStickyBar } from "../components/products/ProductDetailStickyBar";
import { ProductDetailStorySection } from "../components/products/ProductDetailStorySection";
import { WishlistButton } from "../components/account/WishlistButton";
import { useCart } from "../context/CartContext";
import {
  getDefaultPackId,
  getFixedPackSizeLabel,
  getPremiumPackOptions,
  getProductDescription,
  getProductGallery,
  requiresPackSelection,
} from "../data/productDetail";
import { fetchProductBySlug, fetchRelatedProducts } from "../services/catalogApi.js";

export function ProductDetailPage() {
  const { productSlug } = useParams();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    let cancelled = false;
    const slug = productSlug ?? "";

    setLoading(true);
    setError("");
    setProduct(null);
    setRelated([]);

    Promise.all([
      fetchProductBySlug(slug),
      fetchRelatedProducts(slug).catch(() => []),
    ])
      .then(([nextProduct, nextRelated]) => {
        if (cancelled) return;
        setProduct(nextProduct);
        setRelated(nextRelated);
      })
      .catch((err) => {
        if (cancelled) return;
        setProduct(null);
        setRelated([]);
        setError(err.message ?? "Could not load product.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productSlug]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setShowStickyBar(false);
    setPackError("");

    if (!product) {
      setSelectedPackId(null);
      return;
    }

    const nextOptions = requiresPackSelection(product) ? getPremiumPackOptions(product) : [];
    if (nextOptions.length) {
      setSelectedPackId(getDefaultPackId(product, nextOptions));
    } else {
      setSelectedPackId(null);
    }
  }, [productSlug, product]);

  useEffect(() => {
    const target = ctaRef.current;
    if (!target) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0, rootMargin: "0px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [productSlug, product]);

  if (loading) {
    return (
      <div className="relative pb-24 pt-[calc(var(--site-header)+0.75rem)] md:pb-28 md:pt-[calc(var(--site-header)+1rem)]">
        <div className="pdp-atmosphere pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-[1480px] px-4 sm:px-5 md:px-10">
          <div className="pdp-skeleton" aria-busy="true" aria-label="Loading product">
            <div className="pdp-skeleton__gallery" />
            <div className="pdp-skeleton__info">
              <div className="pdp-skeleton__line pdp-skeleton__line--sm" />
              <div className="pdp-skeleton__line pdp-skeleton__line--title" />
              <div className="pdp-skeleton__line pdp-skeleton__line--md" />
              <div className="pdp-skeleton__panel" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="relative pb-24 pt-[calc(var(--site-header)+1.5rem)] md:pb-28">
        <div className="pdp-atmosphere pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-[1480px] px-4 sm:px-5 md:px-10">
          <div className="pdp-empty">
            <p className="pdp-empty__eyebrow">Saliah Foods</p>
            <h1 className="pdp-empty__title">Product not found</h1>
            <p className="pdp-empty__copy">
              This product could not be loaded. It may have been moved or is temporarily unavailable.
            </p>
            {error ? <p className="pdp-empty__error">{error}</p> : null}
            <Link to="/products" className="pdp-empty__cta">
              Browse the collection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const rating = product.rating ?? null;
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
  const displayPackSize = needsPackSelection
    ? selectedVariant?.packSize || selectedVariant?.label || selectedVariant?.weight || null
    : fixedPackSize;
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
    bogoEnabled: Boolean(product.bogoEnabled),
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
      bogoEnabled: Boolean(product.bogoEnabled),
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
      <PageMeta title={product.name} description={description || product.tagline || product.name} />

      <div className="relative pb-24 pt-[calc(var(--site-header)+0.75rem)] md:pb-28 md:pt-[calc(var(--site-header)+1rem)]">
        <div className="pdp-atmosphere pointer-events-none absolute inset-0" aria-hidden />
        <div className="plp-texture pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <div className="pdp-atmosphere-veil pointer-events-none absolute inset-x-0 top-0 h-[28rem]" aria-hidden />

        <div className="relative mx-auto max-w-[1480px] px-4 sm:px-5 md:px-10">
          <nav className="pdp-breadcrumb mb-6 md:mb-8" aria-label="Breadcrumb">
            <Link to="/" className="pdp-breadcrumb__link">
              Home
            </Link>
            <span className="pdp-breadcrumb__sep" aria-hidden>
              /
            </span>
            <Link to="/products" className="pdp-breadcrumb__link">
              Products
            </Link>
            <span className="pdp-breadcrumb__sep" aria-hidden>
              /
            </span>
            <Link to={categoryHref} className="pdp-breadcrumb__link">
              {product.categoryLabel}
            </Link>
            <span className="pdp-breadcrumb__sep" aria-hidden>
              /
            </span>
            <span className="pdp-breadcrumb__current">{product.name}</span>
          </nav>

          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-20">
            <ProductDetailGallery
              images={gallery}
              productName={product.name}
              badge={
                product.bogoEnabled
                  ? product.offerLabel || "Buy 1 Get 1 Free"
                  : product.badge
              }
            />

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col lg:sticky lg:top-[calc(var(--site-header)+1rem)] lg:pt-1"
            >
              <div className="pdp-info-header">
                <div className="pdp-info-header__top">
                  <p className="pdp-info-header__eyebrow">{product.categoryLabel}</p>
                  <WishlistButton product={wishlistProduct} size="lg" />
                </div>
                <h1 className="pdp-info-header__title">{product.name}</h1>
                {product.tagline ? <p className="pdp-info-header__tagline">{product.tagline}</p> : null}
              </div>

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
                discountPercent={linePricing.discountPercent}
                priceKey={selectedVariant?.id ?? selectedPackId ?? product.slug}
                isOutOfStock={isOutOfStock}
                bogoEnabled={Boolean(product.bogoEnabled)}
                offerLabel={product.offerLabel || "Buy 1 Get 1 Free"}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                ctaRef={ctaRef}
              />
            </motion.div>
          </div>

          <ProductDetailStorySection
            description={description}
            benefits={product.benefits}
            categoryLabel={product.categoryLabel}
            productName={product.name}
            netWeight={displayPackSize}
          />

          <section className="pdp-bottom-stack mt-14 md:mt-20" aria-label="Reviews and recommendations">
            <div className="pdp-bottom-stack__reviews" id="pdp-reviews">
              <ProductDetailReviewsSection
                productSlug={product.slug}
                fallbackRating={rating ?? 0}
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
