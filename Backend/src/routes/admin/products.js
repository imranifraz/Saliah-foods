import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { formatProduct } from "../../lib/product-response.js";
import { syncBestSellersFromSales } from "../../lib/best-sellers.js";
import {
  buildProductSummary,
  generateVariantSku,
  normalizeStockQuantity,
  slugify,
  stockStatusFromQuantity,
  syncProductSummary,
} from "../../lib/products.js";
import { requireAdmin } from "../../middleware/admin.js";

const router = Router();
const uploadDir = path.resolve(process.cwd(), "uploads", "products");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".png";
    const base = slugify(path.basename(file.originalname || "product", ext)) || "product";
    cb(null, `${base}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
});

router.use(requireAdmin);

router.post("/sync-best-sellers", async (_req, res, next) => {
  try {
    const result = await syncBestSellersFromSales(prisma);
    res.json({ ok: true, message: "Best sellers updated from order sales", ...result });
  } catch (err) {
    next(err);
  }
});

function parseBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "off", ""].includes(normalized)) return false;
  }
  if (typeof value === "number") return value === 1;
  return fallback;
}

function parseMaybeJson(value, fallback) {
  if (value == null || value === "") return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function parseBenefits(value) {
  const parsed = parseMaybeJson(value, value);
  if (Array.isArray(parsed)) {
    return parsed.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof parsed === "string") {
    return parsed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return ["Natural Energy"];
}

function uploadedPaths(files = []) {
  return files.map((file) => `/uploads/products/${file.filename}`);
}

function dedupe(values) {
  return [...new Set(values.filter(Boolean))];
}

function parseStatus(value, fallback = "active") {
  return value === "draft" ? "draft" : fallback;
}

function parseProductType(value, fallback = "simple") {
  return value === "variant" ? "variant" : fallback;
}

function formatProducts(products) {
  return products.map((product) => formatProduct(product));
}

function normalizeVariantRows(rawVariants, fallback, existingVariants = []) {
  const rows = Array.isArray(rawVariants) ? rawVariants : [];
  const existingById = new Map(existingVariants.map((variant) => [variant.id, variant]));
  const normalized = rows.map((row, index) => {
    const weight = String(row.weight ?? row.packSize ?? "").trim();
    const existingVariant = row.id ? existingById.get(String(row.id)) : null;
    const sku =
      existingVariant?.sku ||
      generateVariantSku({
        categoryId: fallback.categoryId,
        productName: fallback.productName,
        productSlug: fallback.productSlug,
        weight,
      });
    const priceValue = Number(row.priceValue ?? row.sellingPrice ?? 0);
    const mrpValue =
      row.mrpValue == null || row.mrpValue === ""
        ? null
        : Number(row.mrpValue ?? row.mrpPrice ?? row.mrp);
    const stockQuantity = normalizeStockQuantity(row.stockQuantity);

    return {
      id: row.id ? String(row.id) : null,
      weight,
      sku,
      priceValue,
      mrpValue,
      stockQuantity,
      stockStatus: stockStatusFromQuantity(stockQuantity),
      img: String(row.img ?? fallback.img ?? "").trim() || null,
      packaging: String(row.packaging ?? fallback.packaging ?? "").trim() || null,
      isDefault: Boolean(row.isDefault),
      sortOrder: Number(row.sortOrder ?? index),
    };
  });

  const cleaned = normalized.filter(
    (row) => row.weight && Number.isFinite(row.priceValue) && row.priceValue > 0
  );

  if (cleaned.length === 0) {
    return [];
  }

  const seenWeights = new Set();
  const seenSkus = new Set();

  cleaned.forEach((row) => {
    const weightKey = row.weight.toLowerCase();
    const skuKey = row.sku.toLowerCase();
    if (seenWeights.has(weightKey)) {
      throw new Error(`Duplicate variant weight: ${row.weight}`);
    }
    if (seenSkus.has(skuKey)) {
      throw new Error(`Duplicate SKU: ${row.sku}`);
    }
    seenWeights.add(weightKey);
    seenSkus.add(skuKey);
  });

  const defaultIndex = cleaned.findIndex((row) => row.isDefault);
  return cleaned.map((row, index) => ({
    ...row,
    isDefault: defaultIndex === -1 ? index === 0 : index === defaultIndex,
  }));
}

function createSimpleVariant(body, fallback, existingVariants = []) {
  const weight = String(body.weight ?? body.packSize ?? fallback.packSize ?? "Default").trim();
  const requestedVariantId = body.variantId ? String(body.variantId) : null;
  const existingVariant =
    existingVariants.find((variant) => variant.id === requestedVariantId) ?? existingVariants[0] ?? null;
  const sku =
    existingVariant?.sku ||
    generateVariantSku({
      categoryId: fallback.categoryId,
      productName: fallback.productName,
      productSlug: fallback.productSlug,
      weight,
    });
  const priceValue = Number(body.priceValue ?? body.sellingPrice ?? 0);
  const mrpValue =
    body.mrpValue == null || body.mrpValue === ""
      ? null
      : Number(body.mrpValue ?? body.mrpPrice ?? body.mrp);
  const stockQuantity =
    body.stockQuantity !== undefined
      ? normalizeStockQuantity(body.stockQuantity)
      : parseBoolean(body.inStock, fallback.inStock ?? true)
        ? 10
        : 0;

  if (!weight || !Number.isFinite(priceValue) || priceValue <= 0) {
    throw new Error("Simple products require weight, selling price, and stock quantity");
  }

  return [
    {
      id: body.variantId ? String(body.variantId) : null,
      weight,
      sku,
      priceValue,
      mrpValue,
      stockQuantity,
      stockStatus: stockStatusFromQuantity(stockQuantity),
      img: String(body.variantImage ?? fallback.img ?? "").trim() || null,
      packaging: String(body.packaging ?? fallback.packaging ?? "").trim() || null,
      isDefault: true,
      sortOrder: 0,
    },
  ];
}

async function parseProductPayload(req, existingProduct = null) {
  const categoryId = String(req.body.categoryId ?? existingProduct?.categoryId ?? "").trim();
  const category = categoryId
    ? await prisma.category.findUnique({ where: { id: categoryId } })
    : null;

  if (!category) {
    throw new Error("Select a valid category");
  }

  const name = String(req.body.name ?? existingProduct?.name ?? "").trim();
  if (!name) {
    throw new Error("Product name is required");
  }

  const slug = String(req.body.slug ?? existingProduct?.slug ?? slugify(name)).trim() || slugify(name);
  const catalogId =
    String(req.body.catalogId ?? existingProduct?.catalogId ?? `${category.id}-${slug}`).trim() ||
    `${category.id}-${slug}`;

  const incomingImages = uploadedPaths(req.files);
  const existingImages = parseMaybeJson(req.body.existingImages, existingProduct?.images ?? []);
  const images = dedupe([
    ...existingImages,
    ...incomingImages,
    req.body.img ?? "",
    existingProduct?.img ?? "",
  ]);
  const mainImage = images[0];

  if (!mainImage) {
    throw new Error("At least one product image is required");
  }

  const fallbackVariant = {
    img: mainImage,
    catalogId,
    categoryId: category.id,
    productName: name,
    productSlug: slug,
    packSize: req.body.packSize ?? existingProduct?.packSize ?? "Default",
    inStock: existingProduct?.inStock ?? true,
    packaging: String(req.body.packaging ?? existingProduct?.packaging ?? "").trim() || null,
  };
  const productType = parseProductType(req.body.productType, existingProduct?.productType ?? "simple");
  const rawVariants = parseMaybeJson(req.body.variants, []);
  const variants =
    productType === "variant"
      ? normalizeVariantRows(rawVariants, fallbackVariant, existingProduct?.variants ?? [])
      : createSimpleVariant(req.body, fallbackVariant, existingProduct?.variants ?? []);

  if (variants.length === 0) {
    throw new Error("Add at least one product variant");
  }

  const summary = buildProductSummary(
    {
      catalogId,
      slug,
      img: mainImage,
      images,
      packSize: existingProduct?.packSize ?? "",
      priceValue: existingProduct?.priceValue ?? 0,
      mrpValue: existingProduct?.mrpValue ?? null,
      packaging: fallbackVariant.packaging,
      inStock: existingProduct?.inStock ?? true,
    },
    variants
  );

  return {
    product: {
      catalogId,
      slug,
      name,
      productType,
      status: parseStatus(req.body.status, existingProduct?.status ?? "active"),
      tagline: String(req.body.tagline ?? existingProduct?.tagline ?? "").trim(),
      fullDescription: String(req.body.fullDescription ?? existingProduct?.fullDescription ?? "").trim(),
      tag: String(req.body.tag ?? existingProduct?.tag ?? "").trim() || null,
      img: summary.img || mainImage,
      images: summary.images?.length ? summary.images : images,
      packSize: summary.packSize || null,
      categoryId: category.id,
      categoryLabel: category.label,
      priceValue: summary.priceValue,
      mrpValue: summary.mrpValue,
      rating:
        req.body.rating !== undefined
          ? Number(req.body.rating)
          : Number(existingProduct?.rating ?? 4.7),
      reviewCount:
        req.body.reviewCount !== undefined
          ? Number(req.body.reviewCount)
          : Number(existingProduct?.reviewCount ?? 0),
      packaging: summary.packaging ?? fallbackVariant.packaging,
      badge: String(req.body.badge ?? existingProduct?.badge ?? "").trim() || null,
      benefits: parseBenefits(req.body.benefits ?? existingProduct?.benefits ?? ["Natural Energy"]),
      inStock: summary.inStock,
      featured: parseBoolean(req.body.featured, existingProduct?.featured ?? false),
      isNew: parseBoolean(req.body.isNew, existingProduct?.isNew ?? false),
    },
    variants,
  };
}

async function upsertVariants(tx, productId, existingVariants, variants) {
  const keepIds = variants.map((variant) => variant.id).filter(Boolean);

  await tx.productVariant.deleteMany({
    where: {
      productId,
      ...(keepIds.length ? { id: { notIn: keepIds } } : {}),
    },
  });

  for (const variant of variants) {
    const payload = {
      productId,
      sku: variant.sku,
      weight: variant.weight,
      priceValue: variant.priceValue,
      mrpValue: variant.mrpValue,
      stockQuantity: variant.stockQuantity,
      stockStatus: variant.stockStatus,
      img: variant.img,
      packaging: variant.packaging,
      isDefault: variant.isDefault,
      sortOrder: variant.sortOrder,
    };

    if (variant.id && existingVariants.some((row) => row.id === variant.id)) {
      await tx.productVariant.update({
        where: { id: variant.id },
        data: payload,
      });
    } else {
      await tx.productVariant.create({ data: payload });
    }
  }
}

router.get("/", async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: {
          orderBy: [{ isDefault: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
        },
      },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    });

    res.json({ ok: true, products: formatProducts(products) });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        variants: {
          orderBy: [{ isDefault: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    if (!product) {
      return res.status(404).json({ ok: false, error: "Product not found" });
    }

    res.json({ ok: true, product: formatProduct(product) });
  } catch (err) {
    next(err);
  }
});

router.post("/", upload.array("images", 8), async (req, res, next) => {
  try {
    const parsed = await parseProductPayload(req);

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({ data: parsed.product });
      await upsertVariants(tx, created.id, [], parsed.variants);
      return syncProductSummary(tx, created.id);
    });

    res.status(201).json({ ok: true, product: formatProduct(product) });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ ok: false, error: "Duplicate product slug, catalog ID, or variant SKU" });
    }
    next(err);
  }
});

router.patch("/:id", upload.array("images", 8), async (req, res, next) => {
  try {
    const existing = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { variants: true },
    });

    if (!existing) {
      return res.status(404).json({ ok: false, error: "Product not found" });
    }

    const bodyKeys = Object.keys(req.body ?? {});
    if (!req.is("multipart/form-data") && bodyKeys.length === 1 && bodyKeys[0] === "inStock") {
      const nextInStock = parseBoolean(req.body.inStock, existing.inStock);
      const product = await prisma.$transaction(async (tx) => {
        await tx.productVariant.updateMany({
          where: { productId: existing.id },
          data: {
            stockQuantity: nextInStock ? 10 : 0,
            stockStatus: nextInStock ? "in_stock" : "out_of_stock",
          },
        });
        return syncProductSummary(tx, existing.id);
      });
      return res.json({ ok: true, product: formatProduct(product) });
    }

    const parsed = await parseProductPayload(req, existing);

    const product = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: existing.id },
        data: parsed.product,
      });
      await upsertVariants(tx, existing.id, existing.variants, parsed.variants);
      return syncProductSummary(tx, existing.id);
    });

    res.json({ ok: true, product: formatProduct(product) });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ ok: false, error: "Duplicate product slug, catalog ID, or variant SKU" });
    }
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ ok: false, error: "Product not found" });
    }
    next(err);
  }
});

export default router;
