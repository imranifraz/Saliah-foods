import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { faqItems as FALLBACK_FAQ_ITEMS } from "../data/pages.js";
import { fetchCmsPage } from "../services/cmsPageApi.js";

function mapFaqPage(page) {
  const body = page?.body ?? {};
  const faqItems =
    Array.isArray(body.faqItems) && body.faqItems.length ? body.faqItems : FALLBACK_FAQ_ITEMS;

  return {
    title: page?.title ?? "Frequently Asked Questions",
    subtitle:
      page?.subtitle ?? "Quick answers about ordering, delivery, storage, and customer support.",
    faqItems,
    ctaText: body.ctaText || "Still have a question?",
    ctaButtonLabel: body.ctaButtonLabel || "Contact us",
    ctaHref: body.ctaHref || "/contact",
  };
}

const FaqContentContext = createContext(null);

export function FaqContentProvider({ children }) {
  const [faq, setFaq] = useState(() => mapFaqPage(null));
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const page = await fetchCmsPage("faq");
      setFaq(mapFaqPage(page));
    } catch {
      setFaq(mapFaqPage(null));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      faq,
      loading,
      refresh,
    }),
    [faq, loading, refresh]
  );

  return <FaqContentContext.Provider value={value}>{children}</FaqContentContext.Provider>;
}

export function useFaqContent() {
  const ctx = useContext(FaqContentContext);
  if (!ctx) {
    throw new Error("useFaqContent must be used within FaqContentProvider");
  }
  return ctx;
}
