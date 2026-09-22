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

/** True if this order already passed through a fulfill status (prevents double stock deduct). */
export function hasOrderInventoryBeenFulfilled(order) {
  if (FULFILL_STATUSES.has(order?.status)) return true;
  const history = Array.isArray(order?.statusHistory) ? order.statusHistory : [];
  return history.some((entry) => FULFILL_STATUSES.has(entry?.status));
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
  admin_quick_stock: "Quick stock toggle",
  order_reserved: "Order reserved",
  order_cancelled: "Order cancelled",
  order_fulfilled: "Order shipped",
  product_sync: "Product sync",
};
