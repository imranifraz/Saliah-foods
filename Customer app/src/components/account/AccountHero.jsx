import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { OptimizedImage } from "../ui/OptimizedImage";

export function AccountHero({
  fullName = "",
  email = "",
  initials = "S",
  sectionLabel = "Personal details",
  ordersCount = 0,
  activeOrdersCount = 0,
  wishlistCount = 0,
  onSignOut,
}) {
  const reduce = useReducedMotion();
  const firstName = fullName.trim().split(/\s+/)[0] || "there";

  const stats = [
    { label: "Total orders", value: ordersCount },
    { label: "In progress", value: activeOrdersCount },
    { label: "Wishlist", value: wishlistCount },
  ];

  return (
    <section className="account-hero" aria-labelledby="account-hero-title">
      <div className="account-hero__panel">
        <div className="account-hero__glow" aria-hidden />
        <div className="account-hero__grid">
          <div className="account-hero__content">
            <nav className="account-hero__breadcrumb" aria-label="Breadcrumb">
              <Link to="/" className="transition-colors hover:text-emerald-800/80">
                Home
              </Link>
              <span className="mx-2 opacity-40">/</span>
              <span className="text-emerald-900/50">My account</span>
            </nav>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="account-hero__eyebrow"
            >
              Saliah member
            </motion.p>

            <motion.h1
              id="account-hero-title"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.04 }}
              className="account-hero__title"
            >
              Welcome back, {firstName}
            </motion.h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="account-hero__desc"
            >
              Manage your profile, orders, and preferences — currently viewing{" "}
              <span className="font-medium text-emerald-900/65">{sectionLabel}</span>.
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12 }}
              className="account-hero__profile"
            >
              <span className="account-hero__avatar" aria-hidden>
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-base text-emerald-900">{fullName || "Your profile"}</p>
                <p className="truncate font-body text-sm text-emerald-900/45">{email}</p>
              </div>
            </motion.div>

            <motion.ul
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.16 }}
              className="account-hero__stats"
              aria-label="Account overview"
            >
              {stats.map((stat) => (
                <li key={stat.label} className="account-hero__stat">
                  <span className="account-hero__stat-value">{stat.value}</span>
                  <span className="account-hero__stat-label">{stat.label}</span>
                </li>
              ))}
            </motion.ul>

            <div className="account-hero__divider" aria-hidden />
          </div>

          <div className="account-hero__visual" aria-hidden>
            <OptimizedImage
              src="/assets/brand-legacy.png"
              alt=""
              className="account-hero__image"
              width={720}
              height={480}
            />
            <div className="account-hero__visual-overlay" />
          </div>
        </div>

        <div className="account-hero__actions">
          <Link to="/products/all" className="account-hero__link">
            Continue shopping
          </Link>
          <button type="button" className="account-signout account-hero__signout" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </div>
    </section>
  );
}
