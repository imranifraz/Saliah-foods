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

export function AccountCard({ children, className = "", padding = true }) {
  return (
    <section className={`account-card ${padding ? "account-card--padded" : ""} ${className}`.trim()}>
      {children}
    </section>
  );
}

export function AccountEmptyState({ icon, title, description, actionLabel, actionHref }) {
  return (
    <div className="account-empty">
      {icon ? <div className="account-empty__icon" aria-hidden>{icon}</div> : null}
      <h3 className="account-empty__title">{title}</h3>
      {description ? <p className="account-empty__desc">{description}</p> : null}
      {actionHref && actionLabel ? (
        <Link to={actionHref} className="account-btn account-btn--primary">
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

export function AccountInput(props) {
  return <input className="account-input" {...props} />;
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
