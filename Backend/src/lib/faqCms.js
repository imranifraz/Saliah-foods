import { sanitizeRichHtml } from "./richText.js";

export const DEFAULT_FAQ_ITEMS = [
  {
    category: "Orders & Delivery",
    questions: [
      {
        q: "How do I place an order?",
        a: "Browse our products, add items to your cart, and complete checkout with your delivery address and payment details. You will receive an order confirmation by email.",
      },
      {
        q: "Do you deliver across India?",
        a: "Yes — we dispatch to most pin codes across India. Delivery timelines and availability may vary by product and location.",
      },
      {
        q: "How long does delivery take?",
        a: "Most orders arrive within 5–8 business days after dispatch. Remote areas may take slightly longer.",
      },
    ],
  },
  {
    category: "Products",
    questions: [
      {
        q: "How should I store dates and wellness products?",
        a: "Store in a cool, dry place away from direct sunlight. Once opened, seal tightly and consume within the period noted on the pack.",
      },
      {
        q: "Are your products natural?",
        a: "Our core ranges use naturally sourced ingredients. Full ingredient and allergen information is listed on each product label.",
      },
      {
        q: "What pack sizes are available?",
        a: "Pack sizes vary by product — from pouches and jars to 1kg date packs. Sizes are shown on each product card and listing page.",
      },
    ],
  },
  {
    category: "Returns & Support",
    questions: [
      {
        q: "What is your return policy?",
        a: "If you receive a damaged or incorrect item, contact us within 48 hours of delivery with photos. We will arrange a replacement or refund as applicable.",
      },
      {
        q: "How can I track my order?",
        a: "Tracking details are shared by email and SMS once your order is dispatched. You can also reach our support team for updates.",
      },
      {
        q: "How do I contact customer support?",
        a: "Use our Contact us page or email support@saliahfoods.com. We aim to respond within one business day.",
      },
    ],
  },
];

function normalizeQuestion(item = {}) {
  return {
    q: String(item.q ?? "").trim(),
    a: sanitizeRichHtml(item.a ?? ""),
  };
}

function normalizeCategory(item = {}) {
  const questions = Array.isArray(item.questions)
    ? item.questions.map(normalizeQuestion).filter((question) => question.q && question.a)
    : [];

  return {
    category: String(item.category ?? "").trim(),
    questions,
  };
}

export function normalizeFaqCmsBody(body = {}) {
  const faqItems = Array.isArray(body.faqItems)
    ? body.faqItems.map(normalizeCategory).filter((item) => item.category && item.questions.length)
    : [];

  return {
    faqItems: faqItems.length ? faqItems : DEFAULT_FAQ_ITEMS,
    ctaText: sanitizeRichHtml(body.ctaText ?? "Still have a question?"),
    ctaButtonLabel: String(body.ctaButtonLabel ?? "Contact us").trim(),
    ctaHref: String(body.ctaHref ?? "/contact").trim() || "/contact",
  };
}

export function formatFaqCmsPage(page) {
  if (!page) return null;
  return {
    slug: page.slug,
    title: page.title,
    subtitle: sanitizeRichHtml(page.subtitle ?? ""),
    pageType: page.pageType,
    published: page.published,
    updatedAt: page.updatedAt,
    body: normalizeFaqCmsBody(page.body),
  };
}
