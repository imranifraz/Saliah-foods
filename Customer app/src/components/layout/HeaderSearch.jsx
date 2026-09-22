import { useEffect, useId, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useCatalog } from "../../context/CatalogContext.jsx";
import { getProductDetailPath } from "../../data/productCatalog.js";
import { resolveMediaUrl } from "../../lib/api.js";
import { rankProductSearch } from "../../lib/productSearch.js";

function IconSearch({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" strokeLinecap="round" />
    </svg>
  );
}

function formatPrice(product) {
  return product.salePrice || product.price || "";
}

export function HeaderSearch({ onNavigate }) {
  const navigate = useNavigate();
  const { products, loading } = useCatalog();
  const dialogTitleId = useId();
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const trimmed = query.trim();
  const results = trimmed ? rankProductSearch(products, trimmed, 8) : [];

  useEffect(() => {
    if (!open) return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => inputRef.current?.focus(), 20);

    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const goToListing = (term = trimmed) => {
    const q = term.trim();
    close();
    onNavigate?.();
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    goToListing();
  };

  return (
    <>
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-900/5 text-emerald-900 transition-colors hover:bg-emerald-900/10"
        aria-label="Search products"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <IconSearch />
      </button>

      <AnimatePresence>
        {open ? (
          <div className="fixed inset-0 z-[80]" role="presentation">
            <motion.button
              type="button"
              className="absolute inset-0 bg-emerald-950/45 backdrop-blur-[2px]"
              aria-label="Close search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={dialogTitleId}
              className="absolute inset-x-0 top-0 mx-auto w-full max-w-xl px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-4 sm:pt-4"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="overflow-hidden rounded-2xl border border-cream-200/90 bg-cream-50 shadow-[0_20px_50px_rgba(22,49,42,0.18)]">
                <div className="flex items-center gap-2 border-b border-cream-200/80 px-3 py-2.5 sm:px-4">
                  <p id={dialogTitleId} className="sr-only">
                    Search products
                  </p>
                  <IconSearch className="h-4 w-4 shrink-0 text-emerald-900/35" />
                  <form className="min-w-0 flex-1" onSubmit={handleSubmit}>
                    <input
                      ref={inputRef}
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search dates, syrups, wellness foods…"
                      className="w-full bg-transparent font-body text-sm text-emerald-900 outline-none placeholder:text-emerald-900/35"
                      autoComplete="off"
                      enterKeyHint="search"
                    />
                  </form>
                  {trimmed ? (
                    <button
                      type="button"
                      className="rounded-full px-2 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-900/45 hover:text-emerald-900"
                      onClick={() => setQuery("")}
                    >
                      Clear
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="rounded-full px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-900/55 hover:bg-cream-100 hover:text-emerald-900"
                    onClick={close}
                  >
                    Esc
                  </button>
                </div>

                <div className="max-h-[min(70vh,28rem)] overflow-y-auto">
                  {!trimmed ? (
                    <p className="px-4 py-6 font-body text-sm text-emerald-900/45">
                      Try “Ajwa”, “date syrup”, or “wellness”.
                    </p>
                  ) : loading ? (
                    <p className="px-4 py-6 font-body text-sm text-emerald-900/45">Loading catalog…</p>
                  ) : results.length === 0 ? (
                    <div className="px-4 py-6">
                      <p className="font-body text-sm text-emerald-900/55">No products match “{trimmed}”.</p>
                      <button
                        type="button"
                        className="mt-3 font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-600 hover:text-emerald-800"
                        onClick={() => goToListing()}
                      >
                        Browse all products
                      </button>
                    </div>
                  ) : (
                    <ul role="listbox" aria-label="Search results">
                      {results.map((product) => {
                        const href = getProductDetailPath(product);
                        const img = resolveMediaUrl(product.img || product.images?.[0] || "");
                        return (
                          <li key={product.slug || product.id || product.name}>
                            <Link
                              to={href}
                              role="option"
                              className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-cream-100/90 sm:px-4"
                              onClick={() => {
                                close();
                                onNavigate?.();
                              }}
                            >
                              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-cream-200/80 bg-white">
                                {img ? (
                                  <img
                                    src={img}
                                    alt=""
                                    className="h-full w-full object-contain p-1"
                                    loading="lazy"
                                    decoding="async"
                                  />
                                ) : null}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate font-body text-sm font-medium text-emerald-900">
                                  {product.name}
                                </span>
                                <span className="mt-0.5 block truncate font-body text-xs text-emerald-900/45">
                                  {product.categoryLabel || product.tagline || "Saliah Foods"}
                                </span>
                              </span>
                              {formatPrice(product) ? (
                                <span className="shrink-0 font-body text-xs font-medium text-emerald-900/70">
                                  {formatPrice(product)}
                                </span>
                              ) : null}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {trimmed && results.length > 0 ? (
                  <div className="border-t border-cream-200/80 px-3 py-2.5 sm:px-4">
                    <button
                      type="button"
                      className="w-full rounded-xl bg-emerald-900/5 px-3 py-2.5 text-center font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-900 transition-colors hover:bg-emerald-900/10"
                      onClick={() => goToListing()}
                    >
                      View all results for “{trimmed}”
                    </button>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
