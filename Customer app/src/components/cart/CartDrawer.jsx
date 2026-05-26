import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { formatINR } from "../../data/pricing";
import { ProductPrice } from "../ui/ProductPrice";
import { useCart } from "../../context/CartContext";
import { OptimizedImage } from "../ui/OptimizedImage";

export function CartDrawer() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, totalCount } = useCart();

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-[70] bg-emerald-950/35 backdrop-blur-[2px]"
            aria-label="Close cart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            initial={reduce ? false : { x: "100%" }}
            animate={reduce ? undefined : { x: 0 }}
            exit={reduce ? undefined : { x: "100%" }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-[71] flex w-full max-w-md flex-col border-l border-cream-200/80 bg-cream-50/98 shadow-[-12px_0_48px_rgba(22,49,42,0.12)] backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-cream-200/70 px-5 py-4">
              <div>
                <h2 className="font-display text-xl text-emerald-900">Your cart</h2>
                <p className="mt-0.5 font-body text-[12px] text-emerald-900/45">
                  {totalCount} {totalCount === 1 ? "item" : "items"}
                </p>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-900/5 text-emerald-900 transition-colors hover:bg-emerald-900/10"
                aria-label="Close cart"
                onClick={closeCart}
              >
                <IconClose />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <p className="font-display text-lg text-emerald-900">Your cart is empty</p>
                <p className="mt-2 font-body text-sm text-emerald-900/45">
                  Add premium dates and wellness favourites to get started.
                </p>
                <Link
                  to="/products/all"
                  className="mt-6 rounded-full gradient-gold-premium px-6 py-3 font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-white"
                  onClick={closeCart}
                >
                  Browse products
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-5" role="list">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex gap-3 rounded-xl border border-cream-200/70 bg-white/80 p-3 shadow-[0_2px_12px_rgba(22,49,42,0.04)]"
                    >
                      <Link
                        to={`/product/${item.slug}`}
                        className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-cream-100/80"
                        onClick={closeCart}
                      >
                        <OptimizedImage
                          src={item.img}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain p-1"
                          width={64}
                          height={64}
                        />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/product/${item.slug}`}
                          className="line-clamp-2 font-display text-[14px] leading-snug text-emerald-900 hover:text-emerald-800"
                          onClick={closeCart}
                        >
                          {item.name}
                        </Link>
                        {item.packSize ? (
                          <p className="mt-0.5 font-body text-[10px] uppercase tracking-[0.12em] text-emerald-900/35">
                            {item.packSize}
                          </p>
                        ) : null}
                        <div className="mt-1">
                          <ProductPrice
                            priceValue={item.priceValue}
                            mrpValue={item.mrpValue}
                            price={item.price}
                            mrp={item.mrp}
                            size="sm"
                            showDiscountBadge={false}
                          />
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex items-center rounded-full border border-cream-200/80 bg-cream-50/80">
                            <button
                              type="button"
                              className="flex h-7 w-7 items-center justify-center font-body text-sm text-emerald-900/60 hover:text-emerald-900"
                              aria-label={`Decrease quantity of ${item.name}`}
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              −
                            </button>
                            <span className="min-w-[1.25rem] text-center font-body text-[12px] font-medium text-emerald-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              className="flex h-7 w-7 items-center justify-center font-body text-sm text-emerald-900/60 hover:text-emerald-900"
                              aria-label={`Increase quantity of ${item.name}`}
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            className="font-body text-[11px] text-emerald-900/35 underline-offset-2 hover:text-emerald-900/60 hover:underline"
                            onClick={() => removeItem(item.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-cream-200/70 bg-white/60 px-5 py-4">
                  <div className="flex items-baseline justify-between">
                    <span className="font-body text-[11px] uppercase tracking-[0.14em] text-emerald-900/45">
                      Subtotal
                    </span>
                    <span className="font-display text-xl text-emerald-900">{formatINR(subtotal)}</span>
                  </div>
                  <p className="mt-1 font-body text-[11px] text-emerald-900/35">
                    Shipping and GST will be shown at checkout
                  </p>

                  <button
                    type="button"
                    className="mt-4 w-full rounded-full gradient-gold-premium py-3.5 font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-white"
                    onClick={() => {
                      closeCart();
                      navigate("/checkout");
                    }}
                  >
                    Checkout
                  </button>
                  <button
                    type="button"
                    className="mt-2 w-full rounded-full border border-emerald-900/10 py-2.5 font-body text-[10px] font-medium uppercase tracking-[0.14em] text-emerald-900/50 hover:border-emerald-900/18 hover:text-emerald-900/70"
                    onClick={closeCart}
                  >
                    Continue shopping
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
