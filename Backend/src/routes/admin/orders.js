import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { syncBestSellersFromSales } from "../../lib/best-sellers.js";
import { applyOrderCancellation, canAdminCancel } from "../../lib/orderCancel.js";
import { notifyOrderCancelled, notifyOrderStatusChange } from "../../lib/notifications.js";
import { requireAdmin } from "../../middleware/admin.js";

const router = Router();
const STATUSES = new Set([
  "placed",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);

function formatOrder(order, productsById = new Map()) {
  return {
    id: order.id,
    userId: order.userId,
    status: order.status,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    gstAmount: order.gstAmount,
    gstLabel: order.gstLabel,
    paymentMethod: order.paymentMethod,
    cancelReason: order.cancelReason,
    trackingNote: order.trackingNote,
    customer: order.customer,
    statusHistory: order.statusHistory,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      slug: item.productSlug,
      name: item.name,
      img: item.img,
      packSize: item.packSize,
      priceValue: item.priceValue,
      mrpValue: item.mrpValue,
      quantity: item.quantity,
      categoryId: item.productId ? productsById.get(item.productId)?.categoryId ?? null : null,
      categoryLabel: item.productId ? productsById.get(item.productId)?.categoryLabel ?? null : null,
    })),
  };
}

async function loadProductsById(orders) {
  const productIds = [
    ...new Set(
      orders.flatMap((order) => order.items.map((item) => item.productId).filter(Boolean))
    ),
  ];

  if (!productIds.length) return new Map();

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      categoryId: true,
      categoryLabel: true,
    },
  });

  return new Map(products.map((product) => [product.id, product]));
}

router.use(requireAdmin);

router.get("/", async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = status && status !== "all" ? { status: String(status) } : {};
    const orders = await prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    const productsById = await loadProductsById(orders);
    res.json({ ok: true, orders: orders.map((order) => formatOrder(order, productsById)) });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });
    if (!order) return res.status(404).json({ ok: false, error: "Order not found" });
    const productsById = await loadProductsById([order]);
    res.json({ ok: true, order: formatOrder(order, productsById) });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });
    if (!order) return res.status(404).json({ ok: false, error: "Order not found" });

    const { status, trackingNote, cancelReason } = req.body;
    const nextStatus = status !== undefined ? String(status) : order.status;

    if (status !== undefined && !STATUSES.has(nextStatus)) {
      return res.status(400).json({ ok: false, error: "Invalid order status" });
    }

    if (nextStatus === "cancelled" && order.status !== "cancelled") {
      if (!canAdminCancel(order.status)) {
        return res.status(400).json({
          ok: false,
          error: "Orders can only be cancelled before they are packed",
        });
      }

      const reason = String(cancelReason ?? "").trim();
      const previousStatus = order.status;
      const updated = await prisma.$transaction(async (tx) => {
        await applyOrderCancellation(tx, order, {
          reason,
          cancelledBy: "admin",
          note: reason || "Cancelled by admin",
        });

        const data = {};
        if (trackingNote !== undefined) {
          data.trackingNote = String(trackingNote);
        }

        let result;
        if (Object.keys(data).length > 0) {
          result = await tx.order.update({
            where: { id: order.id },
            data,
            include: { items: true },
          });
        } else {
          result = await tx.order.findUnique({
            where: { id: order.id },
            include: { items: true },
          });
        }

        await notifyOrderCancelled(tx, result, previousStatus, { cancelledBy: "admin" });
        return result;
      });

      await syncBestSellersFromSales(prisma);

      const productsById = await loadProductsById([updated]);
      return res.json({ ok: true, order: formatOrder(updated, productsById) });
    }

    const data = {};
    const history = Array.isArray(order.statusHistory) ? [...order.statusHistory] : [];

    if (status !== undefined && nextStatus !== order.status) {
      data.status = nextStatus;
      history.push({
        status: nextStatus,
        at: new Date().toISOString(),
        note: "Updated by admin",
      });
      data.statusHistory = history;
    }

    if (trackingNote !== undefined) {
      data.trackingNote = String(trackingNote);
    }

    const previousStatus = order.status;
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.order.update({
        where: { id: order.id },
        data,
        include: { items: true },
      });
      if (data.status && data.status !== previousStatus) {
        await notifyOrderStatusChange(tx, result, previousStatus);
      }
      return result;
    });

    const productsById = await loadProductsById([updated]);
    res.json({ ok: true, order: formatOrder(updated, productsById) });
  } catch (err) {
    next(err);
  }
});

export default router;
