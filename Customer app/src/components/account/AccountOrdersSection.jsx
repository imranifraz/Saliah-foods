import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useOrders } from "../../context/OrdersContext";
import { useCart } from "../../context/CartContext";
import { canCancelOrder, formatINR, formatOrderDate } from "../../data/orders";
import { formatAddressSummary } from "../../data/profile";
import { GST_LABEL } from "../../data/pricing";
import { useGstSettings } from "../../context/GstSettingsContext.jsx";
import { OrderTrackingTimeline } from "./OrderTrackingTimeline";
import {
  AccountAlert,
  AccountField,
  AccountBtn,
  AccountCard,
  AccountEmptyState,
  AccountInput,
  AccountStatusBadge,
  AccountTextarea,
} from "./AccountUI";
import { downloadOrderInvoice, getOrderStatusBadge, getPaymentStatusLabel } from "./accountUtils";
import { RefundDetailsPanel } from "./RefundDetailsPanel.jsx";
import { formatRefundAmount, getRefundDetails } from "../../utils/paymentRefund.js";

function OrderThumbnails({ items }) {
  const shown = items.slice(0, 4);
  return (
    <div className="account-order-thumbs">
      {shown.map((item) => (
        <img
          key={item.id}
          src={item.img}
          alt=""
          className="account-order-thumb"
          loading="lazy"
          decoding="async"
        />
      ))}
      {items.length > 4 ? (
        <span className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-white bg-cream-100 font-body text-[10px] font-medium text-emerald-900/50">
          +{items.length - 4}
        </span>
      ) : null}
    </div>
  );
}

const REVIEW_STATUS_META = {
  pending: {
    label: "Pending approval",
    className: "bg-amber-50 text-amber-700",
    actionLabel: "Edit review",
  },
  approved: {
    label: "Approved review",
    className: "bg-emerald-50 text-emerald-700",
    actionLabel: "View review",
  },
  rejected: {
    label: "Needs changes",
    className: "bg-rose-50 text-rose-700",
    actionLabel: "Edit & resubmit",
  },
};

