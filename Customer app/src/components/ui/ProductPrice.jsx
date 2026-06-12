import { useGstSettings } from "../../context/GstSettingsContext.jsx";

/**
 * MRP (struck through) + selling price — standard Indian retail discount display.
 */
export function ProductPrice({
  priceValue,
  mrpValue,
  price,
  mrp,
  discountPercent,
  size = "md",
  className = "",
  showDiscountBadge = true,
  showInclGst = false,
}) {
  const { label: gstLabel, showOnProducts } = useGstSettings();
  const showGstNote = showInclGst && showOnProducts;
  const selling = price ?? (priceValue != null ? `₹${priceValue.toLocaleString("en-IN")}` : "");
  const list = mrp ?? (mrpValue != null ? `₹${mrpValue.toLocaleString("en-IN")}` : null);
  const hasDiscount = mrpValue != null && priceValue != null && mrpValue > priceValue;
  const pct =
    discountPercent ??
    (hasDiscount ? Math.round((1 - priceValue / mrpValue) * 100) : 0);

  const sizeClass =
    size === "sm"
      ? "product-price--sm"
      : size === "lg"
        ? "product-price--lg"
        : size === "xl"
          ? "product-price--xl"
          : "";

  if (!hasDiscount && !list) {
    return (
      <div className={`product-price ${sizeClass} ${className}`.trim()}>
        <span className="product-price__selling">{selling}</span>
        {showGstNote ? (
          <span className="product-price__gst-note">Incl. {gstLabel}</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`product-price ${sizeClass} ${className}`.trim()}>
      <div className="product-price__row">
        {list ? <span className="product-price__mrp">MRP {list}</span> : null}
        {showDiscountBadge && pct > 0 ? (
          <span className="product-price__off">{pct}% off</span>
        ) : null}
      </div>
      <span className="product-price__selling">{selling}</span>
      {showGstNote ? (
        <span className="product-price__gst-note">Incl. {gstLabel}</span>
      ) : null}
    </div>
  );
}
