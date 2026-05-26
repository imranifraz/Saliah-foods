import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
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

    const { status, trackingNote } = req.body;
    const data = {};
    const history = Array.isArray(order.statusHistory) ? [...order.statusHistory] : [];

    if (status !== undefined) {
      if (!STATUSES.has(status)) {
        return res.status(400).json({ ok: false, error: "Invalid order status" });
      }
      data.status = status;
      if (status !== order.status) {
        history.push({ status, at: new Date().toISOString(), note: "Updated by admin" });
        data.statusHistory = history;
      }
    }

    if (trackingNote !== undefined) {
      data.trackingNote = String(trackingNote);
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data,
      include: { items: true },
    });

    const productsById = await loadProductsById([updated]);
    res.json({ ok: true, order: formatOrder(updated, productsById) });
  } catch (err) {
    next(err);
  }
});

export default router;
