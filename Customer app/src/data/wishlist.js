import { buildPriceFields } from "./pricing";

export const WISHLIST_STORAGE_PREFIX = "saliah-wishlist";

export function getWishlistStorageKey(userId) {
  return userId ? `${WISHLIST_STORAGE_PREFIX}-${userId}` : null;
}

export function loadWishlist(userId) {
  const key = getWishlistStorageKey(userId);
  if (!key) return [];

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveWishlist(userId, items) {
  const key = getWishlistStorageKey(userId);
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(items));
}

export function wishlistItemKey(item) {
  return item.variantId ? `variant:${item.variantId}` : `${item.slug}::${item.packSize ?? ""}`;
}

export function createWishlistEntry(product) {
  const selling = product.priceValue ?? 0;
  const priceFields = buildPriceFields(selling, product.mrpValue);

  return {
    productId: product.productId ?? null,
    variantId: product.variantId ?? null,
    sku: product.sku ?? null,
    slug: product.slug,
    name: product.name,
    img: product.img,
    ...priceFields,
    packSize: product.packSize ?? "",
    tagline: product.tagline ?? "",
    addedAt: new Date().toISOString(),
  };
}
