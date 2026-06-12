import { useMemo } from "react";
import { useCatalog } from "../../context/CatalogContext.jsx";
import { ProductSectionGrid } from "../ui/ProductSectionGrid";
import { SectionHeader } from "../ui/SectionHeader";
import { Reveal } from "../ui/Reveal";

const PREMIUM_DATES_CATEGORY_ID = "premium-dates";

const DEFAULT_SUBTITLE =
  "From soft Kimia dates to rich Ajwa and easy seedless packs, find dates suited for daily snacking, wellness routines, and family use.";

export function PremiumDates() {
  const { loading, getProductsForCategory, getCategoryById } = useCatalog();

  const category = getCategoryById(PREMIUM_DATES_CATEGORY_ID);
  const apiProducts = useMemo(
    () => getProductsForCategory(PREMIUM_DATES_CATEGORY_ID),
    [getProductsForCategory]
  );

  const products = apiProducts;
  const subtitle = category?.description?.trim() ? category.description : DEFAULT_SUBTITLE;

  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section id="premium-dates" className="section-pad bg-cream-100" aria-labelledby="premium-dates-title">
      <div className="section-container">
        <Reveal>
          <SectionHeader
            id="premium-dates-title"
            align="left"
            title={category?.label ?? "Discover Our Premium Date Varieties"}
            subtitle={subtitle}
            className="max-w-3xl"
          />
        </Reveal>

        {loading ? (
          <p className="mt-10 text-sm text-emerald-900/55">Loading premium dates…</p>
        ) : (
          <ProductSectionGrid
            products={products}
            viewAllHref="/products/premium-dates"
            viewAllLabel="View all dates"
            columns={4}
            maxRows={3}
            showPackSize
          />
        )}
      </div>
    </section>
  );
}
