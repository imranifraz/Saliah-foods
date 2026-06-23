import { AdminLogo } from "./AdminLogo.jsx";
import { AdminThemeToggle } from "./AdminThemeToggle.jsx";

export function AdminLoginLayout({ theme, children }) {
  return (
    <div
      className="admin-shell admin-login-page grid min-h-screen min-h-dvh grid-cols-1 md:grid-cols-[45fr_55fr]"
      data-admin-theme={theme}
    >
      <div className="admin-login-page__toggle fixed right-4 top-4 z-30 sm:right-6 sm:top-5 lg:right-8 lg:top-6">
        <AdminThemeToggle className="admin-login-page__theme-toggle shadow-sm" />
      </div>

      <aside className="admin-login-brand relative hidden overflow-hidden md:flex md:flex-col md:justify-between md:p-10 md:pb-8 lg:p-12 lg:pb-10 xl:p-14 xl:pb-12">
        <img
          src="/date-based-products-category.webp"
          alt=""
          className="admin-login-brand__photo pointer-events-none absolute inset-0 h-full w-full object-cover"
          aria-hidden
        />
        <div className="admin-login-brand__overlay pointer-events-none absolute inset-0" aria-hidden />
        <div className="admin-login-brand__sheen pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-center py-8">
          <AdminLogo size="login" showTagline variant="brand" />
          <h1 className="admin-login-brand__headline mt-8 max-w-md font-display text-[clamp(2rem,3.2vw,2.75rem)] font-semibold leading-[1.12] text-white">
            Premium dates &amp; natural wellness
          </h1>
          <div className="admin-login-brand__divider mt-8 max-w-xs" aria-hidden />
          <p className="admin-login-brand__copy mt-7 max-w-sm text-[0.9375rem] font-medium leading-relaxed text-white">
            Back-office dashboard for orders, inventory, and customer operations.
          </p>
        </div>

        <p className="relative z-10 text-[11px] font-medium tracking-wide text-white/90">
          © {new Date().getFullYear()} Saliah Foods — Admin only
        </p>
      </aside>

      <div className="admin-login-panel relative flex flex-col items-center justify-center px-4 pb-8 pt-16 sm:px-6 sm:pb-10 sm:pt-[4.75rem] md:px-8 md:py-10 lg:px-10 lg:py-12 xl:px-14">
        <div className="admin-login-panel__glow pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative z-10 w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
