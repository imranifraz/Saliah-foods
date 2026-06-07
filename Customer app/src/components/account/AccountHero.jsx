import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { OptimizedImage } from "../ui/OptimizedImage";
import { AccountProfileAvatar } from "./AccountProfileAvatar";

export function AccountHero({
  fullName = "",
  email = "",
  phone = "",
  avatarUrl = "",
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
        <div className="account-hero__sheen" aria-hidden />
        <div className="account-hero__glow account-hero__glow--gold" aria-hidden />
        <div className="account-hero__glow account-hero__glow--emerald" aria-hidden />
        <div className="account-hero__grid">
          <div className="account-hero__content">
            <div className="account-hero__header">
              <nav className="account-hero__breadcrumb" aria-label="Breadcrumb">
                <Link to="/" className="account-hero__breadcrumb-link">
                  Home
                </Link>
                <span className="account-hero__breadcrumb-sep" aria-hidden>
                  /
                </span>
                <span className="account-hero__breadcrumb-current">My account</span>
              </nav>

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
            </div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12 }}
              className="account-hero__profile"
            >
              <div className="account-hero__profile-main">
                <AccountProfileAvatar name={fullName} avatarUrl={avatarUrl} size="md" className="account-hero__avatar" />
                <div className="min-w-0">
                  <p className="truncate font-display text-base text-emerald-900">{fullName || "Your profile"}</p>
                  {email ? (
                    <p className="truncate font-body text-sm text-emerald-900/45">{email}</p>
                  ) : null}
                  {phone ? (
                    <p className="truncate font-body text-sm text-emerald-900/45">+91 {phone}</p>
                  ) : null}
                </div>
              </div>
              <p className="account-hero__profile-badge">Saliah member</p>
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
            <div className="account-hero__visual-frame">
              <OptimizedImage
                src="/assets/brand-legacy.png"
                alt=""
                className="account-hero__image"
                width={720}
                height={480}
              />
            </div>
          </div>
        </div>

        <div className="account-hero__visual-mobile lg:hidden" aria-hidden>
          <div className="account-hero__visual-frame">
            <OptimizedImage
              src="/assets/brand-legacy.png"
              alt=""
              className="account-hero__image"
              width={720}
              height={320}
            />
          </div>
        </div>

        <div className="account-hero__actions">
          <Link to="/products" className="account-hero__link">
            <svg className="account-hero__link-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
              <path d="M6 6h15l-1.5 9h-12z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 6V4a3 3 0 0 1 6 0v2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
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
