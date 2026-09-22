/** Buy One Get One Free helpers (mirrors Backend/src/lib/offers.js). */

export const BOGO_OFFER_LABEL = "Buy 1 Get 1 Free";

export function calcBogoQuantities(quantity) {
  const qty = Math.max(0, Math.floor(Number(quantity) || 0));
  const freeQty = Math.floor(qty / 2);
  const paidQty = qty - freeQty;
  return { paidQty, freeQty };
}

export function priceCartLine(line) {
  const quantity = Math.max(0, Math.floor(Number(line.quantity) || 0));
  const unitPrice = Math.max(0, Math.round(Number(line.unitPrice ?? line.priceValue) || 0));
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
  return {
    quantity,
    unitPrice,
    paidQty,
    freeQty,
    lineGross: unitPrice * quantity,
    lineDiscount: unitPrice * freeQty,
    lineSubtotal: unitPrice * paidQty,
    bogoApplied: freeQty > 0,
  };
}

export function applyOffersToCartItems(items = []) {
  const lines = [];
  const appliedOffers = [];
  let grossSubtotal = 0;
  let discountTotal = 0;
  let subtotal = 0;

  for (const item of items) {
    const priced = priceCartLine({
      ...item,
      unitPrice: item.priceValue,
      bogoEnabled: item.bogoEnabled,
      quantity: item.quantity,
    });
    lines.push({ ...item, ...priced });
    grossSubtotal += priced.lineGross;
    discountTotal += priced.lineDiscount;
    subtotal += priced.lineSubtotal;

    if (priced.bogoApplied) {
      appliedOffers.push({
        type: "bogo",
        label: BOGO_OFFER_LABEL,
        productId: item.productId ?? null,
        variantId: item.variantId ?? null,
        freeQty: priced.freeQty,
        discount: priced.lineDiscount,
      });
    }
  }

  return { lines, subtotal, discountTotal, grossSubtotal, appliedOffers };
}

export function getOrderItemLineTotal(item) {
  if (item?.lineTotal != null) return Math.max(0, Math.round(Number(item.lineTotal) || 0));
  const price = Number(item?.priceValue ?? 0);
  const qty = Number(item?.quantity ?? 0);
  const discount = Number(item?.lineDiscount ?? 0);
  return Math.max(0, price * qty - discount);
}
