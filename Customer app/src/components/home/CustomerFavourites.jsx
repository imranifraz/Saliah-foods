import { useMemo } from "react";
import { useCatalog } from "../../context/CatalogContext.jsx";
import { ProductSectionGrid } from "../ui/ProductSectionGrid";
import { SectionHeader } from "../ui/SectionHeader";
import { Reveal } from "../ui/Reveal";

export function CustomerFavourites() {
  const { products, loading } = useCatalog();

  const favourites = useMemo(
    () => products.filter((p) => p.isBestSeller).slice(0, 12),
    [products]
  );

  if (!loading && favourites.length === 0) {
    return null;
  }

  return (
    <section id="customer-favourites" className="section-pad bg-cream-100" aria-labelledby="favourites-title">
      <div className="section-container">
        <Reveal>
          <SectionHeader
            id="favourites-title"
            align="left"
            title="Customer Favourites"
            subtitle="Top picks from real orders — updated automatically as customers shop."
            className="max-w-3xl"
          />
        </Reveal>

        {loading ? (
          <p className="mt-10 text-sm text-emerald-900/55">Loading favourites…</p>
        ) : (
          <ProductSectionGrid
            products={favourites}
            viewAllHref="/products/best-sellers"
            viewAllLabel="View all favourites"
            columns={4}
            maxRows={3}
            showPackSize
            showTagline
          />
        )}
      </div>
    </section>
  );
}
