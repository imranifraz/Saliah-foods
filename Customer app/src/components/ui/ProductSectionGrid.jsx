import { Link } from "react-router-dom";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";
import { getProductDetailPath } from "../../data/productCatalog";

/** Shared home + listing card rhythm: fixed columns so sparse sections don’t look oversized. */
const HOME_PRODUCT_GRID =
  "grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4 xl:gap-6";

/** Homepage product block: same ProductCard as PLP (`variant="listing"`). */
export function ProductSectionGrid({
  products,
  viewAllHref,
  viewAllLabel = "View all",
  columns = 4,
  maxRows = 3,
  showPackSize = true,
  showTagline = true,
}) {
  const maxVisible = Math.max(1, columns) * Math.max(1, maxRows);
  const visible = products.slice(0, maxVisible);

  return (
    <div className="mt-10 md:mt-12">
      <ul className={`${HOME_PRODUCT_GRID} items-stretch`} role="list">
        {visible.map((p, i) => (
          <li key={p.id ?? p.name} className="flex min-w-0">
            <ProductCard
              product={p}
              index={i}
              variant="listing"
              showPackSize={showPackSize}
              showTagline={showTagline}
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
