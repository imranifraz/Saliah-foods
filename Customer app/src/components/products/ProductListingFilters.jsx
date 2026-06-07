import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

function formatPrice(value) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function PriceRangeFilter({ bounds, value, onChange }) {
  const { min, max, step } = bounds;
  const [minValue, maxValue] = value;
  const minGap = step;
  const range = Math.max(max - min, step);
  const fillLeft = ((minValue - min) / range) * 100;
  const fillRight = 100 - ((maxValue - min) / range) * 100;

  const handleMinChange = useCallback(
    (nextMin) => {
      const clamped = Math.min(nextMin, maxValue - minGap);
      onChange([Math.max(min, clamped), maxValue]);
    },
    [maxValue, min, minGap, onChange]
  );

  const handleMaxChange = useCallback(
    (nextMax) => {
      const clamped = Math.max(nextMax, minValue + minGap);
      onChange([minValue, Math.min(max, clamped)]);
    },
    [minValue, max, minGap, onChange]
  );

  return (
    <div className="plp-price-range" role="group" aria-labelledby="plp-price-range-label">
      <div className="plp-price-range__values" id="plp-price-range-label">
        <span>{formatPrice(minValue)}</span>
        <span className="plp-price-range__dash" aria-hidden>
          –
        </span>
        <span>{formatPrice(maxValue)}</span>
      </div>

      <div className="plp-price-range__slider">
        <div className="plp-price-range__track" aria-hidden>
          <div
            className="plp-price-range__fill"
            style={{ left: `${fillLeft}%`, right: `${fillRight}%` }}
          />
        </div>

        <input
          type="range"
          className="plp-price-range__input plp-price-range__input--min"
          min={min}
          max={max}
          step={step}
          value={minValue}
          aria-label="Minimum price"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={minValue}
          aria-valuetext={formatPrice(minValue)}
          onChange={(e) => handleMinChange(Number(e.target.value))}
        />
        <input
          type="range"
          className="plp-price-range__input plp-price-range__input--max"
          min={min}
          max={max}
          step={step}
          value={maxValue}
          aria-label="Maximum price"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={maxValue}
          aria-valuetext={formatPrice(maxValue)}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
        />
      </div>

      <div className="plp-price-range__limits" aria-hidden>
        <span>{formatPrice(min)}</span>
        <span>{formatPrice(max)}</span>
      </div>
    </div>
  );
}

