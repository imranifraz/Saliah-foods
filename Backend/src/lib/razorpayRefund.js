import crypto from "node:crypto";
import Razorpay from "razorpay";
import { getRazorpayConfig, isRazorpayConfigured, isTestPaymentsAllowed } from "./razorpay.js";

async function getRazorpayClient() {
  const { keyId, keySecret } = await getRazorpayConfig();
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

function getOrderPayment(order) {
  const customer = order.customer ?? {};
  return customer.payment && typeof customer.payment === "object" ? customer.payment : {};
}

export async function refundOrderPayment(order) {
  const payment = getOrderPayment(order);
  const amount = Number(payment.verifiedAmount ?? order.total ?? 0);

  if (!amount || amount <= 0) {
    return { ok: true, mode: "none", amount: 0 };
  }

  if (payment.status === "pending_configuration") {
    return { ok: true, mode: "none", amount: 0 };
  }

  if (payment.status === "refunded" || payment.razorpayRefundId) {
    return {
      ok: true,
      mode: payment.mode ?? "live",
      amount,
      razorpayRefundId: payment.razorpayRefundId ?? null,
      alreadyRefunded: true,
    };
  }

  const paymentId = payment.razorpayPaymentId;
  const isTestPayment =
    payment.mode === "test" || String(paymentId ?? "").startsWith("pay_test_");

  if (isTestPayment && (await isTestPaymentsAllowed())) {
    return {
      ok: true,
      mode: "test",
      amount,
      razorpayRefundId: `rfnd_test_${crypto.randomBytes(6).toString("hex")}`,
      status: "processed",
    };
  }

  if (!(await isRazorpayConfigured()) || !paymentId || isTestPayment) {
    throw new Error("This payment cannot be refunded automatically yet");
  }

  const client = await getRazorpayClient();
  const refund = await client.payments.refund(paymentId, {
    amount: Math.round(amount * 100),
    notes: {
      orderId: order.id,
      reason: "customer_cancellation",
    },
  });

  return {
    ok: true,
    mode: "live",
    amount,
    razorpayRefundId: refund.id,
    status: refund.status ?? "processed",
  };
}
