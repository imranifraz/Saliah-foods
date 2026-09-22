export function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function generateVariantSku({ categoryId, productName, productSlug, weight }) {
  const parts = [
    slugify(categoryId),
    slugify(productSlug || productName),
    slugify(weight || "default"),
  ].filter(Boolean);

  return parts.join("-").toUpperCase();
}

export function parseImages(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return Array.isArray(value) ? value : [];
}

export function normalizeStockQuantity(value) {
  const quantity = Number(value);
  if (!Number.isFinite(quantity) || quantity < 0) return 0;
  return Math.floor(quantity);
}

export function stockStatusFromQuantity(quantity) {
  return normalizeStockQuantity(quantity) > 0 ? "in_stock" : "out_of_stock";
}

export function isVariantInStock(variant) {
  const stock = Number(variant?.stockQuantity ?? 0);
  const reserved = Number(variant?.reservedQuantity ?? 0);
  return stockStatusFromQuantity(Math.max(0, stock - reserved)) === "in_stock";
}

export function pickDefaultVariant(variants) {
  if (!Array.isArray(variants) || variants.length === 0) return null;
  return (
    variants.find((variant) => variant.isDefault) ??
    [...variants].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))[0]
  );
}

export function buildProductSummary(product, variants) {
  const defaultVariant = pickDefaultVariant(variants);
  const imagePool = parseImages(product.images);
  const mainImage = imagePool[0] ?? defaultVariant?.img ?? product.img;

  return {
    catalogId: product.catalogId || `${product.categoryId}-${product.slug}`,
    img: mainImage,
    images: imagePool.length ? imagePool : mainImage ? [mainImage] : [],
    packSize: defaultVariant?.weight ?? product.packSize ?? "",
    packaging: defaultVariant?.packaging ?? product.packaging ?? null,
    priceValue: defaultVariant?.priceValue ?? product.priceValue,
    mrpValue:
      defaultVariant?.mrpValue !== undefined ? defaultVariant.mrpValue : product.mrpValue ?? null,
    inStock: variants.length > 0 ? variants.some(isVariantInStock) : Boolean(product.inStock),
  };
}

export async function syncProductSummary(prisma, productId) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      variants: {
        orderBy: [{ isDefault: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!product) return null;

  const summary = buildProductSummary(product, product.variants);
  // Keep gallery order from the product row; only refresh derived pricing/stock fields.
  // Prefer images[] written by the last PATCH — never let an empty variant img wipe the gallery.
  return prisma.product.update({
    where: { id: product.id },
    data: {
      catalogId: summary.catalogId,
      img: (summary.images?.[0] || summary.img || product.img) ?? product.img,
      images: summary.images?.length ? summary.images : product.images,
      packSize: summary.packSize || null,
      packaging: summary.packaging,
      priceValue: summary.priceValue,
      mrpValue: summary.mrpValue,
      inStock: summary.inStock,
    },
    include: {
      variants: {
        orderBy: [{ isDefault: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });
}
