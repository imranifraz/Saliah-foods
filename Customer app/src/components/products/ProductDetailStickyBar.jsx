import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { OptimizedImage } from "../ui/OptimizedImage";
import { ProductPrice } from "../ui/ProductPrice";

export function ProductDetailStickyBar({
  visible,
  product,
  priceValue,
  mrpValue,
  price,
  mrp,
  packSize,
  onAddToCart,
  inStock = true,
}) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="pdp-sticky-bar fixed inset-x-0 bottom-0 z-50 border-t border-cream-200/80 bg-white/98 px-4 py-3 sm:px-5 md:px-10"
        >
          <div className="mx-auto flex max-w-[1480px] items-center gap-3 sm:gap-4">
            <div className="hidden h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-cream-200/70 bg-cream-50 sm:flex">
              <OptimizedImage
                src={product.img}
                alt=""
                className="max-h-full max-w-full object-contain p-1"
                width={44}
                height={44}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm text-emerald-900">{product.name}</p>
              {packSize ? (
                <p className="font-body text-[10px] uppercase tracking-[0.12em] text-emerald-900/35">{packSize}</p>
              ) : null}
              <ProductPrice
                priceValue={priceValue}
                mrpValue={mrpValue}
                price={price}
                mrp={mrp}
                size="sm"
                showDiscountBadge={false}
              />
            </div>
            <motion.button
              type="button"
              className={`pdp-btn-primary shrink-0 rounded-full px-6 py-3 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-white sm:px-8 sm:text-[11px] ${
                !inStock ? "cursor-not-allowed opacity-50" : ""
              }`}
              whileHover={reduce ? undefined : { y: -1 }}
              whileTap={reduce ? undefined : { scale: 0.985 }}
              onClick={onAddToCart}
              disabled={!inStock}
            >
              {inStock ? "Add to cart" : "Out of stock"}
            </motion.button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
