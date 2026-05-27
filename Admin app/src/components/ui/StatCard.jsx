const ACCENTS = {
  emerald: "border-[var(--admin-border)] from-[var(--admin-success-bg)] to-transparent",
  gold: "border-[var(--admin-tab-active-border)] from-[var(--admin-tab-active-bg)] to-transparent",
  cream: "border-[var(--admin-border)] from-[var(--admin-hover)] to-transparent",
  marble: "border-[var(--admin-border)] from-[var(--admin-hover)] to-transparent",
};

const ICON_STYLES = {
  emerald: "bg-[var(--admin-success-bg)] text-[var(--admin-success)]",
  gold: "bg-[var(--admin-tab-active-bg)] text-[var(--admin-link)]",
  cream: "bg-[var(--admin-hover)] text-[var(--admin-fg)]",
  marble: "bg-[var(--admin-hover)] text-[var(--admin-fg-muted)]",
};

export function StatCard({ label, value, hint, accent = "emerald", icon }) {
  return (
    <div
      className={`admin-card relative overflow-hidden border bg-gradient-to-br p-5 ${ACCENTS[accent] ?? ACCENTS.emerald}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="admin-caption">{label}</p>
          <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-[var(--admin-fg)]">
            {value}
          </p>
          {hint ? <p className="admin-muted mt-1.5 text-xs">{hint}</p> : null}
        </div>
        {icon ? (
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${ICON_STYLES[accent] ?? ICON_STYLES.emerald}`}
          >
            {icon}
          </span>
        ) : null}
      </div>
    </div>
  );
}
