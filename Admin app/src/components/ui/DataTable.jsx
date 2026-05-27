export function DataTable({ columns, children, emptyMessage = "No data found" }) {
  const isEmpty = !children || (Array.isArray(children) && children.length === 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--admin-border)]">
            {columns.map((col) => (
              <th key={col} className="admin-caption px-5 py-3.5">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--admin-border)]">{children}</tbody>
      </table>
      {isEmpty ? (
        <p className="admin-muted px-5 py-12 text-center text-[15px]">{emptyMessage}</p>
      ) : null}
    </div>
  );
}

export function DataRow({ children, className = "" }) {
  return (
    <tr className={`transition hover:bg-[var(--admin-hover)] ${className}`}>{children}</tr>
  );
}

export function DataCell({ children, className = "" }) {
  return (
    <td className={`admin-fg px-5 py-4 text-[15px] font-medium leading-relaxed ${className}`}>
      {children}
    </td>
  );
}
