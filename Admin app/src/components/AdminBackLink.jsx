import { Link, useLocation } from "react-router-dom";

function BackArrowIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

/** Shared back control for nested admin screens. */
export function AdminBackLink({ to, label = "Back", className = "" }) {
  if (!to) return null;
  return (
    <Link
      to={to}
      className={`admin-muted inline-flex items-center gap-1.5 text-sm font-medium transition hover:text-[var(--admin-link)] ${className}`}
    >
      <BackArrowIcon />
      {label}
    </Link>
  );
}

/**
 * Resolve parent destination for nested admin routes.
 * Top-level sidebar pages return null (no back link).
 */
export function resolveAdminBackTarget(pathname) {
  const path = String(pathname || "").replace(/\/+$/, "") || "/";

  if (path === "/") return null;

  const topLevel = new Set([
    "/products",
    "/orders",
    "/users",
    "/admins",
    "/categories",
    "/inventory",
    "/reviews",
    "/transactions",
    "/payments",
    "/cms/pages",
    "/cms/blog",
    "/cms/enquiries",
  ]);
  if (topLevel.has(path)) return null;

  if (/^\/products\/[^/]+\/edit$/.test(path)) {
    return { to: "/products", label: "Back to products" };
  }
  if (/^\/orders\/[^/]+$/.test(path)) {
    return { to: "/orders", label: "Back to orders" };
  }
  if (/^\/users\/[^/]+$/.test(path)) {
    return { to: "/users", label: "Back to customers" };
  }
  if (/^\/admins\/[^/]+$/.test(path)) {
    return { to: "/admins", label: "Back to admins" };
  }
  if (/^\/categories\/(new|[^/]+\/edit)$/.test(path)) {
    return { to: "/categories", label: "Back to categories" };
  }
  if (/^\/cms\/blog\/[^/]+$/.test(path)) {
    return { to: "/cms/blog", label: "Back to blog posts" };
  }
  if (
    path === "/cms/home" ||
    path === "/cms/contact" ||
    path === "/cms/faq" ||
    path === "/cms/sourcing" ||
    path === "/cms/legacy" ||
    path.startsWith("/cms/pages/")
  ) {
    return { to: "/cms/pages", label: "Back to web content" };
  }
  if (path === "/account/profile") {
    return { to: "/", label: "Back to overview" };
  }

  return { to: "/", label: "Back to overview" };
}

/** Layout chrome: shows a parent back link on nested admin routes. */
export function AdminRouteBackNav() {
  const { pathname } = useLocation();
  const target = resolveAdminBackTarget(pathname);
  if (!target) return null;

  return (
    <div className="mb-4">
      <AdminBackLink to={target.to} label={target.label} />
    </div>
  );
}
