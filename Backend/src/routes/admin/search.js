import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAdmin } from "../../middleware/admin.js";

const router = Router();
router.use(requireAdmin);

router.get("/", async (req, res, next) => {
  try {
    const q = String(req.query.q ?? "").trim();
    if (!q) {
      return res.json({ ok: true, categories: [], products: [], orders: [], inventory: [] });
    }

    const [categories, products, orders, inventory] = await Promise.all([
      prisma.category.findMany({
        where: {
          OR: [
            { label: { contains: q, mode: "insensitive" } },
            { id: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
        take: 5,
        select: { id: true, label: true },
      }),
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { catalogId: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        },
        orderBy: { name: "asc" },
        take: 5,
        select: { id: true, name: true, categoryId: true },
      }),
      prisma.order.findMany({
        where: {
          OR: [
            { id: { contains: q, mode: "insensitive" } },
            { customerName: { contains: q, mode: "insensitive" } },
            { customerEmail: { contains: q, mode: "insensitive" } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, customerName: true, status: true },
      }),
      prisma.productVariant.findMany({
        where: {
          OR: [
            { sku: { contains: q, mode: "insensitive" } },
            { weight: { contains: q, mode: "insensitive" } },
            { product: { name: { contains: q, mode: "insensitive" } } },
            { product: { slug: { contains: q, mode: "insensitive" } } },
          ],
        },
        orderBy: [{ product: { name: "asc" } }, { sku: "asc" }],
        take: 5,
        select: {
          id: true,
          sku: true,
          stockQuantity: true,
          product: { select: { name: true } },
        },
      }),
    ]);

    res.json({
      ok: true,
      categories: categories.map((category) => ({
        id: category.id,
        label: category.label,
        href: `/categories?q=${encodeURIComponent(category.label)}`,
      })),
      products: products.map((product) => ({
        id: product.id,
        label: product.name,
        href: `/products?category=${encodeURIComponent(product.categoryId)}`,
      })),
      orders: orders.map((order) => ({
        id: order.id,
        label: order.customerName || order.id,
        status: order.status,
        href: `/orders/${order.id}`,
      })),
      inventory: inventory.map((variant) => ({
        id: variant.id,
        label: `${variant.sku} · ${variant.product.name}`,
        status: `${variant.stockQuantity ?? 0} in stock`,
        href: `/inventory?q=${encodeURIComponent(variant.sku)}`,
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
