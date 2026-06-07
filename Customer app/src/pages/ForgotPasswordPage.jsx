import { Link, Navigate, useSearchParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { PageMeta } from "../components/pages/PageMeta";
import { ForgotPasswordForm } from "../components/auth/ForgotPasswordForm";
import {
  authCardClass,
  authCardHeaderClass,
  authFooterClass,
  authFooterLinkClass,
  authHeadingClass,
  authSubtextClass,
} from "../components/auth/authFormStyles";
import { useAuth } from "../context/AuthContext";

export function ForgotPasswordPage() {
  const reduce = useReducedMotion();
  const { isAuthenticated } = useAuth();
  const [params] = useSearchParams();
  const redirectTo = params.get("redirect") || "/login";

  if (isAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  return (
    <>
      <PageMeta
        title="Reset password"
        description="Reset your Saliah Foods account password with a verification code sent to your email."
      />

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
              <h1 className={authHeadingClass}>Reset password</h1>
              <p className={authSubtextClass}>
                Enter your account email. We&apos;ll send a 6-digit verification code so you can set a new
                password.
              </p>
            </header>

            <ForgotPasswordForm redirectTo={redirectTo.startsWith("/login") ? redirectTo : "/login"} />

            <p className={authFooterClass}>
              <Link to={redirectTo.startsWith("/login") ? redirectTo : "/login"} className={authFooterLinkClass}>
                ← Back to sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
