import {
  buildProductSummary,
  isVariantInStock,
  parseImages,
  pickDefaultVariant,
} from "./products.js";
import { formatApprovedProductReview } from "./reviews.js";

function formatMoney(value) {
  if (value == null) return null;
  return `₹${value.toLocaleString("en-IN")}`;
}

function getDiscountPercent(priceValue, mrpValue) {
  if (!mrpValue || mrpValue <= priceValue) return null;
  return Math.round(((mrpValue - priceValue) / mrpValue) * 100);
}

export function formatProductVariant(variant, fallbackImage = "") {
  const priceValue = variant.priceValue ?? 0;
  const mrpValue = variant.mrpValue ?? null;

  return {
    id: variant.id,
    productId: variant.productId,
    sku: variant.sku,
    weight: variant.weight,
    packSize: variant.weight,
    label: variant.weight,
    priceValue,
    mrpValue,
    price: formatMoney(priceValue),
    mrp: formatMoney(mrpValue),
    discountPercent: getDiscountPercent(priceValue, mrpValue),
    stockQuantity: variant.stockQuantity,
    stockStatus: variant.stockStatus,
    inStock: isVariantInStock(variant),
    img: variant.img || fallbackImage,
    packaging: variant.packaging ?? null,
    isDefault: Boolean(variant.isDefault),
    sortOrder: variant.sortOrder ?? 0,
    createdAt: variant.createdAt?.toISOString?.() ?? variant.createdAt,
    updatedAt: variant.updatedAt?.toISOString?.() ?? variant.updatedAt,
  };
}

export function formatProduct(product) {
  const images = parseImages(product.images);
  const fallbackImage = product.img || images[0] || "";
  const rawVariants = Array.isArray(product.variants) ? product.variants : [];
  const variants = rawVariants.map((variant) => formatProductVariant(variant, fallbackImage));
  const defaultVariant = pickDefaultVariant(rawVariants);
  const summary = buildProductSummary(product, rawVariants);
  const priceValue = summary.priceValue ?? product.priceValue ?? defaultVariant?.priceValue ?? 0;
  const mrpValue =
    summary.mrpValue ?? product.mrpValue ?? defaultVariant?.mrpValue ?? null;
  const approvedReviews = Array.isArray(product.reviews)
    ? product.reviews
        .map(formatApprovedProductReview)
        .filter(Boolean)
    : [];

  return {
    id: product.id,
    catalogId: product.catalogId,
    slug: product.slug,
    name: product.name,
    productType: product.productType,
    status: product.status,
    tagline: product.tagline ?? "",
    shortDescription: product.tagline ?? "",
    fullDescription: product.fullDescription ?? "",
    tag: product.tag ?? null,
    img: summary.img || fallbackImage,
    images: summary.images?.length ? summary.images : fallbackImage ? [fallbackImage] : [],
    packSize: summary.packSize ?? product.packSize ?? "",
    categoryId: product.categoryId,
    categoryLabel: product.categoryLabel,
    priceValue,
    mrpValue,
    price: formatMoney(priceValue),
    mrp: formatMoney(mrpValue),
    discountPercent: getDiscountPercent(priceValue, mrpValue),
    rating: product.reviewCount > 0 ? product.rating : null,
    reviewCount: product.reviewCount,
    approvedReviews,
    packaging: summary.packaging ?? product.packaging ?? null,
    badge: product.badge ?? null,
    benefits: Array.isArray(product.benefits) ? product.benefits : [],
    inStock: summary.inStock ?? product.inStock,
    featured: Boolean(product.featured),
    isNew: Boolean(product.isNew),
    isBestSeller: Boolean(product.isBestSeller),
    bogoEnabled: Boolean(product.bogoEnabled),
    offerLabel: product.bogoEnabled ? "Buy 1 Get 1 Free" : null,
    variantCount: variants.length,
    defaultVariantId: defaultVariant?.id ?? variants[0]?.id ?? null,
    variants,
    createdAt: product.createdAt?.toISOString?.() ?? product.createdAt,
    updatedAt: product.updatedAt?.toISOString?.() ?? product.updatedAt,
  };
}
