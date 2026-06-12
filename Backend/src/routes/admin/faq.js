import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { formatFaqCmsPage, normalizeFaqCmsBody } from "../../lib/faqCms.js";
import { sanitizeRichHtml } from "../../lib/richText.js";
import { requireAdmin } from "../../middleware/admin.js";

const router = Router();
router.use(requireAdmin);

router.get("/settings", async (_req, res, next) => {
  try {
    const page = await prisma.cmsPage.findUnique({ where: { slug: "faq" } });
    if (!page) {
      return res.status(404).json({ ok: false, error: "FAQ page not found" });
    }
    res.json({ ok: true, page: formatFaqCmsPage(page) });
  } catch (err) {
    next(err);
  }
});

router.put("/settings", async (req, res, next) => {
  try {
    const title = String(req.body.title ?? "").trim();
    const subtitle = sanitizeRichHtml(req.body.subtitle ?? "");
    const published = req.body.published !== false;
    const body = normalizeFaqCmsBody(req.body.body ?? req.body);

    const page = await prisma.cmsPage.update({
      where: { slug: "faq" },
      data: {
        title: title || "FAQ",
        subtitle,
        published,
        body,
      },
    });

    res.json({ ok: true, page: formatFaqCmsPage(page) });
  } catch (err) {
    next(err);
  }
});

export default router;
