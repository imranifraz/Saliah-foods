import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { PageMeta } from "../components/pages/PageMeta";
import { AuthFormField } from "../components/auth/AuthFormField";
import { AuthPasswordField } from "../components/auth/AuthPasswordField";
import { AuthSplitLayout } from "../components/auth/AuthSplitLayout";
import {
  authCardClass,
  authCardHeaderClass,
  authErrorBannerClass,
  authFooterClass,
  authFooterLinkClass,
  authFormGridClass,
  authHeadingClass,
  authPerksClass,
  authSubmitClass,
  authSubtextClass,
} from "../components/auth/authFormStyles";
import { useAuth } from "../context/AuthContext";
import { validateRegisterForm } from "../data/auth";
import { checkApiHealth } from "../services/authApi.js";

const REGISTER_PERKS = [
  "Faster checkout",
  "Saved addresses",
  "Order tracking",
];

export function RegisterPage() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const { register, isAuthenticated } = useAuth();
  const [params] = useSearchParams();
  const redirectTo = params.get("redirect") || "/account";

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [apiOffline, setApiOffline] = useState(false);

  useEffect(() => {
    checkApiHealth()
      .then(() => setApiOffline(false))
      .catch(() => setApiOffline(true));
  }, []);

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
    const nextErrors = validateRegisterForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setFormError("");
    const result = await register(form);
    setSubmitting(false);

    if (!result.ok) {
      if (result.errors) setErrors(result.errors);
      else setFormError(result.error ?? "Could not create account. Is the backend running?");
      return;
    }

    navigate(redirectTo, { replace: true });
  };

  const isCheckoutRedirect = redirectTo.startsWith("/checkout");

  return (
    <>
      <PageMeta
        title="Create account"
        description="Create a Saliah Foods account to checkout and save delivery addresses."
      />

      <div className="relative pb-16 pt-[calc(var(--site-header)+2rem)] sm:pt-[calc(var(--site-header)+2.5rem)] md:pb-20">
        <div className="pdp-atmosphere pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative mx-auto w-full max-w-[52rem] px-4 sm:px-5">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={authCardClass}
          >
            <header className={authCardHeaderClass}>
              <h1 className={authHeadingClass}>Create account</h1>
              <p className={authSubtextClass}>
                {isCheckoutRedirect
                  ? "Create an account to complete your order."
                  : "Join Saliah Foods for a smoother shopping experience."}
              </p>
              <ul className={authPerksClass} aria-label="Account benefits">
                {REGISTER_PERKS.map((perk) => (
                  <li key={perk} className="flex items-center gap-1.5">
                    <span className="text-gold-500" aria-hidden>
                      ✓
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>
            </header>

            <AuthSplitLayout mode="register" onSocialSuccess={() => navigate(redirectTo, { replace: true })}>
              <form onSubmit={handleSubmit} className="w-full" noValidate>
                <div className={authFormGridClass}>
                  <AuthFormField
                    id="fullName"
                    label="Full name"
                    autoComplete="name"
                    placeholder="Your name"
                    value={form.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    error={errors.fullName}
                  />

                  <AuthFormField
                    id="email"
                    label="Email address"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    error={errors.email}
                  />

                  <AuthFormField
                    id="phone"
                    label="Mobile number"
                    type="tel"
                    autoComplete="tel"
                    inputMode="numeric"
                    placeholder="10-digit mobile"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                    error={errors.phone}
                    className="sm:col-span-2"
                    maxLength={10}
                  />

                  <AuthPasswordField
                    id="password"
                    label="Password"
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    error={errors.password}
                    hint={!errors.password ? "Minimum 6 characters" : undefined}
                  />

                  <AuthPasswordField
                    id="confirmPassword"
                    label="Confirm password"
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                    error={errors.confirmPassword}
                  />
                </div>

                {apiOffline ? (
                  <p className={`${authErrorBannerClass} mt-4`} role="alert">
                    Backend is offline. Start it with: cd Backend → npm run dev (port 3001). Accounts
                    only save to PostgreSQL when the API is running.
                  </p>
                ) : null}

                {formError ? (
                  <p className={`${authErrorBannerClass} mt-4`} role="alert">
                    {formError}
                  </p>
                ) : null}

                <button type="submit" className={`${authSubmitClass} mt-5`} disabled={submitting}>
                  {submitting ? "Creating account…" : "Create account"}
                </button>
              </form>
            </AuthSplitLayout>

            <p className={authFooterClass}>
              Already have an account?{" "}
              <Link
                to={`/login?redirect=${encodeURIComponent(redirectTo)}`}
                className={authFooterLinkClass}
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
