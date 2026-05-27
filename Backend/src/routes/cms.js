import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { formatHomeCmsPage } from "../lib/home-cms.js";

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
    res.json({ ok: true, page });
  } catch (err) {
    next(err);
  }
});

export default router;
