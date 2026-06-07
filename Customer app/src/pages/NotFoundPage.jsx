import { Link } from "react-router-dom";
import { PageMeta } from "../components/pages/PageMeta";
import { Reveal } from "../components/ui/Reveal";

export function NotFoundPage() {
  return (
    <>
      <PageMeta
        title="Page not found"
        description="The page you are looking for could not be found on Saliah Foods."
      />

      <div className="relative min-h-[calc(100svh-var(--site-header)-8rem)] bg-cream-50 pb-20 pt-[calc(var(--site-header)+2.5rem)] md:pb-28 md:pt-[calc(var(--site-header)+3rem)]">
        <div className="pdp-atmosphere pointer-events-none absolute inset-0" aria-hidden />

        <div className="relative mx-auto max-w-[40rem] px-4 text-center sm:px-5">
          <Reveal>
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-600/90">
              Error 404
            </p>
            <h1 className="mt-3 font-display text-[clamp(2rem,6vw,3rem)] font-medium leading-tight text-emerald-900">
              Page not found
            </h1>
            <p className="mx-auto mt-4 max-w-md font-body text-base leading-relaxed text-emerald-900/55">
              The link may be broken or the page may have moved. Head back home or explore our collection.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/"
                className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-full gradient-gold px-8 py-3 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-md shadow-gold-500/20 sm:w-auto"
              >
                Back to home
              </Link>
              <Link
                to="/products"
                className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-full border border-emerald-900/12 bg-white/90 px-8 py-3 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-900/70 transition hover:border-emerald-900/20 hover:text-emerald-900 sm:w-auto"
              >
                Shop products
              </Link>
            </div>

            <p className="mt-8 font-body text-sm text-emerald-900/45">
              Need help?{" "}
              <Link to="/contact" className="font-medium text-emerald-800 underline-offset-2 hover:underline">
                Contact us
              </Link>
            </p>
          </Reveal>
        </div>
      </div>
    </>
  );
}
