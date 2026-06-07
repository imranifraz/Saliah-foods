import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { PageMeta } from "../components/pages/PageMeta";
import { EmailVerificationBanner } from "../components/auth/EmailVerificationBanner";
import {
  authCardClass,
  authCardHeaderClass,
  authErrorBannerClass,
  authFooterClass,
  authFooterLinkClass,
  authHeadingClass,
  authSubmitClass,
  authSubtextClass,
  authSuccessBannerClass,
} from "../components/auth/authFormStyles";
import { useAuth } from "../context/AuthContext";

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [params, setParams] = useSearchParams();
  const { user, isAuthenticated, emailVerified, verifyEmail, resendVerificationEmail } = useAuth();

  const token = params.get("token");
  const [status, setStatus] = useState(token ? "verifying" : "idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return undefined;

    let cancelled = false;

    async function run() {
      setStatus("verifying");
      setError("");
      const result = await verifyEmail(token);
      if (cancelled) return;

      if (!result.ok) {
        setStatus("error");
        setError(result.error ?? "Verification failed");
        return;
      }

      setStatus("verified");
      setMessage(result.message ?? "Email verified successfully.");
      setParams({}, { replace: true });
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [token, verifyEmail, setParams]);

  if (emailVerified && status !== "verifying") {
    return (
      <>
        <PageMeta title="Email verified" description="Your Saliah Foods email address is verified." />
        <AuthShell reduce={reduce}>
          <div className={authSuccessBannerClass} role="status">
            Your email is verified. You can checkout and place orders.
          </div>
          <button type="button" className={`${authSubmitClass} mt-5`} onClick={() => navigate("/account")}>
            Go to my account
          </button>
        </AuthShell>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="Verify email"
        description="Verify your Saliah Foods account email to enable checkout."
      />

      <AuthShell reduce={reduce}>
        <header className={authCardHeaderClass}>
          <h1 className={authHeadingClass}>
            {status === "verified" ? "Email verified" : "Verify your email"}
          </h1>
          <p className={authSubtextClass}>
            {status === "verified"
              ? "You're all set to checkout and track orders."
              : "Open the link we emailed you, or request a new one below."}
          </p>
        </header>

        {status === "verifying" ? (
          <p className="font-body text-sm text-emerald-900/55">Verifying your email…</p>
        ) : null}

        {status === "verified" ? (
          <div className={authSuccessBannerClass} role="status">
            {message}
          </div>
        ) : null}

        {status === "error" && error ? (
          <p className={authErrorBannerClass} role="alert">
            {error}
          </p>
        ) : null}

        {isAuthenticated && user?.email && !emailVerified ? (
          <EmailVerificationBanner
            email={user.email}
            onResend={resendVerificationEmail}
            className="mt-4"
          />
        ) : !isAuthenticated ? (
          <p className="mt-4 font-body text-sm text-emerald-900/55">
            Sign in to resend a verification email, or use the link from your inbox.
          </p>
        ) : null}

        {status === "verified" ? (
          <button type="button" className={`${authSubmitClass} mt-5`} onClick={() => navigate("/checkout")}>
            Continue to checkout
          </button>
        ) : (
          <button type="button" className={`${authSubmitClass} mt-5`} onClick={() => navigate(isAuthenticated ? "/account" : "/login")}>
            {isAuthenticated ? "Back to account" : "Sign in"}
          </button>
        )}

        <p className={authFooterClass}>
          {isAuthenticated ? (
            <>
              Wrong inbox?{" "}
              <button
                type="button"
                className={authFooterLinkClass}
                onClick={() => navigate("/account?tab=personal")}
              >
                Update email in profile
              </button>
            </>
          ) : (
            <>
              Have an account?{" "}
              <Link to="/login" className={authFooterLinkClass}>
                Sign in
              </Link>
            </>
          )}
        </p>
      </AuthShell>
    </>
  );
}

function AuthShell({ reduce, children }) {
  return (
    <div className="relative pb-16 pt-[calc(var(--site-header)+2rem)] sm:pt-[calc(var(--site-header)+2.5rem)] md:pb-20">
      <div className="pdp-atmosphere pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto w-full max-w-[44rem] px-4 sm:px-5">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className={authCardClass}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
