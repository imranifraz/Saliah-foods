export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-emerald-900/8 pb-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">Saliah Admin</p>
        <h1 className="mt-1 font-display text-3xl font-medium tracking-tight text-emerald-900">{title}</h1>
        {subtitle && <p className="mt-2 max-w-xl text-sm text-emerald-900/60">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
