import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAdmin } from "../../middleware/admin.js";

const router = Router();
router.use(requireAdmin);

router.get("/", async (_req, res, next) => {
  try {
    const [orderCount, productCount, customerCount, pendingOrders] = await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count({
        where: {
          role: "customer",
          orders: { some: { status: { not: "cancelled" } } },
        },
      }),
      prisma.order.count({
        where: { status: { in: ["placed", "confirmed", "packed", "shipped", "out_for_delivery"] } },
      }),
    ]);

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    res.json({
      ok: true,
      stats: { orderCount, productCount, customerCount, pendingOrders },
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
