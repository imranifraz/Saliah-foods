import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { formatNotification } from "../lib/notifications.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const DEFAULTS = {
  orderTracking: true,
  deliveryUpdates: true,
  ratingReminders: true,
  orderSms: false,
};

router.get("/", async (req, res, next) => {
  try {
    const rows = await prisma.notification.findMany({
      where: {
        audience: "customer",
        userId: req.user.id,
        dismissedAt: null,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({
      ok: true,
      notifications: rows.map(formatNotification),
      unreadCount: rows.filter((row) => !row.readAt).length,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/read", async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.map(String) : [];
    const all = Boolean(req.body.all);
    const now = new Date();

    if (all) {
      await prisma.notification.updateMany({
        where: {
          audience: "customer",
          userId: req.user.id,
          dismissedAt: null,
          readAt: null,
        },
        data: { readAt: now },
      });
    } else if (ids.length) {
      await prisma.notification.updateMany({
        where: {
          audience: "customer",
          userId: req.user.id,
          id: { in: ids },
        },
        data: { readAt: now },
      });
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post("/dismiss", async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.map(String) : [];
    const all = Boolean(req.body.all);
    const now = new Date();

    if (all) {
      await prisma.notification.updateMany({
        where: {
          audience: "customer",
          userId: req.user.id,
          dismissedAt: null,
        },
        data: { dismissedAt: now, readAt: now },
      });
    } else if (ids.length) {
      await prisma.notification.updateMany({
        where: {
          audience: "customer",
          userId: req.user.id,
          id: { in: ids },
        },
        data: { dismissedAt: now, readAt: now },
      });
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get("/prefs", async (req, res, next) => {
  try {
    let prefs = await prisma.notificationPrefs.findUnique({
      where: { userId: req.user.id },
    });
    if (!prefs) {
      prefs = await prisma.notificationPrefs.create({
        data: { userId: req.user.id, ...DEFAULTS },
      });
    }
    res.json({ ok: true, prefs });
  } catch (err) {
    next(err);
  }
});

router.put("/prefs", async (req, res, next) => {
  try {
    const prefs = await prisma.notificationPrefs.upsert({
      where: { userId: req.user.id },
      create: { userId: req.user.id, ...DEFAULTS, ...req.body },
      update: {
        orderTracking: req.body.orderTracking,
        deliveryUpdates: req.body.deliveryUpdates,
        ratingReminders: req.body.ratingReminders,
        orderSms: req.body.orderSms,
      },
    });
    res.json({ ok: true, prefs });
  } catch (err) {
    next(err);
  }
});

export default router;
