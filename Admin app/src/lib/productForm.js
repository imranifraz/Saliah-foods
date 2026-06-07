export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export function createVariant(overrides = {}) {
  return {
    id: null,
    weight: "",
    sku: "",
    priceValue: "",
    mrpValue: "",
    stockQuantity: "10",
    packaging: "Pouch",
    isDefault: false,
    ...overrides,
  };
}

export function createEmptyForm(categoryId = "dates") {
  return {
    name: "",
    slug: "",
    categoryId,
    productType: "simple",
    status: "active",
    tagline: "",
    fullDescription: "",
    tag: "",
    badge: "",
    benefits: "Natural Energy",
    featured: false,
    isNew: false,
    existingImages: [],
    imageFiles: [],
    variants: [createVariant({ weight: "250g", packaging: "Pouch", isDefault: true })],
  };
}

export function mapProductToForm(product) {
  return {
    name: product.name ?? "",
    slug: product.slug ?? "",
    categoryId: product.categoryId ?? "dates",
    productType: product.productType ?? "simple",
    status: product.status ?? "active",
    tagline: product.tagline ?? "",
    fullDescription: product.fullDescription ?? "",
    tag: product.tag ?? "",
    badge: product.badge ?? "",
    benefits: Array.isArray(product.benefits) ? product.benefits.join(", ") : "",
    featured: Boolean(product.featured),
    isNew: Boolean(product.isNew),
    existingImages: Array.isArray(product.images) ? product.images : product.img ? [product.img] : [],
    imageFiles: [],
    variants:
      product.variants?.length > 0
        ? product.variants.map((variant) =>
            createVariant({
              id: variant.id,
              weight: variant.weight ?? variant.packSize ?? "",
              sku: variant.sku ?? "",
              priceValue: variant.priceValue != null ? String(variant.priceValue) : "",
              mrpValue: variant.mrpValue != null ? String(variant.mrpValue) : "",
              stockQuantity: variant.stockQuantity != null ? String(variant.stockQuantity) : "0",
              packaging: variant.packaging ?? "Pouch",
              isDefault: Boolean(variant.isDefault),
            })
          )
        : [createVariant({ weight: product.packSize ?? "250g", packaging: "Pouch", isDefault: true })],
  };
}

export function slugifySkuPart(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function buildAutoSku({ categoryId, productName, weight }) {
  const parts = [
    slugifySkuPart(categoryId),
    slugifySkuPart(productName),
    slugifySkuPart(weight || "default"),
  ].filter(Boolean);

  return parts.join("-").toUpperCase();
}

export function parseSortValue(value) {
  const [field, direction] = value.split(":");
  return { field, direction: direction === "desc" ? "desc" : "asc" };
}

export function buildProductsUrl({
  query,
  categoryFilter,
  statusFilter,
  stockFilter,
  featuredFilter,
  typeFilter,
  badgeFilter,
  sortValue,
  page,
  pageSize,
  all,
}) {
  const { field, direction } = parseSortValue(sortValue);
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (categoryFilter !== "all") params.set("category", categoryFilter);
  if (statusFilter !== "all") params.set("status", statusFilter);
  if (stockFilter !== "all") params.set("stock", stockFilter);
  if (featuredFilter !== "all") params.set("featured", featuredFilter);
  if (typeFilter !== "all") params.set("type", typeFilter);
  if (badgeFilter !== "all") params.set("badge", badgeFilter);
  params.set("sort", field);
  params.set("direction", direction);
  if (all) {
    params.set("all", "true");
  } else {
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
  }
  return `/api/admin/products?${params.toString()}`;
}

export function escapeCsv(value) {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function downloadProductsCsv(products) {
  const header = [
    "catalogId",
    "name",
    "category",
    "type",
    "status",
    "price",
    "mrp",
    "inStock",
    "variants",
    "featured",
    "isNew",
    "isBestSeller",
    "createdAt",
    "updatedAt",
  ];
  const lines = [
    header.join(","),
    ...products.map((product) =>
      [
        escapeCsv(product.catalogId ?? product.id),
        escapeCsv(product.name),
        escapeCsv(product.categoryLabel ?? product.categoryId),
        escapeCsv(product.productType),
        escapeCsv(product.status),
        escapeCsv(product.price ?? product.priceValue),
        escapeCsv(product.mrp ?? product.mrpValue ?? ""),
        escapeCsv(product.inStock ? "yes" : "no"),
        escapeCsv(product.variantCount ?? 0),
        escapeCsv(product.featured ? "yes" : "no"),
        escapeCsv(product.isNew ? "yes" : "no"),
        escapeCsv(product.isBestSeller ? "yes" : "no"),
        escapeCsv(product.createdAt ?? ""),
        escapeCsv(product.updatedAt ?? ""),
      ].join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function formatProductDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function validateProductImageFile(file) {
  if (!file) return { ok: false, error: "No file selected." };
  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    return { ok: false, error: "Image must be 5 MB or smaller." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: true, warn: "This file may not be an image. Upload JPG, PNG, or WebP for best results." };
  }
  return { ok: true };
}
