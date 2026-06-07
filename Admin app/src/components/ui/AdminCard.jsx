export function AdminCard({
  title,
  children,
  className = "",
  action,
  subtitle,
  headerClassName = "",
  inlineSubtitle = false,
}) {
  return (
    <section className={`admin-card ${className}`}>
      {title ? (
        <div
          className={`flex flex-col gap-3 border-b border-[var(--admin-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${
            inlineSubtitle ? "lg:flex-nowrap" : "sm:flex-wrap"
          } ${headerClassName}`}
        >
          <div className={`min-w-0 ${inlineSubtitle ? "shrink-0" : ""}`}>
            {inlineSubtitle ? (
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                <h2 className="font-display text-lg font-semibold text-[var(--admin-fg)]">{title}</h2>
                {subtitle ? (
                  <p className="admin-caption mt-0 sm:whitespace-nowrap">{subtitle}</p>
                ) : null}
              </div>
            ) : (
              <>
                <h2 className="font-display text-lg font-semibold text-[var(--admin-fg)]">{title}</h2>
                {subtitle ? <p className="admin-caption mt-1">{subtitle}</p> : null}
              </>
            )}
          </div>
          {action ? (
            <div className="flex w-full shrink-0 flex-nowrap items-center gap-3 sm:ml-auto sm:w-auto sm:justify-end">
              {action}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}
