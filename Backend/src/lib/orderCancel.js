import { releaseOrderInventory } from "./inventoryStock.js";

export const CUSTOMER_CANCELLABLE = new Set(["placed", "confirmed"]);

/** Same cutoff as customer — no cancel after admin marks packed. */
export const ADMIN_CANCELLABLE = new Set(["placed", "confirmed"]);

export function canCustomerCancel(status) {
  return CUSTOMER_CANCELLABLE.has(status);
}

export function canAdminCancel(status) {
  return ADMIN_CANCELLABLE.has(status);
}

export function buildCancelledCustomer(customer, { reason = "", cancelledBy = "system", refund }) {
  const base = customer && typeof customer === "object" ? customer : {};
  const payment = base.payment && typeof base.payment === "object" ? base.payment : {};
  const wasPaid =
    payment.status === "paid" ||
    Boolean(payment.razorpayPaymentId) ||
    payment.status === "pending_configuration";
  const at = new Date().toISOString();
  const refundProcessed =
    refund?.ok && (refund.amount > 0 || refund.alreadyRefunded || refund.mode === "test");

  return {
    ...base,
    payment: {
      ...payment,
      status: refundProcessed ? "refunded" : wasPaid ? "cancelled" : "cancelled",
      refundedAt: refundProcessed ? at : payment.refundedAt ?? null,
      razorpayRefundId: refund?.razorpayRefundId ?? payment.razorpayRefundId ?? null,
      refundAmount: refund?.amount ?? payment.refundAmount ?? null,
      refundMode: refund?.mode ?? payment.refundMode ?? null,
      refundStatus: refund?.status ?? (refundProcessed ? "processed" : null),
      cancelledAt: at,
      cancelReason: reason || payment.cancelReason || "",
      cancelledBy,
    },
  };
}

export async function restoreOrderInventory(tx, order) {
  await releaseOrderInventory(tx, order);
}

export async function applyOrderCancellation(
  tx,
  order,
  { reason = "", cancelledBy = "customer", note, refund = null }
) {
  if (order.status === "cancelled") {
    return order;
  }

  await restoreOrderInventory(tx, order);

  const at = new Date().toISOString();
  const history = Array.isArray(order.statusHistory) ? [...order.statusHistory] : [];
  const cancelNote =
    note || reason || (cancelledBy === "admin" ? "Cancelled by admin" : "Cancelled by customer");

  return tx.order.update({
    where: { id: order.id },
    data: {
      status: "cancelled",
      cancelReason: reason || order.cancelReason || "",
      customer: buildCancelledCustomer(order.customer, { reason, cancelledBy, refund }),
      statusHistory: [...history, { status: "cancelled", at, note: cancelNote }],
    },
    include: { items: true },
  });
}
