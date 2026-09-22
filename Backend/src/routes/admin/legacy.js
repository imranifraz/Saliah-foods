import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { formatLegacyCmsPage, normalizeLegacyCmsBody } from "../../lib/legacyCms.js";
import { sanitizeRichHtml } from "../../lib/richText.js";
import { requireAdmin } from "../../middleware/admin.js";

const router = Router();
router.use(requireAdmin);

const SLUG = "our-legacy";

router.get("/settings", async (_req, res, next) => {
  try {
    let page = await prisma.cmsPage.findUnique({ where: { slug: SLUG } });
    if (!page) {
      page = await prisma.cmsPage.findUnique({ where: { slug: "about-us" } });
    }
    if (!page) {
      return res.status(404).json({ ok: false, error: "Our Legacy page not found" });
    }
    res.json({ ok: true, page: formatLegacyCmsPage({ ...page, slug: SLUG }) });
  } catch (err) {
    next(err);
  }
});

router.put("/settings", async (req, res, next) => {
  try {
    const title = String(req.body.title ?? "").trim();
    const subtitle = sanitizeRichHtml(req.body.subtitle ?? "");
    const published = req.body.published !== false;
    const body = normalizeLegacyCmsBody(req.body.body ?? req.body);

    const page = await prisma.cmsPage.upsert({
      where: { slug: SLUG },
      create: {
        slug: SLUG,
        title: title || "Our Legacy",
        subtitle,
        pageType: "legacy",
        published,
        body,
      },
      update: {
        title: title || "Our Legacy",
        subtitle,
        published,
        body,
        pageType: "legacy",
      },
    });

    // Retire mismatched about-us slug if still present
    await prisma.cmsPage.deleteMany({ where: { slug: "about-us" } }).catch(() => {});

    res.json({ ok: true, page: formatLegacyCmsPage(page) });
  } catch (err) {
    next(err);
  }
});

export default router;
