/**
 * Google analytics config — set per client in .env before deploy.
 * Recommended: use GTM as the single entry point and configure GA4 inside GTM.
 */
export const analyticsConfig = {
  gtmId: String(import.meta.env.VITE_GTM_ID ?? "").trim(),
  ga4Id: String(import.meta.env.VITE_GA4_MEASUREMENT_ID ?? "").trim(),
  siteVerification: String(import.meta.env.VITE_GOOGLE_SITE_VERIFICATION ?? "").trim(),
};

export function isAnalyticsEnabled() {
  return Boolean(analyticsConfig.gtmId || analyticsConfig.ga4Id);
}

function ensureDataLayer() {
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

/** Push a custom event to GTM / GA4 dataLayer. */
export function trackEvent(event, params = {}) {
  if (!isAnalyticsEnabled()) return;

  ensureDataLayer().push({
    event,
    ...params,
  });
}

/** SPA page view — picked up by GTM History Change trigger or GA4 config. */
export function trackPageView(path, title = document.title) {
  if (!isAnalyticsEnabled()) return;

  const pagePath = path || `${window.location.pathname}${window.location.search}`;

  trackEvent("page_view", {
    page_path: pagePath,
    page_title: title,
    page_location: `${window.location.origin}${pagePath}`,
  });

  if (typeof window.gtag === "function" && analyticsConfig.ga4Id) {
    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_title: title,
    });
  }
}

export function trackAddToCart(item) {
  trackEvent("add_to_cart", {
    ecommerce: {
      currency: "INR",
      value: (item.priceValue ?? 0) * (item.quantity ?? 1),
      items: [
        {
          item_id: item.sku || item.id || item.slug,
          item_name: item.name,
          price: item.priceValue ?? 0,
          quantity: item.quantity ?? 1,
        },
      ],
    },
  });
}

export function trackPurchase(order) {
  if (!order) return;

  const items = (order.items ?? []).map((item) => ({
    item_id: item.sku || item.productSlug || item.id,
    item_name: item.name,
    price: item.priceValue ?? 0,
    quantity: item.quantity ?? 1,
  }));

  trackEvent("purchase", {
    ecommerce: {
      transaction_id: order.id,
      value: order.total ?? 0,
      currency: "INR",
      shipping: order.shipping ?? 0,
      items,
    },
  });
}
