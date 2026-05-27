import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useAdminTheme } from "../context/AdminThemeContext.jsx";
import { AdminLogo } from "../components/AdminLogo.jsx";
import { AdminThemeToggle } from "../components/AdminThemeToggle.jsx";

export function LoginPage() {
  const { user, login } = useAuth();
  const { theme } = useAdminTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user?.role === "admin") return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message ?? "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-shell flex min-h-screen" data-admin-theme={theme}>
      <div className="absolute right-4 top-4 z-10">
        <AdminThemeToggle />
      </div>
      <div className="relative hidden w-[45%] gradient-emerald lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div>
          <AdminLogo size="login" showTagline />
          <h1 className="mt-6 max-w-sm font-display text-4xl font-semibold leading-tight text-cream-50">
            Premium dates &amp; natural wellness
          </h1>
          <div className="gold-line mt-8 max-w-xs" />
          <p className="admin-muted mt-6 max-w-xs">
            Back-office dashboard for orders, inventory, and customer operations.
          </p>
        </div>
        <p className="text-xs font-medium text-cream-50/55">© Saliah Foods — Admin only</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-[var(--admin-bg)] px-6 py-12">
        <form onSubmit={handleSubmit} className="admin-card w-full max-w-md p-8">
          <div className="mb-6 flex justify-center lg:justify-start">
            <AdminLogo size="form" variant="dark" showTagline />
          </div>
          <p className="admin-caption text-[var(--admin-link)]">Welcome back</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-[var(--admin-fg)]">Admin sign in</h2>
          <p className="admin-muted mt-2">Enter your credentials to continue</p>

          {error ? (
            <p className="mt-5 rounded-xl border border-red-400/35 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200">
              {error}
            </p>
          ) : null}

          <label className="mt-8 block">
            <span className="admin-label">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-input"
              placeholder="admin@saliahfoods.com"
            />
          </label>

          <label className="mt-5 block">
            <span className="admin-label">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-input"
              placeholder="••••••••"
            />
          </label>

          <button type="submit" disabled={busy} className="btn-primary mt-8 w-full">
            {busy ? "Signing in…" : "Sign in to dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
