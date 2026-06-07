import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAdmin } from "../../middleware/admin.js";

const router = Router();
router.use(requireAdmin);

function slugifyCategoryId(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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
    variantCount: c.variantCount ?? 0,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

async function getCountsForCategory(categoryId) {
  const [productCount, variantCount] = await Promise.all([
    prisma.product.count({ where: { categoryId } }),
    prisma.productVariant.count({ where: { product: { categoryId } } }),
  ]);
  return { productCount, variantCount };
}

async function buildCategoryCountMaps() {
  const products = await prisma.product.findMany({
    select: { categoryId: true, _count: { select: { variants: true } } },
  });
  const productCountMap = {};
  const variantCountMap = {};
  for (const product of products) {
    productCountMap[product.categoryId] = (productCountMap[product.categoryId] ?? 0) + 1;
    variantCountMap[product.categoryId] =
      (variantCountMap[product.categoryId] ?? 0) + product._count.variants;
  }
  return { productCountMap, variantCountMap };
}

function hasFeaturedPromo(category) {
  const promo = category.featuredPromo;
  return Boolean(promo && typeof promo === "object" && (promo.title || promo.image));
}

router.get("/", async (req, res, next) => {
  try {
    const q = String(req.query.q ?? "").trim();
    const status = String(req.query.status ?? "all");
    const promo = String(req.query.promo ?? "all");
    const sort = String(req.query.sort ?? "sortOrder");
    const direction = req.query.direction === "desc" ? "desc" : "asc";
    const all = req.query.all === "true" || req.query.page == null;
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(req.query.pageSize, 10) || 25));

    const where = {};
    if (status === "active") where.isActive = true;
    if (status === "inactive") where.isActive = false;
    if (q) {
      where.OR = [
        { label: { contains: q, mode: "insensitive" } },
        { id: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const dbOrderBy =
      sort === "label"
        ? [{ label: direction }]
        : sort === "updatedAt"
          ? [{ updatedAt: direction }]
          : sort === "createdAt"
            ? [{ createdAt: direction }]
            : [{ sortOrder: direction }, { label: "asc" }];

    const categories = await prisma.category.findMany({ where, orderBy: dbOrderBy });
    const { productCountMap, variantCountMap } = await buildCategoryCountMaps();

    let list = categories.map((c) =>
      formatCategory({
        ...c,
        productCount: productCountMap[c.id] ?? 0,
        variantCount: variantCountMap[c.id] ?? 0,
      })
    );

    if (promo === "featured") {
      list = list.filter((c) => hasFeaturedPromo(c));
    } else if (promo === "none") {
      list = list.filter((c) => !hasFeaturedPromo(c));
    }

    if (sort === "productCount") {
      list.sort((a, b) => {
        const cmp = (a.productCount ?? 0) - (b.productCount ?? 0);
        return direction === "asc" ? cmp : -cmp;
      });
    }

    const summary = {
      total: list.length,
      active: list.filter((c) => c.isActive).length,
      inactive: list.filter((c) => !c.isActive).length,
      linkedProducts: list.reduce((sum, c) => sum + Number(c.productCount ?? 0), 0),
      linkedVariants: list.reduce((sum, c) => sum + Number(c.variantCount ?? 0), 0),
      featured: list.filter((c) => hasFeaturedPromo(c)).length,
    };

    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = all ? 1 : Math.min(page, totalPages);
    const paginated = all ? list : list.slice((safePage - 1) * pageSize, safePage * pageSize);

    res.json({
      ok: true,
      categories: paginated,
      total,
      page: safePage,
      pageSize: all ? total : pageSize,
      totalPages: all ? 1 : totalPages,
      summary,
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

router.post("/:id/duplicate", async (req, res, next) => {
  try {
    const source = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!source) return res.status(404).json({ ok: false, error: "Category not found" });

    let newId = `${source.id}-copy`;
    let counter = 2;
    while (await prisma.category.findUnique({ where: { id: newId } })) {
      newId = `${source.id}-copy-${counter}`;
      counter += 1;
    }

    const maxSort = await prisma.category.aggregate({ _max: { sortOrder: true } });
    const category = await prisma.category.create({
      data: {
        id: newId,
        label: `${source.label} (Copy)`,
        description: source.description,
        image: source.image,
        sortOrder: (maxSort._max.sortOrder ?? source.sortOrder) + 1,
        isActive: false,
        featuredPromo: source.featuredPromo,
      },
    });

    res.status(201).json({ ok: true, category: formatCategory({ ...category, productCount: 0 }) });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ ok: false, error: "Category URL slug already exists" });
    }
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!category) return res.status(404).json({ ok: false, error: "Category not found" });

    const { productCount, variantCount } = await getCountsForCategory(category.id);
    res.json({ ok: true, category: formatCategory({ ...category, productCount, variantCount }) });
  } catch (err) {
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

    const requestedId =
      req.body.id !== undefined ? slugifyCategoryId(req.body.id) : existing.id;
    if (!requestedId) {
      return res.status(400).json({ ok: false, error: "Category URL slug is required" });
    }

    const category = await prisma.$transaction(async (tx) => {
      const label = data.label ?? existing.label;

      if (requestedId !== existing.id) {
        const taken = await tx.category.findUnique({ where: { id: requestedId } });
        if (taken) {
          const err = new Error("Category URL slug already exists");
          err.status = 409;
          throw err;
        }

        const products = await tx.product.findMany({
          where: { categoryId: existing.id },
          select: { id: true, slug: true, catalogId: true },
        });

        for (const product of products) {
          const newCatalogId = `${requestedId}-${product.slug}`;
          if (newCatalogId !== product.catalogId) {
            const catalogConflict = await tx.product.findUnique({
              where: { catalogId: newCatalogId },
            });
            if (catalogConflict && catalogConflict.id !== product.id) {
              const err = new Error(
                `Cannot rename category: catalog ID "${newCatalogId}" is already in use`
              );
              err.status = 409;
              throw err;
            }
          }

          await tx.product.update({
            where: { id: product.id },
            data: {
              categoryId: requestedId,
              categoryLabel: label,
              catalogId: newCatalogId,
            },
          });

          const variants = await tx.productVariant.findMany({
            where: { productId: product.id },
            select: { id: true, sku: true },
          });
          for (const variant of variants) {
            if (variant.sku === product.catalogId) {
              await tx.productVariant.update({
                where: { id: variant.id },
                data: { sku: newCatalogId },
              });
            }
          }
        }

        return tx.category.update({
          where: { id: existing.id },
          data: { ...data, id: requestedId },
        });
      }

      if (data.label !== undefined) {
        await tx.product.updateMany({
          where: { categoryId: existing.id },
          data: { categoryLabel: label },
        });
      }

      return tx.category.update({
        where: { id: existing.id },
        data,
      });
    });

    const { productCount, variantCount } = await getCountsForCategory(category.id);
    res.json({ ok: true, category: formatCategory({ ...category, productCount, variantCount }) });
  } catch (err) {
    if (err.status === 409) {
      return res.status(409).json({ ok: false, error: err.message });
    }
    if (err.code === "P2002") {
      return res.status(409).json({ ok: false, error: "Category URL slug already exists" });
    }
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
