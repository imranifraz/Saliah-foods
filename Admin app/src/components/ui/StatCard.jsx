const ACCENTS = {
  emerald: "from-emerald-800/12 to-emerald-900/5 border-emerald-800/15",
  gold: "from-gold-400/20 to-gold-500/5 border-gold-500/25",
  cream: "from-cream-200/80 to-cream-100 border-cream-200",
  marble: "from-marble to-cream-100 border-emerald-900/10",
};

export function StatCard({ label, value, hint, accent = "emerald", icon }) {
  return (
    <div
      className={`admin-card relative overflow-hidden border bg-gradient-to-br p-5 ${ACCENTS[accent] ?? ACCENTS.emerald}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-900/50">{label}</p>
          <p className="mt-2 font-display text-3xl font-medium text-emerald-900">{value}</p>
          {hint && <p className="mt-1 text-xs text-emerald-900/45">{hint}</p>}
        </div>
        {icon && (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-900/8 text-emerald-800">
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}
