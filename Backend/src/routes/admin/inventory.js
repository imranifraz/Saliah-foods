import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import {
  getAvailableQuantity,
  isLowStockAvailable,
  LOW_STOCK_THRESHOLD,
} from "../../lib/inventoryConstants.js";
import {
  setVariantStockQuantity,
  productSelect,
} from "../../lib/inventoryStock.js";
import { listStockHistory } from "../../lib/stockAudit.js";
import { requireAdmin } from "../../middleware/admin.js";

const router = Router();
export { LOW_STOCK_THRESHOLD };

function formatInventoryItem(variant) {
  const stockQuantity = Number(variant.stockQuantity ?? 0);
  const reservedQuantity = Number(variant.reservedQuantity ?? 0);
  const availableQuantity = getAvailableQuantity(variant);

  return {
    id: variant.id,
    productId: variant.productId,
    sku: variant.sku,
    weight: variant.weight,
    packSize: variant.weight,
    stockQuantity,
    reservedQuantity,
    availableQuantity,
    stockStatus: variant.stockStatus,
    inStock: availableQuantity > 0,
    isLowStock: isLowStockAvailable(availableQuantity),
    isDefault: Boolean(variant.isDefault),
    sortOrder: variant.sortOrder ?? 0,
    product: {
      id: variant.product.id,
      slug: variant.product.slug,
      catalogId: variant.product.catalogId,
      name: variant.product.name,
      categoryId: variant.product.categoryId,
      categoryLabel: variant.product.categoryLabel,
      img: variant.img || variant.product.img,
      images: Array.isArray(variant.product.images) ? variant.product.images : [],
      status: variant.product.status,
      isBestSeller: Boolean(variant.product.isBestSeller),
    },
    priceValue: variant.priceValue,
    mrpValue: variant.mrpValue,
    updatedAt: variant.updatedAt.toISOString(),
  };
}

function buildProductFilter(categoryId, status, productId) {
  const product = {};
  if (productId) product.id = productId;
  if (categoryId && categoryId !== "all") {
    if (categoryId === "best-sellers") product.isBestSeller = true;
    else product.categoryId = categoryId;
  }
  if (status === "active") product.status = "active";
  if (status === "draft") product.status = "draft";
  return Object.keys(product).length ? { product } : {};
}

function buildCategoryCounts(variants) {
  const counts = {};
  let bestSellerCount = 0;

  for (const variant of variants) {
    const id = variant.product.categoryId;
    counts[id] = (counts[id] ?? 0) + 1;
    if (variant.product.isBestSeller) bestSellerCount += 1;
  }

  counts["best-sellers"] = bestSellerCount;
  return counts;
}

function matchesStockFilter(item, stock) {
  if (stock === "in_stock") return item.inStock;
  if (stock === "out_of_stock") return !item.inStock;
  if (stock === "low_stock") return item.isLowStock;
  return true;
}

function sortItems(list, sort, direction) {
  const dir = direction === "desc" ? -1 : 1;
  const sorted = [...list];

  sorted.sort((a, b) => {
    let cmp = 0;
    switch (sort) {
      case "sku":
        cmp = String(a.sku ?? "").localeCompare(String(b.sku ?? ""));
        break;
      case "availableQuantity":
        cmp = (a.availableQuantity ?? 0) - (b.availableQuantity ?? 0);
        break;
      case "stockQuantity":
        cmp = (a.stockQuantity ?? 0) - (b.stockQuantity ?? 0);
        break;
      case "availableQuantity":
        cmp = (a.availableQuantity ?? 0) - (b.availableQuantity ?? 0);
        break;
      case "updatedAt":
        cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case "productName":
      default:
        cmp = String(a.product.name ?? "").localeCompare(String(b.product.name ?? ""));
        if (cmp === 0) cmp = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
        break;
    }
    return cmp * dir;
  });

  return sorted;
}

function computeSummary(items) {
  const inStock = items.filter((item) => item.inStock).length;
  const lowStock = items.filter((item) => item.isLowStock).length;
  return {
    total: items.length,
    active: items.filter((item) => item.product.status === "active").length,
    draft: items.filter((item) => item.product.status === "draft").length,
    inStock,
    outOfStock: items.length - inStock,
    lowStock,
    unitsOnHand: items.reduce((sum, item) => sum + Number(item.stockQuantity ?? 0), 0),
    unitsReserved: items.reduce((sum, item) => sum + Number(item.reservedQuantity ?? 0), 0),
    unitsAvailable: items.reduce((sum, item) => sum + Number(item.availableQuantity ?? 0), 0),
    lowStockThreshold: LOW_STOCK_THRESHOLD,
  };
}

router.use(requireAdmin);

