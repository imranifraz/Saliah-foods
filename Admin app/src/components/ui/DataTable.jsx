export function DataTable({ columns, children, emptyMessage = "No data found" }) {
  const isEmpty = !children || (Array.isArray(children) && children.length === 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-emerald-900/8 bg-cream-100/80">
            {columns.map((col) => (
              <th
                key={col}
                className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-emerald-900/50"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-emerald-900/5">{children}</tbody>
      </table>
      {isEmpty && (
        <p className="px-5 py-12 text-center text-sm text-emerald-900/45">{emptyMessage}</p>
      )}
    </div>
  );
}

export function DataRow({ children, className = "" }) {
  return (
    <tr className={`transition hover:bg-cream-100/40 ${className}`}>{children}</tr>
  );
}

export function DataCell({ children, className = "" }) {
  return <td className={`px-5 py-3.5 text-emerald-950 ${className}`}>{children}</td>;
}
