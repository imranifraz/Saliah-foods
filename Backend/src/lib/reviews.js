function toIso(value) {
  return value?.toISOString?.() ?? value ?? null;
}

export function formatReview(review) {
  if (!review) return null;

  return {
    id: review.id,
    userId: review.userId,
    orderId: review.orderId,
    orderItemId: review.orderItemId,
    productId: review.productId,
    variantId: review.variantId ?? null,
    rating: review.rating,
    title: review.title ?? "",
    comment: review.comment ?? "",
    status: review.status,
    moderationNote: review.moderationNote ?? "",
    submittedAt: toIso(review.submittedAt),
    moderatedAt: toIso(review.moderatedAt),
    createdAt: toIso(review.createdAt),
    updatedAt: toIso(review.updatedAt),
  };
}

export function maskCustomerName(fullName) {
  const parts = String(fullName ?? "Customer").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "Verified customer";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
}

export function formatApprovedProductReview(review) {
  if (!review) return null;

  const fullName = review.user?.fullName ?? "Verified customer";

  return {
    id: review.id,
    rating: review.rating,
    title: review.title ?? "",
    comment: review.comment ?? "",
    submittedAt: toIso(review.submittedAt),
    customerName: maskCustomerName(fullName),
  };
}

export function buildReviewSummary(reviews) {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let total = 0;
  let sum = 0;

  for (const review of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(Number(review.rating) || 0)));
    distribution[star] += 1;
    total += 1;
    sum += Number(review.rating) || 0;
  }

  const average = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;

  return {
    average,
    count: total,
    distribution: [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: distribution[star],
      percent: total > 0 ? Math.round((distribution[star] / total) * 100) : 0,
    })),
  };
}

export function formatReviewableOrderItem(order, item) {
  const history = Array.isArray(order.statusHistory) ? order.statusHistory : [];
  const deliveredAt =
    history.find((entry) => entry?.status === "delivered")?.at ?? order.createdAt;

  return {
    orderId: order.id,
    orderStatus: order.status,
    orderCreatedAt: toIso(order.createdAt),
    deliveredAt: toIso(deliveredAt),
    item: {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      slug: item.productSlug,
      name: item.name,
      img: item.img,
      packSize: item.packSize,
      quantity: item.quantity,
      priceValue: item.priceValue,
      mrpValue: item.mrpValue,
      review: formatReview(item.review),
    },
  };
}

export async function syncProductReviewAggregates(prismaLike, productId) {
  const approved = await prismaLike.review.aggregate({
    where: { productId, status: "approved" },
    _avg: { rating: true },
    _count: { _all: true },
  });

  const approvedCount = approved._count._all ?? 0;
  const nextRating = approvedCount > 0 ? Number(approved._avg.rating ?? 0) : 0;

  return prismaLike.product.update({
    where: { id: productId },
    data: {
      rating: nextRating,
      reviewCount: approvedCount,
    },
  });
}
