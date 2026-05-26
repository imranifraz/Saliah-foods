export function AdminFilterTabs({ items, value, onChange }) {
  return (
    <div className="mb-5 overflow-x-auto">
      <div className="inline-flex min-w-full gap-2 rounded-2xl border border-emerald-900/8 bg-white/85 p-2">
        {items.map((item) => {
          const active = item.value === value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onChange(item.value)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition ${
                active
                  ? "bg-emerald-900 text-white shadow-sm"
                  : "text-emerald-900/65 hover:bg-cream-100"
              }`}
            >
              {item.label}
              {item.count != null ? (
                <span className={`ml-2 text-xs ${active ? "text-white/80" : "text-emerald-900/40"}`}>
                  {item.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
