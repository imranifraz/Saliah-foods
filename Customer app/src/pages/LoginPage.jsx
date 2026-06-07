import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { PageMeta } from "../components/pages/PageMeta";
import { AuthSplitLayout } from "../components/auth/AuthSplitLayout";
import { AuthPasswordField } from "../components/auth/AuthPasswordField";
import {
  authCardClass,
  authCardHeaderClass,
  authErrorBannerClass,
  authFieldClass,
  authFooterClass,
  authFooterLinkClass,
  authHeadingClass,
  authLabelClass,
  authSubmitClass,
  authSubtextClass,
  authSuccessBannerClass,
} from "../components/auth/authFormStyles";
import { useAuth } from "../context/AuthContext";
import { validateLoginForm } from "../data/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const reduce = useReducedMotion();
  const { login, isAuthenticated } = useAuth();
  const [params] = useSearchParams();
  const redirectTo = params.get("redirect") || "/account";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (formError) setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateLoginForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setFormError("");
    const result = await login(form);
    setSubmitting(false);

    if (!result.ok) {
      if (result.errors) setErrors(result.errors);
      else setFormError(result.error);
      return;
    }

    navigate(redirectTo, { replace: true });
  };

  const isCheckoutRedirect = redirectTo.startsWith("/checkout");
  const passwordUpdated = location.state?.passwordUpdated;

  return (
    <>
      <PageMeta title="Sign in" description="Sign in to your Saliah Foods account to checkout and manage orders." />

      <div className="relative pb-16 pt-[calc(var(--site-header)+2rem)] sm:pt-[calc(var(--site-header)+2.5rem)] md:pb-20">
        <div className="pdp-atmosphere pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative mx-auto w-full max-w-[44rem] px-4 sm:px-5">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={authCardClass}
          >
            <header className={authCardHeaderClass}>
              <h1 className={authHeadingClass}>Sign in</h1>
              <p className={authSubtextClass}>
                {isCheckoutRedirect
                  ? "Sign in to complete checkout."
                  : "Access your orders and saved addresses."}
              </p>
            </header>

            <AuthSplitLayout mode="login" onSocialSuccess={() => navigate(redirectTo, { replace: true })}>
              {passwordUpdated ? (
                <p className={`${authSuccessBannerClass} mb-4`} role="status">
                  Your password has been updated. Sign in with your new password.
                </p>
              ) : null}

              <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4" noValidate>
                <div className="w-full">
                  <label htmlFor="email" className={authLabelClass}>
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    className={authFieldClass}
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email ? (
                    <p className="mt-1 font-body text-sm text-red-800/90" role="alert">
                      {errors.email}
                    </p>
                  ) : null}
                </div>

                <AuthPasswordField
                  id="password"
                  label="Password"
                  autoComplete="current-password"
                  placeholder="Your password"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  error={errors.password}
                  className="w-full"
                />

                <p className="-mt-1 text-right font-body text-sm">
                  <Link
                    to={`/login/forgot-password?redirect=${encodeURIComponent(redirectTo)}`}
                    className={authFooterLinkClass}
                  >
                    Forgot password?
                  </Link>
                </p>

                {formError ? (
                  <p className={authErrorBannerClass} role="alert">
                    {formError}
                  </p>
                ) : null}

                <button type="submit" className={authSubmitClass} disabled={submitting}>
                  {submitting ? "Signing in…" : "Sign in"}
                </button>
              </form>
            </AuthSplitLayout>

            <p className={authFooterClass}>
              New here?{" "}
              <Link
                to={`/register?redirect=${encodeURIComponent(redirectTo)}`}
                className={authFooterLinkClass}
              >
                Create an account
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
