import { Link } from "react-router-dom";
import { mainNav } from "../../data/navigation";
import { useHomeContent } from "../../context/HomeContentContext.jsx";
import { resolveMediaUrl } from "../../lib/api.js";

export function Footer() {
  const year = new Date().getFullYear();
  const { content: homeContent } = useHomeContent();

  return (
    <footer className="overflow-x-clip border-t border-emerald-900/8 bg-emerald-950 pt-14 pb-8 text-cream-50 sm:pt-16 md:pt-20 md:pb-10">
      <div className="section-container">
        <div className="grid gap-10 sm:gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <img
              src={resolveMediaUrl(homeContent.siteLogo) || "/assets/application-logo.png"}
              alt="Saliah Foods"
              className="h-12 w-auto rounded-xl sm:h-14 md:h-16 lg:h-[4.5rem]"
              width={595}
              height={131}
              loading="lazy"
              decoding="async"
            />
            <p className="mt-6 max-w-sm font-body text-sm leading-relaxed text-cream-50/55">
              Saliah Foods® — luxury gourmet dates, nuts, dry fruits, and artisan preserves for the
              international table.
            </p>
          </div>
          <div>
            <h3 className="font-body text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-400">
              Navigate
            </h3>
            <ul className="mt-5 flex flex-col gap-3">
              {mainNav.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="font-body text-sm text-cream-50/70 transition-colors hover:text-gold-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-body text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-400">
              Connect
            </h3>
            <ul className="mt-5 flex flex-col gap-3 font-body text-sm text-cream-50/70">
              <li>
                <Link to="/contact" className="transition-colors hover:text-gold-300">
                  Contact us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="transition-colors hover:text-gold-300">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/blog" className="transition-colors hover:text-gold-300">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-16 border-t border-cream-50/10 pt-8 text-center font-body text-xs text-cream-50/40">
          © {year} Saliah Foods. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
