import { Link } from "react-router-dom";
import { Reveal } from "../ui/Reveal";

export function PageShell({ breadcrumb, title, subtitle, children }) {
  return (
    <div className="bg-cream-50 pb-20 pt-28 md:pt-32">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-5 md:px-10">
        <nav className="font-body text-xs text-emerald-900/50" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-emerald-800">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-emerald-900">{breadcrumb}</span>
        </nav>

        <Reveal>
          <header className="mt-6 max-w-3xl">
            <h1 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-medium text-emerald-900">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-3 font-body text-base leading-relaxed text-emerald-900/65 md:text-lg">
                {subtitle}
              </p>
            ) : null}
          </header>
        </Reveal>

        {children}
      </div>
    </div>
  );
}
