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

function formatBadge(tag, reviewCount) {
  if (reviewCount > 200) return "Bestseller";
  const map = {
    Premium: "Premium Quality",
    "Natural Sweetness": "Naturally Sweet",
    Seedless: "No Added Sugar",
    Soft: "Premium Quality",
    "Everyday Snack": "Naturally Sweet",
    "No Added Sugar": "No Added Sugar",
    Organic: "Organic",
  };
  return map[tag] ?? tag ?? null;
}

function inferBenefits(product) {
  const benefits = new Set();
  const tag = product.tag ?? "";
  const tagline = (product.tagline ?? "").toLowerCase();

  if (tag === "Seedless" || tagline.includes("natural")) benefits.add("No Added Sugar");
  if (tag === "Natural Sweetness" || tagline.includes("sweet")) benefits.add("Natural Energy");
  if (tag === "Premium" || tag === "Soft") benefits.add("Premium Quality");
  if (tagline.includes("wellness") || tagline.includes("traditional")) benefits.add("Organic");
  if (product.reviewCount > 150) benefits.add("High Fiber");
  if (benefits.size === 0) benefits.add("Natural Energy");
  return [...benefits];
}

function normalizeVariant(rawVariant, fallbackImage) {
  const priceFields = buildPriceFields(rawVariant.priceValue, rawVariant.mrpValue ?? undefined);
  const stockQuantity = Number(rawVariant.stockQuantity ?? 0);
  const variantImage = resolveMediaUrl(rawVariant.img || fallbackImage);

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

export function normalizeApiProduct(raw) {
  const images = Array.isArray(raw.images) ? raw.images.map(resolveMediaUrl).filter(Boolean) : [];
  const variants = Array.isArray(raw.variants)
    ? raw.variants.map((variant) => normalizeVariant(variant, raw.img))
    : [];
  const defaultVariant = pickDefaultVariant(variants);
  const priceValue = defaultVariant?.priceValue ?? raw.priceValue;
  const mrpValue = defaultVariant?.mrpValue ?? raw.mrpValue ?? undefined;
  const priceFields = buildPriceFields(priceValue, mrpValue);
  const packaging =
    defaultVariant?.packaging ?? raw.packaging ?? inferPackaging(defaultVariant?.packSize ?? raw.packSize);
  const benefits =
    Array.isArray(raw.benefits) && raw.benefits.length > 0 ? raw.benefits : inferBenefits(raw);

  return {
    ...raw,
    ...priceFields,
    catalogId: raw.catalogId,
    slug: raw.slug,
    img: resolveMediaUrl(raw.img) || defaultVariant?.img || images[0] || "",
    images: images.length
      ? images
      : [resolveMediaUrl(raw.img) || defaultVariant?.img].filter(Boolean),
    packSize: defaultVariant?.packSize ?? raw.packSize ?? "",
    packaging,
    benefits,
    badge: raw.badge ?? formatBadge(raw.tag, raw.reviewCount ?? 0),
    inStock: variants.length ? variants.some((variant) => variant.inStock) : raw.inStock !== false,
    featured: Boolean(raw.featured),
    isNew: Boolean(raw.isNew),
    isBestSeller: Boolean(raw.isBestSeller),
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
    products: products.filter((p) => p.categoryId === cat.id),
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
