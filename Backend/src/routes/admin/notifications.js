import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { formatNotification } from "../../lib/notifications.js";
import { requireAdmin } from "../../middleware/admin.js";

const router = Router();
router.use(requireAdmin);

router.get("/", async (req, res, next) => {
  try {
    const rows = await prisma.notification.findMany({
      where: {
        audience: "admin",
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
        where: { audience: "admin", dismissedAt: null, readAt: null },
        data: { readAt: now },
      });
    } else if (ids.length) {
      await prisma.notification.updateMany({
        where: { audience: "admin", id: { in: ids } },
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
        where: { audience: "admin", dismissedAt: null },
        data: { dismissedAt: now, readAt: now },
      });
    } else if (ids.length) {
      await prisma.notification.updateMany({
        where: { audience: "admin", id: { in: ids } },
        data: { dismissedAt: now, readAt: now },
      });
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
