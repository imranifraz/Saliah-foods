import { buildPriceFields } from "./pricing";

const ASSETS = {
  lifestyle: "/assets/hero-banner.png",
  brand: "/assets/brand-legacy.png",
  premiumCategory: "/assets/premium-dates-category.png",
  wellnessCategory: "/assets/wellness-foods-category.png",
  nutrition: "/assets/date-based-products-category.png",
  kimia: "/assets/kimia-dates.png",
  ajwa: "/assets/ajwa-dates.png",
  safawi: "/assets/safawi-dates.png",
};

function pickAlternatePackshot(product) {
  const pool = [ASSETS.kimia, ASSETS.ajwa, ASSETS.safawi].filter((src) => src !== product.img);
  return pool[product.name.length % pool.length] ?? ASSETS.kimia;
}

function getProductVariants(product) {
  return Array.isArray(product?.variants) ? product.variants : [];
}

function getPreferredVariant(product) {
  const variants = getProductVariants(product);
  if (!variants.length) return null;
  return (
    variants.find((variant) => variant.id === product.defaultVariantId && variant.inStock) ??
    variants.find((variant) => variant.inStock) ??
    variants.find((variant) => variant.id === product.defaultVariantId) ??
    variants[0]
  );
}

export function requiresPackSelection(product) {
  return getProductVariants(product).length > 1;
}

export function getPremiumPackOptions(product) {
  return getProductVariants(product).map((variant) => ({
    ...variant,
    id: variant.id,
    variantId: variant.id,
    label: variant.label ?? variant.weight ?? variant.packSize ?? "",
    packSize: variant.packSize ?? variant.weight ?? "",
    ...buildPriceFields(variant.priceValue, variant.mrpValue ?? undefined),
    inStock: variant.inStock !== false,
  }));
}

export function getDefaultPackId(product, options) {
  if (!options.length) return null;
  const preferred = getPreferredVariant(product);
  const match = options.find((option) => option.id === preferred?.id);
  return match?.id ?? options[0].id;
}

export function getFixedPackSizeLabel(product) {
  const variant = getPreferredVariant(product);
  return variant?.packSize ?? product.packSize?.trim() ?? null;
}

export function getProductGallery(product, selectedVariant = null) {
  const isDates =
    product.categoryId.includes("dates") || product.name.toLowerCase().includes("date");
  const preferredVariant = selectedVariant ?? getPreferredVariant(product);
  const items = [
    preferredVariant?.img,
    ...(Array.isArray(product.images) ? product.images : []),
    product.img,
    pickAlternatePackshot(product),
    ASSETS.lifestyle,
    isDates ? ASSETS.premiumCategory : ASSETS.wellnessCategory,
  ]
    .filter(Boolean)
    .map((src, index) => ({
      id: `gallery-${index}`,
      src,
      alt: index === 0 ? `${product.name} — selected packshot` : `${product.name} — gallery image ${index + 1}`,
      type: index < 2 ? "packshot" : "gallery",
    }));

  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.src)) return false;
    seen.add(item.src);
    return true;
  });
}

export function getProductDescription(product) {
  if (product.fullDescription?.trim()) return product.fullDescription.trim();
  const tagline = product.tagline ?? "Premium quality, thoughtfully packed.";
  return `${product.name} — ${tagline} Sourced with care and sealed fresh for everyday wellness, gifting, and natural sweetness.`;
}

export const PDP_HIGHLIGHTS = [
  { icon: "leaf", label: "Natural ingredients" },
  { icon: "box", label: "Freshly packed" },
  { icon: "shield", label: "Secure checkout" },
  { icon: "delivery", label: "Pan-India delivery" },
];
