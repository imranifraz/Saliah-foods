export function RoleBadge({ role }) {
  const isAdmin = role === "admin";
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
        isAdmin
          ? "border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] text-[var(--admin-tab-active-fg)]"
          : "border-[var(--admin-border)] bg-[var(--admin-hover)] text-[var(--admin-fg-muted)]"
      }`}
    >
      {role}
    </span>
  );
}
