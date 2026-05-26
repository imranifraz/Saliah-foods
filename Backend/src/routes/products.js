import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { formatProduct } from "../lib/product-response.js";

const router = Router();
const productInclude = {
  variants: {
    orderBy: [{ isDefault: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
  },
  reviews: {
    where: { status: "approved" },
    include: {
      user: {
        select: { fullName: true },
      },
    },
    orderBy: { submittedAt: "desc" },
    take: 3,
  },
};

router.get("/", async (req, res, next) => {
  try {
    const { category } = req.query;
    const where = {
      status: "active",
      ...(category && category !== "all" ? { categoryId: String(category) } : {}),
    };
    const products = await prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    });
    res.json({ ok: true, products: products.map(formatProduct) });
  } catch (err) {
    next(err);
  }
});

router.get("/slug/:slug", async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({
      where: { slug: req.params.slug, status: "active" },
      include: productInclude,
    });
    if (!product) return res.status(404).json({ ok: false, error: "Product not found" });
    res.json({ ok: true, product: formatProduct(product) });
  } catch (err) {
    next(err);
  }
});

router.get("/:slug/related", async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({
      where: { slug: req.params.slug, status: "active" },
      include: productInclude,
    });
    if (!product) return res.status(404).json({ ok: false, error: "Product not found" });

    const related = await prisma.product.findMany({
      where: {
        status: "active",
        categoryId: product.categoryId,
        NOT: { slug: product.slug },
      },
      include: productInclude,
      take: 4,
    });
    res.json({ ok: true, products: related.map(formatProduct) });
  } catch (err) {
    next(err);
  }
});

export default router;
