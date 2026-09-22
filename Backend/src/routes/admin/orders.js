import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { syncBestSellersFromSales } from "../../lib/best-sellers.js";
import { applyOrderCancellation, canAdminCancel } from "../../lib/orderCancel.js";
import { PRE_FULFILL_STATUSES, FULFILL_STATUSES, hasOrderInventoryBeenFulfilled } from "../../lib/inventoryConstants.js";
import { fulfillOrderInventory, releaseOrderInventory } from "../../lib/inventoryStock.js";
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
    discountTotal: order.discountTotal ?? 0,
    appliedOffers: order.appliedOffers ?? null,
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
      lineDiscount: item.lineDiscount ?? 0,
      bogoApplied: Boolean(item.bogoApplied),
      lineTotal: Math.max(0, (item.priceValue ?? 0) * (item.quantity ?? 0) - (item.lineDiscount ?? 0)),
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

const MANUAL_PAYMENT_METHODS = new Set(["cod", "upi", "card"]);

router.patch("/:id/payment/mark-paid", async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });
    if (!order) return res.status(404).json({ ok: false, error: "Order not found" });

    const paymentMethod = String(order.paymentMethod ?? "").toLowerCase();
    if (!MANUAL_PAYMENT_METHODS.has(paymentMethod)) {
      return res.status(400).json({
        ok: false,
        error: "Only cash on delivery, UPI, and card orders can be marked paid manually",
      });
    }

    const customer = order.customer && typeof order.customer === "object" ? { ...order.customer } : {};
    const payment =
      customer.payment && typeof customer.payment === "object" ? { ...customer.payment } : {};

    if (payment.status === "paid") {
      return res.status(400).json({ ok: false, error: "Payment is already marked as paid" });
    }

    const verifiedAt = new Date().toISOString();
    customer.payment = {
      ...payment,
      method: paymentMethod,
      status: "paid",
      verifiedAmount: order.total,
      verifiedAt,
      markedPaidBy: "admin",
    };

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { customer },
      include: { items: true },
    });

    const productsById = await loadProductsById([updated]);
    res.json({ ok: true, order: formatOrder(updated, productsById) });
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
      const noteText =
        trackingNote !== undefined ? String(trackingNote).trim() : "";
      const previousStatus = order.status;
      const updated = await prisma.$transaction(async (tx) => {
        await applyOrderCancellation(tx, order, {
          reason,
          cancelledBy: "admin",
          note: noteText || reason || "Cancelled by admin",
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
    const noteText =
      trackingNote !== undefined ? String(trackingNote).trim() : String(order.trackingNote ?? "").trim();

    if (status !== undefined && nextStatus !== order.status) {
      data.status = nextStatus;
      history.push({
        status: nextStatus,
        at: new Date().toISOString(),
        note: noteText || "Updated by admin",
      });
      data.statusHistory = history;
    }

    if (trackingNote !== undefined) {
      data.trackingNote = String(trackingNote);
    }

    const previousStatus = order.status;
    const updated = await prisma.$transaction(async (tx) => {
      if (
        status !== undefined &&
        nextStatus !== order.status &&
        FULFILL_STATUSES.has(nextStatus) &&
        PRE_FULFILL_STATUSES.has(order.status) &&
        !hasOrderInventoryBeenFulfilled(order)
      ) {
        await fulfillOrderInventory(tx, order);
      }

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

router.delete("/:id", async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });
    if (!order) return res.status(404).json({ ok: false, error: "Order not found" });

    await prisma.$transaction(async (tx) => {
      // Release reserved stock for open orders; cancelled orders already released.
      // Fail the delete if release fails so reservations are never orphaned.
      if (PRE_FULFILL_STATUSES.has(order.status)) {
        await releaseOrderInventory(tx, order);
      }

      await tx.order.delete({ where: { id: order.id } });
    });

    await syncBestSellersFromSales(prisma);

    res.json({ ok: true, deletedId: order.id });
  } catch (err) {
    if (err?.message && /reserved|stock|inventory|variant/i.test(err.message)) {
      return res.status(409).json({
        ok: false,
        error: `Could not delete order because inventory could not be released: ${err.message}`,
      });
    }
    next(err);
  }
});

export default router;
