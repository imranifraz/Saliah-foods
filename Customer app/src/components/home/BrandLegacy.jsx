import { Link } from "react-router-dom";
import { homepageImages } from "../../data/homepage";
import { OptimizedImage } from "../ui/OptimizedImage";
import { Reveal } from "../ui/Reveal";

export function BrandLegacy() {
  return (
    <section id="brand-legacy" className="section-pad" aria-labelledby="legacy-title">
      <div className="section-container">
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="order-2 lg:order-1">
            <p className="font-body text-[11px] font-medium uppercase tracking-[0.28em] text-gold-600">
              Our story
            </p>
            <h2
              id="legacy-title"
              className="mt-3 font-display text-[clamp(1.75rem,4.5vw,2.75rem)] font-medium leading-tight text-emerald-900"
            >
              Rooted in Dates. Built on Natural Goodness.
            </h2>
            <p className="mt-4 font-body text-[15px] leading-relaxed text-emerald-900/70 sm:mt-5 sm:text-base">
              Saliah Foods brings together premium dates, natural sweeteners, and traditional wellness foods
              selected for freshness, taste, and everyday nourishment. Our journey is built around quality
              sourcing, careful selection, and a commitment to bringing naturally good food to every home.
            </p>
            <Link
              to="/our-legacy"
              className="mt-6 inline-flex min-h-[48px] items-center rounded-full border border-emerald-900/15 px-7 py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-900 transition-colors hover:bg-emerald-900 hover:text-cream-50 sm:mt-8"
            >
              Read Our Story
            </Link>
          </Reveal>

          <Reveal delay={0.1} className="order-1 lg:order-2">
            <div className="overflow-hidden rounded-2xl shadow-luxury-lg">
              <OptimizedImage
                src={homepageImages.brandLegacy}
                alt="Saliah Foods premium dates, honey blends, and wellness products"
                className="aspect-[4/3] w-full object-cover"
                width={1200}
                height={900}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
