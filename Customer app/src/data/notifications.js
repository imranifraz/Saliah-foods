import { ORDER_STATUSES } from "./orders";

export const NOTIFICATIONS_STORAGE_PREFIX = "saliah-notification-prefs";

/** What the customer wants to receive (order-related only). */
export const DEFAULT_NOTIFICATION_PREFS = {
  orderTracking: true,
  deliveryUpdates: true,
  ratingReminders: true,
  orderSms: false,
};

export function getNotificationsStorageKey(userId) {
  return userId ? `${NOTIFICATIONS_STORAGE_PREFIX}-${userId}` : null;
}

function migratePrefs(parsed) {
  return {
    orderTracking: parsed.orderTracking ?? parsed.orderUpdates ?? true,
    deliveryUpdates: parsed.deliveryUpdates ?? parsed.shippingAlerts ?? true,
    ratingReminders: parsed.ratingReminders ?? true,
    orderSms: parsed.orderSms ?? parsed.smsUpdates ?? false,
  };
}

export function loadNotificationPrefs(userId) {
  const key = getNotificationsStorageKey(userId);
  if (!key) return { ...DEFAULT_NOTIFICATION_PREFS };

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { ...DEFAULT_NOTIFICATION_PREFS };
    return migratePrefs(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_NOTIFICATION_PREFS };
  }
}

export function saveNotificationPrefs(userId, prefs) {
  const key = getNotificationsStorageKey(userId);
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(prefs));
}

export const NOTIFICATION_OPTIONS = [
  {
    id: "orderTracking",
    label: "Order tracking",
    description: "Updates when your order is confirmed, packed, shipped, and on the way.",
  },
  {
    id: "deliveryUpdates",
    label: "Delivery updates",
    description: "Alerts when your order is out for delivery or has been delivered.",
  },
  {
    id: "ratingReminders",
    label: "Rate delivered products",
    description: "A reminder to rate and review items after your order is delivered.",
  },
  {
    id: "orderSms",
    label: "SMS for order updates",
    description: "Tracking and delivery messages on your registered mobile number.",
  },
];

const TRACKING_STATUSES = ["placed", "confirmed", "packed", "shipped", "out_for_delivery"];
const DELIVERY_STATUSES = ["out_for_delivery", "delivered"];

/**
 * Build in-app notifications from order history (demo feed).
 * @returns {Array<{ id: string, type: string, orderId: string, title: string, message: string, at: string, actionLabel?: string, actionHref?: string }>}
 */
export function buildOrderNotificationFeed(orders, prefs) {
  const items = [];

  for (const order of orders) {
    if (order.status === "cancelled") continue;

    const history = order.statusHistory ?? [{ status: order.status, at: order.createdAt }];
    const productNames = order.items?.map((i) => i.name).filter(Boolean).join(", ") || "your order";
    const itemsNeedingReview =
      order.items?.filter(
        (item) => item.productId && (!item.review || item.review.status === "rejected")
      ) ?? [];
    const reviewNames = itemsNeedingReview.map((item) => item.name).filter(Boolean).join(", ");

    for (const entry of history) {
      const status = entry.status;
      const at = entry.at ?? order.createdAt;
      const label = ORDER_STATUSES[status]?.label ?? status;

      if (prefs.orderTracking && TRACKING_STATUSES.includes(status)) {
        items.push({
          id: `${order.id}-track-${status}`,
          type: "tracking",
          category: "orders",
          orderId: order.id,
          title: label,
          message: `Order ${order.id}: ${label.toLowerCase()}.`,
          at,
          actionLabel: "Track order",
          actionHref: "/account?tab=orders",
        });
      }

      if (prefs.deliveryUpdates && DELIVERY_STATUSES.includes(status)) {
        const isDelivered = status === "delivered";
        items.push({
          id: `${order.id}-delivery-${status}`,
          type: "delivery",
          category: "delivery",
          orderId: order.id,
          title: isDelivered ? "Order delivered" : "Out for delivery",
          message: isDelivered
            ? `Your Saliah order has been delivered. We hope you enjoy ${productNames}.`
            : `Your order is on its way and will arrive soon.`,
          at,
          actionLabel: "View order",
          actionHref: "/account?tab=orders",
        });
      }
    }

    if (prefs.ratingReminders && order.status === "delivered" && itemsNeedingReview.length > 0) {
      const deliveredAt =
        history.find((h) => h.status === "delivered")?.at ??
        order.createdAt;
      items.push({
        id: `${order.id}-rating`,
        type: "rating",
        category: "account",
        orderId: order.id,
        title: "How was your order?",
        message: `Your order is delivered. Please rate ${reviewNames || productNames} and help other customers choose Saliah.`,
        at: deliveredAt,
        actionLabel: "Rate products",
        actionHref: "/account?tab=orders",
      });
    }
  }

  return items
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 20);
}

export const NOTIFICATION_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "orders", label: "Orders" },
  { id: "delivery", label: "Delivery" },
  { id: "account", label: "Account" },
];

export const NOTIFICATION_READ_PREFIX = "saliah-notification-read";
export const NOTIFICATION_DISMISSED_PREFIX = "saliah-notification-dismissed";

export function loadNotificationReadIds(userId) {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(`${NOTIFICATION_READ_PREFIX}-${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveNotificationReadIds(userId, ids) {
  if (!userId) return;
  localStorage.setItem(`${NOTIFICATION_READ_PREFIX}-${userId}`, JSON.stringify(ids));
}

export function loadDismissedNotificationIds(userId) {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(`${NOTIFICATION_DISMISSED_PREFIX}-${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDismissedNotificationIds(userId, ids) {
  if (!userId) return;
  localStorage.setItem(`${NOTIFICATION_DISMISSED_PREFIX}-${userId}`, JSON.stringify(ids));
}

export function formatNotificationTime(iso) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 0) {
      return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
    }
    if (diffDays === 1) return "Yesterday";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}
