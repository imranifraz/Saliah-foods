import { formatINR, calcOrderBreakdown, GST_LABEL } from "../../data/pricing";
import { getShippingFee, getDefaultShippingSettings } from "../../data/checkout";
import { OptimizedImage } from "../ui/OptimizedImage";
import { ProductPrice } from "../ui/ProductPrice";

export function CheckoutOrderSummary({ items, subtotal, shippingSettings, compact = false }) {
  const settings = shippingSettings ?? getDefaultShippingSettings();
  const shipping = getShippingFee(subtotal, settings);
  const breakdown = calcOrderBreakdown(subtotal, shipping);
  const freeShippingThreshold = settings.freeShippingThreshold;

  return (
    <div
      className={`rounded-2xl border border-cream-200/80 bg-white/90 ${
        compact ? "p-4" : "p-5 shadow-[0_4px_24px_rgba(22,49,42,0.06)] md:p-6"
      }`}
    >
      <h2 className="font-display text-lg text-emerald-900">Order summary</h2>
      <p className="mt-1 font-body text-[12px] text-emerald-900/40">
        {items.reduce((sum, item) => sum + item.quantity, 0)} items
      </p>

      <ul className={`space-y-3 ${compact ? "mt-4" : "mt-5"}`} role="list">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-cream-100/80">
              <OptimizedImage
                src={item.img}
                alt={item.name}
                className="max-h-full max-w-full object-contain p-1"
                width={56}
                height={56}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 font-body text-[13px] leading-snug text-emerald-900">{item.name}</p>
              {item.packSize ? (
                <p className="mt-0.5 font-body text-[10px] uppercase tracking-[0.1em] text-emerald-900/30">
                  {item.packSize}
                </p>
              ) : null}
              <div className="mt-1 flex items-end justify-between gap-2">
                <span className="font-body text-[11px] text-emerald-900/40">Qty {item.quantity}</span>
                <ProductPrice
                  priceValue={(item.priceValue ?? 0) * item.quantity}
                  mrpValue={item.mrpValue ? item.mrpValue * item.quantity : undefined}
                  size="sm"
                  showDiscountBadge={false}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-5 space-y-2 border-t border-cream-200/60 pt-4 font-body text-sm">
        <div className="flex justify-between text-emerald-900/55">
          <span>Subtotal</span>
          <span>{formatINR(breakdown.subtotal)}</span>
        </div>
        <div className="flex justify-between text-emerald-900/55">
          <span>{GST_LABEL} (included)</span>
          <span>{formatINR(breakdown.gstAmount)}</span>
        </div>
        <div className="flex justify-between text-emerald-900/55">
          <span>Shipping</span>
          <span>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
        </div>
        {shipping > 0 ? (
          <p className="font-body text-[11px] text-emerald-900/35">
            Free shipping on orders above {formatINR(freeShippingThreshold)}
          </p>
        ) : null}
        <div className="flex justify-between border-t border-cream-200/60 pt-3 font-display text-lg text-emerald-900">
          <span>Total</span>
          <span>{formatINR(breakdown.total)}</span>
        </div>
      </div>
    </div>
  );
}
