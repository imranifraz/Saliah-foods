import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { getGstSettings, saveGstSettings } from "../../lib/gstSettings.js";
import {
  getRazorpaySettings,
  maskRazorpayKeyId,
  resolveRazorpayKeySecret,
} from "../../lib/razorpay.js";
import { normalizeShippingSettings } from "../../lib/shippingSettings.js";
import { requireAdmin } from "../../middleware/admin.js";

const router = Router();
router.use(requireAdmin);

router.get("/", async (_req, res, next) => {
  try {
    const [methods, settings] = await Promise.all([
      prisma.paymentMethod.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.storeSetting.findMany({
        where: { key: { in: ["shipping", "checkout"] } },
      }),
    ]);

    const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    const [razorpay, gst] = await Promise.all([getRazorpaySettings(), getGstSettings()]);
    const shipping = normalizeShippingSettings(settingsMap.shipping);

    res.json({
      ok: true,
      methods,
      store: {
        ...shipping,
        codEnabled: settingsMap.checkout?.codEnabled ?? true,
      },
      gst,
      razorpay: {
        configured: razorpay.configured,
        active: razorpay.active,
        enabled: razorpay.enabled,
        keyId: razorpay.keyId,
        maskedKeyId: maskRazorpayKeyId(razorpay.keyId),
        keySecretSet: razorpay.keySecretSet,
        source: razorpay.source,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/methods/:id", async (req, res, next) => {
  try {
    const { label, description, enabled, sortOrder } = req.body;
    const method = await prisma.paymentMethod.update({
      where: { id: req.params.id },
      data: {
        label: label ?? undefined,
        description: description ?? undefined,
        enabled: enabled !== undefined ? Boolean(enabled) : undefined,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : undefined,
      },
    });
    res.json({ ok: true, method });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ ok: false, error: "Payment method not found" });
    }
    next(err);
  }
});

router.post("/methods", async (req, res, next) => {
  try {
    const { id, label, description, enabled, sortOrder } = req.body;
    if (!id?.trim() || !label?.trim()) {
      return res.status(400).json({ ok: false, error: "ID and label required" });
    }
    const method = await prisma.paymentMethod.create({
      data: {
        id: id.trim().toLowerCase(),
        label: label.trim(),
        description: description ?? "",
        enabled: enabled !== false,
        sortOrder: sortOrder ?? 0,
      },
    });
    res.status(201).json({ ok: true, method });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ ok: false, error: "Payment method ID exists" });
    }
    next(err);
  }
});

router.put("/razorpay", async (req, res, next) => {
  try {
    const keyId = String(req.body.keyId ?? "").trim();
    const keySecretInput = String(req.body.keySecret ?? "").trim();
    const enabled = req.body.enabled !== false;

    if (!keyId) {
      return res.status(400).json({ ok: false, error: "Razorpay Key ID is required" });
    }

    const existing = await prisma.storeSetting.findUnique({ where: { key: "razorpay" } });
    const existingValue =
      existing?.value && typeof existing.value === "object" ? existing.value : {};
    const keySecret = resolveRazorpayKeySecret({
      keySecretInput,
      existingDbSecret: existingValue.keySecret,
      keyId,
    });

    if (!keySecret) {
      return res.status(400).json({
        ok: false,
        error: "Razorpay Key Secret is required. Enter it here or configure RAZORPAY_KEY_SECRET on the server.",
      });
    }

    await prisma.storeSetting.upsert({
      where: { key: "razorpay" },
      create: {
        key: "razorpay",
        value: { keyId, keySecret, enabled },
      },
      update: {
        value: { keyId, keySecret, enabled },
      },
    });

    await prisma.paymentMethod.upsert({
      where: { id: "razorpay" },
      create: {
        id: "razorpay",
        label: "Razorpay",
        description: "Pay securely using UPI, cards, net banking, or wallets",
        enabled: true,
        sortOrder: 0,
      },
      update: { enabled },
    });

    const razorpay = await getRazorpaySettings();
    res.json({
      ok: true,
      razorpay: {
        configured: razorpay.configured,
        active: razorpay.active,
        enabled: razorpay.enabled,
        keyId: razorpay.keyId,
        maskedKeyId: maskRazorpayKeyId(razorpay.keyId),
        keySecretSet: true,
        source: razorpay.source,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.put("/gst", async (req, res, next) => {
  try {
    const gst = await saveGstSettings(req.body ?? {});
    res.json({ ok: true, gst });
  } catch (err) {
    next(err);
  }
});

router.put("/store", async (req, res, next) => {
  try {
    const {
      freeShippingThreshold,
      shippingFee,
      codEnabled,
      promoBarEnabled,
      promoBarMessage,
      promoBarHref,
    } = req.body;

    const shippingTouched =
      freeShippingThreshold !== undefined ||
      shippingFee !== undefined ||
      promoBarEnabled !== undefined ||
      promoBarMessage !== undefined ||
      promoBarHref !== undefined;

    if (shippingTouched) {
      const existing = await prisma.storeSetting.findUnique({ where: { key: "shipping" } });
      const nextShipping = normalizeShippingSettings({
        ...(existing?.value && typeof existing.value === "object" ? existing.value : {}),
        ...(freeShippingThreshold !== undefined ? { freeShippingThreshold } : {}),
        ...(shippingFee !== undefined ? { shippingFee } : {}),
        ...(promoBarEnabled !== undefined ? { promoBarEnabled } : {}),
        ...(promoBarMessage !== undefined ? { promoBarMessage } : {}),
        ...(promoBarHref !== undefined ? { promoBarHref } : {}),
      });

      await prisma.storeSetting.upsert({
        where: { key: "shipping" },
        create: { key: "shipping", value: nextShipping },
        update: { value: nextShipping },
      });
    }

    if (codEnabled !== undefined) {
      await prisma.storeSetting.upsert({
        where: { key: "checkout" },
        create: { key: "checkout", value: { codEnabled: Boolean(codEnabled) } },
        update: { value: { codEnabled: Boolean(codEnabled) } },
      });
    }

    const [shippingRow, checkoutRow] = await Promise.all([
      prisma.storeSetting.findUnique({ where: { key: "shipping" } }),
      prisma.storeSetting.findUnique({ where: { key: "checkout" } }),
    ]);

    res.json({
      ok: true,
      store: {
        ...normalizeShippingSettings(shippingRow?.value),
        codEnabled: checkoutRow?.value?.codEnabled ?? true,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
