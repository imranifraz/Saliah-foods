import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { sourcingQuality as FALLBACK } from "../data/pages.js";
import { fetchCmsPage } from "../services/cmsPageApi.js";

function mapSourcingPage(page) {
  const body = page?.body ?? {};

  return {
    title: page?.title ?? FALLBACK.title,
    subtitle: page?.subtitle ?? FALLBACK.subtitle,
    intro: body.intro || FALLBACK.intro,
    pillars:
      Array.isArray(body.pillars) && body.pillars.length ? body.pillars : FALLBACK.pillars,
    journeyTitle: body.journeyTitle || "Our quality journey",
    steps: Array.isArray(body.steps) && body.steps.length ? body.steps : FALLBACK.steps,
    commitmentsTitle: body.commitmentsTitle || "Our commitments",
    commitments:
      Array.isArray(body.commitments) && body.commitments.length
        ? body.commitments
        : FALLBACK.commitments,
    bannerImage: body.bannerImage || "/assets/brand-legacy.png",
    bannerAlt:
      body.bannerAlt || "Saliah Foods quality selection of dates and wellness products",
    ctaLabel: body.ctaLabel || "Shop premium dates",
    ctaHref: body.ctaHref || "/products/premium-dates",
    metaDescription:
      body.metaDescription ||
      "Learn how Saliah Foods sources, inspects, and packs premium dates and natural wellness products.",
  };
}

const SourcingContentContext = createContext(null);

export function SourcingContentProvider({ children }) {
  const [sourcing, setSourcing] = useState(() => mapSourcingPage(null));
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const page = await fetchCmsPage("sourcing-quality");
      setSourcing(mapSourcingPage(page));
    } catch {
      setSourcing(mapSourcingPage(null));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      sourcing,
      loading,
      refresh,
    }),
    [sourcing, loading, refresh]
  );

  return (
    <SourcingContentContext.Provider value={value}>{children}</SourcingContentContext.Provider>
  );
}

export function useSourcingContent() {
  const ctx = useContext(SourcingContentContext);
  if (!ctx) {
    throw new Error("useSourcingContent must be used within SourcingContentProvider");
  }
  return ctx;
}
