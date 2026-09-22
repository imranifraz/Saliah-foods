import { useId } from "react";

/**
 * Shared admin list filtering UI.
 * Pattern: always-visible search + primary segment groups + optional advanced panel + active chips.
 */

export function AdminFilterDock({
  title = "Find & filter",
  search,
  children,
  advanced = null,
  advancedOpen = false,
  onAdvancedOpenChange,
  chips = [],
  onClearAll,
  actions = null,
  className = "",
}) {
  const hasChips = chips.length > 0;
  const showAdvancedToggle = Boolean(advanced);

  return (
    <section className={`admin-filter-dock ${className}`.trim()} aria-label={title}>
      <div className="admin-filter-dock__rail" aria-hidden />
      <div className="admin-filter-dock__body">
        {search || actions || showAdvancedToggle ? (
          <div className="admin-filter-dock__top">
            <div className="admin-filter-dock__intro">
              <p className="admin-filter-dock__eyebrow">{title}</p>
              {search}
            </div>
            {actions || showAdvancedToggle ? (
              <div className="admin-filter-dock__tools">
                {showAdvancedToggle ? (
                  <button
                    type="button"
                    className={`admin-filter-dock__more ${advancedOpen ? "is-open" : ""}`}
                    aria-expanded={advancedOpen}
                    onClick={() => onAdvancedOpenChange?.(!advancedOpen)}
                  >
                    <span>More filters</span>
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                ) : null}
                {actions}
              </div>
            ) : null}
          </div>
        ) : (
          <p className="admin-filter-dock__eyebrow">{title}</p>
        )}

        {children ? <div className="admin-filter-dock__groups">{children}</div> : null}

        {showAdvancedToggle && advancedOpen ? (
          <div className="admin-filter-dock__advanced" role="region" aria-label="More filters">
            {advanced}
          </div>
        ) : null}

        {hasChips ? (
          <div className="admin-filter-dock__chips">
            <span className="admin-filter-dock__chips-label">Active</span>
            <div className="admin-filter-dock__chip-list">
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  className="admin-filter-chip"
                  onClick={chip.onRemove}
                  aria-label={`Remove ${chip.label} filter`}
                >
                  <span>{chip.label}</span>
                  <span aria-hidden>×</span>
                </button>
              ))}
            </div>
            {onClearAll ? (
              <button type="button" className="admin-filter-dock__clear" onClick={onClearAll}>
                Clear all
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function AdminFilterSearch({
  value,
  onChange,
  onSubmit,
  onClear,
  placeholder = "Search…",
  label = "Search",
  id,
}) {
  const autoId = useId();
  const inputId = id || autoId;

  return (
    <form
      className="admin-filter-search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.(value);
      }}
      role="search"
    >
      <label className="sr-only" htmlFor={inputId}>
        {label}
      </label>
      <span className="admin-filter-search__icon" aria-hidden>
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
        </svg>
      </span>
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="admin-filter-search__input"
      />
      {value ? (
        <button type="button" className="admin-filter-search__clear" aria-label="Clear search" onClick={onClear}>
          ×
        </button>
      ) : null}
      <button type="submit" className="admin-filter-search__submit">
        Search
      </button>
    </form>
  );
}

export function AdminFilterSegment({ label, options, value, onChange, ariaLabel }) {
  return (
    <div className="admin-filter-segment" role="group" aria-label={ariaLabel || label}>
      {label ? <p className="admin-filter-segment__label">{label}</p> : null}
      <div className="admin-filter-segment__track">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              className={`admin-filter-segment__btn ${active ? "is-active" : ""}`}
              aria-pressed={active}
              onClick={() => onChange(option.value)}
            >
              <span>{option.label}</span>
              {option.count != null ? <span className="admin-filter-segment__count">{option.count}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AdminFilterSelect({ label, value, onChange, options, ariaLabel }) {
  return (
    <label className="admin-filter-select">
      <span className="admin-filter-select__label">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="admin-input"
        aria-label={ariaLabel || label}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
