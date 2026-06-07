import { Link } from "react-router-dom";
import { getPasswordStrength } from "./accountUtils";

export function AccountSectionHeader({ title, description, action }) {
  return (
    <header className="account-section-header">
      <div>
        <h2 className="account-section-title">{title}</h2>
        {description ? <p className="account-section-desc">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export function AccountCard({ children, className = "", padding = true, ...props }) {
  return (
    <section className={`account-card ${padding ? "account-card--padded" : ""} ${className}`.trim()} {...props}>
      {children}
    </section>
  );
}

export function AccountEmptyState({ icon, title, description, actionLabel, actionHref }) {
  return (
    <div className="account-empty">
      <div className="account-empty__icon" aria-hidden>
        {icon ?? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 11l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <h3 className="account-empty__title">{title}</h3>
      {description ? <p className="account-empty__desc">{description}</p> : null}
      {actionHref && actionLabel ? (
        <Link to={actionHref} className="account-btn account-btn--primary account-empty__action">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function AccountAlert({ type = "success", children }) {
  return (
    <p className={`account-alert account-alert--${type}`} role={type === "error" ? "alert" : "status"}>
      {children}
    </p>
  );
}

export function AccountStatusBadge({ label, className }) {
  return <span className={className}>{label}</span>;
}

export function AccountField({ id, label, error, children, className = "" }) {
  return (
    <div className={`account-field ${className}`.trim()}>
      <label htmlFor={id} className="account-label">
        {label}
      </label>
      {children}
      {error ? (
        <p className="account-field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function AccountDetailField({ label, value, className = "" }) {
  return (
    <div className={`account-detail ${className}`.trim()}>
      <p className="account-label">{label}</p>
      <p className="account-detail__value">{value || "—"}</p>
    </div>
  );
}

export function AccountInput(props) {
  return <input className="account-input" {...props} />;
}

export function AccountPhoneInput({ id, value, onChange, error, placeholder = "9876543210", ...props }) {
  return (
    <div className={`account-phone-input${error ? " account-phone-input--error" : ""}`}>
      <span className="account-phone-input__prefix" aria-hidden>
        +91
      </span>
      <input
        id={id}
        type="tel"
        autoComplete="tel-national"
        inputMode="numeric"
        className="account-phone-input__field"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        maxLength={10}
        aria-invalid={Boolean(error)}
        {...props}
      />
    </div>
  );
}

export function AccountSelect(props) {
  return <select className="account-input account-select" {...props} />;
}

export function AccountTextarea(props) {
  return <textarea className="account-input account-textarea" rows={3} {...props} />;
}

export function AccountBtn({ variant = "primary", type = "button", className = "", children, ...props }) {
  const variantClass =
    variant === "ghost"
      ? "account-btn--ghost"
      : variant === "soft"
        ? "account-btn--soft"
        : variant === "danger"
          ? "account-btn--danger"
          : "account-btn--primary";
  return (
    <button type={type} className={`account-btn ${variantClass} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

export function AccountBtnLink({ to, children, className = "" }) {
  return (
    <Link to={to} className={`account-btn account-btn--primary ${className}`.trim()}>
      {children}
    </Link>
  );
}

export function PasswordStrengthBar({ password }) {
  const strength = getPasswordStrength(password);
  if (!password) return null;

  return (
    <div className="account-password-strength">
      <div className="account-password-strength__track">
        <span
          className={`account-password-strength__fill ${strength.color}`}
          style={{ width: `${strength.percent}%` }}
        />
      </div>
      <p className="account-password-strength__label">
        Strength: <span className="font-medium text-emerald-900/70">{strength.label}</span>
      </p>
    </div>
  );
}
