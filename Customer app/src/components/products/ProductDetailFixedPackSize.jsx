export function ProductDetailFixedPackSize({ label, variant = "block" }) {
  if (!label) return null;

  if (variant === "inline") {
    return (
      <div className="pdp-pack-selector pdp-pack-selector--pills">
        <p className="pdp-pack-selector__label">Pack size</p>
        <p className="mt-2 font-body text-[15px] font-semibold text-emerald-900">{label}</p>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <p className="font-body text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-900/55">
        Pack size
      </p>
      <p className="mt-2 font-body text-[15px] font-medium tracking-wide text-emerald-900">{label}</p>
    </div>
  );
}
