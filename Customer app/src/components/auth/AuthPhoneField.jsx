import { authLabelClass } from "./authFormStyles";

const phoneWrapClass =
  "mt-1.5 flex min-h-[3rem] overflow-hidden rounded-lg border border-cream-200/95 bg-white transition-[border-color,box-shadow,background-color] duration-150 hover:border-cream-200 focus-within:border-emerald-800/35 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(201,149,106,0.2)]";

const phoneInputClass =
  "min-w-0 flex-1 border-0 bg-transparent px-4 py-3 font-body text-base text-emerald-900 outline-none placeholder:text-emerald-900/30";

export function AuthPhoneField({
  id,
  label,
  error,
  hint,
  className = "",
  placeholder = "9876543210",
  value,
  onChange,
  onBlur,
}) {
  const describedBy = [hint && !error ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <label htmlFor={id} className={authLabelClass}>
        {label}
      </label>
      <div className={`${phoneWrapClass}${error ? " border-red-300/80" : ""}`}>
        <span className="flex shrink-0 items-center border-r border-cream-200/95 bg-[#faf6f0]/70 px-3 font-body text-sm font-semibold text-emerald-900/60">
          +91
        </span>
        <input
          id={id}
          name={id}
          type="tel"
          autoComplete="tel-national"
          inputMode="numeric"
          placeholder={placeholder}
          className={phoneInputClass}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          maxLength={10}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
        />
      </div>
      {hint && !error ? (
        <p id={`${id}-hint`} className="mt-1 font-body text-xs text-emerald-900/40">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1 font-body text-sm text-red-800/90" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
