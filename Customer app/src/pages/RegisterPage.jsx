import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { PageMeta } from "../components/pages/PageMeta";
import { AuthFormField } from "../components/auth/AuthFormField";
import { AuthPhoneField } from "../components/auth/AuthPhoneField";
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
  authSubmitClass,
  authSubtextClass,
} from "../components/auth/authFormStyles";
import { RegisterSuccessModal } from "../components/auth/RegisterSuccessModal";
import { useAuth } from "../context/AuthContext";
import { validateRegisterField, validateRegisterForm } from "../data/auth";
import { checkApiHealth } from "../services/authApi.js";

export function RegisterPage() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const { register, isAuthenticated, resendVerificationEmail, user } = useAuth();
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
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [apiOffline, setApiOffline] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState("");

  useEffect(() => {
    checkApiHealth()
      .then(() => setApiOffline(false))
      .catch(() => setApiOffline(true));
  }, []);

  if (isAuthenticated && !registrationComplete) {
    return <Navigate to={redirectTo} replace />;
  }

  const showFieldError = (name) => ((touched[name] || submitAttempted) ? errors[name] : undefined);

  const setFieldError = (name, nextForm) => {
    const message = validateRegisterField(name, nextForm);
    setErrors((prev) => ({ ...prev, [name]: message }));
  };

  const updateField = (name, value) => {
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);
    if (formError) setFormError("");

    if (touched[name] || submitAttempted) {
      setErrors((prev) => {
        const next = {
          ...prev,
          [name]: validateRegisterField(name, nextForm),
        };
        if (name === "password" && (touched.confirmPassword || submitAttempted)) {
          next.confirmPassword = validateRegisterField("confirmPassword", nextForm);
        }
        return next;
      });
    } else if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFieldBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFieldError(name, form);
    if (name === "password" && (touched.confirmPassword || form.confirmPassword)) {
      setTouched((prev) => ({ ...prev, confirmPassword: true }));
      setFieldError("confirmPassword", form);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitAttempted(true);
    const nextErrors = validateRegisterForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setTouched({
        fullName: true,
        email: true,
        phone: true,
        password: true,
        confirmPassword: true,
      });
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

    setRegistrationComplete(true);
    setRegistrationMessage(
      result.message ??
        "Account created. We sent a verification link to your email — verify before checkout."
    );
  };

  const isCheckoutRedirect = redirectTo.startsWith("/checkout");

  const handleContinueAfterRegister = () => {
    navigate(redirectTo, { replace: true });
  };

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
                  : "Save addresses, track orders, and checkout faster."}
              </p>
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
                      onBlur={() => handleFieldBlur("fullName")}
                      error={showFieldError("fullName")}
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
                      onBlur={() => handleFieldBlur("email")}
                      error={showFieldError("email")}
                    />

                    <AuthPhoneField
                      id="phone"
                      label="Mobile number"
                      placeholder="9876543210"
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                      onBlur={() => handleFieldBlur("phone")}
                      error={showFieldError("phone")}
                      className="sm:col-span-2"
                    />

                    <AuthPasswordField
                      id="password"
                      label="Password"
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      value={form.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      onBlur={() => handleFieldBlur("password")}
                      error={showFieldError("password")}
                      hint={!showFieldError("password") ? "Minimum 8 characters" : undefined}
                    />

                    <AuthPasswordField
                      id="confirmPassword"
                      label="Confirm password"
                      autoComplete="new-password"
                      placeholder="Re-enter password"
                      value={form.confirmPassword}
                      onChange={(e) => updateField("confirmPassword", e.target.value)}
                      onBlur={() => handleFieldBlur("confirmPassword")}
                      error={showFieldError("confirmPassword")}
                    />
                  </div>

                  {apiOffline ? (
                    <p className={`${authErrorBannerClass} mt-4`} role="alert">
                      Backend is offline. Start it with: cd Backend → npm run dev (port 3001).
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

      {registrationComplete ? (
        <RegisterSuccessModal
          email={user?.email ?? form.email}
          message={registrationMessage}
          onResend={resendVerificationEmail}
          onContinue={handleContinueAfterRegister}
          continueLabel={isCheckoutRedirect ? "Continue to checkout" : "Go to my account"}
        />
      ) : null}
    </>
  );
}
