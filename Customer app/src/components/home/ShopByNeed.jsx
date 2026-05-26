import { motion } from "framer-motion";
import { shopByNeed } from "../../data/homepage";
import { SectionHeader } from "../ui/SectionHeader";
import { Reveal } from "../ui/Reveal";

export function ShopByNeed() {
  return (
    <section id="shop-by-need" className="bg-cream-100 py-20 md:py-28" aria-labelledby="shop-need-title">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-5 md:px-10">
        <Reveal>
          <SectionHeader id="shop-need-title" title="Shop by Need" />
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shopByNeed.map((item, i) => (
            <motion.a
              key={item.need}
              href={item.href}
              className="group rounded-2xl border border-cream-200 bg-cream-50 p-6 shadow-luxury transition-shadow hover:shadow-luxury-lg"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.06 }}
            >
              <h3 className="font-display text-lg font-medium text-emerald-900 group-hover:text-emerald-800">
                {item.need}
              </h3>
              <p className="mt-2 font-body text-sm text-emerald-900/60">{item.products}</p>
              <span className="mt-4 inline-block font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-600">
                Shop now →
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