router.get("/", async (req, res, next) => {
  try {
    const {
      stock = "all",
      q = "",
      category = "all",
      status = "all",
      product = "",
      sort = "productName",
      direction = "asc",
      page = "1",
      pageSize = "25",
      all = "",
    } = req.query;
    const query = String(q).trim();
    const categoryId = String(category).trim();
    const statusFilter = String(status).trim();
    const productId = String(product).trim();
    const stockFilter = String(stock).trim();
    const sortKey = ["sku", "stockQuantity", "availableQuantity", "updatedAt", "productName"].includes(
      String(sort)
    )
      ? String(sort)
      : "productName";
    const sortDirection = String(direction).toLowerCase() === "desc" ? "desc" : "asc";
    const parsedPage = Math.max(1, Number.parseInt(page, 10) || 1);
    const parsedPageSize = Math.min(100, Math.max(1, Number.parseInt(pageSize, 10) || 25));
    const fetchAll = String(all) === "true";

    const searchWhere = query
      ? {
          OR: [
            { sku: { contains: query, mode: "insensitive" } },
            { weight: { contains: query, mode: "insensitive" } },
            { product: { name: { contains: query, mode: "insensitive" } } },
            { product: { slug: { contains: query, mode: "insensitive" } } },
            { product: { catalogId: { contains: query, mode: "insensitive" } } },
            { product: { categoryLabel: { contains: query, mode: "insensitive" } } },
          ],
        }
      : {};

    const productFilterWhere = buildProductFilter(categoryId, statusFilter, productId);

    const variants = await prisma.productVariant.findMany({
      where: { ...searchWhere, ...productFilterWhere },
      include: { product: { select: productSelect } },
    });

    const statusOnlyWhere = buildProductFilter("all", statusFilter);
    const allForCounts = await prisma.productVariant.findMany({
      where: { ...searchWhere, ...statusOnlyWhere },
      select: {
        stockQuantity: true,
        reservedQuantity: true,
        product: { select: { categoryId: true, isBestSeller: true } },
      },
    });

    const filtered = variants
      .map(formatInventoryItem)
      .filter((item) => matchesStockFilter(item, stockFilter));
    const sorted = sortItems(filtered, sortKey, sortDirection);
    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / parsedPageSize));
    const safePage = fetchAll ? 1 : Math.min(parsedPage, totalPages);
    const items = fetchAll
      ? sorted
      : sorted.slice((safePage - 1) * parsedPageSize, safePage * parsedPageSize);

    const fullSummary = computeSummary(sorted);
    const categoryCounts = buildCategoryCounts(allForCounts);

    res.json({
      ok: true,
      items,
      total,
      page: safePage,
      pageSize: fetchAll ? total : parsedPageSize,
      totalPages: fetchAll ? 1 : totalPages,
      summary: fullSummary,
      categoryCounts,
      totalAllCategories: allForCounts.length,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/history", async (req, res, next) => {
  try {
    const existing = await prisma.productVariant.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ ok: false, error: "Inventory item not found" });
    }

    const history = await listStockHistory(req.params.id);
    res.json({ ok: true, history });
  } catch (err) {
    next(err);
  }
});

router.patch("/bulk", async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(String).filter(Boolean) : [];
    const patch = req.body?.patch ?? {};

    if (!ids.length) {
      return res.status(400).json({ ok: false, error: "No variant IDs provided" });
    }

    const hasStockQuantity = patch.stockQuantity != null && patch.stockQuantity !== "";
    const hasInStock = typeof patch.inStock === "boolean";

    if (!hasStockQuantity && !hasInStock) {
      return res.status(400).json({ ok: false, error: "Nothing to update" });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const results = [];
      for (const id of ids) {
        const existing = await tx.productVariant.findUnique({ where: { id } });
        if (!existing) continue;

        let quantity = existing.stockQuantity ?? 0;
        if (hasStockQuantity) {
          const parsed = Number(patch.stockQuantity);
          if (!Number.isFinite(parsed) || parsed < 0) {
            throw new Error("Stock quantity must be 0 or more");
          }
          quantity = parsed;
        } else if (hasInStock) {
          const reserved = existing.reservedQuantity ?? 0;
          quantity = patch.inStock ? Math.max(quantity, reserved + 10, 10) : reserved;
        }

        const row = await setVariantStockQuantity(tx, existing, quantity, {
          source: "admin_bulk",
          admin: req.admin,
        });
        if (row) results.push(formatInventoryItem(row));
      }
      return results;
    });

    res.json({ ok: true, updated: updated.length, items: updated });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const existing = await prisma.productVariant.findUnique({
      where: { id: req.params.id },
      include: { product: { select: productSelect } },
    });

    if (!existing) {
      return res.status(404).json({ ok: false, error: "Inventory item not found" });
    }

    const parsedQuantity = Number(req.body.stockQuantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0) {
      return res.status(400).json({ ok: false, error: "Stock quantity must be 0 or more" });
    }

    if (parsedQuantity < (existing.reservedQuantity ?? 0)) {
      return res.status(400).json({
        ok: false,
        error: `On-hand stock cannot be below reserved quantity (${existing.reservedQuantity})`,
      });
    }

    const updated = await prisma.$transaction(async (tx) =>
      setVariantStockQuantity(tx, existing, parsedQuantity, {
        source: "admin_manual",
        admin: req.admin,
      })
    );

    res.json({ ok: true, item: formatInventoryItem(updated) });
  } catch (err) {
    next(err);
  }
});

export default router;
