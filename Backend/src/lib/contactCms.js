import { sanitizeRichHtml } from "./richText.js";

const DEFAULT_SUBJECTS = [
  "General enquiry",
  "Order support",
  "Wholesale / B2B",
  "Product feedback",
  "Other",
];

export const DEFAULT_MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3899.6365508516665!2d78.2433487!3d12.2051153!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bac15feeee3de55%3A0xd6dec5f913775d19!2sSaliah%20Dates!5e0!3m2!1sen!2sin!4v1781257892099!5m2!1sen!2sin";

export const DEFAULT_GOOGLE_MAPS_URL = "https://maps.app.goo.gl/Wy4uVGoSQegJqusW9";

export function normalizeContactCmsBody(body = {}) {
  const subjects = Array.isArray(body.subjects)
    ? body.subjects.map((item) => String(item).trim()).filter(Boolean)
    : DEFAULT_SUBJECTS;

  return {
    email: String(body.email ?? "").trim(),
    phone: String(body.phone ?? "").trim(),
    phoneTel: String(body.phoneTel ?? body.phone ?? "").trim(),
    address: sanitizeRichHtml(body.address ?? ""),
    hours: sanitizeRichHtml(body.hours ?? ""),
    subjects: subjects.length ? subjects : DEFAULT_SUBJECTS,
    formSuccessMessage: sanitizeRichHtml(
      body.formSuccessMessage ??
        "We have received your message and will respond within one business day."
    ),
    mapEmbedUrl: String(body.mapEmbedUrl ?? "").trim() || DEFAULT_MAP_EMBED_URL,
    googleMapsUrl: String(body.googleMapsUrl ?? "").trim() || DEFAULT_GOOGLE_MAPS_URL,
    placeLabel: String(body.placeLabel ?? "Saliah Dates").trim() || "Saliah Dates",
  };
}

export function formatContactCmsPage(page) {
  if (!page) return null;
  return {
    slug: page.slug,
    title: page.title,
    subtitle: sanitizeRichHtml(page.subtitle ?? ""),
    pageType: page.pageType,
    published: page.published,
    updatedAt: page.updatedAt,
    body: normalizeContactCmsBody(page.body),
  };
}
