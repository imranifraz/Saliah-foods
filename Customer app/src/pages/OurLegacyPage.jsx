import { PageMeta } from "../components/pages/PageMeta";
import { Reveal } from "../components/ui/Reveal";
import { OptimizedImage } from "../components/ui/OptimizedImage";
import { RichText } from "../components/ui/RichText.jsx";
import { resolveMediaUrl } from "../lib/api.js";
import { LegacyContentProvider, useLegacyContent } from "../context/LegacyContentContext.jsx";

function OurLegacyPageInner() {
  const { legacy, loading } = useLegacyContent();

  if (loading) {
    return (
      <div className="bg-cream-50 pb-20 pt-[calc(var(--site-header)+2rem)]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-5 md:px-10">
          <p className="font-body text-sm text-emerald-900/55">Loading…</p>
        </div>
      </div>
    );
  }

  const {
    title,
    metaDescription,
    heroEyebrow,
    heroTitle,
    heroText,
    heroImage,
    heroImageAlt,
    founderEyebrow,
    founderTitle,
    founderText,
    founderImage,
    founderImageAlt,
    highlights,
    storyLabel,
    storyQuote,
    storyParagraphs,
    signatureImage,
    signatureName,
    signatureRole,
  } = legacy;

  return (
    <>
      <PageMeta title={title} description={metaDescription} />

      <div className="bg-cream-50 pb-20">
        <section className="pt-[calc(var(--site-header)+0.35rem)]">
          <div className="relative min-h-[16rem] overflow-hidden sm:min-h-[19rem] lg:min-h-[22rem]">
            <OptimizedImage
              src={heroImage}
              alt={heroImageAlt}
              className="absolute inset-0 h-full w-full object-cover"
              width={1600}
              height={900}
              priority
              sizes="100vw"
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 via-emerald-950/45 to-emerald-900/20"
              aria-hidden
            />
            <div className="relative mx-auto flex min-h-[inherit] max-w-[1440px] items-end px-4 pb-8 sm:px-5 md:px-10 lg:pb-12">
              <Reveal className="max-w-3xl">
                <p className="font-body text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-300/90">
                  {heroEyebrow}
                </p>
                <h1 className="mt-3 font-display text-[clamp(2rem,4.7vw,4rem)] font-medium leading-[1.08] text-cream-50">
                  {heroTitle}
                </h1>
                <RichText
                  html={heroText}
                  className="mt-4 max-w-2xl font-body text-sm leading-relaxed text-cream-50/78 sm:text-base"
                />
              </Reveal>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 pt-10 sm:px-5 md:px-10 md:pt-14">
          <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-12">
            <Reveal>
              <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-luxury-lg">
                <OptimizedImage
                  src={founderImage}
                  alt={founderImageAlt}
                  className="aspect-[1/1] w-full object-cover"
                  width={900}
                  height={900}
                  sizes="(max-width: 1024px) 100vw, 42vw"
                />
              </div>
            </Reveal>

            <Reveal delay={0.06}>
              <p className="font-body text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-600">
                {founderEyebrow}
              </p>
              <h2 className="mt-3 font-display text-[clamp(1.85rem,3vw,2.75rem)] font-medium leading-tight text-emerald-900">
                {founderTitle}
              </h2>
              <RichText
                html={founderText}
                className="mt-5 font-body text-[15px] leading-relaxed text-emerald-900/72 sm:text-base"
              />
            </Reveal>
          </section>

          <section className="mt-8 grid gap-4 md:grid-cols-3">
            {highlights.map((item, index) => (
              <Reveal key={`${item.title}-${index}`} delay={index * 0.05}>
                <article className="h-full rounded-[1.5rem] border border-emerald-900/8 bg-white px-5 py-5 shadow-luxury">
                  <h3 className="font-display text-lg font-medium leading-snug text-emerald-900">
                    {item.title}
                  </h3>
                  <RichText
                    html={item.text}
                    className="mt-3 font-body text-sm leading-relaxed text-emerald-900/62"
                  />
                </article>
              </Reveal>
            ))}
          </section>

          <section className="mt-16 grid gap-10 lg:grid-cols-[0.82fr_minmax(0,1.18fr)] lg:gap-14">
            <Reveal>
              <div className="rounded-[1.75rem] bg-cream-100 px-6 py-7 shadow-luxury md:px-8 md:py-9">
                <p className="font-display text-[clamp(2rem,3vw,3rem)] font-medium leading-tight text-gold-600">
                  {storyLabel}
                </p>
                <RichText
                  as="blockquote"
                  html={storyQuote}
                  className="mt-6 max-w-sm font-display text-[clamp(1.4rem,2.4vw,2rem)] font-medium italic leading-snug text-emerald-900"
                />
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="max-w-3xl">
                {storyParagraphs.map((paragraph, index) => (
                  <RichText
                    key={index}
                    html={paragraph}
                    className="mt-5 font-body text-[15px] leading-relaxed text-emerald-900/72 first:mt-0 sm:text-base"
                  />
                ))}

                <div className="mt-8">
                  {signatureImage ? (
                    <OptimizedImage
                      src={resolveMediaUrl(signatureImage)}
                      alt={`Signature of ${signatureName}`}
                      pictureClassName="inline-block"
                      className="h-10 w-auto opacity-90 sm:h-12"
                      loading="lazy"
                    />
                  ) : null}
                  <div className="mt-3 flex items-center gap-2">
                    <p className="font-body text-sm font-semibold text-emerald-900">{signatureName}</p>
                    <span className="text-emerald-900/25">/</span>
                    <p className="font-body text-xs uppercase tracking-[0.18em] text-emerald-900/45">
                      {signatureRole}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </section>
        </div>
      </div>
    </>
  );
}

export function OurLegacyPage() {
  return (
    <LegacyContentProvider>
      <OurLegacyPageInner />
    </LegacyContentProvider>
  );
}
