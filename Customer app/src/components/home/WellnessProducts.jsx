import { wellnessProducts } from "../../data/homepage";
import { ProductSectionGrid } from "../ui/ProductSectionGrid";
import { SectionHeader } from "../ui/SectionHeader";
import { Reveal } from "../ui/Reveal";

export function WellnessProducts() {
  return (
    <section id="wellness-products" className="section-pad bg-cream-50" aria-labelledby="wellness-title">
      <div className="section-container">
        <Reveal>
          <SectionHeader
            id="wellness-title"
            align="left"
            title="Natural Foods for Everyday Wellness"
            subtitle="Traditional favourites and naturally sweet products made for daily use at home."
            className="max-w-3xl"
          />
        </Reveal>

        <ProductSectionGrid
          products={wellnessProducts}
          viewAllHref="/products/wellness-traditional"
          viewAllLabel="View all wellness foods"
          columns={4}
          maxRows={3}
          showPackSize
        />
      </div>
    </section>
  );
}
