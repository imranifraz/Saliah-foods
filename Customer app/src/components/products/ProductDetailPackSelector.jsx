export function ProductDetailPackSelector({ options, value, onChange, error, variant = "cards" }) {
  const isPills = variant === "pills";

  return (
    <div className={isPills ? "pdp-pack-selector pdp-pack-selector--pills" : "mt-5"}>
      <div className="flex items-baseline gap-1.5">
        <p
          className={
            isPills
              ? "pdp-pack-selector__label"
              : "font-body text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-900/55"
          }
        >
          Select pack size
        </p>
        <span className="font-body text-[11px] text-gold-600" aria-hidden>
          *
        </span>
        <span className="sr-only">Required</span>
      </div>

      <div
        className={isPills ? "pdp-pack-selector__pills" : "mt-2.5 flex flex-wrap gap-2"}
        role="radiogroup"
        aria-label="Pack size"
      >
        {options.map((option) => {
          const selected = value === option.id;
          const disabled = option.inStock === false;

          if (isPills) {
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={`${option.label}${disabled ? ", out of stock" : ""}`}
                className={`pdp-pack-pill ${selected ? "pdp-pack-pill--active" : ""} ${
                  disabled ? "pdp-pack-pill--disabled" : ""
                }`}
                onClick={() => {
                  if (!disabled) onChange(option.id);
                }}
                disabled={disabled}
              >
                {option.label}
              </button>
            );
          }

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${option.label}, ${option.price}${disabled ? ", out of stock" : ""}`}
              className={`rounded-2xl border px-4 py-2.5 text-left transition-all duration-300 ${
                selected
                  ? "border-emerald-900 bg-emerald-900 text-cream-50 shadow-sm"
                  : disabled
                    ? "cursor-not-allowed border-red-100 bg-red-50/40 text-red-700/55 opacity-70"
                    : "border-cream-200/80 bg-white/70 text-emerald-900/55 hover:border-emerald-900/20 hover:bg-white hover:text-emerald-900"
              }`}
              onClick={() => {
                if (!disabled) onChange(option.id);
              }}
              disabled={disabled}
            >
              <span className="block font-body text-[12px] tracking-wide">{option.label}</span>
              <span className={`mt-1 block ${selected ? "text-cream-50/90" : ""}`}>
                {option.mrpValue > option.priceValue ? (
                  <>
                    <span
                      className={`block font-body text-[10px] line-through ${selected ? "text-cream-50/50" : "text-emerald-900/35"}`}
                    >
                      MRP {option.mrp}
                    </span>
                    <span className="block font-body text-[12px] font-medium">{option.price}</span>
                  </>
                ) : (
                  <span
                    className={`block font-body text-[11px] ${selected ? "text-cream-50/75" : "text-emerald-900/40"}`}
                  >
                    {option.price}
                  </span>
                )}
              </span>
              {disabled ? (
                <span className="mt-1 block font-body text-[10px] uppercase tracking-[0.12em]">
                  Out of stock
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="mt-2 font-body text-[12px] text-red-700/80" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
