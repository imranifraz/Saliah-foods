export const LOW_STOCK_THRESHOLD = 5;

export const PRE_FULFILL_STATUSES = new Set(["placed", "confirmed", "packed"]);
export const FULFILL_STATUSES = new Set(["shipped", "out_for_delivery", "delivered"]);

export function getAvailableQuantity(variant) {
  const stock = Number(variant?.stockQuantity ?? 0);
  const reserved = Number(variant?.reservedQuantity ?? 0);
  return Math.max(0, stock - reserved);
}

export function isLowStockAvailable(available) {
  return available > 0 && available <= LOW_STOCK_THRESHOLD;
}

export function formatStockAdjustment(row) {
  return {
    id: row.id,
    variantId: row.variantId,
    sku: row.sku,
    productId: row.productId,
    previousStock: row.previousStock,
    newStock: row.newStock,
    previousReserved: row.previousReserved,
    newReserved: row.newReserved,
    stockDelta: row.newStock - row.previousStock,
    reservedDelta: row.newReserved - row.previousReserved,
    source: row.source,
    adminId: row.adminId ?? null,
    adminName: row.adminName ?? null,
    adminEmail: row.adminEmail ?? null,
    orderId: row.orderId ?? null,
    note: row.note ?? "",
    createdAt: row.createdAt.toISOString(),
  };
}

export const STOCK_SOURCE_LABELS = {
  admin_manual: "Manual update",
  admin_bulk: "Bulk update",
  order_reserved: "Order reserved",
  order_fulfilled: "Order fulfilled",
  order_cancelled: "Order cancelled",
  product_sync: "Product sync",
};
