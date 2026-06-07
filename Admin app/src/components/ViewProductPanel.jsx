import { Link } from "react-router-dom";
import { resolveAdminMediaUrl } from "../lib/mediaUrl.js";
import { ProductThumb } from "./ui/ProductThumb.jsx";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function DetailField({ label, value }) {
  return (
    <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-3">
      <p className="admin-caption">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[var(--admin-fg)]">{value ?? "—"}</p>
    </div>
  );
}

function StatusPill({ active, labelActive, labelInactive }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
        active
          ? "border-[var(--admin-success-bg)] bg-[var(--admin-badge-bg)] text-[var(--admin-success)]"
          : "border-[var(--admin-border)] bg-[var(--admin-surface-2)] text-[var(--admin-fg-muted)]"
      }`}
    >
      {active ? labelActive : labelInactive}
    </span>
  );
}

export function ProductVariantsPanel({ product, showStock = true }) {
  const variants = product.variants ?? [];

  if (variants.length === 0) {
    return <p className="admin-muted text-sm">No variants found.</p>;
  }

  return (
    <div className="rounded-xl border border-[var(--admin-border)] overflow-hidden">
      <p className="admin-caption border-b border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-2">
        Variants
      </p>
      <div className="divide-y divide-[var(--admin-border)]">
        {variants.map((variant) => (
          <div key={variant.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm">
            <div className="min-w-0">
              <p className="font-semibold text-[var(--admin-fg)]">
                {variant.weight || variant.packSize}
                {variant.isDefault ? (
                  <span className="admin-muted ml-2 text-xs font-medium">Default</span>
                ) : null}
              </p>
              <p className="admin-muted text-xs">{variant.sku}</p>
            </div>
            <div className="text-right">
              {variant.mrp &&
              Number(variant.priceValue) > 0 &&
              Number(variant.mrpValue) > Number(variant.priceValue) ? (
                <>
                  <p className="admin-muted text-xs whitespace-nowrap line-through">{variant.mrp}</p>
                  <p className="font-semibold text-[var(--admin-fg)]">{variant.price}</p>
                  {variant.discountPercent ? (
                    <p className="admin-muted text-xs whitespace-nowrap">{variant.discountPercent}% off</p>
                  ) : null}
                </>
              ) : (
                <p className="font-semibold text-[var(--admin-fg)]">{variant.price || variant.mrp || "—"}</p>
              )}
              {showStock ? (
                <p className="admin-muted text-xs">
                  Stock: {variant.stockQuantity ?? 0}
                  {variant.packaging ? ` · ${variant.packaging}` : ""}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ViewProductPanel({ product }) {
  const images = product.images?.length ? product.images : product.img ? [product.img] : [];
  const coverImage = images[0] ? resolveAdminMediaUrl(images[0]) : "";
  const variants = product.variants ?? [];
  const primarySku =
    variants.length === 1
      ? variants.find((variant) => variant.isDefault)?.sku ?? variants[0]?.sku ?? null
      : null;

  return (
    <div className="space-y-4">
      {coverImage ? (
        <div className="overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)]">
          <img src={coverImage} alt="" className="aspect-square max-h-56 w-full object-contain p-4" />
        </div>
      ) : (
        <div className="flex justify-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-6">
          <ProductThumb product={product} size="lg" alt={product.name} />
        </div>
      )}

      <div>
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <h3 className="font-display text-lg font-semibold text-[var(--admin-fg)]">{product.name}</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <Link
              to={`/inventory?product=${encodeURIComponent(product.id)}&productLabel=${encodeURIComponent(product.name || "")}`}
              className="admin-link inline-flex"
            >
              Inventory
            </Link>
            <Link
              to={`/reviews?q=${encodeURIComponent(product.slug || product.name || "")}`}
              className="admin-link inline-flex"
            >
              Reviews
            </Link>
          </div>
        </div>
        <p className="admin-muted mt-1 text-sm">/product/{product.slug}</p>
        {primarySku ? <p className="admin-muted text-xs">SKU: {primarySku}</p> : null}
      </div>

      {product.tagline ? (
        <p className="text-sm font-medium text-[var(--admin-fg-muted)]">{product.tagline}</p>
      ) : null}

      {product.fullDescription ? (
        <p className="text-sm leading-relaxed text-[var(--admin-fg-muted)]">{product.fullDescription}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <StatusPill active={product.status === "active"} labelActive="Active" labelInactive="Draft" />
        <StatusPill active={product.inStock} labelActive="In stock" labelInactive="Out of stock" />
        {product.featured ? (
          <span className="inline-flex rounded-full border border-[var(--admin-tab-active-border)] bg-[var(--admin-tab-active-bg)] px-3 py-1 text-xs font-semibold text-[var(--admin-link)]">
            Featured
          </span>
        ) : null}
        {product.isNew ? (
          <span className="inline-flex rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-1 text-xs font-semibold text-[var(--admin-fg)]">
            New arrival
          </span>
        ) : null}
        {product.isBestSeller ? (
          <span className="inline-flex rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-1 text-xs font-semibold text-[var(--admin-fg)]">
            Best seller
          </span>
        ) : null}
        {product.badge ? (
          <span className="inline-flex rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-1 text-xs font-semibold text-[var(--admin-fg)]">
            {product.badge}
          </span>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DetailField label="Category" value={product.categoryLabel} />
        <DetailField label="Type" value={product.productType} />
        <DetailField label="Price" value={product.price} />
        <DetailField label="MRP" value={product.mrp ?? "—"} />
        <DetailField label="Variants" value={String(product.variantCount ?? variants.length)} />
        <DetailField label="Pack size" value={product.packSize || "—"} />
        <DetailField label="Tag" value={product.tag || "—"} />
        <DetailField label="Rating" value={product.reviewCount > 0 ? `${product.rating} (${product.reviewCount})` : "—"} />
        <DetailField label="Updated" value={formatDate(product.updatedAt)} />
        <DetailField label="Created" value={formatDate(product.createdAt)} />
      </div>

      {product.benefits?.length ? (
        <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-3">
          <p className="admin-caption">Benefits</p>
          <p className="mt-1 text-sm text-[var(--admin-fg)]">{product.benefits.join(", ")}</p>
        </div>
      ) : null}

      {variants.length > 0 ? <ProductVariantsPanel product={product} /> : null}

      {images.length > 1 ? (
        <div>
          <p className="admin-caption mb-2">Gallery ({images.length} images)</p>
          <div className="grid grid-cols-4 gap-2">
            {images.slice(0, 8).map((image) => (
              <div
                key={image}
                className="overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-2)]"
              >
                <img src={resolveAdminMediaUrl(image)} alt="" className="aspect-square w-full object-contain p-1" />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
