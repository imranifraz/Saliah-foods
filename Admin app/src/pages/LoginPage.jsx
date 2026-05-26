import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { AdminLogo } from "../components/AdminLogo.jsx";

export function LoginPage() {
  const { user, login } = useAuth();
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
    <div className="flex min-h-screen">
      <div className="relative hidden w-[45%] gradient-emerald lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div>
          <AdminLogo size="login" showTagline />
          <h1 className="mt-6 max-w-sm font-display text-4xl font-medium leading-tight text-cream-50">
            Premium dates &amp; natural wellness
          </h1>
          <div className="gold-line mt-8 max-w-xs" />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-cream-50/70">
            Back-office dashboard for orders, inventory, and customer operations.
          </p>
        </div>
        <p className="text-xs text-cream-50/40">© Saliah Foods — Admin only</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-cream-50 px-6 py-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md admin-card p-8 shadow-xl"
        >
          <div className="mb-6 flex justify-center lg:justify-start">
            <AdminLogo size="form" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">Welcome back</p>
          <h2 className="mt-2 font-display text-3xl font-medium text-emerald-900">Admin sign in</h2>
          <p className="mt-2 text-sm text-emerald-900/55">Enter your credentials to continue</p>

          {error && (
            <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

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
