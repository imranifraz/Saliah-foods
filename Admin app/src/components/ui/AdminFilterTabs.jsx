export function AdminFilterTabs({ items, value, onChange }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {items.map((item) => {
        const isActive = value === item.value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] text-[var(--admin-tab-active-fg)]"
                : "border-[var(--admin-border)] bg-[var(--admin-surface-2)] text-[var(--admin-tab-fg)] hover:bg-[var(--admin-hover)]"
            }`}
          >
            {item.label}
            {item.count != null ? (
              <span
                className={`ml-2 text-xs font-bold ${
                  isActive ? "opacity-90" : "text-[var(--admin-fg-faint)]"
                }`}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
