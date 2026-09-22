function resolveApiBase() {
  const env = import.meta.env.VITE_API_URL;
  if (env === "" || env === "/") return "";
  if (env) return String(env).replace(/\/$/, "");
  if (import.meta.env.DEV) return "";
  return "http://127.0.0.1:3001";
}

const API_BASE = resolveApiBase();

/** Catalog assets were migrated to .webp; DB may still reference .png */
function normalizeAssetExtension(path) {
  if (!path.startsWith("/assets/")) return path;
  if (/\.png$/i.test(path)) return path.replace(/\.png$/i, ".webp");
  return path;
}

function toPathname(value) {
  const trimmed = String(value).trim();
  if (!trimmed) return "";

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    // Keep blob:/data: URLs intact for local previews — only normalize http(s) to pathname.
    if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
      return trimmed;
    }
    try {
      const { pathname } = new URL(trimmed);
      return pathname || "";
    } catch {
      return trimmed;
    }
  }

  let path = trimmed.replace(/\\/g, "/");
  if (!path.startsWith("/")) {
    if (path.startsWith("uploads/") || path.startsWith("assets/")) {
      path = `/${path}`;
    } else {
      path = `/${path}`;
    }
  }
  return path;
}

/**
 * Resolve product/CMS image URLs for the admin app (uploads + catalog assets).
 */
export function resolveAdminMediaUrl(url) {
  if (url == null || url === "") return "";

  const raw = String(url).trim();
  if (raw.startsWith("blob:") || raw.startsWith("data:")) return raw;

  let path = toPathname(url);
  if (!path) return "";

  // Prefer WebP for catalog shots only — keep brand logo PNGs as-is.
  const isBrandLogo =
    /\/(?:assets\/)?(?:saliah-foods-logo|application-logo|application-logo-white|application-dark-logo)(?:[-.].*)?$/i.test(
      path
    ) || /logo.*\.png$/i.test(path);

  if (!isBrandLogo) {
    path = normalizeAssetExtension(path);
  }

  if (path.startsWith("/uploads/")) {
    return API_BASE ? `${API_BASE}${path}` : path;
  }

  if (path.startsWith("/assets/")) {
    return API_BASE ? `${API_BASE}${path}` : path;
  }

  // Admin static public files (e.g. /saliah-foods-logo.png)
  if (path.startsWith("/saliah-")) {
    return path;
  }

  return API_BASE ? `${API_BASE}${path}` : path;
}

/** Webp fallback when a stored .png asset path 404s */
export function resolveAdminMediaFallback(url) {
  const path = toPathname(url);
  if (!path || !/\.png$/i.test(path)) return "";
  return resolveAdminMediaUrl(path.replace(/\.png$/i, ".webp"));
}

export function pickProductCoverImage(product) {
  if (!product) return "";
  if (product.img) return product.img;
  if (Array.isArray(product.images) && product.images[0]) return product.images[0];
  const variantWithImg = product.variants?.find((v) => v?.img);
  return variantWithImg?.img ?? "";
}
