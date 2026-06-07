import { cmsImageSrc } from "../lib/cmsUpload.js";
import { getCustomerStoreUrl } from "../config/adminApps.js";

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
      <p className="mt-1 text-sm font-semibold text-[var(--admin-fg)]">{value || "—"}</p>
    </div>
  );
}

export function ViewCategoryPanel({ category, onEdit, onClose }) {
  const promo = category.featuredPromo;
  const hasPromo = Boolean(promo && typeof promo === "object" && promo.title);
  const storefrontHref = getCustomerStoreUrl() ? `${getCustomerStoreUrl()}/products/${category.id}` : "";

  return (
    <div className="space-y-4">
      {category.image ? (
        <div className="overflow-hidden rounded-xl border border-[var(--admin-border)]">
          <img src={cmsImageSrc(category.image)} alt="" className="aspect-[16/9] w-full object-cover" />
        </div>
      ) : null}

      <div>
        <h3 className="font-display text-lg font-semibold text-[var(--admin-fg)]">{category.label}</h3>
        <p className="admin-muted mt-1 text-sm">/products/{category.id}</p>
        {storefrontHref ? (
          <a
            href={storefrontHref}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-link mt-2 inline-flex text-sm"
          >
            View on customer site
          </a>
        ) : null}
      </div>

      {category.description ? (
        <p className="text-sm leading-relaxed text-[var(--admin-fg-muted)]">{category.description}</p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <DetailField label="Products" value={String(category.productCount ?? 0)} />
        <DetailField label="Sort order" value={String(category.sortOrder ?? 0)} />
        <DetailField label="Status" value={category.isActive ? "Visible" : "Hidden"} />
        <DetailField label="Updated" value={formatDate(category.updatedAt)} />
        <DetailField label="Created" value={formatDate(category.createdAt)} />
        <DetailField label="Featured promo" value={hasPromo ? "Enabled" : "None"} />
      </div>

      {hasPromo ? (
        <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-4">
          <p className="admin-caption">Shop menu promo preview</p>
          <div className="mt-3 flex gap-4">
            {promo.image ? (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)]">
                <img src={cmsImageSrc(promo.image)} alt="" className="max-h-full max-w-full object-contain" />
              </div>
            ) : null}
            <div className="min-w-0">
              <p className="font-semibold text-[var(--admin-fg)]">{promo.title}</p>
              {promo.subtitle ? <p className="admin-muted mt-1 text-sm">{promo.subtitle}</p> : null}
              {promo.cta ? (
                <p className="mt-2 inline-flex rounded-full border border-[var(--admin-border)] px-3 py-1 text-xs font-semibold text-[var(--admin-link)]">
                  {promo.cta}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="sticky bottom-0 -mx-4 flex flex-col-reverse gap-2 border-t border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 pb-1 pt-3 sm:-mx-5 sm:flex-row sm:justify-end sm:px-5 sm:pb-0">
        <button type="button" onClick={onClose} className="btn-ghost w-full sm:w-auto">
          Close
        </button>
        <button type="button" onClick={onEdit} className="btn-primary w-full sm:w-auto">
          Edit category
        </button>
      </div>
    </div>
  );
}
