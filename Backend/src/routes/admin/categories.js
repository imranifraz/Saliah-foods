import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAdmin } from "../../middleware/admin.js";

const router = Router();
router.use(requireAdmin);

function formatCategory(c) {
  return {
    id: c.id,
    label: c.label,
    description: c.description,
    image: c.image,
    sortOrder: c.sortOrder,
    isActive: c.isActive,
    featuredPromo: c.featuredPromo,
    productCount: c.productCount ?? 0,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

router.get("/", async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    });
    const counts = await prisma.product.groupBy({
      by: ["categoryId"],
      _count: { _all: true },
    });
    const countMap = Object.fromEntries(counts.map((c) => [c.categoryId, c._count._all]));
    res.json({
      ok: true,
      categories: categories.map((c) =>
        formatCategory({ ...c, productCount: countMap[c.id] ?? 0 })
      ),
    });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { id, label, description, image, sortOrder, isActive, featuredPromo } = req.body;
    if (!id?.trim() || !label?.trim()) {
      return res.status(400).json({ ok: false, error: "Category ID and label are required" });
    }

    const category = await prisma.category.create({
      data: {
        id: id.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        label: label.trim(),
        description: description ?? "",
        image: image ?? "",
        sortOrder: sortOrder ?? 0,
        isActive: isActive !== false,
        featuredPromo: featuredPromo ?? null,
      },
    });
    res.status(201).json({ ok: true, category: formatCategory({ ...category, productCount: 0 }) });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ ok: false, error: "Category ID already exists" });
    }
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const existing = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ ok: false, error: "Category not found" });

    const data = {};
    if (req.body.label !== undefined) data.label = req.body.label.trim();
    if (req.body.description !== undefined) data.description = req.body.description;
    if (req.body.image !== undefined) data.image = req.body.image;
    if (req.body.sortOrder !== undefined) data.sortOrder = Number(req.body.sortOrder);
    if (req.body.isActive !== undefined) data.isActive = Boolean(req.body.isActive);
    if (req.body.featuredPromo !== undefined) data.featuredPromo = req.body.featuredPromo;

    const category = await prisma.category.update({
      where: { id: existing.id },
      data,
    });
    const productCount = await prisma.product.count({ where: { categoryId: category.id } });
    res.json({ ok: true, category: formatCategory({ ...category, productCount }) });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const count = await prisma.product.count({ where: { categoryId: req.params.id } });
    if (count > 0) {
      return res.status(400).json({
        ok: false,
        error: `Cannot delete: ${count} product(s) use this category`,
      });
    }
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ ok: false, error: "Category not found" });
    }
    next(err);
  }
});

export default router;
