import { useMemo } from "react";
import { useCatalog } from "../../context/CatalogContext.jsx";
import { ProductSectionGrid } from "../ui/ProductSectionGrid";
import { SectionHeader } from "../ui/SectionHeader";
import { Reveal } from "../ui/Reveal";

const WELLNESS_CATEGORY_ID = "wellness-traditional";

const DEFAULT_SUBTITLE =
  "Traditional favourites and naturally sweet products made for daily use at home.";

export function WellnessProducts() {
  const { loading, getProductsForCategory, getCategoryById } = useCatalog();

  const category = getCategoryById(WELLNESS_CATEGORY_ID);
  const products = useMemo(
    () => getProductsForCategory(WELLNESS_CATEGORY_ID),
    [getProductsForCategory]
  );
  const subtitle = category?.description?.trim() ? category.description : DEFAULT_SUBTITLE;

  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section id="wellness-products" className="section-pad bg-cream-50" aria-labelledby="wellness-title">
      <div className="section-container">
        <Reveal>
          <SectionHeader
            id="wellness-title"
            align="left"
            title={category?.label ?? "Natural Foods for Everyday Wellness"}
            subtitle={subtitle}
            className="max-w-3xl"
          />
        </Reveal>

        {loading ? (
          <p className="mt-10 text-sm text-emerald-900/55">Loading wellness foods…</p>
        ) : (
          <ProductSectionGrid
            products={products}
            viewAllHref="/products/wellness-traditional"
            viewAllLabel="View all wellness foods"
            columns={4}
            maxRows={3}
            showPackSize
          />
        )}
      </div>
    </section>
  );
}
