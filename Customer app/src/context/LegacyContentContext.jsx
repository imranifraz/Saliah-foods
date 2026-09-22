import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchCmsPage } from "../services/cmsPageApi.js";

const FALLBACK = {
  title: "Our Legacy",
  metaDescription:
    "Discover the Saliah legacy shaped by pioneering date palm farming in South India and decades of trust, care, and cultivation.",
  heroEyebrow: "Our Legacy",
  heroTitle: "Rooted in trust. Grown with legacy.",
  heroText:
    "A story of pioneering date palm cultivation, Arabian farming knowledge, and a lifelong promise to bring honest nourishment back home to India.",
  heroImage: "/assets/brand-legacy.png",
  heroImageAlt: "Saliah Foods legacy with premium dates and palm farm roots",
  founderEyebrow: "Our Root",
  founderTitle: "Built by a pioneer of date palm farming in South India.",
  founderText:
    "Our founder, S. Nizamuddeen, is widely recognized as a pioneer in date palm farming in India, celebrated as the first to cultivate date palms in South India. He previously worked at several date farms across Saudi Arabia before returning to India to grow his own dates.",
  founderImage: "/assets/our-legacy-founder.png",
  founderImageAlt: "Founder S. Nizamuddeen holding a fresh bunch of dates in the farm",
  highlights: [
    {
      title: "South India's First Date Palm Pioneer",
      text: "Paved the way for date cultivation in South India, inspiring countless farmers across the region.",
    },
    {
      title: "Expertise From the Heart of Arabia",
      text: "Gained years of hands-on experience working in Saudi Arabia's renowned date farms.",
    },
    {
      title: "A Legacy of Passion & Purpose",
      text: "What began as one man's dream has grown into a flourishing movement in sustainable farming.",
    },
  ],
  storyLabel: "The Saliah Way",
  storyQuote: "Behind every date we pack lies a journey of trust, care, and legacy.",
  storyParagraphs: [
    "Our story began over three decades ago, among lush date farms in Saudi Arabia. I spent years across fields, growing and cultivating prized dates. My dream was to bring date cultivation back home to the fertile soils of India.",
    "Since 1992, I began to realise my vision. I was the first farmer to start a full-fledged date palm plantation in South India. At Saliah Dates, we have firm roots supporting farmers and harvest gardens of splendour.",
    "Today, we carry sun-ripened Arabian and local date varieties, bursting with nutrients and goodness. Dates are a superfood that spans across cultures and traditions. Discover our delightful collection, one date at a time.",
  ],
  signatureImage: "/assets/signature.webp",
  signatureName: "Nizamuddeen",
  signatureRole: "Founder",
};

function mapLegacyPage(page) {
  const body = page?.body ?? {};
  return {
    title: page?.title ?? FALLBACK.title,
    metaDescription: body.metaDescription || FALLBACK.metaDescription,
    heroEyebrow: body.heroEyebrow || FALLBACK.heroEyebrow,
    heroTitle: body.heroTitle || FALLBACK.heroTitle,
    heroText: body.heroText || FALLBACK.heroText,
    heroImage: body.heroImage || FALLBACK.heroImage,
    heroImageAlt: body.heroImageAlt || FALLBACK.heroImageAlt,
    founderEyebrow: body.founderEyebrow || FALLBACK.founderEyebrow,
    founderTitle: body.founderTitle || FALLBACK.founderTitle,
    founderText: body.founderText || FALLBACK.founderText,
    founderImage: body.founderImage || FALLBACK.founderImage,
    founderImageAlt: body.founderImageAlt || FALLBACK.founderImageAlt,
    highlights:
      Array.isArray(body.highlights) && body.highlights.length
        ? body.highlights
        : FALLBACK.highlights,
    storyLabel: body.storyLabel || FALLBACK.storyLabel,
    storyQuote: body.storyQuote || FALLBACK.storyQuote,
    storyParagraphs:
      Array.isArray(body.storyParagraphs) && body.storyParagraphs.length
        ? body.storyParagraphs
        : FALLBACK.storyParagraphs,
    signatureImage: body.signatureImage || FALLBACK.signatureImage,
    signatureName: body.signatureName || FALLBACK.signatureName,
    signatureRole: body.signatureRole || FALLBACK.signatureRole,
  };
}

const LegacyContentContext = createContext(null);

export function LegacyContentProvider({ children }) {
  const [legacy, setLegacy] = useState(() => mapLegacyPage(null));
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      let page = null;
      try {
        page = await fetchCmsPage("our-legacy");
      } catch {
        page = await fetchCmsPage("about-us");
      }
      setLegacy(mapLegacyPage(page));
    } catch {
      setLegacy(mapLegacyPage(null));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => ({ legacy, loading, refresh }), [legacy, loading, refresh]);

  return <LegacyContentContext.Provider value={value}>{children}</LegacyContentContext.Provider>;
}

export function useLegacyContent() {
  const ctx = useContext(LegacyContentContext);
  if (!ctx) throw new Error("useLegacyContent must be used within LegacyContentProvider");
  return ctx;
}
