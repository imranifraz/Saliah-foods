import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCatalog } from "../../context/CatalogContext.jsx";
import { OptimizedImage } from "../ui/OptimizedImage";

const EASE = [0.22, 1, 0.36, 1];

const menuVariants = {
  hidden: { opacity: 0, y: -10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: EASE },
  },
  exit: { opacity: 0, y: -6, transition: { duration: 0.2, ease: EASE } },
};

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE } },
};

function formatBadge(tag) {
  if (!tag) return null;
  const map = {
    Premium: "Premium Quality",
    "Natural Sweetness": "Naturally Sweet",
    Soft: "Premium Quality",
    Seedless: "No Added Sugar",
    "Everyday Snack": "Naturally Sweet",
  };
  return map[tag] ?? tag;
}

function ProductPreviewCard({ product, href, onClose, compact = false, index = 0 }) {
  const badge = formatBadge(product.tag);

  return (
    <motion.div variants={compact ? undefined : cardVariants} custom={index} className="min-w-0">
      <Link
        to={href}
        className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-white/70 bg-white/70 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-cream-200 hover:bg-white hover:shadow-[0_12px_28px_rgba(22,49,42,0.1)]"
        onClick={onClose}
      >
        <div
          className={`relative overflow-hidden bg-gradient-to-b from-cream-100/80 to-cream-50/30 ${
            compact ? "aspect-[5/4] p-2" : "aspect-[5/4] p-2.5"
          }`}
        >
          <OptimizedImage
            src={product.img}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.04]"
            width={compact ? 120 : 180}
            height={compact ? 96 : 144}
          />
        </div>

        <div className={`flex flex-col ${compact ? "gap-0.5 px-2.5 pb-2.5 pt-2" : "gap-1 px-2.5 pb-2.5 pt-2"}`}>
          {badge ? (
            <span className="inline-flex w-fit max-w-full truncate rounded-full bg-emerald-900/[0.06] px-1.5 py-0.5 font-body text-[8px] font-medium uppercase tracking-[0.12em] text-emerald-800/65">
              {badge}
            </span>
          ) : null}

          <p
            className={`font-display leading-snug text-emerald-900 transition-colors duration-300 group-hover:text-emerald-800 ${
              compact ? "text-[11px] line-clamp-2" : "text-[12px] line-clamp-2"
            }`}
          >
            {product.name}
          </p>

          {product.tagline ? (
            <p className="font-body text-[10px] leading-snug text-emerald-900/45 line-clamp-1">
              {product.tagline}
            </p>
          ) : null}

          <div className="mt-1 flex items-baseline justify-between gap-2 border-t border-cream-200/60 pt-1.5">
            {product.packSize ? (
              <span className="font-body text-[9px] uppercase tracking-[0.1em] text-emerald-900/35">
                {product.packSize}
              </span>
            ) : (
              <span />
            )}
            <span
              className={`shrink-0 font-display text-emerald-900 ${compact ? "text-[11px]" : "text-[13px]"}`}
            >
              {product.price}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function FeaturedPromo({ promo, href, onClose }) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: 0.12, ease: EASE }}
      className="relative flex min-h-0 flex-col overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-cream-100 via-cream-50 to-cream-200/60 p-4"
    >
      <div className="pointer-events-none absolute inset-0 marble-texture opacity-40" aria-hidden />
      <div className="relative flex flex-1 flex-col">
        <div className="relative mb-3 flex items-center justify-center overflow-hidden rounded-xl bg-cream-100/50 p-2.5">
          <OptimizedImage
            src={promo.image}
            alt=""
            className="max-h-[6rem] w-full object-contain transition-transform duration-500 ease-out hover:scale-105"
            width={200}
            height={160}
          />
        </div>

        <div className="relative space-y-2">
          <p className="font-body text-[9px] font-medium uppercase tracking-[0.18em] text-emerald-800/50">
            Featured
          </p>
          <h4 className="font-display text-lg leading-tight text-emerald-900">{promo.title}</h4>
          <p className="font-body text-[11px] leading-relaxed tracking-wide text-emerald-900/50">
            {promo.subtitle}
          </p>
          <Link
            to={href}
            onClick={onClose}
            className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-emerald-900/10 bg-white/70 px-4 py-2.5 font-body text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-900 transition-all duration-300 hover:border-emerald-800/25 hover:bg-emerald-900 hover:text-cream-50 hover:shadow-[0_8px_24px_rgba(22,49,42,0.18)]"
          >
            {promo.cta}
          </Link>
        </div>
      </div>
    </motion.aside>
  );
}

