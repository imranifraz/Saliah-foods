import { premiumDates } from "../../data/homepage";
import { ProductSectionGrid } from "../ui/ProductSectionGrid";
import { SectionHeader } from "../ui/SectionHeader";
import { Reveal } from "../ui/Reveal";

export function PremiumDates() {
  return (
    <section id="premium-dates" className="section-pad bg-cream-100" aria-labelledby="premium-dates-title">
      <div className="section-container">
        <Reveal>
          <SectionHeader
            id="premium-dates-title"
            align="left"
            title="Discover Our Premium Date Varieties"
            subtitle="From soft Kimia dates to rich Ajwa and easy seedless packs, find dates suited for daily snacking, wellness routines, and family use."
            className="max-w-3xl"
          />
        </Reveal>

        <ProductSectionGrid
          products={premiumDates}
          viewAllHref="/products/premium-dates"
          viewAllLabel="View all dates"
          columns={4}
          maxRows={3}
          showPackSize
        />
      </div>
    </section>
  );
}
