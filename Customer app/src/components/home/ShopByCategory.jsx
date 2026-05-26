import { motion } from "framer-motion";
import { useCatalog } from "../../context/CatalogContext.jsx";
import { OptimizedImage } from "../ui/OptimizedImage";
import { SectionHeader } from "../ui/SectionHeader";
import { Reveal } from "../ui/Reveal";

export function ShopByCategory() {
  const { shopCategories, loading } = useCatalog();
  const primaryCategories = shopCategories.slice(0, 3);
  const secondaryCategories = shopCategories.slice(3);

  if (loading || shopCategories.length === 0) return null;

  return (
    <section id="shop-category" className="section-pad bg-cream-50" aria-labelledby="shop-category-title">
      <div className="section-container">
        <Reveal>
          <SectionHeader
            id="shop-category-title"
            title="Shop by Category"
            subtitle="Choose from premium dates, natural sweeteners, traditional wellness foods, and everyday family favourites."
            className="mx-auto max-w-3xl md:mx-0 md:text-left"
          />
        </Reveal>

        <div className="-mx-4 mt-8 flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-6 sm:gap-4 sm:px-6 md:mt-10 lg:hidden [&::-webkit-scrollbar]:hidden">
          {shopCategories.map((cat, i) => (
            <CategoryCard
              key={cat.title}
              category={cat}
              className="w-[min(85vw,280px)] shrink-0 snap-start sm:w-[min(45vw,320px)] md:w-[min(32vw,340px)]"
              index={i}
            />
          ))}
        </div>

        <div className="mt-10 hidden lg:grid lg:grid-cols-6 lg:gap-5">
          {primaryCategories.map((cat, i) => (
            <CategoryCard key={cat.title} category={cat} className="lg:col-span-2" index={i} />
          ))}
          {secondaryCategories.map((cat, i) => (
            <CategoryCard
              key={cat.title}
              category={cat}
              className={secondaryCategories.length === 1 ? "lg:col-span-2 lg:col-start-3" : "lg:col-span-3"}
              index={i + 3}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ category, className = "", index }) {
  const isFeatured = Boolean(category.featured);

  return (
    <motion.a
      href={category.href}
      className={`group relative block aspect-[16/10] min-h-[180px] overflow-hidden rounded-2xl bg-emerald-950 shadow-luxury sm:min-h-[200px] ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay: index * 0.08 }}
      aria-label={`${category.title} — ${category.cta}`}
    >
      <OptimizedImage
        src={category.img}
        alt=""
        className="absolute inset-0 z-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
        width={800}
        height={500}
        sizes="(max-width: 1024px) 85vw, 33vw"
      />
      <div
        className={`absolute inset-0 z-10 bg-gradient-to-t ${
          isFeatured
            ? "from-emerald-950/90 via-emerald-950/25 to-transparent"
            : "from-emerald-950/85 via-emerald-950/35 to-emerald-950/10"
        }`}
      />
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-4 sm:p-5 md:p-6">
        <h3 className="font-display text-base font-medium text-cream-50 sm:text-lg md:text-xl">{category.title}</h3>
        {!isFeatured && (
          <p className="mt-1.5 line-clamp-2 font-body text-[11px] leading-relaxed text-cream-50/70 sm:text-xs">
            {category.products}
          </p>
        )}
        <span className="mt-2 inline-flex font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-300 sm:mt-3">
          {category.cta} →
        </span>
      </div>
    </motion.a>
  );
}
