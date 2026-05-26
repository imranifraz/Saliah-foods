import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

function FilterDropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find((o) => o.value === value) ?? options[0];
  const isActive = value !== options[0]?.value;

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        className={`inline-flex h-[34px] items-center gap-1.5 rounded-full px-3 font-body text-[11px] tracking-wide transition-colors duration-200 sm:text-[12px] ${
          isActive
            ? "bg-emerald-900/[0.07] text-emerald-900"
            : "text-emerald-900/50 hover:bg-white/50 hover:text-emerald-900"
        }`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {value === options[0]?.value ? label : selected.label}
        <svg
          className={`h-3 w-3 text-emerald-900/30 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <path d="M3 4.5 6 7.5 9 4.5" />
        </svg>
      </button>

      {open ? (
        <motion.ul
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="absolute left-0 top-[calc(100%+0.3rem)] z-50 min-w-[11rem] overflow-hidden rounded-lg border border-cream-200/90 bg-white py-1 shadow-[0_8px_24px_rgba(22,49,42,0.08)]"
        >
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                className={`w-full px-3.5 py-2 text-left font-body text-[12px] transition-colors ${
                  value === option.value
                    ? "bg-emerald-900/[0.04] font-medium text-emerald-900"
                    : "text-emerald-900/55 hover:bg-cream-50"
                }`}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </motion.ul>
      ) : null}
    </div>
  );
}

export function ProductListingFilterBar({
  categoryPills = [{ id: "all", label: "All Products" }],
  activeCategory,
  onCategoryChange,
  filters,
  onFilterChange,
  sortBy,
  sortOptions,
  onSortChange,
  searchQuery,
  onSearchChange,
  productCount,
  onClearFilters,
  hasActiveFilters,
  isPinned = false,
  filterRef,
}) {
  const reduce = useReducedMotion();

  const barContent = (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2 sm:gap-x-2">
      {categoryPills.map((pill) => (
        <button
          key={pill.id}
          type="button"
          className={`h-[34px] rounded-full px-3.5 font-body text-[11px] tracking-wide transition-colors duration-200 sm:text-[12px] ${
            activeCategory === pill.id
              ? "bg-emerald-900 text-cream-50"
              : "text-emerald-900/50 hover:bg-white/60 hover:text-emerald-900"
          }`}
          onClick={() => onCategoryChange(pill.id)}
        >
          {pill.label}
        </button>
      ))}

      <span className="mx-1 hidden h-3.5 w-px bg-emerald-900/10 lg:block" aria-hidden />

      <FilterDropdown
        label="Price"
        value={filters.price}
        options={filters.priceOptions}
        onChange={(v) => onFilterChange("price", v)}
      />
      <FilterDropdown
        label="Benefits"
        value={filters.benefits}
        options={filters.benefitsOptions}
        onChange={(v) => onFilterChange("benefits", v)}
      />
      <FilterDropdown
        label="Packaging"
        value={filters.packaging}
        options={filters.packagingOptions}
        onChange={(v) => onFilterChange("packaging", v)}
      />
      <FilterDropdown label="Sort" value={sortBy} options={sortOptions} onChange={onSortChange} />

      {hasActiveFilters ? (
        <button
          type="button"
          className="h-[34px] px-2 font-body text-[11px] text-emerald-800/55 underline underline-offset-2 hover:text-emerald-900 sm:text-[12px]"
          onClick={onClearFilters}
        >
          Clear
        </button>
      ) : null}

      <div className="flex w-full items-center gap-2.5 sm:ml-auto sm:w-auto">
        <div className="relative min-w-0 flex-1 sm:w-[12rem] sm:flex-none md:w-[13.5rem]">
          <label htmlFor="plp-search" className="sr-only">
            Search products
          </label>
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-emerald-900/25"
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
            id="plp-search"
            type="search"
            value={searchQuery}
            placeholder="Search..."
            className="h-[34px] w-full rounded-full border border-cream-200/70 bg-white/60 pl-9 pr-3.5 font-body text-[12px] text-emerald-900 placeholder:text-emerald-900/30 focus:border-emerald-900/12 focus:bg-white focus:outline-none"
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <p className="shrink-0 font-body text-[11px] tracking-wide text-emerald-900/35 sm:text-[12px]">
          {productCount} items
        </p>
      </div>
    </div>
  );

  return (
    <motion.div
      ref={filterRef}
      initial={reduce ? false : { opacity: 0 }}
      animate={reduce ? undefined : { opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`plp-filter-bar border-b border-cream-200/70 py-1.5 ${
        isPinned ? "plp-filter-bar--pinned fixed inset-x-0 top-[var(--site-header)] z-30 border-t py-1.5" : "relative mb-0"
      }`}
    >
      <div className="mx-auto max-w-[1480px] px-4 sm:px-5 md:px-10">{barContent}</div>
    </motion.div>
  );
}
