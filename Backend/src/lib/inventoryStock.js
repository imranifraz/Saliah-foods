import { stockStatusFromQuantity, syncProductSummary } from "./products.js";
import {
  getAvailableQuantity,
  isLowStockAvailable,
  LOW_STOCK_THRESHOLD,
} from "./inventoryConstants.js";
import { recordStockAdjustment } from "./stockAudit.js";
import { notifyLowStock, notifyOutOfStock } from "./notifications.js";
import { sendInventoryAlertEmail } from "./mail.js";

const productSelect = {
  id: true,
  slug: true,
  catalogId: true,
  name: true,
  categoryId: true,
  categoryLabel: true,
  img: true,
  images: true,
  status: true,
  isBestSeller: true,
};

function normalizeQuantity(value) {
  const quantity = Number(value);
  if (!Number.isFinite(quantity) || quantity < 0) return 0;
  return Math.floor(quantity);
}

function computeStockStatus(stockQuantity, reservedQuantity) {
  return stockStatusFromQuantity(getAvailableQuantity({ stockQuantity, reservedQuantity }));
}

async function loadVariantWithProduct(variantId, tx) {
  return tx.productVariant.findUnique({
    where: { id: variantId },
    include: { product: { select: productSelect } },
  });
}

export async function applyVariantStockChange(
  tx,
  {
    variantId,
    stockQuantity,
    stockDelta = 0,
    reservedDelta = 0,
    source,
    admin = null,
    orderId = null,
    note = "",
  }
) {
  const existing = await tx.productVariant.findUnique({
    where: { id: variantId },
    include: { product: { select: productSelect } },
  });

  if (!existing) {
    throw new Error("Inventory item not found");
  }

  const previousStock = normalizeQuantity(existing.stockQuantity);
  const previousReserved = normalizeQuantity(existing.reservedQuantity);
  const nextStock =
    stockQuantity !== undefined && stockQuantity !== null
      ? normalizeQuantity(stockQuantity)
      : previousStock + normalizeQuantity(stockDelta);
  const nextReserved = previousReserved + normalizeQuantity(reservedDelta);

  if (nextStock < 0 || nextReserved < 0) {
    throw new Error("Stock quantities cannot be negative");
  }

  if (nextReserved > nextStock) {
    throw new Error("Reserved quantity cannot exceed on-hand stock");
  }

  const previousAvailable = getAvailableQuantity(existing);
  const nextAvailable = Math.max(0, nextStock - nextReserved);

  await tx.productVariant.update({
    where: { id: variantId },
    data: {
      stockQuantity: nextStock,
      reservedQuantity: nextReserved,
      stockStatus: computeStockStatus(nextStock, nextReserved),
    },
  });

  await recordStockAdjustment(tx, {
    variantId,
    sku: existing.sku,
    productId: existing.productId,
    previousStock,
    newStock: nextStock,
    previousReserved,
    newReserved: nextReserved,
    source,
    admin,
    orderId,
    note,
  });

  await syncProductSummary(tx, existing.productId);

  const updated = await loadVariantWithProduct(variantId, tx);

  if (previousAvailable !== nextAvailable) {
    if (nextAvailable === 0 && previousAvailable > 0) {
      await notifyOutOfStock(tx, updated);
      queueInventoryAlertEmail({
        subject: `Out of stock: ${updated.sku}`,
        text: `${updated.sku} · ${updated.product?.name ?? "Product"} is out of stock.`,
      });
    } else if (isLowStockAvailable(nextAvailable) && !isLowStockAvailable(previousAvailable)) {
      await notifyLowStock(tx, updated, nextAvailable);
      queueInventoryAlertEmail({
        subject: `Low stock: ${updated.sku}`,
        text: `${updated.sku} · ${updated.product?.name ?? "Product"} has ${nextAvailable} unit(s) available.`,
      });
    }
  }

  return updated;
}

export async function setVariantStockQuantity(tx, variant, stockQuantity, { source, admin, note = "" } = {}) {
  return applyVariantStockChange(tx, {
    variantId: variant.id,
    stockQuantity,
    source,
    admin,
    note,
  });
}

export async function reserveVariantStock(tx, variantId, quantity, orderId) {
  const existing = await tx.productVariant.findUnique({ where: { id: variantId } });
  if (!existing) throw new Error("Variant not found");

  const qty = normalizeQuantity(quantity);
  if (qty < 1) throw new Error("Invalid quantity");

  const available = getAvailableQuantity(existing);
  if (available < qty) {
    throw new Error("Insufficient available stock");
  }

  return applyVariantStockChange(tx, {
    variantId,
    reservedDelta: qty,
    source: "order_reserved",
    orderId,
    note: `Reserved ${qty} unit(s) for order`,
  });
}

export async function releaseVariantReservation(tx, variantId, quantity, orderId) {
  const qty = normalizeQuantity(quantity);
  if (qty < 1) return null;

  return applyVariantStockChange(tx, {
    variantId,
    reservedDelta: -qty,
    source: "order_cancelled",
    orderId,
    note: `Released ${qty} reserved unit(s)`,
  });
}

export async function fulfillVariantReservation(tx, variantId, quantity, orderId) {
  const qty = normalizeQuantity(quantity);
  if (qty < 1) return null;

  return applyVariantStockChange(tx, {
    variantId,
    stockDelta: -qty,
    reservedDelta: -qty,
    source: "order_fulfilled",
    orderId,
    note: `Fulfilled ${qty} unit(s) on ship`,
  });
}

export async function reserveOrderInventory(tx, order) {
  for (const item of order.items ?? []) {
    if (!item.variantId || !item.quantity) continue;
    await reserveVariantStock(tx, item.variantId, item.quantity, order.id);
  }
}

export async function releaseOrderInventory(tx, order) {
  for (const item of order.items ?? []) {
    if (!item.variantId || !item.quantity) continue;
    await releaseVariantReservation(tx, item.variantId, item.quantity, order.id);
  }
}

export async function fulfillOrderInventory(tx, order) {
  for (const item of order.items ?? []) {
    if (!item.variantId || !item.quantity) continue;
    await fulfillVariantReservation(tx, item.variantId, item.quantity, order.id);
  }
}

export { LOW_STOCK_THRESHOLD, getAvailableQuantity, productSelect, loadVariantWithProduct };

function queueInventoryAlertEmail(payload) {
  sendInventoryAlertEmail(payload).catch((err) => {
    console.error("[mail] Inventory alert failed:", err.message);
  });
}
