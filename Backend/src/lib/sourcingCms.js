import { sanitizeRichHtml, richHtmlHasText } from "./richText.js";

export const DEFAULT_SOURCING_BODY = {
  intro:
    "At Saliah Foods, quality begins at the source. We work with established date growers and trusted suppliers who share our commitment to natural ingredients, careful handling, and consistent standards.",
  pillars: [
    {
      title: "Trusted Origins",
      text: "Premium date varieties sourced from regions known for flavour, texture, and harvest quality — including Kimia, Ajwa, Safawi, and Zahidi.",
    },
    {
      title: "Careful Selection",
      text: "Each lot is inspected for freshness, size, moisture, and appearance before it moves to packing.",
    },
    {
      title: "Hygienic Packing",
      text: "Products are sealed in food-grade packaging designed to protect taste and shelf life from our facility to your home.",
    },
    {
      title: "Batch Consistency",
      text: "We maintain clear quality checkpoints so every pack meets the same Saliah Foods standard you expect.",
    },
  ],
  journeyTitle: "Our quality journey",
  steps: [
    {
      step: "01",
      title: "Source",
      text: "Partner with growers and suppliers who meet our ingredient and handling standards.",
    },
    {
      step: "02",
      title: "Inspect",
      text: "Visual and sensory checks on arrival — grading for size, softness, and overall condition.",
    },
    {
      step: "03",
      title: "Pack",
      text: "Packed fresh in controlled conditions with clear labelling for weight and variety.",
    },
    {
      step: "04",
      title: "Dispatch",
      text: "Orders shipped securely across India with careful handling in transit.",
    },
  ],
  commitmentsTitle: "Our commitments",
  commitments: [
    "No artificial colours or flavours in our core date and wellness ranges",
    "Transparent pack sizes and ingredient information on every label",
    "Regular supplier review to maintain freshness and consistency",
    "Customer feedback loop to improve selection and packing",
  ],
  bannerImage: "/assets/brand-legacy.png",
  bannerAlt: "Saliah Foods quality selection of dates and wellness products",
  ctaLabel: "Shop premium dates",
  ctaHref: "/products/premium-dates",
  metaDescription:
    "Learn how Saliah Foods sources, inspects, and packs premium dates and natural wellness products.",
};

function normalizePillar(item = {}) {
  return {
    title: String(item.title ?? "").trim(),
    text: sanitizeRichHtml(item.text ?? ""),
  };
}

function normalizeStep(item = {}, index = 0) {
  const fallbackStep = String(index + 1).padStart(2, "0");
  return {
    step: String(item.step ?? fallbackStep).trim() || fallbackStep,
    title: String(item.title ?? "").trim(),
    text: sanitizeRichHtml(item.text ?? ""),
  };
}

export function normalizeSourcingCmsBody(body = {}) {
  const pillars = Array.isArray(body.pillars)
    ? body.pillars.map(normalizePillar).filter((item) => item.title && richHtmlHasText(item.text))
    : [];
  const steps = Array.isArray(body.steps)
    ? body.steps
        .map(normalizeStep)
        .filter((item) => item.title && richHtmlHasText(item.text))
        .map((item, index) => ({
          ...item,
          step: item.step || String(index + 1).padStart(2, "0"),
        }))
    : [];
  const commitments = Array.isArray(body.commitments)
    ? body.commitments.map((item) => sanitizeRichHtml(item ?? "")).filter(richHtmlHasText)
    : [];

  return {
    intro: sanitizeRichHtml(body.intro ?? "") || DEFAULT_SOURCING_BODY.intro,
    pillars: pillars.length ? pillars : DEFAULT_SOURCING_BODY.pillars,
    journeyTitle: String(body.journeyTitle ?? "").trim() || DEFAULT_SOURCING_BODY.journeyTitle,
    steps: steps.length ? steps : DEFAULT_SOURCING_BODY.steps,
    commitmentsTitle:
      String(body.commitmentsTitle ?? "").trim() || DEFAULT_SOURCING_BODY.commitmentsTitle,
    commitments: commitments.length ? commitments : DEFAULT_SOURCING_BODY.commitments,
    bannerImage: String(body.bannerImage ?? "").trim() || DEFAULT_SOURCING_BODY.bannerImage,
    bannerAlt: String(body.bannerAlt ?? "").trim() || DEFAULT_SOURCING_BODY.bannerAlt,
    ctaLabel: String(body.ctaLabel ?? "").trim() || DEFAULT_SOURCING_BODY.ctaLabel,
    ctaHref: String(body.ctaHref ?? "").trim() || DEFAULT_SOURCING_BODY.ctaHref,
    metaDescription:
      String(body.metaDescription ?? "").trim() || DEFAULT_SOURCING_BODY.metaDescription,
  };
}

export function formatSourcingCmsPage(page) {
  if (!page) return null;
  return {
    slug: page.slug,
    title: page.title,
    subtitle: sanitizeRichHtml(page.subtitle ?? ""),
    pageType: page.pageType,
    published: page.published,
    updatedAt: page.updatedAt,
    body: normalizeSourcingCmsBody(page.body),
  };
}
