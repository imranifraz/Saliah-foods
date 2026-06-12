import { prisma } from "./prisma.js";
import { formatContactCmsPage } from "./contactCms.js";
import { sendOrderPaymentInstructionsEmail } from "./mail.js";

const MANUAL_PAYMENT_METHODS = new Set(["cod", "upi", "card"]);

function formatInr(amount) {
  return `₹${Math.round(Number(amount ?? 0)).toLocaleString("en-IN")}`;
}

function buildInstructions({ paymentMethod, total, orderId, contact }) {
  const amount = formatInr(total);
  const supportEmail = contact.email || "support@saliahfoods.com";
  const supportPhone = contact.phone || "";

  if (paymentMethod === "cod") {
    return {
      subject: `Saliah Foods order ${orderId} — Pay on delivery`,
      headline: "Pay when your order is delivered",
      steps: [
        `Your order total is ${amount}.`,
        "Please keep the exact amount ready for the delivery partner.",
        "No advance payment is required for cash on delivery orders.",
      ],
    };
  }

  if (paymentMethod === "upi") {
    return {
      subject: `Saliah Foods order ${orderId} — Complete UPI payment`,
      headline: "Complete your UPI payment",
      steps: [
        `Order ${orderId} is confirmed. Total payable: ${amount}.`,
        `Send payment via UPI and share the transaction reference with us at ${supportEmail}${supportPhone ? ` or ${supportPhone}` : ""}.`,
        "Include your order ID in the payment note or follow-up message.",
        "We will confirm your payment and start processing once received.",
      ],
    };
  }

  if (paymentMethod === "card") {
    return {
      subject: `Saliah Foods order ${orderId} — Complete card payment`,
      headline: "Complete your card payment",
      steps: [
        `Order ${orderId} is confirmed. Total payable: ${amount}.`,
        `Contact us at ${supportEmail}${supportPhone ? ` or call ${supportPhone}` : ""} to complete payment securely by debit/credit card.`,
        "Share your order ID when you reach out so we can match the payment quickly.",
        "We will confirm your payment and start processing once received.",
      ],
    };
  }

  return null;
}

async function loadContactDetails() {
  const page = await prisma.cmsPage.findUnique({ where: { slug: "contact" } });
  const formatted = formatContactCmsPage(page);
  return {
    email: formatted?.body?.email ?? "",
    phone: formatted?.body?.phone ?? "",
  };
}

export async function sendManualPaymentInstructions(order) {
  const paymentMethod = String(order.paymentMethod ?? "").toLowerCase();
  if (!MANUAL_PAYMENT_METHODS.has(paymentMethod)) return { sent: false, skipped: true };

  const customer = order.customer ?? {};
  const email = String(customer.email ?? "").trim();
  if (!email) return { sent: false, skipped: true, reason: "missing_email" };

  const contact = await loadContactDetails();
  const instructions = buildInstructions({
    paymentMethod,
    total: order.total,
    orderId: order.id,
    contact,
  });
  if (!instructions) return { sent: false, skipped: true };

  return sendOrderPaymentInstructionsEmail({
    email,
    fullName: customer.fullName ?? "",
    orderId: order.id,
    total: order.total,
    paymentMethod,
    instructions,
    contact,
  });
}
