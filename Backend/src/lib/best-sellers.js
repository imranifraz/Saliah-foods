/** Top N products by units sold (non-cancelled orders) get `isBestSeller` on the Product row. */
export const BEST_SELLER_LIMIT = 8;

function safeQty(n) {
  const x = Number(n ?? 0);
  return Number.isFinite(x) && x > 0 ? Math.floor(x) : 0;
}

/**
 * Aggregate units sold per product from order line items.
 * @param {import("@prisma/client").PrismaClient | import("@prisma/client").Prisma.TransactionClient} prisma
 */
export async function aggregateProductSales(prisma) {
  const items = await prisma.orderItem.findMany({
    where: {
      productId: { not: null },
      order: { status: { not: "cancelled" } },
    },
    select: {
      productId: true,
      quantity: true,
    },
  });

  const byProduct = new Map();
  for (const item of items) {
    const id = item.productId;
    if (!id) continue;
    const current = byProduct.get(id) ?? { productId: id, quantity: 0 };
    current.quantity += safeQty(item.quantity);
    byProduct.set(id, current);
  }

  return [...byProduct.values()].sort((a, b) => b.quantity - a.quantity);
}

/**
 * Recompute and persist `Product.isBestSeller` from real order sales.
 * @param {import("@prisma/client").PrismaClient | import("@prisma/client").Prisma.TransactionClient} prisma
 */
export async function syncBestSellersFromSales(prisma, { limit = BEST_SELLER_LIMIT } = {}) {
  const rankings = await aggregateProductSales(prisma);
  const top = rankings.slice(0, Math.max(0, limit));
  const topIds = top.map((r) => r.productId).filter(Boolean);

  await prisma.product.updateMany({ data: { isBestSeller: false } });

  if (topIds.length) {
    await prisma.product.updateMany({
      where: { id: { in: topIds }, status: "active" },
      data: { isBestSeller: true },
    });
  }

  return { limit, count: topIds.length, top };
}
