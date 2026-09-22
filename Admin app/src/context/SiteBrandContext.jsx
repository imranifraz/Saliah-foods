import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, getAuthToken } from "../lib/api.js";
import { resolveAdminMediaUrl } from "../lib/mediaUrl.js";

const FALLBACK_LOGO = "/saliah-foods-logo.png";
const FALLBACK_MARK = "/saliah-mark.png";
const LOGO_CACHE_KEY = "saliah.admin.siteLogo";

const SiteBrandContext = createContext(null);

function pickSiteLogo(payload) {
  const content = payload?.page?.content ?? payload?.content ?? null;
  const logo = content?.siteLogo ?? payload?.siteLogo ?? "";
  return String(logo || "").trim();
}

function readCachedLogo() {
  try {
    return String(localStorage.getItem(LOGO_CACHE_KEY) || "").trim();
  } catch {
    return "";
  }
}

function writeCachedLogo(path) {
  const next = String(path || "").trim();
  if (!next) return;
  try {
    localStorage.setItem(LOGO_CACHE_KEY, next);
  } catch {
    // ignore private mode / quota
  }
}

export function SiteBrandProvider({ children }) {
  const [siteLogoPath, setSiteLogoPath] = useState(() => readCachedLogo());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      let logo = "";

      // Logged-in admin: use CMS draft/saved logo so sidebar updates immediately after save.
      if (getAuthToken()) {
        try {
          const adminData = await apiFetch("/api/admin/cms/home");
          logo = pickSiteLogo(adminData);
        } catch {
          logo = "";
        }
      }

      // Login page / no admin session: public homepage CMS.
      if (!logo) {
        try {
          const publicData = await apiFetch("/api/cms/home");
          logo = pickSiteLogo(publicData);
        } catch {
          logo = "";
        }
      }

      const next = logo || FALLBACK_LOGO;
      writeCachedLogo(next);
      setSiteLogoPath(next);
    } catch {
      setSiteLogoPath((prev) => prev || FALLBACK_LOGO);
    } finally {
      setLoading(false);
    }
  }, []);

  const applySiteLogo = useCallback((path) => {
    const next = String(path || "").trim() || FALLBACK_LOGO;
    writeCachedLogo(next);
    setSiteLogoPath(next);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => {
    const hasLogo = Boolean(siteLogoPath);
    const path = siteLogoPath || FALLBACK_LOGO;
    const resolved = hasLogo ? resolveAdminMediaUrl(path) || path : "";
    const isDefaultAsset =
      !hasLogo ||
      path === FALLBACK_LOGO ||
      path === "/assets/saliah-foods-logo.png" ||
      path.endsWith("/saliah-foods-logo.png") ||
      path.endsWith("/saliah-foods-logo.webp");

    return {
      siteLogoPath: hasLogo ? path : "",
      siteLogoSrc: resolved,
      markSrc: !hasLogo ? "" : isDefaultAsset ? FALLBACK_MARK : resolved,
      isCustomLogo: hasLogo && !isDefaultAsset,
      loading,
      refresh,
      applySiteLogo,
    };
  }, [siteLogoPath, loading, refresh, applySiteLogo]);

  return <SiteBrandContext.Provider value={value}>{children}</SiteBrandContext.Provider>;
}

export function useSiteBrand() {
  const ctx = useContext(SiteBrandContext);
  if (!ctx) {
    return {
      siteLogoPath: FALLBACK_LOGO,
      siteLogoSrc: FALLBACK_LOGO,
      markSrc: FALLBACK_MARK,
      isCustomLogo: false,
      loading: false,
      refresh: async () => {},
      applySiteLogo: () => {},
    };
  }
  return ctx;
}
