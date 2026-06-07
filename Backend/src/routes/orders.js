import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { syncBestSellersFromSales } from "../lib/best-sellers.js";
import { getAvailableQuantity } from "../lib/inventoryConstants.js";
import { reserveVariantStock } from "../lib/inventoryStock.js";
import { applyOrderCancellation, canCustomerCancel } from "../lib/orderCancel.js";
import { refundOrderPayment } from "../lib/razorpayRefund.js";
import { isRazorpayConfigured, isTestPaymentsAllowed } from "../lib/razorpay.js";
import { formatReview } from "../lib/reviews.js";
import { notifyNewOrder, notifyOrderCancelled } from "../lib/notifications.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";
const orderInclude = {
  items: {
    include: {
      review: true,
    },
  },
};

function formatOrder(order) {
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
      variantId: item.variantId,
      sku: item.sku,
      slug: item.productSlug,
      name: item.name,
      img: item.img,
      packSize: item.packSize,
      priceValue: item.priceValue,
      mrpValue: item.mrpValue,
      quantity: item.quantity,
      review: formatReview(item.review),
    })),
  };
}

function generateOrderId() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SAL-${stamp}-${rand}`;
}

async function resolveVariant(tx, item) {
  if (item.variantId) {
    return tx.productVariant.findUnique({
      where: { id: item.variantId },
      include: { product: true },
    });
  }

  if (item.sku) {
    return tx.productVariant.findUnique({
      where: { sku: item.sku },
      include: { product: true },
    });
  }

  if (!item.slug && !item.productSlug) {
    return null;
  }

  const slug = item.slug ?? item.productSlug;
  const product = await tx.product.findUnique({
    where: { slug },
    include: {
      variants: {
        orderBy: [{ isDefault: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!product) return null;

  const match =
    product.variants.find((variant) => variant.weight === (item.packSize ?? "")) ?? product.variants[0];

  return match ? { ...match, product } : null;
}

function verifyRazorpayPaymentToken(token, userId, expectedAmount) {
  if (!token) {
    if (isTestPaymentsAllowed()) {
      throw new Error("Complete the test payment before placing your order");
    }
    if (!isRazorpayConfigured()) {
      throw new Error("Online payment is not available yet. Please try again later.");
    }
    throw new Error("Online payment verification is required before placing the order");
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    throw new Error("Payment verification expired. Please make the payment again.");
  }

  if (payload?.gateway !== "razorpay" || payload?.userId !== userId) {
    throw new Error("Invalid payment verification for this user");
  }

  if (payload.mode === "test" && !isTestPaymentsAllowed()) {
    throw new Error("Test payments are disabled on the server");
  }

  const paidAmount = Math.round(Number(payload.amount ?? 0) * 100);
  const orderAmount = Math.round(Number(expectedAmount ?? 0) * 100);

  if (!orderAmount || paidAmount !== orderAmount) {
    throw new Error("Verified payment amount does not match the order total");
  }

  return {
    ...payload,
    status: payload.status ?? "paid",
    mode: payload.mode ?? "live",
  };
}

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: orderInclude,
      orderBy: { createdAt: "desc" },
    });
    res.json({ ok: true, orders: orders.map(formatOrder) });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: orderInclude,
    });
    if (!order) return res.status(404).json({ ok: false, error: "Order not found" });
    res.json({ ok: true, order: formatOrder(order) });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const {
      items,
      customer,
      subtotal,
      shipping,
      total,
      gstAmount,
      gstLabel,
      paymentMethod,
      paymentVerificationToken,
    } = req.body;

    if (!items?.length || !customer) {
      return res.status(400).json({ ok: false, error: "Invalid order payload" });
    }

    const normalizedPaymentMethod = String(paymentMethod ?? customer.paymentMethod ?? "razorpay")
      .trim()
      .toLowerCase();

    if (normalizedPaymentMethod !== "razorpay") {
      return res.status(400).json({ ok: false, error: "Only online payment via Razorpay is available" });
    }

    const payment = verifyRazorpayPaymentToken(paymentVerificationToken, req.user.id, total);

    const createdAt = new Date();
    const order = await prisma.$transaction(async (tx) => {
      const resolvedItems = [];
      const orderId = generateOrderId();

      for (const item of items) {
        const variant = await resolveVariant(tx, item);
        if (!variant?.product) {
          throw new Error(`Variant not found for ${item.name ?? item.slug ?? "product"}`);
        }

        const quantity = Number(item.quantity ?? 1);
        if (!Number.isFinite(quantity) || quantity < 1) {
          throw new Error(`Invalid quantity for ${variant.product.name}`);
        }

        const available = getAvailableQuantity(variant);
        if (available < quantity) {
          throw new Error(`${variant.product.name} (${variant.weight}) is out of stock`);
        }

        resolvedItems.push({
          productId: variant.product.id,
          variantId: variant.id,
          sku: variant.sku,
          productSlug: variant.product.slug,
          name: variant.product.name,
          img: item.img ?? variant.img ?? variant.product.img,
          packSize: variant.weight,
          priceValue: Number(item.priceValue ?? variant.priceValue),
          mrpValue: item.mrpValue ?? variant.mrpValue ?? null,
          quantity,
        });
      }

      for (const item of resolvedItems) {
        await reserveVariantStock(tx, item.variantId, item.quantity, orderId);
      }

      const created = await tx.order.create({
        data: {
          id: orderId,
          userId: req.user.id,
          status: "placed",
          subtotal,
          shipping,
          total,
          gstAmount: gstAmount ?? null,
          gstLabel: gstLabel ?? null,
          paymentMethod: "razorpay",
          customer: {
            ...customer,
            paymentMethod: "razorpay",
            payment: {
              gateway: "razorpay",
              mode: payment.mode ?? "live",
              razorpayOrderId: payment.razorpayOrderId,
              razorpayPaymentId: payment.razorpayPaymentId,
              verifiedAmount: payment.amount,
              verifiedAt: createdAt.toISOString(),
              status: payment.status ?? "paid",
            },
          },
          statusHistory: [{ status: "placed", at: createdAt.toISOString() }],
          items: {
            create: resolvedItems,
          },
        },
        include: orderInclude,
      });

      await notifyNewOrder(tx, created);
      return created;
    });

    await syncBestSellersFromSales(prisma);

    res.status(201).json({ ok: true, order: formatOrder(order) });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/cancel", async (req, res, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: orderInclude,
    });
    if (!order) return res.status(404).json({ ok: false, error: "Order not found" });
    if (!canCustomerCancel(order.status)) {
      return res.status(400).json({
        ok: false,
        error: "This order can no longer be cancelled because it is already being prepared",
      });
    }

    const reason = String(req.body.reason ?? "").trim();
    let refund = null;
    try {
      refund = await refundOrderPayment(order);
    } catch (refundErr) {
      return res.status(400).json({
        ok: false,
        error: refundErr.message ?? "Refund failed. Order was not cancelled.",
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const cancelled = await applyOrderCancellation(tx, order, {
        reason,
        cancelledBy: "customer",
        refund,
      });
      const result = await tx.order.findUnique({
        where: { id: cancelled.id },
        include: orderInclude,
      });
      await notifyOrderCancelled(tx, result, order.status, { cancelledBy: "customer" });
      return result;
    });

    await syncBestSellersFromSales(prisma);

    res.json({ ok: true, order: formatOrder(updated) });
  } catch (err) {
    next(err);
  }
});

export default router;
