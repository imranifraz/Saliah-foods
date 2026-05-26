import { Link } from "react-router-dom";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";
import { getProductDetailPath } from "../../data/productCatalog";

/** Pick column count so the last row is not a short orphan row (e.g. 6 → 3×2, not 4+2). */
function resolveDesktopColumns(count, maxColumns = 4) {
  if (count <= 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return count;
  if (count % 4 === 0) return 4;
  if (count % 3 === 0) return 3;
  return Math.min(3, maxColumns);
}

function gridClassForCount(count, maxColumns) {
  const desktop = resolveDesktopColumns(count, maxColumns);

  if (desktop === 4) {
    return "grid w-full grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 md:gap-7 xl:grid-cols-4 xl:gap-8";
  }
  if (desktop === 3) {
    return "grid w-full grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8";
  }
  if (desktop === 2) {
    return "grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6";
  }
  return "grid w-full grid-cols-1 gap-4 sm:gap-5";
}

/** Homepage product block: responsive grid + view all below. */
export function ProductSectionGrid({
  products,
  viewAllHref,
  viewAllLabel = "View all",
  columns = 4,
  maxRows = 3,
  showPackSize = false,
  showTagline = true,
  compact = false,
}) {
  const maxVisible = columns * maxRows;
  const visible = products.slice(0, maxVisible);
  const colClass = gridClassForCount(visible.length, columns);

  return (
    <div className="mt-10 md:mt-12">
      <ul className={`${colClass} items-stretch`} role="list">
        {visible.map((p, i) => (
          <li key={p.id ?? p.name} className="flex min-w-0">
            <ProductCard
              product={p}
              index={i}
              variant="homepage"
              showPackSize={showPackSize}
              showTagline={showTagline}
              compact={compact}
              detailHref={getProductDetailPath(p)}
              className="w-full"
            />
          </li>
        ))}
      </ul>

      {viewAllHref ? (
        <Reveal className="mt-8 flex w-full justify-end md:mt-10">
          <Link
            to={viewAllHref}
            className="inline-flex min-h-[44px] items-center rounded-full border border-emerald-900/15 bg-cream-50 px-7 py-3 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-900 transition-colors hover:border-emerald-800 hover:bg-emerald-900 hover:text-cream-50"
          >
            {viewAllLabel}
          </Link>
        </Reveal>
      ) : null}
    </div>
  );
}
