const STATUS_LABELS = {
  placed: "Order placed",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const TRACKING_STATUSES = new Set(["placed", "confirmed", "packed", "shipped", "out_for_delivery"]);
const DELIVERY_STATUSES = new Set(["out_for_delivery", "delivered"]);

export function formatNotification(row) {
  return {
    id: row.id,
    type: row.type,
    category: row.category,
    orderId: row.orderId ?? null,
    title: row.title,
    message: row.message,
    actionLabel: row.actionLabel ?? null,
    actionHref: row.actionHref ?? null,
    at: row.createdAt.toISOString(),
    read: Boolean(row.readAt),
    dismissed: Boolean(row.dismissedAt),
  };
}

async function getCustomerPrefs(tx, userId) {
  const prefs = await tx.notificationPrefs.findUnique({ where: { userId } });
  return (
    prefs ?? {
      orderTracking: true,
      deliveryUpdates: true,
      ratingReminders: true,
      orderSms: false,
    }
  );
}

export async function createNotification(tx, data) {
  if (data.dedupeKey) {
    const existing = await tx.notification.findUnique({
      where: { dedupeKey: data.dedupeKey },
    });
    if (existing) return existing;
  }

  return tx.notification.create({ data });
}

export async function notifyNewOrder(tx, order) {
  const customer = order.customer ?? {};
  const customerName = customer.fullName ?? customer.name ?? "Customer";
  const total = Number(order.total ?? 0);

  await createNotification(tx, {
    audience: "admin",
    type: "new_order",
    category: "orders",
    title: "New order received",
    message: `${customerName} placed order ${order.id} for ₹${total.toLocaleString("en-IN")}.`,
    orderId: order.id,
    actionLabel: "View order",
    actionHref: `/orders/${order.id}`,
    dedupeKey: `admin:new_order:${order.id}`,
  });

  if (!order.userId) return;

  const prefs = await getCustomerPrefs(tx, order.userId);
  if (!prefs.orderTracking) return;

  await createNotification(tx, {
    audience: "customer",
    userId: order.userId,
    type: "tracking",
    category: "orders",
    title: STATUS_LABELS.placed,
    message: `Your Saliah order ${order.id} has been placed successfully.`,
    orderId: order.id,
    actionLabel: "Track order",
    actionHref: "/account?tab=orders",
    dedupeKey: `customer:${order.id}:track:placed`,
  });
}

export async function notifyOrderStatusChange(tx, order, previousStatus) {
  const status = order.status;
  if (!order.userId || status === previousStatus) return;

  if (status === "cancelled") {
    await notifyOrderCancelled(tx, order, previousStatus);
    return;
  }

  const prefs = await getCustomerPrefs(tx, order.userId);

  if (prefs.orderTracking && TRACKING_STATUSES.has(status)) {
    const label = STATUS_LABELS[status] ?? status;
    await createNotification(tx, {
      audience: "customer",
      userId: order.userId,
      type: "tracking",
      category: "orders",
      title: label,
      message: `Order ${order.id}: ${label.toLowerCase()}.`,
      orderId: order.id,
      actionLabel: "Track order",
      actionHref: "/account?tab=orders",
      dedupeKey: `customer:${order.id}:track:${status}`,
    });
  }

  if (prefs.deliveryUpdates && DELIVERY_STATUSES.has(status)) {
    const isDelivered = status === "delivered";
    await createNotification(tx, {
      audience: "customer",
      userId: order.userId,
      type: "delivery",
      category: "delivery",
      title: isDelivered ? "Order delivered" : "Out for delivery",
      message: isDelivered
        ? `Your Saliah order ${order.id} has been delivered.`
        : `Your order ${order.id} is on its way and will arrive soon.`,
      orderId: order.id,
      actionLabel: "View order",
      actionHref: "/account?tab=orders",
      dedupeKey: `customer:${order.id}:delivery:${status}`,
    });
  }

  if (status === "delivered") {
    const orderWithReviews =
      order.items?.some((item) => "review" in item)
        ? order
        : await tx.order.findUnique({
            where: { id: order.id },
            include: { items: { include: { review: true } } },
          });
    if (orderWithReviews) await notifyRatingReminder(tx, orderWithReviews);
  }
}

async function notifyRatingReminder(tx, order) {
  if (!order.userId) return;

  const prefs = await getCustomerPrefs(tx, order.userId);
  if (!prefs.ratingReminders) return;

  const items = order.items ?? [];
  const needsReview = items.filter(
    (item) => item.productId && (!item.review || item.review.status === "rejected")
  );
  if (!needsReview.length) return;

  const names = needsReview.map((item) => item.name).filter(Boolean).join(", ");

  await createNotification(tx, {
    audience: "customer",
    userId: order.userId,
    type: "rating",
    category: "account",
    title: "How was your order?",
    message: `Please rate ${names || "your items"} from order ${order.id}.`,
    orderId: order.id,
    actionLabel: "Rate products",
    actionHref: "/account?tab=orders",
    dedupeKey: `customer:${order.id}:rating`,
  });
}

export async function notifyOrderCancelled(tx, order, previousStatus, { cancelledBy = "system" } = {}) {
  const customer = order.customer ?? {};
  const customerName = customer.fullName ?? customer.name ?? "A customer";

  if (previousStatus !== "cancelled") {
    await createNotification(tx, {
      audience: "admin",
      type: "order_cancelled",
      category: "orders",
      title: "Order cancelled",
      message:
        cancelledBy === "customer"
          ? `${customerName} cancelled order ${order.id}.`
          : `Order ${order.id} was cancelled by admin.`,
      orderId: order.id,
      actionLabel: "View order",
      actionHref: `/orders/${order.id}`,
      dedupeKey: `admin:cancelled:${order.id}`,
    });
  }

  if (!order.userId || previousStatus === "cancelled") return;

  await createNotification(tx, {
    audience: "customer",
    userId: order.userId,
    type: "order_cancelled",
    category: "orders",
    title: "Order cancelled",
    message: `Your order ${order.id} has been cancelled.`,
    orderId: order.id,
    actionLabel: "View orders",
    actionHref: "/account?tab=orders",
    dedupeKey: `customer:${order.id}:cancelled`,
  });
}

export async function notifyReviewSubmitted(tx, review, productName, { resubmit = false } = {}) {
  const submittedKey = review.submittedAt
    ? new Date(review.submittedAt).toISOString()
    : new Date().toISOString();
  await createNotification(tx, {
    audience: "admin",
    type: "review_pending",
    category: "reviews",
    title: resubmit ? "Review resubmitted" : "Review awaiting moderation",
    message: `New ${review.rating}-star review for ${productName}.`,
    orderId: review.orderId,
    actionLabel: "Moderate reviews",
    actionHref: "/reviews",
    dedupeKey: resubmit
      ? `admin:review_pending:${review.id}:${submittedKey}`
      : `admin:review_pending:${review.id}`,
  });
}

export async function notifyReviewModerated(tx, review, productName) {
  if (review.status === "pending") return;

  const approved = review.status === "approved";
  await createNotification(tx, {
    audience: "customer",
    userId: review.userId,
    type: approved ? "review_approved" : "review_rejected",
    category: "account",
    title: approved ? "Review published" : "Review not published",
    message: approved
      ? `Your review for ${productName} is now live on Saliah Foods.`
      : `Your review for ${productName} was not published.${review.moderationNote ? ` Note: ${review.moderationNote}` : ""}`,
    orderId: review.orderId,
    actionLabel: "View orders",
    actionHref: "/account?tab=orders",
    dedupeKey: `customer:review:${review.id}:${review.status}`,
  });
}
