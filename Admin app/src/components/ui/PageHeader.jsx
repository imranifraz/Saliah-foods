export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-[var(--admin-fg)]">
          {title}
        </h1>
        {subtitle ? (
          <p className="admin-muted mt-3 max-w-2xl text-[15px] leading-relaxed">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
