import { AdminFilterSegment } from "./AdminFilterDock.jsx";

export function AdminFilterTabs({ items, value, onChange, label = "Filter", className = "" }) {
  return (
    <div className={`admin-filter-tabs ${className}`.trim()}>
      <AdminFilterSegment
        label={label}
        options={items.map((item) => ({
          value: item.value,
          label: item.label,
          count: item.count,
        }))}
        value={value}
        onChange={onChange}
        ariaLabel={label}
      />
    </div>
  );
}
