export function ProductDetailFixedPackSize({ label }) {
  if (!label) return null;

  return (
    <div className="mt-5">
      <p className="font-body text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-900/55">
        Pack size
      </p>
      <p className="mt-2 font-body text-[15px] font-medium tracking-wide text-emerald-900">{label}</p>
    </div>
  );
}
