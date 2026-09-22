import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { formatSourcingCmsPage, normalizeSourcingCmsBody } from "../../lib/sourcingCms.js";
import { sanitizeRichHtml } from "../../lib/richText.js";
import { requireAdmin } from "../../middleware/admin.js";

const router = Router();
router.use(requireAdmin);

const SLUG = "sourcing-quality";

router.get("/settings", async (_req, res, next) => {
  try {
    const page = await prisma.cmsPage.findUnique({ where: { slug: SLUG } });
    if (!page) {
      return res.status(404).json({ ok: false, error: "Sourcing & Quality page not found" });
    }
    res.json({ ok: true, page: formatSourcingCmsPage(page) });
  } catch (err) {
    next(err);
  }
});

router.put("/settings", async (req, res, next) => {
  try {
    const title = String(req.body.title ?? "").trim();
    const subtitle = sanitizeRichHtml(req.body.subtitle ?? "");
    const published = req.body.published !== false;
    const body = normalizeSourcingCmsBody(req.body.body ?? req.body);

    const page = await prisma.cmsPage.upsert({
      where: { slug: SLUG },
      create: {
        slug: SLUG,
        title: title || "Sourcing & Quality",
        subtitle,
        pageType: "content",
        published,
        body,
      },
      update: {
        title: title || "Sourcing & Quality",
        subtitle,
        published,
        body,
        pageType: "content",
      },
    });

    res.json({ ok: true, page: formatSourcingCmsPage(page) });
  } catch (err) {
    next(err);
  }
});

export default router;
