import {
  createEmptyProductStory,
  highlightsToTextarea,
  pairsToTextarea,
  serializeProductStory,
  storyFromProduct,
  textareaToHighlights,
  textareaToPairs,
} from "./productStory.js";

export const PRODUCT_IMAGE_MAX_BYTES = 8 * 1024 * 1024;

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

function createEmptyStoryFields() {
  const story = createEmptyProductStory();
  return {
    overview: "",
    highlightsText: "100% natural\nNo added sugar\nCarefully packed",
    ingredients: "",
    nutritionEnabled: false,
    nutritionText: "",
    nutritionNote: story.nutritionNote,
    origin: "",
    storage: story.storage,
    bestBefore: "",
    important: "",
    factsText: "",
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
    tag: "",
    badge: "",
    featured: false,
    isNew: false,
    bogoEnabled: false,
    ...createEmptyStoryFields(),
    existingImages: [],
    imageFiles: [],
    variants: [createVariant({ weight: "250g", packaging: "Pouch", isDefault: true })],
  };
}

export function mapProductToForm(product) {
  const fromGallery = Array.isArray(product.images)
    ? product.images.map((url) => String(url || "").trim()).filter(Boolean)
    : [];
  const cover = String(product.img || "").trim();
  const existingImages = fromGallery.length
    ? fromGallery
    : cover
      ? [cover]
      : [];
  const ordered =
    cover && existingImages.includes(cover)
      ? [cover, ...existingImages.filter((url) => url !== cover)]
      : cover && !existingImages.includes(cover)
        ? [cover, ...existingImages]
        : existingImages;

  const packSize =
    product.packSize ||
    product.variants?.[0]?.weight ||
    product.variants?.[0]?.packSize ||
    "";
  const story = storyFromProduct({
    fullDescription: product.fullDescription ?? "",
    benefits: product.benefits,
    name: product.name ?? "",
    packSize,
  });
  // Net Weight is owned by variant/pack pricing fields — keep it out of the freeform facts box.
  const factsForForm = (story.facts || []).filter(
    (row) => !/^net\s*weight$/i.test(String(row.label || "").trim())
  );

  return {
    name: product.name ?? "",
    slug: product.slug ?? "",
    categoryId: product.categoryId ?? "dates",
    productType: product.productType ?? "simple",
    status: product.status ?? "active",
    tagline: product.tagline ?? "",
    tag: product.tag ?? "",
    badge: product.badge ?? "",
    featured: Boolean(product.featured),
    isNew: Boolean(product.isNew),
    bogoEnabled: Boolean(product.bogoEnabled),
    overview: story.overview,
    highlightsText: highlightsToTextarea(story.highlights),
    ingredients: story.ingredients,
    nutritionEnabled: Array.isArray(story.nutrition) && story.nutrition.some((row) => row?.label && row?.value),
    nutritionText: pairsToTextarea(story.nutrition),
    nutritionNote: story.nutritionNote,
    origin: story.origin,
    storage: story.storage,
    bestBefore: story.bestBefore,
    important: story.important,
    factsText: pairsToTextarea(factsForForm),
    existingImages: ordered,
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

/** Build catalog fullDescription + benefits array from structured form fields. */
export function buildStoryPayloadFromForm(form) {
  const highlights = textareaToHighlights(form.highlightsText);
  const nutritionEnabled = Boolean(form.nutritionEnabled);
  const nutrition = nutritionEnabled ? textareaToPairs(form.nutritionText) : [];
  const nutritionNote = nutritionEnabled ? form.nutritionNote : "";
  const facts = textareaToPairs(form.factsText).filter(
    (row) => !/^net\s*weight$/i.test(String(row.label || "").trim())
  );

  // Net Weight always comes from the pricing / variant pack labels.
  const packWeights = (form.variants || [])
    .map((variant) => String(variant.weight || "").trim())
    .filter(Boolean);
  const uniqueWeights = [...new Set(packWeights)];
  const netWeight =
    form.productType === "variant" && uniqueWeights.length > 1
      ? uniqueWeights.join(" / ")
      : uniqueWeights[0] || "";
  if (netWeight) {
    const productIdx = facts.findIndex((row) => /^product$/i.test(String(row.label || "").trim()));
    const netRow = { label: "Net Weight", value: netWeight };
    if (productIdx >= 0) facts.splice(productIdx + 1, 0, netRow);
    else facts.splice(Math.min(1, facts.length), 0, netRow);
  }

  const fullDescription = serializeProductStory({
    overview: form.overview,
    highlights,
    ingredients: form.ingredients,
    nutrition,
    nutritionNote,
    origin: form.origin,
    storage: form.storage,
    bestBefore: form.bestBefore,
    important: form.important,
    facts,
  });

  return {
    fullDescription,
    benefits: highlights.length ? highlights : ["Natural Energy"],
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
    return { ok: false, error: "Image must be 8 MB or smaller." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: true, warn: "This file may not be an image. Upload JPG, PNG, or WebP for best results." };
  }
  return { ok: true };
}
