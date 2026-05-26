import { Link } from "react-router-dom";
import { sourcingQuality } from "../data/pages";
import { homepageImages } from "../data/homepage";
import { PageMeta } from "../components/pages/PageMeta";
import { PageShell } from "../components/pages/PageShell";
import { OptimizedImage } from "../components/ui/OptimizedImage";
import { Reveal } from "../components/ui/Reveal";

export function SourcingQualityPage() {
  const { title, subtitle, intro, pillars, steps, commitments } = sourcingQuality;

  return (
    <>
      <PageMeta
        title={title}
        description="Learn how Saliah Foods sources, inspects, and packs premium dates and natural wellness products."
      />
      <PageShell breadcrumb={title} title={title} subtitle={subtitle}>
        <Reveal className="mt-10">
          <p className="max-w-3xl font-body text-base leading-relaxed text-emerald-900/70">{intro}</p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.05}>
              <article className="h-full rounded-2xl border border-emerald-900/8 bg-white p-6 shadow-luxury">
                <h2 className="font-display text-lg font-medium text-emerald-900">{item.title}</h2>
                <p className="mt-3 font-body text-sm leading-relaxed text-emerald-900/65">{item.text}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 overflow-hidden rounded-2xl shadow-luxury-lg">
          <OptimizedImage
            src={homepageImages.brandLegacy}
            alt="Saliah Foods quality selection of dates and wellness products"
            className="aspect-[21/9] w-full object-cover"
            width={1400}
            height={600}
          />
        </Reveal>

        <Reveal className="mt-16">
          <h2 className="font-display text-2xl font-medium text-emerald-900">Our quality journey</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((item) => (
              <li
                key={item.step}
                className="relative rounded-2xl border border-emerald-900/8 bg-cream-100 p-6"
              >
                <span className="font-display text-3xl font-medium text-gold-500/80">{item.step}</span>
                <h3 className="mt-3 font-display text-lg font-medium text-emerald-900">{item.title}</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-emerald-900/65">{item.text}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal className="mt-16 rounded-2xl marble-texture p-8 md:p-10">
          <h2 className="font-display text-xl font-medium text-emerald-900">Our commitments</h2>
          <ul className="mt-6 space-y-3">
            {commitments.map((item) => (
              <li key={item} className="flex gap-3 font-body text-sm text-emerald-900/70">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <Link
            to="/products/premium-dates"
            className="mt-8 inline-flex rounded-full gradient-gold px-7 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-md shadow-gold-500/25"
          >
            Shop premium dates
          </Link>
        </Reveal>
      </PageShell>
    </>
  );
}
