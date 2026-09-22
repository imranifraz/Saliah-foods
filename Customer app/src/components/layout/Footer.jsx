import { Link } from "react-router-dom";
import { useContactContent } from "../../context/ContactContentContext.jsx";
import { useHomeContent } from "../../context/HomeContentContext.jsx";
import { resolveMediaUrl } from "../../lib/api.js";

const FALLBACK_LOGO = "/assets/saliah-foods-logo.png";

const shopLinks = [
  { label: "Premium Dates", href: "/products/premium-dates" },
  { label: "Everyday Dates", href: "/products/dates" },
  { label: "Wellness Foods", href: "/products/wellness-traditional" },
  { label: "Best Sellers", href: "/products/best-sellers" },
];

const companyLinks = [
  { label: "Our Legacy", href: "/our-legacy" },
  { label: "Sourcing & Quality", href: "/sourcing-and-quality" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

const trustBadges = [
  { icon: "leaf", label: "Natural Ingredients" },
  { icon: "shield", label: "Secure Checkout" },
  { icon: "delivery", label: "Pan-India Delivery" },
];

function TrustIcon({ type }) {
  const cls = "h-4 w-4 shrink-0 text-gold-400";
  if (type === "leaf") {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c4-4 8-7.5 8-12a8 8 0 10-16 0c0 4.5 4 8 8 12z" />
      </svg>
    );
  }
  if (type === "shield") {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    );
  }
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12 0v-1.543a2.25 2.25 0 00-1.083-1.916l-2.682-1.34M6.75 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.5c-.621 0-1.125.504-1.125 1.125v2.625m0 0h15"
      />
    </svg>
  );
}

function FooterHeading({ children }) {
  return (
    <h3 className="font-body text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-400">
      {children}
    </h3>
  );
}

function FooterLink({ to, children, external = false }) {
  const className =
    "font-body text-sm text-cream-50/70 transition-colors duration-200 hover:text-gold-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400/50";

  if (external) {
    return (
      <a href={to} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  const { contact } = useContactContent();
  const { content, loading: homeLoading } = useHomeContent();
  const { email, phone, phoneTel, hours, address } = contact;
  const addressLine = address.split("\n")[0];
  const logoPath =
    content?.siteLogoLight || content?.siteLogo || (!homeLoading ? FALLBACK_LOGO : "");
  const logoSrc = logoPath ? resolveMediaUrl(logoPath) : "";

  return (
    <footer className="relative overflow-x-clip border-t border-emerald-900/8 bg-emerald-950 text-cream-50">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(212,165,116,0.12),transparent)]"
        aria-hidden
      />
      <div
        className="mx-auto h-px max-w-[min(100%,72rem)] bg-gradient-to-r from-transparent via-gold-400/50 to-transparent"
        aria-hidden
      />

      <div className="section-container relative pt-14 pb-8 sm:pt-16 md:pt-20 md:pb-10">
        <div className="grid gap-12 sm:gap-14 lg:grid-cols-12 lg:gap-10 xl:gap-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link
              to="/"
              className="inline-block rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400/50"
            >
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt="Saliah Foods"
                  width={150}
                  height={49}
                  className="block h-auto w-[100px] max-w-full bg-transparent object-contain object-left brightness-0 invert sm:w-[120px] md:w-[140px]"
                  decoding="async"
                  loading="lazy"
                />
              ) : (
                <span className="block h-[32px] w-[100px] sm:w-[120px] md:h-[45px] md:w-[140px]" aria-hidden />
              )}
            </Link>
            <p className="mt-5 max-w-sm font-body text-sm leading-relaxed text-cream-50/60">
              Premium dates, natural wellness foods, and artisan preserves — carefully sourced and
              packed for families who value quality and tradition.
            </p>

            <ul className="mt-6 flex flex-wrap gap-2.5" aria-label="Store highlights">
              {trustBadges.map((badge) => (
                <li
                  key={badge.label}
                  className="inline-flex items-center gap-2 rounded-full border border-cream-50/10 bg-cream-50/[0.04] px-3 py-1.5"
                >
                  <TrustIcon type={badge.icon} />
                  <span className="font-body text-[11px] font-medium text-cream-50/75">{badge.label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <FooterHeading>Stay in touch</FooterHeading>
              <p className="mt-3 max-w-xs font-body text-sm leading-relaxed text-cream-50/55">
                Seasonal offers, new arrivals, and wellness tips from our kitchen.
              </p>
              <Link
                to="/#newsletter"
                className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full border border-gold-400/35 bg-gold-400/10 px-6 py-2.5 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-300 transition-colors hover:border-gold-400/55 hover:bg-gold-400/15 hover:text-gold-200"
              >
                Join our newsletter
              </Link>
            </div>
          </div>

          {/* Shop */}
          <div className="lg:col-span-2">
            <FooterHeading>Shop</FooterHeading>
            <ul className="mt-5 flex flex-col gap-3">
              {shopLinks.map((item) => (
                <li key={item.href}>
                  <FooterLink to={item.href}>{item.label}</FooterLink>
                </li>
              ))}
              <li>
                <FooterLink to="/products">View all products</FooterLink>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <FooterHeading>Company</FooterHeading>
            <ul className="mt-5 flex flex-col gap-3">
              {companyLinks.map((item) => (
                <li key={item.href}>
                  <FooterLink to={item.href}>{item.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-4">
            <FooterHeading>Contact</FooterHeading>
            <ul className="mt-5 space-y-4 font-body text-sm text-cream-50/70">
              <li>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cream-50/40">Email</p>
                <a
                  href={`mailto:${email}`}
                  className="mt-1 inline-block transition-colors hover:text-gold-300"
                >
                  {email}
                </a>
              </li>
              <li>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cream-50/40">Phone</p>
                <a
                  href={`tel:${phoneTel.replace(/\s/g, "")}`}
                  className="mt-1 inline-block transition-colors hover:text-gold-300"
                >
                  {phone}
                </a>
              </li>
              <li>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cream-50/40">Hours</p>
                <p className="mt-1">{hours}</p>
              </li>
              <li>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cream-50/40">Location</p>
                <p className="mt-1 leading-relaxed text-cream-50/60">{addressLine}</p>
              </li>
            </ul>

            <div className="mt-6 flex flex-wrap gap-3">
              <FooterLink to="/contact">Get in touch</FooterLink>
              <span className="text-cream-50/20" aria-hidden>
                ·
              </span>
              <a
                href={`https://wa.me/${phoneTel.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-sm text-cream-50/70 transition-colors hover:text-gold-300"
              >
                WhatsApp us
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-cream-50/10 pt-8 sm:flex-row sm:gap-6">
          <p className="text-center font-body text-xs text-cream-50/40 sm:text-left">
            © {year} Saliah Foods. All rights reserved.
          </p>
          <nav aria-label="Footer legal and account links">
            <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-body text-xs text-cream-50/45">
              <li>
                <FooterLink to="/faq">Help centre</FooterLink>
              </li>
              <li>
                <FooterLink to="/contact">Support</FooterLink>
              </li>
              <li>
                <FooterLink to="/account">My account</FooterLink>
              </li>
              <li>
                <a
                  href="#main"
                  className="transition-colors hover:text-gold-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400/50"
                >
                  Back to top
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
