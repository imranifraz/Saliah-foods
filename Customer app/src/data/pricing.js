/** Indian retail pricing: MRP vs selling price + GST breakdown. */

export const GST_RATE = 0.05;
export const GST_LABEL = "GST (5%)";

export function formatINR(amount) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

/** MRP above selling price so customers see a meaningful discount. */
export function deriveMrp(sellingPrice) {
  if (!sellingPrice || sellingPrice <= 0) return sellingPrice;

  let mrp = Math.round(sellingPrice * 1.2);
  if (mrp <= sellingPrice) {
    mrp = sellingPrice + Math.max(40, Math.round(sellingPrice * 0.12));
  }

  if (mrp >= 1000) {
    mrp = Math.ceil(mrp / 100) * 100 - 1;
  } else if (mrp >= 100) {
    mrp = Math.ceil(mrp / 50) * 50 - 1;
  } else {
    mrp = Math.ceil(mrp / 10) * 10 - 1;
  }

  return Math.max(mrp, sellingPrice + 1);
}

export function getDiscountPercent(sellingPrice, mrpValue) {
  if (!mrpValue || mrpValue <= sellingPrice) return 0;
  return Math.round((1 - sellingPrice / mrpValue) * 100);
}

/**
 * Attach selling + MRP display fields to a product or cart line.
 * @param {number} priceValue — selling price (GST-inclusive)
 * @param {number} [mrpValue] — optional explicit MRP
 */
export function buildPriceFields(priceValue, mrpValue) {
  const selling = Math.round(priceValue);
  const mrp = mrpValue != null ? Math.round(mrpValue) : deriveMrp(selling);
  const discountPercent = getDiscountPercent(selling, mrp);

  return {
    priceValue: selling,
    mrpValue: mrp,
    price: formatINR(selling),
    mrp: formatINR(mrp),
    salePrice: formatINR(selling),
    discountPercent,
  };
}

/** Split GST from tax-inclusive subtotal. */
export function splitGstFromInclusive(inclusiveTotal, rate = GST_RATE) {
  const taxable = inclusiveTotal / (1 + rate);
  const gst = inclusiveTotal - taxable;
  return {
    taxable: Math.round(taxable * 100) / 100,
    gst: Math.round(gst * 100) / 100,
    inclusive: inclusiveTotal,
  };
}

export function calcOrderBreakdown(subtotal, shipping = 0) {
  const itemsGst = splitGstFromInclusive(subtotal);
  const shippingGst = shipping > 0 ? splitGstFromInclusive(shipping) : { taxable: 0, gst: 0, inclusive: 0 };
  const total = subtotal + shipping;

  return {
    subtotal,
    shipping,
    total,
    gstAmount: Math.round((itemsGst.gst + shippingGst.gst) * 100) / 100,
    taxableAmount: Math.round((itemsGst.taxable + shippingGst.taxable) * 100) / 100,
    gstRate: GST_RATE,
    gstLabel: GST_LABEL,
  };
}
