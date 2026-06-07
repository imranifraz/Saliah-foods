import { Link } from "react-router-dom";
import { ProductThumb } from "./ui/ProductThumb.jsx";

function DetailField({ label, value }) {
  return (
    <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-3">
      <p className="admin-caption">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[var(--admin-fg)]">{value ?? "—"}</p>
    </div>
  );
}

function StockStatusBadge({ inStock, isLowStock }) {
  if (isLowStock) {
    return (
      <span className="inline-flex rounded-full border border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] px-3 py-1 text-xs font-semibold text-[var(--admin-link)]">
        Low stock
      </span>
    );
  }

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        inStock
          ? "border-[var(--admin-success-bg)] bg-[var(--admin-badge-bg)] text-[var(--admin-success)]"
          : "border-[var(--admin-danger-bg)] bg-[var(--admin-danger-bg)] text-[var(--admin-danger)]"
      }`}
    >
      {inStock ? "In stock" : "Out of stock"}
    </span>
  );
}

function formatUpdatedAt(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ViewInventoryPanel({ item, onViewProduct, onViewHistory }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <ProductThumb product={item.product} alt={item.product?.name} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="admin-caption">SKU</p>
          <p className="font-mono text-sm font-semibold text-[var(--admin-fg)]">{item.sku}</p>
          <h3 className="mt-1 font-display text-lg font-semibold text-[var(--admin-fg)]">{item.product?.name}</h3>
          {item.weight ? <p className="admin-muted mt-1 text-sm">Variant: {item.weight}</p> : null}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StockStatusBadge inStock={item.inStock} isLowStock={item.isLowStock} />
            {item.isDefault ? (
              <span className="admin-muted text-[10px] font-semibold uppercase tracking-wide">Default variant</span>
            ) : null}
            {item.product?.status === "draft" ? (
              <span className="admin-muted text-[10px] font-semibold uppercase tracking-wide">Draft product</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <DetailField label="On hand" value={item.stockQuantity} />
        <DetailField label="Reserved" value={item.reservedQuantity ?? 0} />
        <DetailField label="Available" value={item.availableQuantity ?? 0} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DetailField label="Category" value={item.product?.categoryLabel} />
        <DetailField label="Last updated" value={formatUpdatedAt(item.updatedAt)} />
        <DetailField label="Product status" value={item.product?.status === "draft" ? "Draft" : "Active"} />
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <Link
          to={`/products?category=${encodeURIComponent(item.product?.categoryId ?? "")}`}
          className="font-semibold text-[var(--admin-link)] transition hover:underline"
        >
          Browse category
        </Link>
        {onViewProduct ? (
          <button
            type="button"
            onClick={() => onViewProduct(item.product?.id)}
            className="font-semibold text-[var(--admin-link)] transition hover:underline"
          >
            View product
          </button>
        ) : null}
        {onViewHistory ? (
          <button
            type="button"
            onClick={() => onViewHistory(item)}
            className="font-semibold text-[var(--admin-link)] transition hover:underline"
          >
            Stock history
          </button>
        ) : null}
      </div>
    </div>
  );
}
