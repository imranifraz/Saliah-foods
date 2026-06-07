import { authFieldClass, authLabelClass } from "./authFormStyles";

export function AuthFormField({
  id,
  label,
  error,
  hint,
  className = "",
  type = "text",
  autoComplete,
  inputMode,
  placeholder,
  value,
  onChange,
  onBlur,
  maxLength,
}) {
  const describedBy = [hint && !error ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <label htmlFor={id} className={authLabelClass}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        className={`${authFieldClass}${error ? " border-red-300/80" : ""}`}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy || undefined}
      />
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
