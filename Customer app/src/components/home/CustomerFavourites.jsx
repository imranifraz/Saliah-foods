import { customerFavourites } from "../../data/homepage";
import { ProductSectionGrid } from "../ui/ProductSectionGrid";
import { SectionHeader } from "../ui/SectionHeader";
import { Reveal } from "../ui/Reveal";

export function CustomerFavourites() {
  return (
    <section id="customer-favourites" className="section-pad bg-cream-100" aria-labelledby="favourites-title">
      <div className="section-container">
        <Reveal>
          <SectionHeader
            id="favourites-title"
            align="left"
            title="Customer Favourites"
            subtitle="Our most loved picks for daily snacking, natural sweetness, and traditional taste."
            className="max-w-3xl"
          />
        </Reveal>

        <ProductSectionGrid
          products={customerFavourites}
          viewAllHref="/products/best-sellers"
          viewAllLabel="View all favourites"
          columns={4}
          maxRows={3}
          showPackSize
          showTagline
        />
      </div>
    </section>
  );
}
