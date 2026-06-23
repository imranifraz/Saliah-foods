import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useAdminTheme } from "../context/AdminThemeContext.jsx";
import { AdminLogo } from "../components/AdminLogo.jsx";
import { AdminLoginLayout } from "../components/AdminLoginLayout.jsx";
import { ForgotPasswordForm } from "../components/ForgotPasswordForm.jsx";

export function ForgotPasswordPage() {
  const { user } = useAuth();
  const { theme } = useAdminTheme();
  const logoVariant = theme === "dark" ? "dark" : "light";

  if (user?.role === "admin") return <Navigate to="/" replace />;

  return (
    <AdminLoginLayout theme={theme}>
      <div className="admin-login-card w-full">
        <header className="admin-login-card__header">
          <div className="mb-1 flex justify-center md:justify-start">
            <AdminLogo size="form" showTagline variant={logoVariant} />
          </div>
          <p className="admin-login-card__eyebrow">Account recovery</p>
          <h2 className="admin-login-card__title">Reset with OTP</h2>
          <p className="admin-muted admin-login-card__subtitle">
            Enter your admin email. We will send a 6-digit verification code to reset your password.
          </p>
        </header>

        <ForgotPasswordForm showCancel={false} />

        <p className="admin-login-card__back mt-5 text-center">
          <Link to="/login" className="admin-login-card__forgot-link">
            ← Back to sign in
          </Link>
        </p>

        <p className="admin-login-card__footnote">
          Authorized admin access only. Activity may be monitored for security.
        </p>
      </div>
    </AdminLoginLayout>
  );
}
