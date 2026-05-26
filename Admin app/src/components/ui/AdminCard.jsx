export function AdminCard({ title, children, className = "", action }) {
  return (
    <section className={`admin-card overflow-hidden ${className}`}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-emerald-900/6 bg-cream-100/50 px-5 py-4">
          <h2 className="font-display text-lg font-medium text-emerald-900">{title}</h2>
          {action}
        </div>
      )}
      <div className={title ? "p-5" : "p-5"}>{children}</div>
    </section>
  );
}
