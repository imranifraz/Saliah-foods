import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const DEFAULTS = {
  orderTracking: true,
  deliveryUpdates: true,
  ratingReminders: true,
  orderSms: false,
};

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
