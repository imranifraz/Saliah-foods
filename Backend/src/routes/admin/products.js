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
import { applyProductInStockToggle } from "../../lib/inventoryStock.js";
import { requireAdmin } from "../../middleware/admin.js";

function assertValidVariantPricing(priceValue, mrpValue, label) {
  if (mrpValue == null || !Number.isFinite(mrpValue) || mrpValue <= 0) {
    throw new Error(`${label}: MRP is required`);
  }
  if (priceValue > mrpValue) {
    throw new Error(`${label}: selling price cannot exceed MRP`);
  }
}

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
  limits: { fileSize: 8 * 1024 * 1024, files: 8 },
});

function runProductUpload(req, res, next) {
  upload.array("images", 8)(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ ok: false, error: "Image must be 8 MB or smaller." });
      }
      if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({ ok: false, error: "You can upload at most 8 images." });
      }
      return res.status(400).json({ ok: false, error: err.message || "Image upload failed." });
    }
    return res.status(400).json({ ok: false, error: err.message || "Image upload failed." });
  });
}

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

function uploadedPaths(files) {
  const list = Array.isArray(files) ? files : [];
  return list.map((file) => `/uploads/products/${file.filename}`);
}

function resolveProductImages(req, existingProduct = null) {
  const incomingImages = uploadedPaths(req.files);
  const existingImagesRaw = parseMaybeJson(req.body.existingImages, []);
  const existingImages = Array.isArray(existingImagesRaw)
    ? existingImagesRaw.map((url) => String(url || "").trim()).filter(Boolean)
    : [];
  const imageOrder = parseMaybeJson(req.body.imageOrder, null);
  const newSlotCount = Array.isArray(imageOrder)
    ? imageOrder.filter((slot) => slot === "__new__").length
    : 0;

  if (newSlotCount > 0 && incomingImages.length === 0) {
    throw new Error(
      "Image file did not reach the server. Use JPG/PNG under 8 MB, then Save product again."
    );
  }
  if (newSlotCount > incomingImages.length) {
    throw new Error(
      `Expected ${newSlotCount} new image(s) but received ${incomingImages.length}. Please upload again.`
    );
  }

  let images = [];
  if (Array.isArray(imageOrder) && imageOrder.length > 0) {
    let incomingIndex = 0;
    images = imageOrder
      .map((slot) => {
        if (slot === "__new__") {
          const next = incomingImages[incomingIndex];
          incomingIndex += 1;
          return next || "";
        }
        return String(slot || "").trim();
      })
      .filter(Boolean);
    if (incomingIndex < incomingImages.length) {
      images.push(...incomingImages.slice(incomingIndex));
    }
  } else {
    images = [...incomingImages, ...existingImages];
  }

  // Do not re-attach a removed previous cover when the client sent an explicit order.
  if (!images.length && existingProduct?.img) {
    images = [existingProduct.img];
  }

  return dedupe(images);
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
      img: String(fallback.img || row.img || "").trim() || null,
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
    assertValidVariantPricing(row.priceValue, row.mrpValue, row.weight || "Variant");
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

  assertValidVariantPricing(priceValue, mrpValue, weight || "Product");

  return [
    {
      id: body.variantId ? String(body.variantId) : null,
      weight,
      sku,
      priceValue,
      mrpValue,
      stockQuantity,
      stockStatus: stockStatusFromQuantity(stockQuantity),
      img: String(fallback.img || body.variantImage || "").trim() || null,
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

  const images = resolveProductImages(req, existingProduct);
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
      bogoEnabled: parseBoolean(req.body.bogoEnabled, existingProduct?.bogoEnabled ?? false),
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

router.get("/", async (req, res, next) => {
  try {
    const q = String(req.query.q ?? "").trim();
    const category = String(req.query.category ?? "all");
    const status = String(req.query.status ?? "all");
    const stock = String(req.query.stock ?? "all");
    const featured = String(req.query.featured ?? "all");
    const type = String(req.query.type ?? "all");
    const badge = String(req.query.badge ?? "all");
    const sort = String(req.query.sort ?? "name");
    const direction = req.query.direction === "desc" ? "desc" : "asc";
    const all = req.query.all === "true" || req.query.page == null;
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(req.query.pageSize, 10) || 25));

    const where = {};
    if (category !== "all") {
      if (category === "best-sellers") where.isBestSeller = true;
      else where.categoryId = category;
    }
    if (status === "active") where.status = "active";
    if (status === "draft") where.status = "draft";
    if (stock === "in_stock") where.inStock = true;
    if (stock === "out_of_stock") where.inStock = false;
    if (featured === "featured") where.featured = true;
    if (featured === "none") where.featured = false;
    if (type === "simple") where.productType = "simple";
    if (type === "variant") where.productType = "variant";
    if (badge === "new") where.isNew = true;
    if (badge === "best_seller") where.isBestSeller = true;
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
        { catalogId: { contains: q, mode: "insensitive" } },
        { tagline: { contains: q, mode: "insensitive" } },
        { variants: { some: { sku: { contains: q, mode: "insensitive" } } } },
      ];
    }

    const dbOrderBy =
      sort === "priceValue"
        ? [{ priceValue: direction }]
        : sort === "updatedAt"
          ? [{ updatedAt: direction }]
          : sort === "createdAt"
            ? [{ createdAt: direction }]
            : sort === "featured"
              ? [{ featured: "desc" }, { name: "asc" }]
              : [{ name: direction }];

    const products = await prisma.product.findMany({
      where,
      include: {
        variants: {
          orderBy: [{ isDefault: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
        },
      },
      orderBy: dbOrderBy,
    });

    let list = formatProducts(products);

    if (sort === "variantCount") {
      list.sort((a, b) => {
        const cmp = (a.variantCount ?? 0) - (b.variantCount ?? 0);
        return direction === "asc" ? cmp : -cmp;
      });
    }

    const summary = {
      total: list.length,
      active: list.filter((product) => product.status === "active").length,
      draft: list.filter((product) => product.status === "draft").length,
      inStock: list.filter((product) => product.inStock).length,
      outOfStock: list.filter((product) => !product.inStock).length,
      variants: list
        .filter((product) => product.productType === "variant")
        .reduce((sum, product) => sum + Number(product.variantCount ?? 0), 0),
      featured: list.filter((product) => product.featured).length,
      simple: list.filter((product) => product.productType === "simple").length,
      isNew: list.filter((product) => product.isNew).length,
      isBestSeller: list.filter((product) => product.isBestSeller).length,
    };

    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = all ? 1 : Math.min(page, totalPages);
    const paginated = all ? list : list.slice((safePage - 1) * pageSize, safePage * pageSize);

    res.json({
      ok: true,
      products: paginated,
      total,
      page: safePage,
      pageSize: all ? total : pageSize,
      totalPages: all ? 1 : totalPages,
      summary,
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/bulk", async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(String).filter(Boolean) : [];
    const patch = req.body?.patch ?? {};
    if (!ids.length) {
      return res.status(400).json({ ok: false, error: "No product IDs provided" });
    }

    const hasStatus = patch.status === "active" || patch.status === "draft";
    const hasStock = typeof patch.inStock === "boolean";

    if (!hasStatus && !hasStock) {
      return res.status(400).json({ ok: false, error: "Nothing to update" });
    }

    const products = await prisma.$transaction(async (tx) => {
      const updated = [];
      for (const id of ids) {
        const existing = await tx.product.findUnique({ where: { id }, include: { variants: true } });
        if (!existing) continue;

        if (hasStatus) {
          await tx.product.update({ where: { id }, data: { status: patch.status } });
        }

        if (hasStock) {
          await applyProductInStockToggle(tx, id, patch.inStock, { admin: req.admin });
        }

        updated.push(await syncProductSummary(tx, id));
      }
      return updated;
    });

    res.json({ ok: true, updated: products.length, products: formatProducts(products) });
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

router.post("/", runProductUpload, async (req, res, next) => {
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

router.patch("/:id", runProductUpload, async (req, res, next) => {
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
        return applyProductInStockToggle(tx, existing.id, nextInStock, { admin: req.admin });
      });
      return res.json({ ok: true, product: formatProduct(product) });
    }

    if (!req.is("multipart/form-data") && bodyKeys.length === 1 && bodyKeys[0] === "status") {
      const nextStatus = req.body.status === "draft" ? "draft" : "active";
      const product = await prisma.$transaction(async (tx) => {
        await tx.product.update({ where: { id: existing.id }, data: { status: nextStatus } });
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
