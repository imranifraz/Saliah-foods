import { lazy, Suspense } from "react";
import { Hero } from "../components/home/Hero";
import { TrustStrip } from "../components/home/TrustStrip";
import { ShopByCategory } from "../components/home/ShopByCategory";
const PremiumDates = lazy(() =>
  import("../components/home/PremiumDates").then((m) => ({ default: m.PremiumDates }))
);
const WellnessProducts = lazy(() =>
  import("../components/home/WellnessProducts").then((m) => ({ default: m.WellnessProducts }))
);
const CustomerFavourites = lazy(() =>
  import("../components/home/CustomerFavourites").then((m) => ({ default: m.CustomerFavourites }))
);
const BrandLegacy = lazy(() =>
  import("../components/home/BrandLegacy").then((m) => ({ default: m.BrandLegacy }))
);
const Testimonials = lazy(() =>
  import("../components/home/Testimonials").then((m) => ({ default: m.Testimonials }))
);
const BlogPosts = lazy(() =>
  import("../components/home/BlogPosts").then((m) => ({ default: m.BlogPosts }))
);
const Newsletter = lazy(() =>
  import("../components/home/Newsletter").then((m) => ({ default: m.Newsletter }))
);

function SectionFallback() {
  return <div className="min-h-[280px] animate-pulse bg-cream-100" aria-hidden />;
}

export function HomePage() {
  return (
    <div className="overflow-x-clip">
      <Hero />
      <TrustStrip />
      <ShopByCategory />
      <Suspense fallback={<SectionFallback />}>
        <PremiumDates />
        <WellnessProducts />
        <CustomerFavourites />
        <BrandLegacy />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <Testimonials />
        <BlogPosts />
        <Newsletter />
      </Suspense>
    </div>
  );
}
