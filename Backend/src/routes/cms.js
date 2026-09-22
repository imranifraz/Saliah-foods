import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { formatHomeCmsPage } from "../lib/home-cms.js";
import { formatContactCmsPage } from "../lib/contactCms.js";
import { formatFaqCmsPage } from "../lib/faqCms.js";
import { formatSourcingCmsPage } from "../lib/sourcingCms.js";
import { formatLegacyCmsPage } from "../lib/legacyCms.js";

const router = Router();

router.get("/home", async (_req, res, next) => {
  try {
    const page = await prisma.cmsPage.findFirst({
      where: { slug: "homepage", published: true },
    });
    if (!page) {
      return res.json({ ok: true, page: formatHomeCmsPage(null) });
    }
    res.json({ ok: true, page: formatHomeCmsPage(page) });
  } catch (err) {
    next(err);
  }
});

router.get("/pages", async (_req, res, next) => {
  try {
    const pages = await prisma.cmsPage.findMany({
      where: { published: true },
      select: { slug: true, title: true, subtitle: true, pageType: true, updatedAt: true },
      orderBy: { slug: "asc" },
    });
    res.json({ ok: true, pages });
  } catch (err) {
    next(err);
  }
});

router.get("/pages/:slug", async (req, res, next) => {
  try {
    const page = await prisma.cmsPage.findFirst({
      where: { slug: req.params.slug, published: true },
    });
    if (!page) return res.status(404).json({ ok: false, error: "Page not found" });
    const formatted =
      page.slug === "contact" || page.pageType === "contact"
        ? formatContactCmsPage(page)
        : page.slug === "faq" || page.pageType === "faq"
          ? formatFaqCmsPage(page)
          : page.slug === "sourcing-quality"
            ? formatSourcingCmsPage(page)
            : page.slug === "our-legacy" || page.slug === "about-us" || page.pageType === "legacy"
              ? formatLegacyCmsPage(page)
              : page;
    res.json({ ok: true, page: formatted });
  } catch (err) {
    next(err);
  }
});

export default router;
