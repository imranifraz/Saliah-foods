import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { getAvailableQuantity, isLowStockAvailable, LOW_STOCK_THRESHOLD } from "../../lib/inventoryConstants.js";
import { requireAdmin } from "../../middleware/admin.js";

const router = Router();
router.use(requireAdmin);

router.get("/", async (_req, res, next) => {
  try {
    const [orderCount, productCount, customerCount, pendingOrders, variants] = await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count({
        where: {
          orders: { some: { status: { not: "cancelled" } } },
        },
      }),
      prisma.order.count({
        where: { status: { in: ["placed", "confirmed", "packed", "shipped", "out_for_delivery"] } },
      }),
      prisma.productVariant.findMany({
        where: { product: { status: "active" } },
        select: { stockQuantity: true, reservedQuantity: true },
      }),
    ]);

    let lowStockVariants = 0;
    let outOfStockVariants = 0;
    for (const variant of variants) {
      const available = getAvailableQuantity(variant);
      if (available === 0) outOfStockVariants += 1;
      else if (isLowStockAvailable(available)) lowStockVariants += 1;
    }

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    res.json({
      ok: true,
      stats: {
        orderCount,
        productCount,
        customerCount,
        pendingOrders,
        lowStockVariants,
        outOfStockVariants,
        lowStockThreshold: LOW_STOCK_THRESHOLD,
      },
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        status: o.status,
        total: o.total,
        createdAt: o.createdAt.toISOString(),
        customerName: o.customer?.fullName ?? o.customer?.name ?? "Guest",
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
