const STYLES = {
  placed: "border-[var(--admin-border-strong)] bg-[var(--admin-hover)] text-[var(--admin-fg-muted)]",
  confirmed: "border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] text-[var(--admin-tab-active-fg)]",
  packed: "border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] text-[var(--admin-link)]",
  shipped: "border-[var(--admin-success-bg)] bg-[var(--admin-success-bg)] text-[var(--admin-success)]",
  out_for_delivery: "border-[var(--admin-success-bg)] bg-[var(--admin-success-bg)] text-[var(--admin-success)]",
  delivered: "border-[var(--admin-success-bg)] bg-[var(--admin-badge-bg)] text-[var(--admin-badge-fg)]",
  cancelled: "border-[color-mix(in_srgb,var(--admin-danger)_40%,transparent)] bg-[var(--admin-danger-bg)] text-[var(--admin-danger)]",
};

export function StatusBadge({ status }) {
  const label = status?.replace(/_/g, " ").toUpperCase() ?? "—";
  const style = STYLES[status] ?? STYLES.placed;

  return (
    <span
      className={`inline-flex rounded-md border px-2.5 py-1 text-[10px] font-bold tracking-wide ${style}`}
    >
      {label}
    </span>
  );
}
