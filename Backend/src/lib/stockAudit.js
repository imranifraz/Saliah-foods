import { prisma } from "./prisma.js";
import { formatStockAdjustment } from "./inventoryConstants.js";

export async function recordStockAdjustment(
  tx,
  {
    variantId,
    sku,
    productId,
    previousStock,
    newStock,
    previousReserved,
    newReserved,
    source,
    admin = null,
    orderId = null,
    note = "",
  }
) {
  if (previousStock === newStock && previousReserved === newReserved) return null;

  return tx.stockAdjustment.create({
    data: {
      variantId,
      sku,
      productId,
      previousStock,
      newStock,
      previousReserved,
      newReserved,
      source,
      adminId: admin?.id ?? null,
      adminName: admin?.fullName ?? null,
      adminEmail: admin?.email ?? null,
      orderId: orderId ?? null,
      note: note ?? "",
    },
  });
}

export async function listStockHistory(variantId, { limit = 50 } = {}) {
  const rows = await prisma.stockAdjustment.findMany({
    where: { variantId },
    orderBy: { createdAt: "desc" },
    take: Math.min(100, Math.max(1, limit)),
  });
  return rows.map(formatStockAdjustment);
}
