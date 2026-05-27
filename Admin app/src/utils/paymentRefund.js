export function formatPaymentDateTime(iso) {
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
    return iso;
  }
}

export function formatRefundAmount(amount) {
  return `₹${Number(amount ?? 0).toLocaleString("en-IN")}`;
}

export function getRefundDetails(order) {
  const payment = order?.customer?.payment ?? {};
  const isRefunded = payment.status === "refunded";
  const isCancelled = order?.status === "cancelled";
  const refundAmount = Number(
    payment.refundAmount ?? payment.verifiedAmount ?? order?.total ?? 0
  );

  const hasRefundRecord = Boolean(
    payment.refundedAt || payment.razorpayRefundId || payment.refundAmount
  );

  if (!isRefunded && !(isCancelled && hasRefundRecord)) {
    if (isCancelled && payment.razorpayPaymentId && payment.status === "paid") {
      return {
        isRefunded: false,
        statusLabel: "Refund processing",
        amount: refundAmount,
        refundedAt: null,
        refundId: null,
        refundMode: payment.mode ?? null,
        refundStatus: "pending",
        paidAmount: Number(payment.verifiedAmount ?? order?.total ?? 0),
        paidAt: payment.verifiedAt ?? order?.createdAt ?? null,
      };
    }
    return null;
  }

  return {
    isRefunded,
    statusLabel: isRefunded ? "Refunded" : "Refund pending",
    amount: refundAmount,
    refundedAt: payment.refundedAt ?? null,
    refundId: payment.razorpayRefundId ?? null,
    refundMode: payment.refundMode ?? payment.mode ?? null,
    refundStatus: payment.refundStatus ?? (isRefunded ? "processed" : null),
    paidAmount: Number(payment.verifiedAmount ?? order?.total ?? 0),
    paidAt: payment.verifiedAt ?? order?.createdAt ?? null,
  };
}
