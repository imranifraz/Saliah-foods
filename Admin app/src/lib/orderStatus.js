export const ORDER_STATUS_LABELS = {
  placed: "Order placed",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const TRACKING_STEPS = [
  "placed",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
];

export const ACTIVE_ORDER_STATUSES = [
  "placed",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
];

export const ORDER_BUCKETS = [
  { id: "active", label: "Active orders" },
  { id: "past", label: "Past orders" },
  { id: "cancelled", label: "Cancelled orders" },
];

export function getOrderBucket(order) {
  if (order?.status === "cancelled") return "cancelled";
  if (order?.status === "delivered") return "past";
  return "active";
}

export function isOrderInBucket(order, bucket) {
  return getOrderBucket(order) === bucket;
}

export function getTrackingProgress(status) {
  const index = TRACKING_STEPS.indexOf(status);
  if (status === "cancelled") return -1;
  return index >= 0 ? index : 0;
}

export function formatStatusLabel(status) {
  return ORDER_STATUS_LABELS[status] ?? String(status ?? "").replace(/_/g, " ");
}

export function formatStatusDateTime(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return String(iso);
  }
}

/** Normalize statusHistory into chronological events with labels. */
export function buildStatusEvents(order) {
  const history = Array.isArray(order?.statusHistory) ? order.statusHistory : [];
  const events = history
    .filter((entry) => entry && entry.status)
    .map((entry) => ({
      status: entry.status,
      at: entry.at ?? null,
      note: entry.note ? String(entry.note).trim() : "",
      label: formatStatusLabel(entry.status),
    }));

  if (events.length === 0 && order) {
    events.push({
      status: order.status ?? "placed",
      at: order.createdAt ?? null,
      note: "",
      label: formatStatusLabel(order.status ?? "placed"),
    });
  }

  return events;
}
