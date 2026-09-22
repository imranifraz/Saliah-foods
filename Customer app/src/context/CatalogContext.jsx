import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchCatalog } from "../services/catalogApi.js";

const CatalogContext = createContext(null);

const EMPTY_CATALOG = {
  categories: [],
  products: [],
  menuCategories: [],
  categoryPills: [{ id: "all", label: "All Products" }],
  shopCategories: [],
  fromApi: false,
};

export function CatalogProvider({ children }) {
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshCatalog = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) setLoading(true);
    try {
      const data = await fetchCatalog();
      setCatalog({ ...data, fromApi: true });
      setError("");
    } catch (e) {
      setCatalog((prev) => (prev?.fromApi ? prev : EMPTY_CATALOG));
      setError(e.message ?? "Could not load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await fetchCatalog();
        if (!cancelled) {
          setCatalog({ ...data, fromApi: true });
          setError("");
        }
      } catch (e) {
        if (!cancelled) {
          setCatalog(EMPTY_CATALOG);
          setError(e.message ?? "Could not load products.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let lastFetch = Date.now();
    const STALE_MS = 5 * 60 * 1000;

    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastFetch < STALE_MS) return;
      lastFetch = Date.now();
      refreshCatalog();
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refreshCatalog]);

  const getCategoryById = useCallback(
    (categoryId) => {
      if (!catalog) return null;
      if (categoryId === "all") {
        return {
          id: "all",
          label: "All Products",
          description:
            "Discover our complete range of premium dates, wellness foods, and customer favourites.",
          viewAllHref: "/products",
          products: [],
        };
      }
      return catalog.menuCategories.find((c) => c.id === categoryId) ?? null;
    },
    [catalog]
  );

  const getProductsForCategory = useCallback(
    (categoryId) => {
      if (!catalog) return [];
      if (categoryId === "all") return catalog.products;
      if (categoryId === "best-sellers") {
        return catalog.products.filter((p) => p.isBestSeller);
      }
      return catalog.products.filter((p) => p.categoryId === categoryId);
    },
    [catalog]
  );

  const getProductBySlug = useCallback(
    (slug) => catalog?.products.find((p) => p.slug === slug) ?? null,
    [catalog]
  );

  const getRelatedProducts = useCallback(
    (product, limit) => {
      if (!catalog || !product) return [];
      const related = catalog.products.filter(
        (p) => p.categoryId === product.categoryId && p.slug !== product.slug
      );
      return limit != null ? related.slice(0, limit) : related;
    },
    [catalog]
  );

  const value = useMemo(
    () => ({
      loading,
      error,
      fromApi: catalog?.fromApi ?? false,
      categories: catalog?.categories ?? [],
      products: catalog?.products ?? [],
      menuCategories: catalog?.menuCategories ?? [],
      categoryPills: catalog?.categoryPills ?? EMPTY_CATALOG.categoryPills,
      shopCategories: catalog?.shopCategories ?? [],
      getCategoryById,
      getProductsForCategory,
      getProductBySlug,
      getRelatedProducts,
      refreshCatalog,
    }),
    [catalog, loading, error, getCategoryById, getProductsForCategory, getProductBySlug, getRelatedProducts, refreshCatalog]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}
