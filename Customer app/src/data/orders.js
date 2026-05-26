/** Order statuses and per-user order storage (demo — localStorage). */

export const ORDER_STATUSES = {
  placed: { label: "Order placed", phase: "current" },
  confirmed: { label: "Confirmed", phase: "current" },
  packed: { label: "Packed", phase: "current" },
  shipped: { label: "Shipped", phase: "current" },
  out_for_delivery: { label: "Out for delivery", phase: "current" },
  delivered: { label: "Delivered", phase: "past" },
  cancelled: { label: "Cancelled", phase: "past" },
};

export const TRACKING_STEPS = [
  "placed",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
];

const CANCELLABLE = new Set(["placed", "confirmed"]);

export function getOrdersStorageKey(userId) {
  return userId ? `saliah-orders-${userId}` : null;
}

export function loadUserOrders(userId) {
  const key = getOrdersStorageKey(userId);
  if (!key) return [];

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeOrder) : [];
  } catch {
    return [];
  }
}

export function saveUserOrders(userId, orders) {
  const key = getOrdersStorageKey(userId);
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(orders));
}

function normalizeOrder(order) {
  return {
    ...order,
    status: order.status ?? "placed",
    statusHistory: order.statusHistory ?? [{ status: "placed", at: order.createdAt }],
    trackingNote: order.trackingNote ?? "",
  };
}

export function canCancelOrder(order) {
  return CANCELLABLE.has(order.status);
}

export function isActiveOrder(order) {
  return order.status !== "delivered" && order.status !== "cancelled";
}

export function getTrackingProgress(status) {
  const index = TRACKING_STEPS.indexOf(status);
  if (status === "cancelled") return -1;
  return index >= 0 ? index : 0;
}

export function formatOrderDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function formatINR(amount) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export function cancelOrderRecord(order, reason = "") {
  const at = new Date().toISOString();
  return {
    ...order,
    status: "cancelled",
    cancelReason: reason,
    statusHistory: [
      ...(order.statusHistory ?? []),
      { status: "cancelled", at, note: reason || "Cancelled by customer" },
    ],
  };
}

/** Demo: advance in-transit orders one step (for sample data). */
export function seedDemoTracking(order) {
  const hoursSince = (Date.now() - new Date(order.createdAt).getTime()) / 3600000;
  if (order.status === "cancelled" || order.status === "delivered") return order;

  let status = order.status;
  if (hoursSince > 72) status = "delivered";
  else if (hoursSince > 48) status = "out_for_delivery";
  else if (hoursSince > 24) status = "shipped";
  else if (hoursSince > 6) status = "packed";
  else if (hoursSince > 1) status = "confirmed";

  return { ...order, status };
}
