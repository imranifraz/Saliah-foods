import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { stockStatusFromQuantity, syncProductSummary } from "../lib/products.js";
import { formatReview } from "../lib/reviews.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const CANCELLABLE = new Set(["placed", "confirmed"]);
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";
const orderInclude = {
  items: {
    include: {
      review: true,
    },
  },
};

function isRazorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID?.trim() && process.env.RAZORPAY_KEY_SECRET?.trim());
}

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
    if (!isRazorpayConfigured()) {
      return {
        gateway: "razorpay",
        userId,
        razorpayOrderId: null,
        razorpayPaymentId: null,
        amount: Number(expectedAmount ?? 0),
        status: "pending_configuration",
      };
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

  const paidAmount = Math.round(Number(payload.amount ?? 0) * 100);
  const orderAmount = Math.round(Number(expectedAmount ?? 0) * 100);

  if (!orderAmount || paidAmount !== orderAmount) {
    throw new Error("Verified payment amount does not match the order total");
  }

  return payload;
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

      for (const item of items) {
        const variant = await resolveVariant(tx, item);
        if (!variant?.product) {
          throw new Error(`Variant not found for ${item.name ?? item.slug ?? "product"}`);
        }

        const quantity = Number(item.quantity ?? 1);
        if (!Number.isFinite(quantity) || quantity < 1) {
          throw new Error(`Invalid quantity for ${variant.product.name}`);
        }

        if (variant.stockQuantity < quantity) {
          throw new Error(`${variant.product.name} (${variant.weight}) is out of stock`);
        }

        const nextQuantity = Math.max(0, variant.stockQuantity - quantity);
        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            stockQuantity: nextQuantity,
            stockStatus: stockStatusFromQuantity(nextQuantity),
          },
        });

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

      const created = await tx.order.create({
        data: {
          id: generateOrderId(),
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
              razorpayOrderId: payment.razorpayOrderId,
              razorpayPaymentId: payment.razorpayPaymentId,
              verifiedAmount: payment.amount,
              verifiedAt: payment.status === "pending_configuration" ? null : createdAt.toISOString(),
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

      const touchedProductIds = [...new Set(resolvedItems.map((item) => item.productId).filter(Boolean))];
      for (const productId of touchedProductIds) {
        await syncProductSummary(tx, productId);
      }

      return created;
    });

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
    if (!CANCELLABLE.has(order.status)) {
      return res.status(400).json({ ok: false, error: "This order cannot be cancelled" });
    }

    const at = new Date().toISOString();
    const reason = req.body.reason ?? "";
    const history = Array.isArray(order.statusHistory) ? order.statusHistory : [];
    const updated = await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        if (!item.variantId || !item.quantity) continue;

        const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
        if (!variant) continue;

        const nextQuantity = variant.stockQuantity + item.quantity;
        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            stockQuantity: nextQuantity,
            stockStatus: stockStatusFromQuantity(nextQuantity),
          },
        });

        if (item.productId) {
          await syncProductSummary(tx, item.productId);
        }
      }

      return tx.order.update({
        where: { id: order.id },
        data: {
          status: "cancelled",
          cancelReason: reason,
          statusHistory: [
            ...history,
            { status: "cancelled", at, note: reason || "Cancelled by customer" },
          ],
        },
        include: orderInclude,
      });
    });

    res.json({ ok: true, order: formatOrder(updated) });
  } catch (err) {
    next(err);
  }
});

export default router;
