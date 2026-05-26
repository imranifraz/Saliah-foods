import { productMenuCategories } from "./productMenu";
import { buildPriceFields } from "./pricing";

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

function inferPriceValue(packSize, name) {
  if (packSize === "1kg" || name.includes("Ajwa")) return 1899;
  if (name.includes("Kimia") || name.includes("Medjool")) return 1299;
  if (packSize === "500g") return 899;
  if (packSize === "400g") return 449;
  if (packSize === "300g") return 379;
  if (packSize === "250g") return 349;
  if (packSize === "200g") return 549;
  if (packSize === "100g") return 149;
  if (packSize?.includes("Gift Box")) return 999;
  return 299;
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

export function slugifyProduct(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getProductDetailPath(product) {
  return `/product/${product.slug ?? slugifyProduct(product.name)}`;
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

function enrichProduct(product, categoryId, categoryLabel, index) {
  const packaging = inferPackaging(product.packSize);
  const priceValue = product.priceValue ?? inferPriceValue(product.packSize, product.name);
  const priceFields = buildPriceFields(priceValue, product.mrpValue);

  return {
    ...product,
    ...priceFields,
    categoryId,
    categoryLabel,
    catalogId: product.id ?? `${categoryId}-${product.name}`,
    slug: slugifyProduct(product.name),
    packaging,
    benefits: inferBenefits(product),
    badge: product.badge ?? formatBadge(product.tag, product.reviewCount ?? 0),
    inStock: true,
    featured: index < 2,
    isNew: product.isNew ?? (index === 0 && categoryId === "wellness-traditional"),
    isBestSeller: (product.reviewCount ?? 0) > 200,
  };
}

export function getAllCatalogProducts() {
  const seen = new Set();
  const items = [];

  for (const category of productMenuCategories) {
    category.products.forEach((product, index) => {
      const key = product.name;
      if (seen.has(key)) return;
      seen.add(key);
      items.push(enrichProduct(product, category.id, category.label, index));
    });
  }

  return items;
}

export function getProductBySlug(slug) {
  return getAllCatalogProducts().find((p) => p.slug === slug) ?? null;
}

export function getRelatedProducts(product, limit = 4) {
  return getAllCatalogProducts()
    .filter((p) => p.categoryId === product.categoryId && p.slug !== product.slug)
    .slice(0, limit);
}

export function getProductsForCategory(categoryId) {
  if (categoryId === "all") return getAllCatalogProducts();
  const category = productMenuCategories.find((c) => c.id === categoryId);
  if (!category) return [];
  return category.products.map((product, index) =>
    enrichProduct(product, category.id, category.label, index)
  );
}

export const CATEGORY_PILLS = [
  { id: "all", label: "All Products" },
  { id: "premium-dates", label: "Premium Dates" },
  { id: "wellness-traditional", label: "Wellness Foods" },
  { id: "best-sellers", label: "Best Sellers" },
];

export const FILTER_OPTIONS = {
  price: [
    { value: "all", label: "All Prices" },
    { value: "under-500", label: "Under ₹500" },
    { value: "500-1000", label: "₹500–₹1000" },
    { value: "1000-plus", label: "₹1000+" },
  ],
  benefits: [
    { value: "all", label: "All Benefits" },
    { value: "No Added Sugar", label: "No Added Sugar" },
    { value: "Natural Energy", label: "Natural Energy" },
    { value: "High Fiber", label: "High Fiber" },
    { value: "Organic", label: "Organic" },
  ],
  packaging: [
    { value: "all", label: "All Packaging" },
    { value: "Pouch", label: "Pouch" },
    { value: "Gift Box", label: "Gift Box" },
    { value: "Bulk Pack", label: "Bulk Pack" },
  ],
  availability: [
    { value: "all", label: "All" },
    { value: "in-stock", label: "In Stock" },
  ],
};

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "best-selling", label: "Best Selling" },
  { value: "new-arrivals", label: "New Arrivals" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Customer Rating" },
];

export function filterProducts(products, filters) {
  return products.filter((product) => {
    if (filters.category !== "all" && product.categoryId !== filters.category) return false;

    if (filters.price !== "all") {
      const p = product.priceValue;
      if (filters.price === "under-500" && p >= 500) return false;
      if (filters.price === "500-1000" && (p < 500 || p > 1000)) return false;
      if (filters.price === "1000-plus" && p < 1000) return false;
    }

    if (filters.benefits !== "all" && !product.benefits.includes(filters.benefits)) return false;

    if (filters.packaging !== "all" && product.packaging !== filters.packaging) {
      return false;
    }

    if (filters.availability === "in-stock" && !product.inStock) return false;

    return true;
  });
}

export function sortProducts(products, sortBy) {
  const sorted = [...products];

  switch (sortBy) {
    case "best-selling":
      return sorted.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
    case "new-arrivals":
      return sorted.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    case "price-asc":
      return sorted.sort((a, b) => a.priceValue - b.priceValue);
    case "price-desc":
      return sorted.sort((a, b) => b.priceValue - a.priceValue);
    case "rating":
      return sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case "featured":
    default:
      return sorted.sort(
        (a, b) => Number(b.featured) - Number(a.featured) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0)
      );
  }
}
