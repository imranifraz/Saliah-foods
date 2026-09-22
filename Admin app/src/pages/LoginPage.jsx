import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useAdminTheme } from "../context/AdminThemeContext.jsx";
import { AdminLogo } from "../components/AdminLogo.jsx";
import { AdminLoginLayout } from "../components/AdminLoginLayout.jsx";
import { getRememberMePreference, getRememberedCredentials, setRememberMePreference } from "../lib/api.js";

export function LoginPage() {
  const { user, login, sessionExpired } = useAuth();
  const { theme } = useAdminTheme();
  const logoVariant = theme === "dark" ? "dark" : "light";
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(() => getRememberMePreference());
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const redirectTo = location.state?.from?.pathname ?? "/";
  const passwordUpdated = location.state?.passwordUpdated;

  useEffect(() => {
    const saved = getRememberedCredentials();
    if (saved.email) setEmail(saved.email);
    if (location.state?.passwordUpdated) {
      setPassword("");
      setRememberMePreference(false);
      setRememberMe(false);
    }
  }, [location.state?.passwordUpdated]);

  if (user?.role === "admin") return <Navigate to={redirectTo} replace />;

  function handleRememberMeChange(checked) {
    setRememberMe(checked);
    if (!checked) {
      setRememberMePreference(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password, rememberMe);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err.status === 429 && err.retryAfterSeconds) {
        setError(`${err.message} Try again in ${err.retryAfterSeconds}s.`);
      } else {
        setError(err.message ?? "Login failed");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminLoginLayout theme={theme}>
      {sessionExpired ? (
        <p className="admin-login-card__error mb-4" role="status">
          Your session expired. Please sign in again.
        </p>
      ) : null}
      {passwordUpdated ? (
        <p className="admin-login-card__notice admin-login-card__notice--info mb-4" role="status">
          Password updated successfully. Sign in with your new password.
        </p>
      ) : null}
      <form onSubmit={handleSubmit} className="admin-login-card w-full">
        <header className="admin-login-card__header">
          <div className="mb-1 flex justify-center md:justify-start">
            <AdminLogo size="form" showTagline variant={logoVariant} />
          </div>
          <p className="admin-login-card__eyebrow">Welcome back</p>
          <h2 className="admin-login-card__title">Admin sign in</h2>
          <p className="admin-muted admin-login-card__subtitle">
            Enter your credentials to access orders, inventory, and store settings.
          </p>
        </header>

        {error ? (
          <p className="admin-login-card__error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="admin-login-card__fields">
          <label className="admin-login-card__label block">
            <span className="admin-label">Email</span>
            <div className="admin-login-field">
              <span className="admin-login-field__icon" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
              </span>
              <input
                id="admin-login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-input admin-login-field__input"
                placeholder="admin@saliahfoods.com"
                aria-invalid={Boolean(error)}
              />
            </div>
          </label>

          <label className="admin-login-card__label mt-5 block">
            <div className="admin-login-card__label-row">
              <span className="admin-label">Password</span>
              <Link to="/login/forgot-password" className="admin-login-card__forgot-link">
                Forgot password?
              </Link>
            </div>
            <div className="admin-login-field admin-login-field--password">
              <span className="admin-login-field__icon" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </span>
              <input
                id="admin-login-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-input admin-login-field__input"
                placeholder="Enter your password"
                aria-invalid={Boolean(error)}
              />
              <button
                type="button"
                className="admin-login-field__toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          <label className="admin-login-card__remember mt-4 flex cursor-pointer items-center gap-2.5">
            <input
              id="admin-login-remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => handleRememberMeChange(e.target.checked)}
              className="admin-login-card__remember-input h-4 w-4 rounded border-[var(--admin-border-strong)]"
            />
            <span className="text-sm text-[var(--admin-fg-muted)]">Remember me</span>
          </label>
        </div>

        <button type="submit" disabled={busy} className="admin-login-card__submit mt-5 w-full" aria-busy={busy}>
          {busy ? "Signing in…" : "Sign in to dashboard"}
        </button>

        <p className="admin-login-card__footnote">
          Authorized admin access only. Activity may be monitored for security.
        </p>
      </form>
    </AdminLoginLayout>
  );
}
