const STYLES = {
  placed: "bg-cream-200 text-emerald-900",
  confirmed: "bg-emerald-800/12 text-emerald-800",
  packed: "bg-gold-300/40 text-gold-600",
  shipped: "bg-emerald-700/15 text-emerald-700",
  out_for_delivery: "bg-emerald-700/20 text-emerald-800",
  delivered: "bg-emerald-900 text-cream-50",
  cancelled: "bg-red-50 text-red-700",
};

export function StatusBadge({ status }) {
  const label = status?.replace(/_/g, " ") ?? "—";
  const style = STYLES[status] ?? "bg-cream-100 text-emerald-900/70";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}>
      {label}
    </span>
  );
}
