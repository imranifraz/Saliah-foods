import { sanitizeRichHtml, richHtmlHasText } from "./richText.js";

/** Default homepage CMS content (customer site). */
export const DEFAULT_HOME_CMS = {
  siteLogo: "/assets/saliah-foods-logo.png",
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
        src: "/assets/hero-banner.png",
        image: "/assets/hero-banner.png",
        alt: "Saliah Foods premium dates with nuts, figs, and grapes on marble",
      },
    ],
  },
  story: {
    eyebrow: "Our story",
    title: "Rooted in Dates. Built on Natural Goodness.",
    body:
      "Saliah Foods brings together premium dates, natural sweeteners, and traditional wellness foods selected for freshness, taste, and everyday nourishment. Our journey is built around quality sourcing, careful selection, and a commitment to bringing naturally good food to every home.",
    image: "/assets/brand-legacy.png",
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

function cleanString(value, fallback = "") {
  if (value == null) return fallback;
  return String(value).trim();
}

function cleanCta(raw, fallback) {
  return {
    label: cleanString(raw?.label, fallback.label),
    href: cleanString(raw?.href, fallback.href),
  };
}

function inferMediaType(url, explicitType) {
  const type = cleanString(explicitType).toLowerCase();
  if (type === "video" || type === "image") return type;
  const value = cleanString(url).toLowerCase();
  if (/\.(mp4|webm|mov|m4v)(?:$|\?)/i.test(value) || value.includes("/video")) return "video";
  return "image";
}

function normalizeBanners(rawBanners, legacyHeroImage) {
  const list = Array.isArray(rawBanners) ? rawBanners : [];
  const normalized = list
    .map((banner, index) => {
      const src = cleanString(banner?.src || banner?.image || banner?.video || banner?.url);
      const type = inferMediaType(src, banner?.type || banner?.mediaType || banner?.kind);
      return {
        id: cleanString(banner?.id, `banner-${index + 1}`),
        type,
        src,
        // Keep `image` for older clients; same URL for both image and video slides.
        image: src,
        alt: cleanString(banner?.alt, type === "video" ? "Saliah Foods banner video" : "Saliah Foods banner"),
        poster: cleanString(banner?.poster),
      };
    })
    .filter((banner) => banner.src);

  if (normalized.length > 0) return normalized;

  const legacy = cleanString(legacyHeroImage);
  if (legacy) {
    return [
      {
        id: "hero-1",
        type: "image",
        src: legacy,
        image: legacy,
        alt: "Saliah Foods hero banner",
        poster: "",
      },
    ];
  }

  return DEFAULT_HOME_CMS.hero.banners;
}

function normalizeTestimonialItems(rawItems) {
  const list = Array.isArray(rawItems) ? rawItems : [];
  const normalized = list
    .map((item, index) => ({
      id: cleanString(item?.id, `testimonial-${index + 1}`),
      quote: sanitizeRichHtml(item?.quote),
      name: cleanString(item?.name, "Customer"),
      role: cleanString(item?.role),
    }))
    .filter((item) => richHtmlHasText(item.quote));

  return normalized.length > 0 ? normalized : DEFAULT_HOME_CMS.testimonials.items;
}

/** Merge stored CMS body with defaults for a consistent API shape. */
export function normalizeHomeCmsBody(raw = {}) {
  const heroRaw = raw.hero ?? {};
  const storyRaw = raw.story ?? {};
  const testimonialsRaw = raw.testimonials ?? {};

  const legacyHeroImage =
    raw.heroImage ?? raw.heroBanner ?? heroRaw.image ?? heroRaw.bannerImage ?? null;

  return {
    siteLogo: cleanString(raw.siteLogo, DEFAULT_HOME_CMS.siteLogo),
    hero: {
      title: cleanString(heroRaw.title ?? raw.heroTitle, DEFAULT_HOME_CMS.hero.title),
      subtitle:
        sanitizeRichHtml(heroRaw.subtitle ?? raw.heroSubtitle) || DEFAULT_HOME_CMS.hero.subtitle,
      primaryCta: cleanCta(heroRaw.primaryCta ?? raw.primaryCta, DEFAULT_HOME_CMS.hero.primaryCta),
      secondaryCta: cleanCta(
        heroRaw.secondaryCta ?? raw.secondaryCta,
        DEFAULT_HOME_CMS.hero.secondaryCta
      ),
      trustLine:
        Array.isArray(heroRaw.trustLine) && heroRaw.trustLine.length > 0
          ? heroRaw.trustLine.map((line) => cleanString(line)).filter(Boolean)
          : DEFAULT_HOME_CMS.hero.trustLine,
      banners: normalizeBanners(heroRaw.banners, legacyHeroImage),
    },
    story: {
      eyebrow: cleanString(storyRaw.eyebrow, DEFAULT_HOME_CMS.story.eyebrow),
      title: cleanString(storyRaw.title ?? raw.storyTitle, DEFAULT_HOME_CMS.story.title),
      body: sanitizeRichHtml(storyRaw.body ?? raw.storyBody) || DEFAULT_HOME_CMS.story.body,
      image: cleanString(storyRaw.image ?? raw.storyImage, DEFAULT_HOME_CMS.story.image),
      imageAlt: cleanString(storyRaw.imageAlt, DEFAULT_HOME_CMS.story.imageAlt),
      ctaLabel: cleanString(storyRaw.ctaLabel, DEFAULT_HOME_CMS.story.ctaLabel),
      ctaHref: cleanString(storyRaw.ctaHref, DEFAULT_HOME_CMS.story.ctaHref),
    },
    testimonials: {
      eyebrow: cleanString(testimonialsRaw.eyebrow, DEFAULT_HOME_CMS.testimonials.eyebrow),
      title: cleanString(testimonialsRaw.title, DEFAULT_HOME_CMS.testimonials.title),
      subtitle:
        sanitizeRichHtml(testimonialsRaw.subtitle) || DEFAULT_HOME_CMS.testimonials.subtitle,
      items: normalizeTestimonialItems(testimonialsRaw.items),
    },
  };
}

export function formatHomeCmsPage(page) {
  const content = normalizeHomeCmsBody(page?.body ?? {});
  return {
    slug: page?.slug ?? "homepage",
    title: page?.title ?? "Homepage",
    subtitle: page?.subtitle ?? "",
    published: page?.published !== false,
    updatedAt: page?.updatedAt?.toISOString?.() ?? new Date().toISOString(),
    content,
  };
}
