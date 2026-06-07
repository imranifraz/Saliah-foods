import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

function formatItem(item, live = null) {
  const mrp = item.mrpValue ?? null;
  const discount =
    mrp && mrp > item.priceValue ? Math.round(((mrp - item.priceValue) / mrp) * 100) : 0;

  return {
    productId: item.productId,
    variantId: item.variantId,
    sku: item.sku,
    slug: item.slug,
    name: item.name,
    img: item.img,
    packSize: item.packSize,
    priceValue: item.priceValue,
    mrpValue: item.mrpValue,
    price: `₹${item.priceValue.toLocaleString("en-IN")}`,
    mrp: mrp ? `₹${mrp.toLocaleString("en-IN")}` : null,
    discountPercent: discount || null,
    tagline: item.tagline ?? "",
    addedAt: item.addedAt.toISOString(),
    rating: live?.rating ?? null,
    inStock: live?.inStock ?? null,
    stockLabel: live?.stockLabel ?? null,
  };
}

function variantAvailable(variant) {
  return variant.stockStatus === "in_stock" && variant.stockQuantity - variant.reservedQuantity > 0;
}

function enrichWishlistItems(items, { variants, productsById, productsBySlug }) {
  const variantMap = new Map(variants.map((variant) => [variant.id, variant]));
  const productIdMap = new Map(productsById.map((product) => [product.id, product]));
  const slugMap = new Map(productsBySlug.map((product) => [product.slug, product]));

  return items.map((item) => {
    if (item.variantId) {
      const variant = variantMap.get(item.variantId);
      if (variant) {
        const inStock = variantAvailable(variant);
        return formatItem(item, {
          rating: variant.product.rating,
          inStock,
          stockLabel: inStock ? "In stock" : "Out of stock",
        });
      }
    }

    const product = item.productId
      ? productIdMap.get(item.productId)
      : slugMap.get(item.slug);

    if (product) {
      return formatItem(item, {
        rating: product.rating,
        inStock: product.inStock,
        stockLabel: product.inStock ? "In stock" : "Out of stock",
      });
    }

    return formatItem(item);
  });
}

router.get("/", async (req, res, next) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user.id },
      orderBy: { addedAt: "desc" },
    });

    const variantIds = [...new Set(items.map((item) => item.variantId).filter(Boolean))];
    const productIds = [...new Set(items.map((item) => item.productId).filter(Boolean))];
    const slugs = [
      ...new Set(items.filter((item) => !item.variantId && !item.productId).map((item) => item.slug)),
    ];

    const [variants, productsById, productsBySlug] = await Promise.all([
      variantIds.length
        ? prisma.productVariant.findMany({
            where: { id: { in: variantIds } },
            include: { product: { select: { rating: true, inStock: true } } },
          })
        : [],
      productIds.length
        ? prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, slug: true, rating: true, inStock: true },
          })
        : [],
      slugs.length
        ? prisma.product.findMany({
            where: { slug: { in: slugs } },
            select: { id: true, slug: true, rating: true, inStock: true },
          })
        : [],
    ]);

    res.json({ ok: true, items: enrichWishlistItems(items, { variants, productsById, productsBySlug }) });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { productId, variantId, sku, slug, name, img, packSize, priceValue, mrpValue, tagline } =
      req.body;
    const pack = packSize ?? "";
    let item;

    if (variantId) {
      item = await prisma.wishlistItem.upsert({
        where: {
          userId_variantId: {
            userId: req.user.id,
            variantId,
          },
        },
        create: {
          userId: req.user.id,
          productId: productId ?? null,
          variantId,
          sku: sku ?? null,
          slug,
          name,
          img,
          packSize: pack,
          priceValue,
          mrpValue: mrpValue ?? null,
          tagline: tagline ?? "",
        },
        update: {
          productId: productId ?? null,
          sku: sku ?? null,
          slug,
          name,
          img,
          packSize: pack,
          priceValue,
          mrpValue: mrpValue ?? null,
          tagline: tagline ?? "",
        },
      });
    } else {
      const existing = await prisma.wishlistItem.findFirst({
        where: {
          userId: req.user.id,
          slug,
          packSize: pack,
        },
      });

      item = existing
        ? await prisma.wishlistItem.update({
            where: { id: existing.id },
            data: {
              name,
              img,
              priceValue,
              mrpValue: mrpValue ?? null,
              tagline: tagline ?? "",
            },
          })
        : await prisma.wishlistItem.create({
            data: {
              userId: req.user.id,
              slug,
              name,
              img,
              packSize: pack,
              priceValue,
              mrpValue: mrpValue ?? null,
              tagline: tagline ?? "",
            },
          });
    }

    res.status(201).json({ ok: true, item: formatItem(item) });
  } catch (err) {
    next(err);
  }
});

router.delete("/:identifier", async (req, res, next) => {
  try {
    const packSize = req.query.packSize ?? "";
    const slug = req.query.slug;
    await prisma.wishlistItem.deleteMany({
      where: slug
        ? {
            userId: req.user.id,
            slug: String(slug),
            packSize: String(packSize),
          }
        : {
            userId: req.user.id,
            variantId: req.params.identifier,
          },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
