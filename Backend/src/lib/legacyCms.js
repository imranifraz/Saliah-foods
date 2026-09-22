import { sanitizeRichHtml, richHtmlHasText } from "./richText.js";

export const DEFAULT_LEGACY_BODY = {
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

function normalizeHighlight(item = {}) {
  return {
    title: String(item.title ?? "").trim(),
    text: sanitizeRichHtml(item.text ?? ""),
  };
}

export function normalizeLegacyCmsBody(body = {}) {
  const highlights = Array.isArray(body.highlights)
    ? body.highlights.map(normalizeHighlight).filter((item) => item.title && richHtmlHasText(item.text))
    : [];
  const storyParagraphs = Array.isArray(body.storyParagraphs)
    ? body.storyParagraphs.map((item) => sanitizeRichHtml(item ?? "")).filter(richHtmlHasText)
    : [];

  return {
    metaDescription:
      String(body.metaDescription ?? "").trim() || DEFAULT_LEGACY_BODY.metaDescription,
    heroEyebrow: String(body.heroEyebrow ?? "").trim() || DEFAULT_LEGACY_BODY.heroEyebrow,
    heroTitle: String(body.heroTitle ?? "").trim() || DEFAULT_LEGACY_BODY.heroTitle,
    heroText: sanitizeRichHtml(body.heroText ?? "") || DEFAULT_LEGACY_BODY.heroText,
    heroImage: String(body.heroImage ?? "").trim() || DEFAULT_LEGACY_BODY.heroImage,
    heroImageAlt: String(body.heroImageAlt ?? "").trim() || DEFAULT_LEGACY_BODY.heroImageAlt,
    founderEyebrow: String(body.founderEyebrow ?? "").trim() || DEFAULT_LEGACY_BODY.founderEyebrow,
    founderTitle: String(body.founderTitle ?? "").trim() || DEFAULT_LEGACY_BODY.founderTitle,
    founderText: sanitizeRichHtml(body.founderText ?? "") || DEFAULT_LEGACY_BODY.founderText,
    founderImage: String(body.founderImage ?? "").trim() || DEFAULT_LEGACY_BODY.founderImage,
    founderImageAlt:
      String(body.founderImageAlt ?? "").trim() || DEFAULT_LEGACY_BODY.founderImageAlt,
    highlights: highlights.length ? highlights : DEFAULT_LEGACY_BODY.highlights,
    storyLabel: String(body.storyLabel ?? "").trim() || DEFAULT_LEGACY_BODY.storyLabel,
    storyQuote: sanitizeRichHtml(body.storyQuote ?? "") || DEFAULT_LEGACY_BODY.storyQuote,
    storyParagraphs: storyParagraphs.length
      ? storyParagraphs
      : DEFAULT_LEGACY_BODY.storyParagraphs,
    signatureImage:
      String(body.signatureImage ?? "").trim() || DEFAULT_LEGACY_BODY.signatureImage,
    signatureName: String(body.signatureName ?? "").trim() || DEFAULT_LEGACY_BODY.signatureName,
    signatureRole: String(body.signatureRole ?? "").trim() || DEFAULT_LEGACY_BODY.signatureRole,
  };
}

export function formatLegacyCmsPage(page) {
  if (!page) return null;
  return {
    slug: page.slug,
    title: page.title,
    subtitle: sanitizeRichHtml(page.subtitle ?? ""),
    pageType: page.pageType,
    published: page.published,
    updatedAt: page.updatedAt,
    body: normalizeLegacyCmsBody(page.body),
  };
}
