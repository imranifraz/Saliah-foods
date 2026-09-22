/** Buy One Get One Free pricing helpers (same variant only). */

export const BOGO_OFFER_LABEL = "Buy 1 Get 1 Free";

/**
 * @param {number} quantity
 * @returns {{ paidQty: number, freeQty: number }}
 */
export function calcBogoQuantities(quantity) {
  const qty = Math.max(0, Math.floor(Number(quantity) || 0));
  const freeQty = Math.floor(qty / 2);
  const paidQty = qty - freeQty;
  return { paidQty, freeQty };
}

/**
 * Price a single line from catalog unit price + optional BOGO.
 * @param {{ quantity: number, unitPrice: number, bogoEnabled?: boolean, productId?: string, variantId?: string }} line
 */
export function priceCartLine(line) {
  const quantity = Math.max(0, Math.floor(Number(line.quantity) || 0));
  const unitPrice = Math.max(0, Math.round(Number(line.unitPrice) || 0));
  const bogoEnabled = Boolean(line.bogoEnabled);

  if (!bogoEnabled || quantity < 1) {
    return {
      quantity,
      unitPrice,
      paidQty: quantity,
      freeQty: 0,
      lineGross: unitPrice * quantity,
      lineDiscount: 0,
      lineSubtotal: unitPrice * quantity,
      bogoApplied: false,
    };
  }

  const { paidQty, freeQty } = calcBogoQuantities(quantity);
  const lineGross = unitPrice * quantity;
  const lineDiscount = unitPrice * freeQty;
  const lineSubtotal = unitPrice * paidQty;

  return {
    quantity,
    unitPrice,
    paidQty,
    freeQty,
    lineGross,
    lineDiscount,
    lineSubtotal,
    bogoApplied: freeQty > 0,
  };
}

/**
 * Apply offers across resolved cart lines.
 * Each input line needs: quantity, unitPrice (catalog), bogoEnabled, plus identity fields to echo.
 *
 * @param {Array<object>} lines
 * @returns {{
 *   lines: Array<object>,
 *   subtotal: number,
 *   discountTotal: number,
 *   grossSubtotal: number,
 *   appliedOffers: Array<object>
 * }}
 */
export function applyOffersToLines(lines = []) {
  const priced = [];
  const appliedOffers = [];
  let grossSubtotal = 0;
  let discountTotal = 0;
  let subtotal = 0;

  for (const line of lines) {
    const pricedLine = priceCartLine(line);
    const next = {
      ...line,
      ...pricedLine,
      priceValue: pricedLine.unitPrice,
    };
    priced.push(next);
    grossSubtotal += pricedLine.lineGross;
    discountTotal += pricedLine.lineDiscount;
    subtotal += pricedLine.lineSubtotal;

    if (pricedLine.bogoApplied) {
      appliedOffers.push({
        type: "bogo",
        label: BOGO_OFFER_LABEL,
        productId: line.productId ?? null,
        variantId: line.variantId ?? null,
        freeQty: pricedLine.freeQty,
        discount: pricedLine.lineDiscount,
      });
    }
  }

  return {
    lines: priced,
    subtotal,
    discountTotal,
    grossSubtotal,
    appliedOffers,
  };
}

export function getShippingFeeFromSettings(subtotal, shipping = {}) {
  const threshold = Number(shipping.freeShippingThreshold ?? 999);
  const fee = Number(shipping.shippingFee ?? 99);
  if (!Number.isFinite(subtotal) || subtotal <= 0) return fee;
  if (Number.isFinite(threshold) && subtotal >= threshold) return 0;
  return Number.isFinite(fee) ? fee : 99;
}