function FilterOptionList({ options, value, onChange, name }) {
  return (
    <ul className="plp-filter-options" role="list">
      {options.map((option) => {
        const active = value === option.value;
        const inputId = `${name}-${option.value}`;

        return (
          <li key={option.value}>
            <label
              htmlFor={inputId}
              className={`plp-filter-option${active ? " plp-filter-option--active" : ""}`}
            >
              <input
                id={inputId}
                type="radio"
                name={name}
                className="sr-only"
                checked={active}
                onChange={() => onChange(option.value)}
              />
              <span className="plp-filter-option__marker" aria-hidden />
              <span>{option.label}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

function FilterPanelContent({
  categoryPills,
  activeCategory,
  onCategoryChange,
  filters,
  onFilterChange,
  priceBounds,
  priceRange,
  onPriceRangeChange,
  sortBy,
  sortOptions,
  onSortChange,
  searchQuery,
  onSearchChange,
  productCount,
  onClearFilters,
  hasActiveFilters,
}) {
  return (
    <div className="plp-filter-panel space-y-6">
      <div>
        <label htmlFor="plp-search-sidebar" className="plp-filter-group__title">
          Search
        </label>
        <div className="relative mt-2">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-900/30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>
          <input
            id="plp-search-sidebar"
            type="search"
            value={searchQuery}
            placeholder="Search products..."
            className="plp-filter-search"
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="plp-filter-group">
        <h3 className="plp-filter-group__title">Category</h3>
        <ul className="plp-filter-categories" role="list">
          {categoryPills.map((pill) => (
            <li key={pill.id}>
              <button
                type="button"
                className={`plp-filter-category${activeCategory === pill.id ? " plp-filter-category--active" : ""}`}
                onClick={() => onCategoryChange(pill.id)}
              >
                {pill.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="plp-filter-group">
        <h3 className="plp-filter-group__title">Price</h3>
        <FilterOptionList
          name="price"
          options={filters.priceOptions}
          value={filters.price === "custom" ? "" : filters.price}
          onChange={(v) => onFilterChange("price", v)}
        />
        <p className="plp-filter-group__subtitle">Custom range</p>
        <PriceRangeFilter bounds={priceBounds} value={priceRange} onChange={onPriceRangeChange} />
      </div>

      <div className="plp-filter-group">
        <h3 className="plp-filter-group__title">Benefits</h3>
        <FilterOptionList
          name="benefits"
          options={filters.benefitsOptions}
          value={filters.benefits}
          onChange={(v) => onFilterChange("benefits", v)}
        />
      </div>

      <div className="plp-filter-group">
        <h3 className="plp-filter-group__title">Packaging</h3>
        <FilterOptionList
          name="packaging"
          options={filters.packagingOptions}
          value={filters.packaging}
          onChange={(v) => onFilterChange("packaging", v)}
        />
      </div>

      <div className="plp-filter-group">
        <h3 className="plp-filter-group__title">Availability</h3>
        <FilterOptionList
          name="availability"
          options={filters.availabilityOptions}
          value={filters.availability}
          onChange={(v) => onFilterChange("availability", v)}
        />
      </div>

      <div className="plp-filter-group">
        <h3 className="plp-filter-group__title">Sort by</h3>
        <FilterOptionList name="sort" options={sortOptions} value={sortBy} onChange={onSortChange} />
      </div>

      <div className="border-t border-cream-200/80 pt-4">
        <p className="font-body text-sm text-emerald-900/50">
          <span className="font-semibold text-emerald-900/75">{productCount}</span>{" "}
          {productCount === 1 ? "product" : "products"}
        </p>
        {hasActiveFilters ? (
          <button type="button" className="plp-filter-clear mt-3" onClick={onClearFilters}>
            Clear all filters
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function ProductListingSidebar(props) {
  const reduce = useReducedMotion();

  return (
    <aside className="plp-sidebar hidden lg:block" aria-label="Product filters">
      <motion.div
        initial={reduce ? false : { opacity: 0, x: -8 }}
        animate={reduce ? undefined : { opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
        className="plp-sidebar__inner"
      >
        <p className="plp-sidebar__heading">Filter & sort</p>
        <FilterPanelContent {...props} />
      </motion.div>
    </aside>
  );
}

export function ProductListingMobileFilters(props) {
  const { productCount, hasActiveFilters, onClearFilters } = props;
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="plp-mobile-filters lg:hidden">
      <div className="plp-mobile-filters__bar">
        <button
          type="button"
          className="plp-mobile-filters__trigger"
          onClick={() => setOpen(true)}
          aria-expanded={open}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d="M4 6h16M4 12h10M4 18h7" strokeLinecap="round" />
          </svg>
          Filters
          {hasActiveFilters ? <span className="plp-mobile-filters__badge" aria-hidden /> : null}
        </button>

        <p className="plp-mobile-filters__count">
          {productCount} {productCount === 1 ? "item" : "items"}
        </p>
      </div>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              className="plp-mobile-filters__backdrop"
              aria-label="Close filters"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Product filters"
              className="plp-mobile-filters__drawer"
              initial={reduce ? false : { x: "-100%" }}
              animate={reduce ? undefined : { x: 0 }}
              exit={reduce ? undefined : { x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="plp-mobile-filters__drawer-header">
                <h2 className="font-display text-lg text-emerald-900">Filters</h2>
                <button
                  type="button"
                  className="plp-mobile-filters__close"
                  aria-label="Close filters"
                  onClick={() => setOpen(false)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <div className="plp-mobile-filters__drawer-body">
                <FilterPanelContent
                  {...props}
                  onCategoryChange={(id) => {
                    props.onCategoryChange(id);
                  }}
                />
              </div>

              <div className="plp-mobile-filters__drawer-footer">
                {hasActiveFilters ? (
                  <button type="button" className="plp-filter-clear" onClick={onClearFilters}>
                    Clear all
                  </button>
                ) : null}
                <button type="button" className="plp-mobile-filters__apply" onClick={() => setOpen(false)}>
                  Show {productCount} {productCount === 1 ? "product" : "products"}
                </button>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}