function ReviewStatusPill({ review }) {
  if (!review) return null;
  const meta = REVIEW_STATUS_META[review.status];
  if (!meta) return null;

  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${meta.className}`}>
      {meta.label}
    </span>
  );
}

function ReviewStarButton({ filled, disabled, onClick, label }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className={`rounded-full p-1 transition ${
        disabled ? "cursor-default opacity-70" : "hover:bg-gold-500/10"
      } ${filled ? "text-gold-500" : "text-cream-300"}`}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="M12 3.25l2.77 5.61 6.19.9-4.48 4.37 1.06 6.17L12 17.34l-5.54 2.91 1.06-6.17-4.48-4.37 6.19-.9L12 3.25z" />
      </svg>
    </button>
  );
}

function ReviewModal({ target, onClose, onSubmit }) {
  const review = target?.review ?? null;
  const canEdit = review?.status !== "approved";
  const [rating, setRating] = useState(review?.rating ?? 0);
  const [title, setTitle] = useState(review?.title ?? "");
  const [comment, setComment] = useState(review?.comment ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setRating(review?.rating ?? 0);
    setTitle(review?.title ?? "");
    setComment(review?.comment ?? "");
    setError("");
    setSaving(false);
  }, [review, target?.item.id]);

  if (!target) return null;

  const itemLabel = `${target.item.name}${target.item.packSize ? ` (${target.item.packSize})` : ""}`;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-emerald-950/55 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-[28px] border border-cream-200/70 bg-cream-50 shadow-[0_24px_80px_rgba(22,49,42,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-cream-200/70 px-5 py-4 sm:px-6">
          <div>
            <p className="font-display text-xl text-emerald-900">
              {review ? "Your review" : "Rate delivered product"}
            </p>
            <p className="mt-1 font-body text-sm text-emerald-900/50">{itemLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-emerald-900/5 p-2 text-emerald-900/55 transition hover:bg-emerald-900/10 hover:text-emerald-900"
            aria-label="Close review dialog"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
          {review ? (
            <div className="flex flex-wrap items-center gap-2">
              <ReviewStatusPill review={review} />
              {review.moderationNote ? (
                <p className="font-body text-xs text-emerald-900/45">{review.moderationNote}</p>
              ) : null}
            </div>
          ) : null}

          <div>
            <p className="account-label">Overall rating</p>
            <div className="mt-2 flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, index) => {
                const nextValue = index + 1;
                return (
                  <ReviewStarButton
                    key={nextValue}
                    filled={nextValue <= rating}
                    disabled={!canEdit || saving}
                    label={`Rate ${nextValue} star${nextValue === 1 ? "" : "s"}`}
                    onClick={() => {
                      setRating(nextValue);
                      setError("");
                    }}
                  />
                );
              })}
              <span className="ml-2 font-body text-sm text-emerald-900/55">
                {rating > 0 ? `${rating}/5` : "Select rating"}
              </span>
            </div>
          </div>

          <AccountField id="review-title" label="Headline (optional)">
            <AccountInput
              id="review-title"
              value={title}
              disabled={!canEdit || saving}
              maxLength={120}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What stood out for you?"
            />
          </AccountField>

          <AccountField id="review-comment" label="Review">
            <AccountTextarea
              id="review-comment"
              value={comment}
              disabled={!canEdit || saving}
              onChange={(event) => {
                setComment(event.target.value);
                if (error) setError("");
              }}
              placeholder="Share taste, freshness, packaging, or delivery experience."
              rows={5}
            />
          </AccountField>

          {error ? (
            <AccountAlert type="error">{error}</AccountAlert>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {canEdit ? (
              <AccountBtn
                variant="primary"
                disabled={saving}
                onClick={async () => {
                  if (!rating) {
                    setError("Please select a rating.");
                    return;
                  }
                  if (!comment.trim()) {
                    setError("Please write a short review.");
                    return;
                  }

                  setSaving(true);
                  const result = await onSubmit({
                    orderItemId: target.item.id,
                    rating,
                    title,
                    comment,
                  });
                  setSaving(false);

                  if (!result.ok) {
                    setError(result.error || "Unable to save your review right now.");
                    return;
                  }

                  onClose();
                }}
              >
                {saving
                  ? "Saving..."
                  : review?.status === "rejected"
                    ? "Resubmit for approval"
                    : review
                      ? "Update review"
                      : "Submit review"}
              </AccountBtn>
            ) : null}
            <AccountBtn variant="ghost" onClick={onClose}>
              {canEdit ? "Cancel" : "Close"}
            </AccountBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

function getReviewActionLabel(review) {
  if (!review) return "Rate product";
  return REVIEW_STATUS_META[review.status]?.actionLabel ?? "View review";
}

function getItemReview(item, reviewItemsByOrderItemId) {
  return reviewItemsByOrderItemId[item.id]?.item.review ?? item.review ?? null;
}

function needsReview(item, reviewItemsByOrderItemId) {
  if (!item?.productId) return false;
  const review = getItemReview(item, reviewItemsByOrderItemId);
  return !review || review.status === "rejected";
}

function OrderCard({ order, onCancel, onReorder, reviewItemsByOrderItemId, onOpenReview }) {
  const { gstin } = useGstSettings();
  const [showDetails, setShowDetails] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const statusBadge = getOrderStatusBadge(order.status);
  const paymentLabel = getPaymentStatusLabel(order);
  const refund = getRefundDetails(order);
  const paymentMethodLabel =
    order.paymentMethod === "razorpay"
      ? "Razorpay"
      : order.paymentMethod === "upi"
        ? "UPI"
        : order.paymentMethod === "card"
          ? "Debit / Credit Card"
          : "Cash on Delivery";

  const reviewableItems =
    order.status === "delivered"
      ? order.items.filter((item) => item.productId)
      : [];
  const pendingReviewItems = reviewableItems.filter((item) =>
    needsReview(item, reviewItemsByOrderItemId)
  );
  const firstPendingReview = pendingReviewItems[0] ?? null;

  return (
    <article className="account-order-card">
      <div className="account-order-card__head">
        <div className="flex flex-wrap items-start gap-4">
          <OrderThumbnails items={order.items} />
          <div>
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-900/40">
              {order.id}
            </p>
            <p className="mt-1 font-display text-xl text-emerald-900">{formatINR(order.total)}</p>
            <p className="mt-1 font-body text-xs text-emerald-900/45">
              {formatOrderDate(order.createdAt)} · {order.items.length} item
              {order.items.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <AccountStatusBadge label={statusBadge.label} className={statusBadge.className} />
          <span
            className={`font-body text-[10px] uppercase tracking-[0.12em] ${
              refund?.isRefunded ? "font-semibold text-rose-700" : "text-emerald-900/40"
            }`}
          >
            {paymentLabel}
          </span>
          {refund?.isRefunded ? (
            <span className="font-body text-xs font-medium text-rose-700/90">
              {formatRefundAmount(refund.amount)} refunded
            </span>
          ) : null}
        </div>
      </div>

      {refund ? <RefundDetailsPanel order={order} /> : null}

      {order.status === "delivered" && pendingReviewItems.length > 0 ? (
        <div className="mx-4 mb-1 mt-4 rounded-2xl border border-gold-500/25 bg-gold-500/8 px-4 py-3 sm:mx-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-body text-sm font-semibold text-emerald-900">
                Rate your products
              </p>
              <p className="mt-0.5 font-body text-xs text-emerald-900/55">
                {pendingReviewItems.length} item{pendingReviewItems.length === 1 ? "" : "s"} waiting
                for your review after delivery.
              </p>
            </div>
            {firstPendingReview ? (
              <AccountBtn
                variant="primary"
                className="account-btn--sm"
                onClick={() =>
                  onOpenReview({
                    orderId: order.id,
                    item: firstPendingReview,
                    review: getItemReview(firstPendingReview, reviewItemsByOrderItemId),
                  })
                }
              >
                Write a review
              </AccountBtn>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="account-order-card__body">
        <ul className="space-y-2">
          {order.items.map((item) => {
            const review = getItemReview(item, reviewItemsByOrderItemId);
            const canRate = order.status === "delivered" && item.productId;

            return (
              <li
                key={item.id}
                className="rounded-2xl border border-cream-200/60 bg-white/65 px-3 py-3 font-body text-sm text-emerald-900/65"
              >
                <div className="flex justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p>
                      {item.name}
                      {item.packSize ? ` · ${item.packSize}` : ""} × {item.quantity}
                      {item.bogoApplied ? " · BOGO" : ""}
                    </p>
                    {canRate ? (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <ReviewStatusPill review={review} />
                        <AccountBtn
                          variant={needsReview(item, reviewItemsByOrderItemId) ? "primary" : "soft"}
                          className="account-btn--sm"
                          onClick={() =>
                            onOpenReview({
                              orderId: order.id,
                              item,
                              review,
                            })
                          }
                        >
                          {getReviewActionLabel(review)}
                        </AccountBtn>
                      </div>
                    ) : null}
                  </div>
                  <span className="shrink-0 font-medium">
                    {formatINR(
                      item.lineTotal != null
                        ? item.lineTotal
                        : Math.max(
                            0,
                            (item.priceValue ?? 0) * (item.quantity ?? 0) - (item.lineDiscount ?? 0)
                          )
                    )}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-cream-200/60 pt-5">
          <AccountBtn variant="soft" className="account-btn--sm" onClick={() => setShowDetails((value) => !value)}>
            {showDetails ? "Hide details" : "View details"}
          </AccountBtn>
          {order.status !== "cancelled" ? (
            <AccountBtn variant="soft" className="account-btn--sm" onClick={() => setShowTracking((value) => !value)}>
              {showTracking ? "Hide tracking" : "Track order"}
            </AccountBtn>
          ) : null}
          {order.status === "delivered" ? (
            <AccountBtn variant="ghost" className="account-btn--sm" onClick={() => onReorder(order)}>
              Reorder
            </AccountBtn>
          ) : null}
          <AccountBtn
            variant="ghost"
            className="account-btn--sm"
            onClick={() => downloadOrderInvoice(order, { gstin })}
          >
            Download invoice
          </AccountBtn>
          {canCancelOrder(order) && !showCancel ? (
            <AccountBtn variant="danger" className="account-btn--sm" onClick={() => setShowCancel(true)}>
              Cancel order
            </AccountBtn>
          ) : null}
        </div>

        {showDetails ? (
          <div className="mt-6 border-t border-cream-200/60 pt-6">
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-900/40">
              Order details
            </p>

            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <p className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-900/35">
                    Payment method
                  </p>
                  <p className="mt-1 font-body text-sm text-emerald-900/65">{paymentMethodLabel}</p>
                </div>
                <div>
                  <p className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-900/35">
                    Payment status
                  </p>
                  <p className="mt-1 font-body text-sm text-emerald-900/65">{paymentLabel}</p>
                </div>
                {refund ? (
                  <>
                    <div>
                      <p className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-900/35">
                        Refund amount
                      </p>
                      <p className="mt-1 font-display text-base text-rose-800">
                        {formatRefundAmount(refund.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-900/35">
                        Refunded on
                      </p>
                      <p className="mt-1 font-body text-sm text-emerald-900/65">
                        {refund.refundedAt
                          ? new Date(refund.refundedAt).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })
                          : "—"}
                      </p>
                    </div>
                  </>
                ) : null}
                {order.customer ? (
                  <div>
                    <p className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-900/35">
                      Delivery address
                    </p>
                    <p className="mt-1 font-body text-sm leading-relaxed text-emerald-900/65">
                      {formatAddressSummary(order.customer)}
                    </p>
                  </div>
                ) : null}
                {order.cancelReason ? (
                  <div>
                    <p className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-900/35">
                      Cancellation reason
                    </p>
                    <p className="mt-1 font-body text-sm leading-relaxed text-emerald-900/65">
                      {order.cancelReason}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-cream-200/70 bg-white/65 p-4">
                <p className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-900/35">
                  Price breakup
                </p>
                <div className="mt-3 space-y-2 font-body text-sm">
                  {(order.discountTotal ?? 0) > 0 ? (
                    <div className="flex items-center justify-between text-emerald-700">
                      <span>Offer savings</span>
                      <span>−{formatINR(order.discountTotal)}</span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between text-emerald-900/55">
                    <span>Subtotal</span>
                    <span>{formatINR(order.subtotal ?? 0)}</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-900/55">
                    <span>Shipping</span>
                    <span>{(order.shipping ?? 0) === 0 ? "Free" : formatINR(order.shipping ?? 0)}</span>
                  </div>
                  {order.gstAmount != null ? (
                    <div className="flex items-center justify-between text-emerald-900/55">
                      <span>{order.gstLabel ?? GST_LABEL}</span>
                      <span>{formatINR(order.gstAmount)}</span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between border-t border-cream-200/70 pt-3 font-display text-lg text-emerald-900">
                    <span>Total</span>
                    <span>{formatINR(order.total ?? 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {showTracking ? (
          <div className="mt-6 border-t border-cream-200/60 pt-6">
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-900/40">
              Delivery tracking
            </p>
            <OrderTrackingTimeline status={order.status} />
          </div>
        ) : null}

        {showCancel && canCancelOrder(order) ? (
          <div className="mt-5 rounded-xl border border-red-100/80 bg-red-50/30 p-4">
            <label className="account-label">Reason for cancellation (optional)</label>
            <input
              type="text"
              className="account-input mt-1.5"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Changed my mind"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <AccountBtn
                variant="danger"
                className="account-btn--sm"
                disabled={cancelSubmitting}
                onClick={async () => {
                  setCancelSubmitting(true);
                  const result = await onCancel(order.id, cancelReason);
                  setCancelSubmitting(false);
                  if (result?.ok) {
                    setShowCancel(false);
                    setCancelReason("");
                  }
                }}
              >
                {cancelSubmitting ? "Cancelling..." : "Confirm cancel"}
              </AccountBtn>
              <AccountBtn
                variant="ghost"
                className="account-btn--sm"
                disabled={cancelSubmitting}
                onClick={() => setShowCancel(false)}
              >
                Keep order
              </AccountBtn>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function AccountOrdersSection() {
  const {
    orders,
    currentOrders,
    pastOrders,
    cancelledOrders,
    cancelOrder,
    reviewItemsByOrderItemId,
    submitReview,
  } = useOrders();
  const { addItem } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [feedback, setFeedback] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);

  const pendingReviewCount = useMemo(() => {
    return pastOrders.reduce((count, order) => {
      return (
        count +
        order.items.filter((item) => needsReview(item, reviewItemsByOrderItemId)).length
      );
    }, 0);
  }, [pastOrders, reviewItemsByOrderItemId]);

  const requestedBucket = searchParams.get("bucket");
  const [bucket, setBucket] = useState(
    requestedBucket === "past" || requestedBucket === "cancelled" || requestedBucket === "active"
      ? requestedBucket
      : "active"
  );
  const [bucketTouched, setBucketTouched] = useState(Boolean(requestedBucket));

  useEffect(() => {
    if (requestedBucket === "past" || requestedBucket === "cancelled" || requestedBucket === "active") {
      setBucket(requestedBucket);
      setBucketTouched(true);
      return;
    }
    if (!bucketTouched && pendingReviewCount > 0) {
      setBucket("past");
    }
  }, [requestedBucket, pendingReviewCount, bucketTouched]);

  const selectBucket = (id) => {
    setBucketTouched(true);
    setBucket(id);
    const next = new URLSearchParams(searchParams);
    next.set("tab", "orders");
    if (id === "active") next.delete("bucket");
    else next.set("bucket", id);
    setSearchParams(next, { replace: true });
  };

  const reorder = (order) => {
    order.items.forEach((item) => addItem(item));
  };

  const handleCancel = async (orderId, reason) => {
    const result = await cancelOrder(orderId, reason);
    if (result?.ok) {
      setFeedback({ type: "success", message: "Order cancelled successfully." });
      selectBucket("cancelled");
    } else {
      setFeedback({
        type: "error",
        message: result?.error || "Unable to cancel this order right now.",
      });
    }
    return result;
  };

  const handleReviewSubmit = async (payload) => {
    const existingReview = reviewTarget?.review;
    const result = await submitReview(payload);
    if (result.ok) {
      setFeedback({
        type: "success",
        message: existingReview
          ? "Review updated and sent for approval."
          : "Review submitted for approval.",
      });
    }
    return result;
  };

  const buckets = [
    { id: "active", label: "Active orders", orders: currentOrders },
    { id: "past", label: "Past orders", orders: pastOrders },
    { id: "cancelled", label: "Cancelled orders", orders: cancelledOrders },
  ];

  const activeBucket = buckets.find((item) => item.id === bucket) ?? buckets[0];
  const visibleOrders = activeBucket.orders;

  const firstPendingTarget = useMemo(() => {
    for (const order of pastOrders) {
      const item = order.items.find((entry) => needsReview(entry, reviewItemsByOrderItemId));
      if (item) {
        return {
          orderId: order.id,
          item,
          review: getItemReview(item, reviewItemsByOrderItemId),
        };
      }
    }
    return null;
  }, [pastOrders, reviewItemsByOrderItemId]);

  if (!orders.length) {
    return (
      <div className="account-section">
        <AccountCard>
          <AccountEmptyState
            title="No orders yet"
            description="When you place your first order, it will appear here with tracking and invoice options."
            actionLabel="Continue shopping"
            actionHref="/products"
          />
        </AccountCard>
      </div>
    );
  }

  const emptyCopy = {
    active: {
      title: "No active orders",
      description: "Orders currently being processed will show up here.",
    },
    past: {
      title: "No past orders",
      description: "Delivered orders appear here — you can rate products after delivery.",
    },
    cancelled: {
      title: "No cancelled orders",
      description: "Cancelled orders will appear in this tab.",
    },
  };

  return (
    <div className="account-orders-section space-y-6">
      {feedback ? <AccountAlert type={feedback.type}>{feedback.message}</AccountAlert> : null}

      {pendingReviewCount > 0 ? (
        <div className="rounded-2xl border border-gold-500/30 bg-gradient-to-br from-gold-500/12 to-cream-50 px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-lg text-emerald-900">Reviews waiting</p>
              <p className="mt-1 font-body text-sm text-emerald-900/60">
                You have {pendingReviewCount} delivered product
                {pendingReviewCount === 1 ? "" : "s"} to rate. Open{" "}
                <button
                  type="button"
                  className="font-semibold text-emerald-800 underline underline-offset-2"
                  onClick={() => selectBucket("past")}
                >
                  Past orders
                </button>{" "}
                and tap Write a review.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <AccountBtn variant="soft" className="account-btn--sm" onClick={() => selectBucket("past")}>
                View past orders
              </AccountBtn>
              {firstPendingTarget ? (
                <AccountBtn
                  variant="primary"
                  className="account-btn--sm"
                  onClick={() => {
                    selectBucket("past");
                    setReviewTarget(firstPendingTarget);
                  }}
                >
                  Write a review
                </AccountBtn>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="account-filter-pills" role="tablist" aria-label="Filter orders">
        {buckets.map((item) => {
          const isActive = bucket === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`account-filter-pill ${isActive ? "account-filter-pill--active" : ""}`}
              onClick={() => selectBucket(item.id)}
            >
              {item.label}
              {item.orders.length > 0 ? ` (${item.orders.length})` : ""}
              {item.id === "past" && pendingReviewCount > 0 ? ` · ${pendingReviewCount} to rate` : ""}
            </button>
          );
        })}
      </div>

      {visibleOrders.length > 0 ? (
        <div className="space-y-5">
          {visibleOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onCancel={handleCancel}
              onReorder={reorder}
              reviewItemsByOrderItemId={reviewItemsByOrderItemId}
              onOpenReview={setReviewTarget}
            />
          ))}
        </div>
      ) : (
        <AccountCard>
          <AccountEmptyState
            title={emptyCopy[bucket]?.title ?? "No orders"}
            description={emptyCopy[bucket]?.description ?? "Nothing to show in this tab."}
            actionLabel="Continue shopping"
            actionHref="/products"
          />
        </AccountCard>
      )}

      <ReviewModal
        target={reviewTarget}
        onClose={() => setReviewTarget(null)}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
}
