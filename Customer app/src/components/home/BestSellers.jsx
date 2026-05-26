import { delicaciesProducts } from "../../data/catalog";
import { ProductCard } from "../ui/ProductCard";
import { Reveal } from "../ui/Reveal";

export function BestSellers() {
  return (
    <section id="best-sellers" className="py-24 md:py-32" aria-labelledby="bestsellers-title">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-body text-[11px] font-medium uppercase tracking-[0.3em] text-gold-600">
              Most cherished
            </p>
            <h2
              id="bestsellers-title"
              className="mt-3 font-display text-[clamp(2rem,4vw,3.25rem)] font-medium text-emerald-900"
            >
              Best selling selections
            </h2>
          </div>
          <a
            href="#delicacies"
            id="delicacies"
            className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-800 underline-offset-4 hover:underline"
          >
            View all products
          </a>
        </Reveal>

        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {delicaciesProducts.map((p, i) => (
            <ProductCard key={p.name} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
