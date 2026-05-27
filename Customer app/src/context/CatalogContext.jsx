import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { productMenuCategories } from "../data/productMenu.js";
import { getAllCatalogProducts } from "../data/productCatalog.js";
import {
  buildCategoryPills,
  buildMenuCategories,
  buildShopCategories,
  fetchCatalog,
} from "../services/catalogApi.js";

const CatalogContext = createContext(null);

function buildStaticCatalog() {
  const products = getAllCatalogProducts();
  const categories = productMenuCategories.map((c) => ({
    id: c.id,
    label: c.label,
    description: c.description,
    image: c.featuredPromo?.image ?? "",
    featuredPromo: c.featuredPromo ?? null,
  }));

  return {
    categories,
    products,
    menuCategories: productMenuCategories,
    categoryPills: buildCategoryPills(categories),
    shopCategories: buildShopCategories(
      categories,
      Object.fromEntries(
        categories.map((c) => [c.id, products.filter((p) => p.categoryId === c.id)])
      )
    ),
    fromApi: false,
  };
}

export function CatalogProvider({ children }) {
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshCatalog = useCallback(async () => {
    try {
      const data = await fetchCatalog();
      setCatalog({ ...data, fromApi: true });
      setError("");
    } catch (e) {
      setCatalog((prev) => prev ?? buildStaticCatalog());
      setError(e.message);
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
          setCatalog((prev) => prev ?? buildStaticCatalog());
          setError(e.message);
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
    const handleFocus = () => {
      refreshCatalog();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshCatalog();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", handleFocus);
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
          viewAllHref: "/products/all",
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
      categoryPills: catalog?.categoryPills ?? [{ id: "all", label: "All Products" }],
      shopCategories: catalog?.shopCategories ?? [],
      getCategoryById,
      getProductsForCategory,
      getProductBySlug,
      getRelatedProducts,
    }),
    [catalog, loading, error, getCategoryById, getProductsForCategory, getProductBySlug, getRelatedProducts]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}
