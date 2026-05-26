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
  maxLength,
}) {
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
        className={authFieldClass}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      {hint && !error ? (
        <p id={`${id}-hint`} className="mt-1 font-body text-xs text-emerald-900/40">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="mt-1 font-body text-sm text-red-800/90" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
