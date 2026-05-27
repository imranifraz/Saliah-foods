import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { stockStatusFromQuantity, syncProductSummary } from "../../lib/products.js";
import { requireAdmin } from "../../middleware/admin.js";

const router = Router();

function formatInventoryItem(variant) {
  return {
    id: variant.id,
    productId: variant.productId,
    sku: variant.sku,
    weight: variant.weight,
    packSize: variant.weight,
    stockQuantity: variant.stockQuantity,
    stockStatus: variant.stockStatus,
    inStock: variant.stockStatus === "in_stock",
    isDefault: Boolean(variant.isDefault),
    sortOrder: variant.sortOrder ?? 0,
    product: {
      id: variant.product.id,
      slug: variant.product.slug,
      name: variant.product.name,
      categoryId: variant.product.categoryId,
      categoryLabel: variant.product.categoryLabel,
      img: variant.img || variant.product.img,
      images: Array.isArray(variant.product.images) ? variant.product.images : [],
      status: variant.product.status,
    },
    priceValue: variant.priceValue,
    mrpValue: variant.mrpValue,
    updatedAt: variant.updatedAt.toISOString(),
  };
}

router.use(requireAdmin);

router.get("/", async (req, res, next) => {
  try {
    const { stock = "all", q = "" } = req.query;
    const query = String(q).trim();

    const variants = await prisma.productVariant.findMany({
      where: {
        ...(stock === "in_stock"
          ? { stockStatus: "in_stock" }
          : stock === "out_of_stock"
            ? { stockStatus: "out_of_stock" }
            : {}),
        ...(query
          ? {
              OR: [
                { sku: { contains: query, mode: "insensitive" } },
                { weight: { contains: query, mode: "insensitive" } },
                { product: { name: { contains: query, mode: "insensitive" } } },
                { product: { categoryLabel: { contains: query, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: {
        product: {
          select: {
            id: true,
            slug: true,
            name: true,
            categoryId: true,
            categoryLabel: true,
            img: true,
            images: true,
            status: true,
          },
        },
      },
      orderBy: [
        { product: { name: "asc" } },
        { sortOrder: "asc" },
        { createdAt: "asc" },
      ],
    });

    res.json({ ok: true, items: variants.map(formatInventoryItem) });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const existing = await prisma.productVariant.findUnique({
      where: { id: req.params.id },
      include: {
        product: {
          select: {
            id: true,
            slug: true,
            name: true,
            categoryId: true,
            categoryLabel: true,
            img: true,
            images: true,
            status: true,
          },
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ ok: false, error: "Inventory item not found" });
    }

    const parsedQuantity = Number(req.body.stockQuantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0) {
      return res.status(400).json({ ok: false, error: "Stock quantity must be 0 or more" });
    }

    const stockQuantity = Math.floor(parsedQuantity);
    const stockStatus = stockStatusFromQuantity(stockQuantity);

    const updated = await prisma.$transaction(async (tx) => {
      await tx.productVariant.update({
        where: { id: existing.id },
        data: { stockQuantity, stockStatus },
      });

      await syncProductSummary(tx, existing.productId);

      return tx.productVariant.findUnique({
        where: { id: existing.id },
        include: {
          product: {
            select: {
              id: true,
              slug: true,
              name: true,
              categoryId: true,
              categoryLabel: true,
              img: true,
              images: true,
              status: true,
            },
          },
        },
      });
    });

    res.json({ ok: true, item: formatInventoryItem(updated) });
  } catch (err) {
    next(err);
  }
});

export default router;
