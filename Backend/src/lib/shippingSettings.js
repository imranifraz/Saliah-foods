const DEFAULT_SHIPPING = {
  freeShippingThreshold: 999,
  shippingFee: 99,
  promoBarEnabled: true,
  promoBarMessage: "Get FREE shipping on orders above ₹{threshold}",
  promoBarHref: "/products",
};

/** Keep message templates tied to the live free-shipping amount. */
export function normalizePromoBarMessage(message) {
  let next = String(message ?? "").trim();
  if (!next) return DEFAULT_SHIPPING.promoBarMessage;

  // Convert hardcoded rupee amounts to the dynamic token.
  next = next.replace(/₹\s*[\d,]+/g, "₹{threshold}");

  if (!next.includes("{threshold}") && !next.includes("{amount}")) {
    return DEFAULT_SHIPPING.promoBarMessage;
  }

  return next;
}

export function normalizeShippingSettings(raw = {}) {
  const source = raw && typeof raw === "object" ? raw : {};
  const threshold = Number(source.freeShippingThreshold ?? DEFAULT_SHIPPING.freeShippingThreshold);
  const fee = Number(source.shippingFee ?? DEFAULT_SHIPPING.shippingFee);
  const href = String(source.promoBarHref ?? DEFAULT_SHIPPING.promoBarHref).trim();

  return {
    freeShippingThreshold:
      Number.isFinite(threshold) && threshold >= 0 ? threshold : DEFAULT_SHIPPING.freeShippingThreshold,
    shippingFee: Number.isFinite(fee) && fee >= 0 ? fee : DEFAULT_SHIPPING.shippingFee,
    promoBarEnabled: source.promoBarEnabled !== false,
    promoBarMessage: normalizePromoBarMessage(source.promoBarMessage),
    promoBarHref: href,
  };
}

export { DEFAULT_SHIPPING };
