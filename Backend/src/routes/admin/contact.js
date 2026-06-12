import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { formatContactCmsPage, normalizeContactCmsBody } from "../../lib/contactCms.js";
import { sanitizeRichHtml } from "../../lib/richText.js";
import { requireAdmin } from "../../middleware/admin.js";

const router = Router();
router.use(requireAdmin);

function formatContactMessage(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    read: Boolean(row.readAt),
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/settings", async (_req, res, next) => {
  try {
    const page = await prisma.cmsPage.findUnique({ where: { slug: "contact" } });
    if (!page) {
      return res.status(404).json({ ok: false, error: "Contact page not found" });
    }
    res.json({ ok: true, page: formatContactCmsPage(page) });
  } catch (err) {
    next(err);
  }
});

router.put("/settings", async (req, res, next) => {
  try {
    const title = String(req.body.title ?? "").trim();
    const subtitle = sanitizeRichHtml(req.body.subtitle ?? "");
    const published = req.body.published !== false;
    const body = normalizeContactCmsBody(req.body.body ?? req.body);

    const page = await prisma.cmsPage.update({
      where: { slug: "contact" },
      data: {
        title: title || "Contact Us",
        subtitle,
        published,
        body,
      },
    });

    res.json({ ok: true, page: formatContactCmsPage(page) });
  } catch (err) {
    next(err);
  }
});

router.get("/messages", async (req, res, next) => {
  try {
    const unreadOnly = req.query.unread === "1";
    const [rows, unreadCount] = await Promise.all([
      prisma.contactMessage.findMany({
        where: unreadOnly ? { readAt: null } : undefined,
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.contactMessage.count({ where: { readAt: null } }),
    ]);

    res.json({
      ok: true,
      messages: rows.map(formatContactMessage),
      unreadCount,
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/messages/:id/read", async (req, res, next) => {
  try {
    const row = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { readAt: new Date() },
    });
    res.json({ ok: true, message: formatContactMessage(row) });
  } catch (err) {
    next(err);
  }
});

export default router;
