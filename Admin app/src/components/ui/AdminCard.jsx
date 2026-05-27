export function AdminCard({ title, children, className = "", action, subtitle }) {
  return (
    <section className={`admin-card ${className}`}>
      {title ? (
        <div className="flex flex-col gap-3 border-b border-[var(--admin-border)] px-5 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold text-[var(--admin-fg)]">{title}</h2>
            {subtitle ? <p className="admin-caption mt-1">{subtitle}</p> : null}
          </div>
          {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}
