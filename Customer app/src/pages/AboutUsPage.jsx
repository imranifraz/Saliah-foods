import { Link } from "react-router-dom";
import { aboutUs } from "../data/pages";
import { homepageImages } from "../data/homepage";
import { PageMeta } from "../components/pages/PageMeta";
import { PageShell } from "../components/pages/PageShell";
import { OptimizedImage } from "../components/ui/OptimizedImage";
import { Reveal } from "../components/ui/Reveal";

export function AboutUsPage() {
  const { title, subtitle, story, values, stats } = aboutUs;

  return (
    <>
      <PageMeta
        title={title}
        description="Discover the Saliah Foods story — premium dates, natural wellness foods, and a commitment to quality."
      />
      <PageShell breadcrumb={title} title={title} subtitle={subtitle}>
        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            {story.map((para) => (
              <p key={para.slice(0, 40)} className="mt-5 font-body text-base leading-relaxed text-emerald-900/70 first:mt-0">
                {para}
              </p>
            ))}
          </Reveal>
          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-2xl shadow-luxury-lg">
              <OptimizedImage
                src={homepageImages.brandLegacy}
                alt="Saliah Foods — premium dates and natural wellness"
                className="aspect-[4/3] w-full object-cover"
                width={1200}
                height={900}
              />
            </div>
          </Reveal>
        </div>

        <ul className="mt-16 grid gap-6 sm:grid-cols-3">
          {stats.map((item, i) => (
            <Reveal key={item.label} delay={i * 0.05}>
              <li className="rounded-2xl border border-emerald-900/8 bg-white px-6 py-8 text-center shadow-luxury">
                <p className="font-display text-3xl font-medium text-gold-600">{item.value}</p>
                <p className="mt-2 font-body text-sm text-emerald-900/60">{item.label}</p>
              </li>
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-16">
          <h2 className="font-display text-2xl font-medium text-emerald-900">What we stand for</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {values.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-emerald-900/8 bg-cream-100 p-6 md:p-8"
              >
                <h3 className="font-display text-lg font-medium text-emerald-900">{item.title}</h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-emerald-900/65">{item.text}</p>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-16 flex flex-wrap gap-4">
          <Link
            to="/sourcing-and-quality"
            className="inline-flex rounded-full border border-emerald-900/15 px-7 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-900 transition-colors hover:bg-emerald-900 hover:text-cream-50"
          >
            Sourcing & quality
          </Link>
          <Link
            to="/products/dates"
            className="inline-flex rounded-full gradient-gold px-7 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-md shadow-gold-500/25"
          >
            Explore products
          </Link>
        </Reveal>
      </PageShell>
    </>
  );
}
