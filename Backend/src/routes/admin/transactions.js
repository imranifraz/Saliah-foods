import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAdmin } from "../../middleware/admin.js";

const router = Router();
router.use(requireAdmin);

function customerName(customer) {
  if (!customer || typeof customer !== "object") return "Guest";
  return customer.fullName ?? customer.name ?? "Guest";
}

export function formatTransaction(order) {
  const customer = order.customer ?? {};
  const payment = customer.payment ?? {};
  const isCancelled = order.status === "cancelled";
  const isTest = payment.mode === "test" || String(payment.razorpayPaymentId ?? "").startsWith("pay_test_");
  const isRefunded = payment.status === "refunded";
  let paymentStatus = "unverified";
  if (isRefunded) {
    paymentStatus = "refunded";
  } else if (payment.status === "pending_configuration") {
    paymentStatus = "pending";
  } else if (isCancelled) {
    paymentStatus = "cancelled";
  } else if (payment.status === "paid" || payment.razorpayPaymentId) {
    paymentStatus = "paid";
  }

  const paidAmount = Number(payment.verifiedAmount ?? order.total);
  const refundAmount = isRefunded
    ? Number(payment.refundAmount ?? payment.verifiedAmount ?? order.total)
    : null;

  return {
    id: payment.razorpayPaymentId ?? order.id,
    orderId: order.id,
    amount: paidAmount,
    refundAmount,
    gateway: payment.gateway ?? order.paymentMethod ?? "—",
    mode: isTest ? "test" : payment.mode ?? "live",
    razorpayOrderId: payment.razorpayOrderId ?? null,
    razorpayPaymentId: payment.razorpayPaymentId ?? null,
    razorpayRefundId: payment.razorpayRefundId ?? null,
    paymentStatus,
    orderStatus: order.status,
    customerName: customerName(customer),
    customerEmail: customer.email ?? null,
    paidAt: payment.verifiedAt ?? order.createdAt.toISOString(),
    refundedAt: payment.refundedAt ?? null,
    createdAt: order.createdAt.toISOString(),
  };
}

function matchesFilter(transaction, status) {
  if (!status || status === "all") return true;
  if (status === "paid") {
    return transaction.paymentStatus === "paid" && transaction.orderStatus !== "cancelled";
  }
  if (status === "pending") {
    return transaction.paymentStatus === "pending" || transaction.paymentStatus === "unverified";
  }
  if (status === "cancelled") {
    return transaction.paymentStatus === "cancelled";
  }
  if (status === "refunded") {
    return transaction.paymentStatus === "refunded";
  }
  return true;
}

function computeSummary(transactions) {
  const paid = transactions.filter((t) => t.paymentStatus === "paid");
  const refunded = transactions.filter((t) => t.paymentStatus === "refunded");
  return {
    totalCollected: paid.reduce((sum, t) => sum + t.amount, 0),
    paidCount: paid.length,
    totalRefunded: refunded.reduce((sum, t) => sum + (t.refundAmount ?? t.amount), 0),
    refundedCount: refunded.length,
    transactionCount: transactions.length,
  };
}

router.get("/", async (req, res, next) => {
  try {
    const status = String(req.query.status ?? "all").toLowerCase();
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        total: true,
        paymentMethod: true,
        customer: true,
        createdAt: true,
      },
    });

    const allTransactions = orders.map(formatTransaction);
    const transactions = allTransactions.filter((t) => matchesFilter(t, status));

    res.json({
      ok: true,
      summary: computeSummary(allTransactions),
      transactions,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
