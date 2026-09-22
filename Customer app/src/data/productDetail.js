import { buildPriceFields } from "./pricing";

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

function gallerySrcKey(src) {
  const value = String(src || "").trim();
  if (!value) return "";
  const bare = value.split("#")[0].split("?")[0];
  return bare || value;
}

export function getProductGallery(product, selectedVariant = null) {
  const preferredVariant = selectedVariant ?? getPreferredVariant(product);
  const preferredSrc = preferredVariant?.img || product.img;
  const gallerySources = Array.isArray(product.images) ? product.images : [];
  // Prefer catalog gallery order; keep selected variant cover first when it differs.
  const items = [preferredSrc, ...gallerySources, product.img]
    .filter(Boolean)
    .map((src, index) => ({
      id: `gallery-${index}`,
      src,
      alt: index === 0 ? `${product.name} — packshot` : `${product.name} — image ${index + 1}`,
      type: index === 0 ? "packshot" : "gallery",
    }));

  const seen = new Set();
  return items.filter((item) => {
    const key = gallerySrcKey(item.src);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getProductDescription(product) {
  if (product.fullDescription?.trim()) return product.fullDescription.trim();
  if (product.shortDescription?.trim()) return product.shortDescription.trim();
  if (product.tagline?.trim()) return product.tagline.trim();
  return "";
}

export const PDP_HIGHLIGHTS = [
  { icon: "leaf", label: "Natural ingredients" },
  { icon: "box", label: "Freshly packed" },
  { icon: "shield", label: "Secure checkout" },
  { icon: "delivery", label: "Pan-India delivery" },
];
