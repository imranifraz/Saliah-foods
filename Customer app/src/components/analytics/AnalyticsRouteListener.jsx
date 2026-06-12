import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { isAnalyticsEnabled, trackPageView } from "../../lib/analytics.js";

/** Sends page_view on React Router navigations (initial load is handled by GTM/GA4). */
export function AnalyticsRouteListener() {
  const location = useLocation();

  useEffect(() => {
    if (!isAnalyticsEnabled()) return;
    trackPageView(`${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);

  return null;
}
