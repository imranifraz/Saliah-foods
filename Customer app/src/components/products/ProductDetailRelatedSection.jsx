import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ProductCard } from "../ui/ProductCard";
import { getProductDetailPath } from "../../data/productCatalog";

const INITIAL_VISIBLE = 4;
const LOAD_STEP = 4;

export function ProductDetailRelatedSection({ products }) {
  const reduce = useReducedMotion();
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const productKey = useMemo(
    () => products.map((p) => p.catalogId ?? p.slug).join(","),
    [products]
  );

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [productKey]);

  if (!products?.length) return null;

  const visible = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  function handleLoadMore() {
    setVisibleCount((n) => Math.min(n + LOAD_STEP, products.length));
  }

  return (
    <section className="pdp-related-section" aria-labelledby="related-products-title">
      <div className="pdp-related-section__head">
        <h2 id="related-products-title" className="pdp-related-section__title">
          You may also like
        </h2>
      </div>

      <ul className="pdp-related-grid pdp-related-section__grid" role="list">
        {visible.map((item, index) => (
          <motion.li
            key={item.catalogId ?? item.slug}
            className="min-w-0"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: (index % LOAD_STEP) * 0.05 }}
          >
            <ProductCard
              product={item}
              index={index}
              variant="pdp-related"
              showPackSize
              showTagline={false}
              detailHref={getProductDetailPath(item)}
              className="h-full"
            />
          </motion.li>
        ))}
      </ul>

      {hasMore ? (
        <div className="pdp-related-section__load-more-wrap">
          <button
            type="button"
            className="pdp-related-section__load-more"
            onClick={handleLoadMore}
            aria-label={`Load more products, ${products.length - visibleCount} remaining`}
          >
            Load more
          </button>
        </div>
      ) : null}
    </section>
  );
}
