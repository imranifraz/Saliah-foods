import { apiFetch, resolveMediaUrl } from "../lib/api.js";
import { buildPriceFields } from "../data/pricing.js";

const PACKAGING_MAP = {
  Pouch: "Pouch",
  "100g": "Pouch",
  "200g": "Pouch",
  "250g": "Pouch",
  "300g": "Pouch",
  "400g": "Pouch",
  "500g": "Bulk Pack",
  "1kg": "Bulk Pack",
};

function inferPackaging(packSize) {
  if (!packSize) return "Pouch";
  if (packSize.includes("Gift Box")) return "Gift Box";
  if (packSize.includes("Pouch") || packSize.includes("3 ×")) return "Pouch";
  return PACKAGING_MAP[packSize] ?? "Pouch";
}

function normalizeVariant(rawVariant, fallbackImage, version = "") {
  const priceFields = buildPriceFields(rawVariant.priceValue, rawVariant.mrpValue ?? undefined);
  const stockQuantity = Number(rawVariant.stockQuantity ?? 0);
  const variantImage = withCacheBust(resolveMediaUrl(rawVariant.img || fallbackImage), version);

  return {
    ...rawVariant,
    ...priceFields,
    label: rawVariant.label ?? rawVariant.weight ?? rawVariant.packSize ?? "",
    packSize: rawVariant.packSize ?? rawVariant.weight ?? "",
    img: variantImage,
    stockQuantity,
    inStock:
      rawVariant.inStock !== false &&
      (rawVariant.stockStatus ? rawVariant.stockStatus !== "out_of_stock" : stockQuantity > 0),
    isDefault: Boolean(rawVariant.isDefault),
  };
}

function pickDefaultVariant(variants) {
  if (!variants.length) return null;
  return (
    variants.find((variant) => variant.isDefault && variant.inStock) ??
    variants.find((variant) => variant.inStock) ??
    variants.find((variant) => variant.isDefault) ??
    variants[0]
  );
}

function normalizeApprovedReview(rawReview) {
  return {
    id: rawReview.id,
    rating: Number(rawReview.rating ?? 0),
    title: rawReview.title ?? "",
    comment: rawReview.comment ?? "",
    submittedAt: rawReview.submittedAt ?? "",
    customerName: rawReview.customerName ?? "Verified customer",
  };
}

function withCacheBust(url, version) {
  if (!url || !version) return url;
  const stamp = String(version).replace(/[^\w.-]/g, "");
  if (!stamp) return url;
  return url.includes("?") ? `${url}&v=${stamp}` : `${url}?v=${stamp}`;
}

export function normalizeApiProduct(raw) {
  const version = raw.updatedAt ?? raw.updated_at ?? "";
  const images = Array.isArray(raw.images)
    ? raw.images.map((src) => withCacheBust(resolveMediaUrl(src), version)).filter(Boolean)
    : [];
  const variants = Array.isArray(raw.variants)
    ? raw.variants.map((variant) => normalizeVariant(variant, raw.img, version))
    : [];
  const defaultVariant = pickDefaultVariant(variants);
  const priceValue = defaultVariant?.priceValue ?? raw.priceValue;
  const mrpValue = defaultVariant?.mrpValue ?? raw.mrpValue ?? undefined;
  const priceFields = buildPriceFields(priceValue, mrpValue);
  const packaging =
    defaultVariant?.packaging ?? raw.packaging ?? inferPackaging(defaultVariant?.packSize ?? raw.packSize);
  const benefits = Array.isArray(raw.benefits) ? raw.benefits : [];
  const cover = withCacheBust(resolveMediaUrl(raw.img), version) || defaultVariant?.img || images[0] || "";

  return {
    ...raw,
    ...priceFields,
    catalogId: raw.catalogId,
    slug: raw.slug,
    img: cover,
    images: images.length ? images : [cover].filter(Boolean),
    packSize: defaultVariant?.packSize ?? raw.packSize ?? "",
    packaging,
    benefits,
    badge: raw.badge ?? null,
    bogoEnabled: Boolean(raw.bogoEnabled),
    offerLabel: raw.bogoEnabled ? raw.offerLabel || "Buy 1 Get 1 Free" : null,
    inStock: variants.length ? variants.some((variant) => variant.inStock) : raw.inStock !== false,
    featured: Boolean(raw.featured),
    isNew: Boolean(raw.isNew),
    isBestSeller: Boolean(raw.isBestSeller),
    reviewCount: Number(raw.reviewCount ?? 0),
    rating: Number(raw.reviewCount ?? 0) > 0 && raw.rating != null ? Number(raw.rating) : null,
    approvedReviews: Array.isArray(raw.approvedReviews)
      ? raw.approvedReviews.map(normalizeApprovedReview)
      : [],
    defaultVariantId: defaultVariant?.id ?? raw.defaultVariantId ?? null,
    defaultVariant,
    variants,
  };
}

export function buildMenuCategories(categories, products) {
  return categories.map((cat) => ({
    id: cat.id,
    label: cat.label,
    description: cat.description ?? "",
    image: resolveMediaUrl(cat.image ?? ""),
    viewAllHref: `/products/${cat.id}`,
    products:
      cat.id === "best-sellers"
        ? products.filter((p) => p.isBestSeller)
        : products.filter((p) => p.categoryId === cat.id),
    featuredPromo: cat.featuredPromo
      ? {
          ...cat.featuredPromo,
          image: resolveMediaUrl(cat.featuredPromo.image ?? ""),
        }
      : null,
  }));
}

export function buildCategoryPills(categories) {
  return [
    { id: "all", label: "All Products" },
    ...categories.map((c) => ({ id: c.id, label: c.label })),
  ];
}

export function buildShopCategories(categories, productsByCategory) {
  return categories.map((cat, index) => {
    const count = productsByCategory[cat.id]?.length ?? 0;
    return {
      title: cat.label,
      products:
        cat.description ||
        (count > 0 ? `${count} product${count === 1 ? "" : "s"}` : "Explore our collection"),
      cta: `Shop ${cat.label}`,
      href: `/products/${cat.id}`,
      img: resolveMediaUrl(cat.image) || "/assets/premium-dates-category.png",
      featured: index < 3,
    };
  });
}

export async function fetchProductBySlug(slug) {
  const data = await apiFetch(`/api/products/slug/${encodeURIComponent(slug)}`);
  if (!data?.product) throw new Error("Product not found");
  return normalizeApiProduct(data.product);
}

export async function fetchRelatedProducts(slug) {
  const data = await apiFetch(`/api/products/${encodeURIComponent(slug)}/related`);
  return (data.products ?? []).map(normalizeApiProduct);
}

export async function fetchCatalog() {
  const [catData, prodData] = await Promise.all([
    apiFetch("/api/categories"),
    apiFetch("/api/products"),
  ]);

  const categories = catData.categories ?? [];
  const products = (prodData.products ?? []).map(normalizeApiProduct);

  return {
    categories,
    products,
    menuCategories: buildMenuCategories(categories, products),
    categoryPills: buildCategoryPills(categories),
    shopCategories: buildShopCategories(
      categories,
      Object.fromEntries(
        categories.map((c) => [c.id, products.filter((p) => p.categoryId === c.id)])
      )
    ),
  };
}
