import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";

function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    throw new Error("Razorpay is not configured on the server");
  }

  return { keyId, keySecret };
}

function getRazorpayClient() {
  const { keyId, keySecret } = getRazorpayConfig();
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

function isRazorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID?.trim() && process.env.RAZORPAY_KEY_SECRET?.trim());
}

router.get("/methods", async (_req, res, next) => {
  try {
    const methods = await prisma.paymentMethod.findMany({
      where: { enabled: true },
      orderBy: { sortOrder: "asc" },
    });
    const shipping = await prisma.storeSetting.findUnique({ where: { key: "shipping" } });
    res.json({
      ok: true,
      methods,
      shipping: shipping?.value ?? { freeShippingThreshold: 999, shippingFee: 99 },
      razorpayConfigured: isRazorpayConfigured(),
    });
  } catch (err) {
    next(err);
  }
});

router.post("/razorpay/order", requireAuth, async (req, res, next) => {
  try {
    const amount = Number(req.body.amount ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ ok: false, error: "Valid payment amount is required" });
    }

    const { keyId } = getRazorpayConfig();
    const client = getRazorpayClient();
    const order = await client.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `saliah-${Date.now()}`,
      notes: {
        userId: req.user.id,
        email: req.user.email ?? "",
      },
    });

    res.json({ ok: true, keyId, order });
  } catch (err) {
    next(err);
  }
});

router.post("/razorpay/verify", requireAuth, async (req, res, next) => {
  try {
    const razorpayOrderId = String(req.body.razorpay_order_id ?? "").trim();
    const razorpayPaymentId = String(req.body.razorpay_payment_id ?? "").trim();
    const razorpaySignature = String(req.body.razorpay_signature ?? "").trim();

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ ok: false, error: "Incomplete Razorpay payment response" });
    }

    const { keySecret } = getRazorpayConfig();
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ ok: false, error: "Razorpay payment verification failed" });
    }

    const client = getRazorpayClient();
    const razorpayOrder = await client.orders.fetch(razorpayOrderId);
    const verificationToken = jwt.sign(
      {
        gateway: "razorpay",
        userId: req.user.id,
        razorpayOrderId,
        razorpayPaymentId,
        amount: Number(razorpayOrder.amount ?? 0) / 100,
      },
      JWT_SECRET,
      { expiresIn: "30m" }
    );

    res.json({
      ok: true,
      verificationToken,
      payment: {
        gateway: "razorpay",
        razorpayOrderId,
        razorpayPaymentId,
        amount: Number(razorpayOrder.amount ?? 0) / 100,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