function CategorySidebar({ categories, activeId, onSelect }) {
  return (
    <ul className="flex flex-col gap-1.5 p-3" role="list">
      {categories.map((cat) => {
        const isActive = activeId === cat.id;
        return (
          <li key={cat.id}>
            <button
              type="button"
              className={`group relative w-full overflow-hidden rounded-2xl px-3.5 py-3 text-left transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-br from-emerald-900 to-emerald-800 text-cream-50 shadow-[0_10px_28px_rgba(22,49,42,0.28)]"
                  : "text-emerald-900/55 hover:bg-white/50 hover:text-emerald-900/85"
              }`}
              onMouseEnter={() => onSelect(cat.id)}
              onFocus={() => onSelect(cat.id)}
              onClick={() => onSelect(cat.id)}
            >
              {!isActive ? (
                <span
                  className="absolute bottom-2.5 left-3.5 h-px w-0 bg-emerald-700/35 transition-all duration-300 group-hover:w-[calc(100%-1.75rem)]"
                  aria-hidden
                />
              ) : null}
              <span
                className={`block font-body text-[13px] tracking-wide transition-colors duration-300 ${
                  isActive ? "font-medium" : "font-normal"
                }`}
              >
                {cat.label}
              </span>
              <span
                className={`mt-1 block font-body text-[10px] leading-snug tracking-wide ${
                  isActive ? "text-cream-50/65" : "text-emerald-900/35"
                }`}
              >
                {cat.description}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function ProductMegaMenu({ onClose, onMouseEnter, onMouseLeave }) {
  const { menuCategories } = useCatalog();
  const [activeId, setActiveId] = useState("");
  const active = menuCategories.find((c) => c.id === activeId) ?? menuCategories[0];

  useEffect(() => {
    if (menuCategories.length && !menuCategories.some((c) => c.id === activeId)) {
      setActiveId(menuCategories[0].id);
    }
  }, [menuCategories, activeId]);

  if (!active) return null;
  const previewProducts = active.products.slice(0, 4);
  const promo = active.featuredPromo;

  return (
    <motion.div
      role="dialog"
      aria-label="Product categories"
      variants={menuVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="absolute inset-x-0 top-full z-[60] hidden px-4 pt-4 sm:px-5 md:px-10 xl:block"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="mega-glass shadow-mega-menu overflow-hidden rounded-[1.75rem]">
          <div className="grid grid-cols-[10.5rem_minmax(0,1fr)_13.75rem]">
            <nav
              className="border-r border-white/50 bg-cream-100/30"
              aria-label="Product categories"
            >
              <CategorySidebar
                categories={menuCategories}
                activeId={activeId}
                onSelect={setActiveId}
              />
            </nav>

            <div className="flex min-w-0 flex-col px-4 py-4">
              <div className="mb-3 shrink-0">
                <p className="font-body text-[9px] font-medium uppercase tracking-[0.2em] text-emerald-800/45">
                  Collection
                </p>
                <h3 className="mt-0.5 font-display text-lg tracking-tight text-emerald-900">{active.label}</h3>
                <p className="mt-0.5 max-w-md font-body text-xs leading-relaxed tracking-wide text-emerald-900/50">
                  {active.description}
                </p>
              </div>

              <motion.div
                key={activeId}
                className="grid grid-cols-4 gap-2.5"
                variants={gridVariants}
                initial="hidden"
                animate="show"
              >
                {previewProducts.map((product, index) => (
                  <ProductPreviewCard
                    key={product.catalogId ?? product.id}
                    product={product}
                    href={active.viewAllHref}
                    onClose={onClose}
                    index={index}
                  />
                ))}
                {previewProducts.length < 4 ? (
                  <motion.div variants={cardVariants}>
                    <Link
                      to={active.viewAllHref}
                      onClick={onClose}
                      className="group flex aspect-[5/4] flex-col items-center justify-center rounded-xl border border-dashed border-emerald-900/10 bg-cream-100/30 p-3 text-center transition-all duration-300 hover:border-emerald-900/20 hover:bg-cream-100/60"
                    >
                      <span className="font-display text-sm text-emerald-900/70 transition-colors group-hover:text-emerald-900">
                        Discover more
                      </span>
                      <span className="mt-1 font-body text-[10px] tracking-wide text-emerald-900/40">
                        View full collection
                      </span>
                    </Link>
                  </motion.div>
                ) : null}
              </motion.div>

              <div className="mt-3 flex shrink-0 items-center justify-between border-t border-cream-200/60 pt-3">
                <p className="font-body text-[10px] tracking-wide text-emerald-900/40">
                  {previewProducts.length} curated picks
                </p>
                <Link
                  to={active.viewAllHref}
                  className="group inline-flex items-center gap-2 font-body text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-900 transition-colors duration-300 hover:text-emerald-800"
                  onClick={onClose}
                >
                  View all
                  <span className="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden>
                    →
                  </span>
                </Link>
              </div>
            </div>

            {promo ? (
              <div className="border-l border-white/50 bg-cream-100/20 p-3">
                <FeaturedPromo promo={promo} href={active.viewAllHref} onClose={onClose} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function MobileProductMegaMenu({ onClose }) {
  const { menuCategories } = useCatalog();
  const [activeId, setActiveId] = useState("");
  const active = menuCategories.find((c) => c.id === activeId) ?? menuCategories[0];

  useEffect(() => {
    if (menuCategories.length && !menuCategories.some((c) => c.id === activeId)) {
      setActiveId(menuCategories[0].id);
    }
  }, [menuCategories, activeId]);

  if (!active) return null;
  const previewProducts = active.products.slice(0, 4);

  return (
    <div className="mb-2 space-y-3 rounded-2xl border border-white/60 bg-white/50 p-3 backdrop-blur-sm">
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {menuCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`shrink-0 rounded-full px-3.5 py-1.5 font-body text-xs font-normal tracking-wide transition-all duration-300 ${
              activeId === cat.id
                ? "bg-gradient-to-br from-emerald-900 to-emerald-800 text-cream-50 shadow-md"
                : "bg-cream-50/80 text-emerald-900/70 hover:bg-cream-100"
            }`}
            onClick={() => setActiveId(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div>
        <p className="font-body text-xs tracking-wide text-emerald-900/50">{active.description}</p>
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-2">
          {previewProducts.map((product, index) => (
            <ProductPreviewCard
              key={product.catalogId ?? product.id}
              product={product}
              href={active.viewAllHref}
              onClose={onClose}
              compact
              index={index}
            />
          ))}
        </div>
        <Link
          to={active.viewAllHref}
          className="mt-4 inline-flex rounded-full border border-emerald-900/10 bg-white/70 px-5 py-2.5 font-body text-[10px] font-medium uppercase tracking-[0.14em] text-emerald-900 transition-colors hover:bg-emerald-900 hover:text-cream-50"
          onClick={onClose}
        >
          View all {active.label}
        </Link>
      </div>
    </div>
  );
}
