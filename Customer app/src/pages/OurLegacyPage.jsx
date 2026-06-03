import { PageMeta } from "../components/pages/PageMeta";
import { Reveal } from "../components/ui/Reveal";
import { OptimizedImage } from "../components/ui/OptimizedImage";
import { resolveMediaUrl } from "../lib/api.js";

const legacyHighlights = [
  {
    icon: "🌴",
    title: "South India's First Date Palm Pioneer",
    text: "Paved the way for date cultivation in South India, inspiring countless farmers across the region.",
  },
  {
    icon: "🇸🇦",
    title: "Expertise From the Heart of Arabia",
    text: "Gained years of hands-on experience working in Saudi Arabia's renowned date farms.",
  },
  {
    icon: "🌱",
    title: "A Legacy of Passion & Purpose",
    text: "What began as one man's dream has grown into a flourishing movement in sustainable farming.",
  },
];

const storyParagraphs = [
  "Our story began over three decades ago, among lush date farms in Saudi Arabia. I spent years across fields, growing and cultivating prized dates. My dream was to bring date cultivation back home to the fertile soils of India.",
  "Since 1992, I began to realise my vision. I was the first farmer to start a full-fledged date palm plantation in South India. At Saliah Dates, we have firm roots supporting farmers and harvest gardens of splendour.",
  "Today, we carry sun-ripened Arabian and local date varieties, bursting with nutrients and goodness. Dates are a superfood that spans across cultures and traditions. Discover our delightful collection, one date at a time.",
];

export function OurLegacyPage() {
  return (
    <>
      <PageMeta
        title="Our Legacy"
        description="Discover the Saliah legacy shaped by pioneering date palm farming in South India and decades of trust, care, and cultivation."
      />

      <div className="bg-cream-50 pb-20">
        <section className="pt-[calc(var(--site-header)+0.35rem)]">
          <div className="relative min-h-[16rem] overflow-hidden sm:min-h-[19rem] lg:min-h-[22rem]">
            <OptimizedImage
              src="/assets/brand-legacy.png"
              alt="Saliah Foods legacy with premium dates and palm farm roots"
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
                  Our Legacy
                </p>
                <h1 className="mt-3 font-display text-[clamp(2rem,4.7vw,4rem)] font-medium leading-[1.08] text-cream-50">
                  Rooted in trust. Grown with legacy.
                </h1>
                <p className="mt-4 max-w-2xl font-body text-sm leading-relaxed text-cream-50/78 sm:text-base">
                  A story of pioneering date palm cultivation, Arabian farming knowledge, and a lifelong
                  promise to bring honest nourishment back home to India.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 pt-10 sm:px-5 md:px-10 md:pt-14">
          <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-12">
            <Reveal>
              <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-luxury-lg">
                <OptimizedImage
                  src="/assets/our-legacy-founder.png"
                  alt="Founder S. Nizamuddeen holding a fresh bunch of dates in the farm"
                  className="aspect-[1/1] w-full object-cover"
                  width={900}
                  height={900}
                  sizes="(max-width: 1024px) 100vw, 42vw"
                />
              </div>
            </Reveal>

            <Reveal delay={0.06}>
              <p className="font-body text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-600">
                Our Root
              </p>
              <h2 className="mt-3 font-display text-[clamp(1.85rem,3vw,2.75rem)] font-medium leading-tight text-emerald-900">
                Built by a pioneer of date palm farming in South India.
              </h2>
              <p className="mt-5 font-body text-[15px] leading-relaxed text-emerald-900/72 sm:text-base">
                Our founder, S. Nizamuddeen, is widely recognized as a pioneer in date palm farming in
                India, celebrated as the first to cultivate date palms in South India. He previously
                worked at several date farms across Saudi Arabia before returning to India to grow his own
                dates.
              </p>
            </Reveal>
          </section>

          <section className="mt-8 grid gap-4 md:grid-cols-3">
            {legacyHighlights.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.05}>
                <article className="h-full rounded-[1.5rem] border border-emerald-900/8 bg-white px-5 py-5 shadow-luxury">
                  <h3 className="font-display text-lg font-medium leading-snug text-emerald-900">
                    <span className="mr-2" aria-hidden>
                      {item.icon}
                    </span>
                    {item.title}
                  </h3>
                  <p className="mt-3 font-body text-sm leading-relaxed text-emerald-900/62">{item.text}</p>
                </article>
              </Reveal>
            ))}
          </section>

          <section className="mt-16 grid gap-10 lg:grid-cols-[0.82fr_minmax(0,1.18fr)] lg:gap-14">
            <Reveal>
              <div className="rounded-[1.75rem] bg-cream-100 px-6 py-7 shadow-luxury md:px-8 md:py-9">
                <p className="font-display text-[clamp(2rem,3vw,3rem)] font-medium leading-tight text-gold-600">
                  The Saliah Way
                </p>
                <blockquote className="mt-6 max-w-sm font-display text-[clamp(1.4rem,2.4vw,2rem)] font-medium italic leading-snug text-emerald-900">
                  &ldquo;Behind every date we pack lies a journey of trust, care, and legacy.&rdquo;
                </blockquote>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="max-w-3xl">
                {storyParagraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 32)}
                    className="mt-5 font-body text-[15px] leading-relaxed text-emerald-900/72 first:mt-0 sm:text-base"
                  >
                    {paragraph}
                  </p>
                ))}

                <div className="mt-8">
                  <OptimizedImage
                    src={resolveMediaUrl("/assets/signature.webp")}
                    alt="Signature of S. Nizamuddeen"
                    pictureClassName="inline-block"
                    className="h-10 w-auto opacity-90 sm:h-12"
                    loading="lazy"
                  />
                  <div className="mt-3 flex items-center gap-2">
                    <p className="font-body text-sm font-semibold text-emerald-900">Nizamuddeen</p>
                    <span className="text-emerald-900/25">/</span>
                    <p className="font-body text-xs uppercase tracking-[0.18em] text-emerald-900/45">
                      Founder
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
