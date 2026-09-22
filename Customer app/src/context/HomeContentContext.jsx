import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchHomeCmsApi } from "../services/homeCmsApi.js";
import { homepageImages } from "../data/homepage.js";

const LOGO_CACHE_KEY = "saliah.siteBrand.logos";

const FALLBACK = {
  siteLogo: "/assets/saliah-foods-logo.png",
  siteLogoLight: "/assets/saliah-foods-logo.png",
  hero: {
    title: "Premium Dates & Natural Wellness Foods",
    subtitle:
      "Discover carefully selected dates, date-based products, traditional wellness foods, and naturally sweet everyday essentials from Saliah Foods.",
    primaryCta: { label: "Shop Premium Dates", href: "#premium-dates" },
    secondaryCta: { label: "Explore Wellness Foods", href: "#wellness-products" },
    trustLine: ["Freshly Packed", "Natural Ingredients", "Secure Checkout"],
    banners: [
      {
        id: "hero-1",
        type: "image",
        src: homepageImages.hero,
        image: homepageImages.hero,
        alt: "Saliah Foods premium dates with nuts, figs, and grapes on marble",
      },
    ],
  },
  story: {
    eyebrow: "Our story",
    title: "Rooted in Dates. Built on Natural Goodness.",
    body:
      "Saliah Foods brings together premium dates, natural sweeteners, and traditional wellness foods selected for freshness, taste, and everyday nourishment. Our journey is built around quality sourcing, careful selection, and a commitment to bringing naturally good food to every home.",
    image: homepageImages.brandLegacy,
    imageAlt: "Saliah Foods premium dates, honey blends, and wellness products",
    ctaLabel: "Read Our Story",
    ctaHref: "/our-legacy",
  },
  testimonials: {
    eyebrow: "Testimonials",
    title: "Loved by Families Across India",
    subtitle:
      "What our customers say about Saliah dates, wellness foods, and natural everyday essentials.",
    items: [
      {
        id: "t1",
        quote:
          "The Kimia dates are incredibly soft and fresh. Packaging feels premium — perfect for gifting and everyday snacking at home.",
        name: "Ananya R.",
        role: "Mumbai",
      },
      {
        id: "t2",
        quote:
          "We use Saliah date syrup daily in our kitchen. Natural sweetness without compromise — our whole family loves it.",
        name: "Karthik M.",
        role: "Bengaluru",
      },
      {
        id: "t3",
        quote:
          "Rose gulkand and amla candy remind me of home. Quality is consistent and delivery was neatly packed every time.",
        name: "Priya S.",
        role: "Hyderabad",
      },
    ],
  },
};

function readCachedLogos() {
  try {
    const raw = localStorage.getItem(LOGO_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const siteLogo = String(parsed?.siteLogo || "").trim();
    if (!siteLogo) return null;
    return {
      siteLogo,
      siteLogoLight: String(parsed?.siteLogoLight || siteLogo).trim() || siteLogo,
    };
  } catch {
    return null;
  }
}

function writeCachedLogos(siteLogo, siteLogoLight) {
  const logo = String(siteLogo || "").trim();
  if (!logo) return;
  try {
    localStorage.setItem(
      LOGO_CACHE_KEY,
      JSON.stringify({
        siteLogo: logo,
        siteLogoLight: String(siteLogoLight || logo).trim() || logo,
      })
    );
  } catch {
    // ignore private mode / quota
  }
}

function getInitialContent() {
  const cached = readCachedLogos();
  if (!cached) {
    // Avoid flashing the bundled default logo before CMS returns the uploaded one.
    return { ...FALLBACK, siteLogo: "", siteLogoLight: "" };
  }
  return {
    ...FALLBACK,
    siteLogo: cached.siteLogo,
    siteLogoLight: cached.siteLogoLight,
  };
}

const HomeContentContext = createContext(null);

export function HomeContentProvider({ children }) {
  const [content, setContent] = useState(getInitialContent);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchHomeCmsApi();
      if (data?.page?.content) {
        const next = data.page.content;
        writeCachedLogos(next.siteLogo, next.siteLogoLight);
        setContent(next);
      }
    } catch {
      setContent(FALLBACK);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      content,
      loading,
      refresh,
    }),
    [content, loading, refresh]
  );

  return <HomeContentContext.Provider value={value}>{children}</HomeContentContext.Provider>;
}

export function useHomeContent() {
  const ctx = useContext(HomeContentContext);
  if (!ctx) {
    throw new Error("useHomeContent must be used within HomeContentProvider");
  }
  return ctx;
}
