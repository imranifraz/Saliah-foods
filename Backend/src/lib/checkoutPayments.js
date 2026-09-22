import { prisma } from "./prisma.js";
import { getGstSettings } from "./gstSettings.js";
import { isRazorpayConfigured, isTestPaymentsAllowed } from "./razorpay.js";
import { normalizeShippingSettings } from "./shippingSettings.js";

export async function getCheckoutPaymentMethods() {
  const [dbMethods, checkoutSetting, shipping, gst] = await Promise.all([
    prisma.paymentMethod.findMany({ where: { enabled: true }, orderBy: { sortOrder: "asc" } }),
    prisma.storeSetting.findUnique({ where: { key: "checkout" } }),
    prisma.storeSetting.findUnique({ where: { key: "shipping" } }),
    getGstSettings(),
  ]);

  const codEnabled = checkoutSetting?.value?.codEnabled !== false;
  const razorpayActive = await isRazorpayConfigured();
  const testPaymentsAllowed = await isTestPaymentsAllowed();

  let methods = dbMethods.filter((method) => {
    if (method.id === "cod" && !codEnabled) return false;
    if (method.id === "razorpay" && !razorpayActive && !testPaymentsAllowed) return false;
    return true;
  });

  if (testPaymentsAllowed && !razorpayActive && !methods.some((method) => method.id === "razorpay")) {
    methods = [
      {
        id: "razorpay",
        label: "Razorpay",
        description: "Pay securely using UPI, cards, net banking, or wallets",
        enabled: true,
        sortOrder: 0,
      },
      ...methods,
    ];
  }

  methods.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return {
    methods,
    shipping: normalizeShippingSettings(shipping?.value),
    razorpayConfigured: razorpayActive,
    testPaymentsAllowed,
    codEnabled,
    gst,
  };
}

export async function isPaymentMethodAllowed(methodId) {
  const normalized = String(methodId ?? "").trim().toLowerCase();
  if (!normalized) return false;
  const { methods } = await getCheckoutPaymentMethods();
  return methods.some((method) => method.id === normalized);
}
