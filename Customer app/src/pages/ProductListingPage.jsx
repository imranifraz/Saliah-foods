import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useCatalog } from "../context/CatalogContext.jsx";
import {
  FILTER_OPTIONS,
  SORT_OPTIONS,
  filterProducts,
  getProductDetailPath,
  getProductPriceBounds,
  getPricePresetForRange,
  getPriceRangeForPreset,
  sortProducts,
} from "../data/productCatalog";
import { matchesProductSearch } from "../lib/productSearch.js";
import {
  ProductListingSidebar,
  ProductListingMobileFilters,
} from "../components/products/ProductListingFilters";
import { ProductListingFeatured } from "../components/products/ProductListingFeatured";
import {
  ProductListingBreadcrumb,
  ProductListingHero,
} from "../components/products/ProductListingHero";
import { ProductCard } from "../components/ui/ProductCard";

const INITIAL_VISIBLE = 6;
const LOAD_STEP = 6;
const FEATURED_AFTER_INDEX = 2;

function buildGridItems(products) {
  const items = [];
  products.forEach((product, i) => {
    items.push({ type: "product", product, index: i });
    if (i === FEATURED_AFTER_INDEX && products.length > FEATURED_AFTER_INDEX + 1) {
      items.push({ type: "featured" });
    }
  });
  return items;
}

export function ProductListingPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const reduce = useReducedMotion();
  const {
    loading: catalogLoading,
    error: catalogError,
    fromApi,
    categoryPills,
    getCategoryById,
    getProductsForCategory,
    refreshCatalog,
  } = useCatalog();

  const qFromUrl = searchParams.get("q") ?? "";
  const [activeCategory, setActiveCategory] = useState(categoryId ?? "all");
  const [benefits, setBenefits] = useState("all");
  const [packaging, setPackaging] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState(qFromUrl);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [price, setPrice] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 2000]);

  useEffect(() => {
    setActiveCategory(categoryId ?? "all");
    setVisibleCount(INITIAL_VISIBLE);
  }, [categoryId]);

  useEffect(() => {
    setSearchQuery(qFromUrl);
    setVisibleCount(INITIAL_VISIBLE);
  }, [qFromUrl]);

  const categoryMeta = categoryId ? getCategoryById(categoryId) : getCategoryById("all");
  const pageCopy = {
    label: categoryMeta?.label ?? "All Products",
    description:
      categoryMeta?.description ??
      "Discover our complete range of premium dates, wellness foods, and customer favourites.",
  };

  const allProducts = useMemo(
    () => getProductsForCategory(activeCategory === "all" ? "all" : activeCategory),
    [activeCategory, getProductsForCategory]
  );

  const priceBounds = useMemo(() => getProductPriceBounds(allProducts), [allProducts]);

  useEffect(() => {
    setPriceRange([priceBounds.min, priceBounds.max]);
    setPrice("all");
  }, [categoryId, priceBounds.min, priceBounds.max]);

  const filteredProducts = useMemo(() => {
    const filtered = filterProducts(allProducts, {
      category: "all",
      priceMin: priceRange[0],
      priceMax: priceRange[1],
      benefits,
      packaging,
      availability,
    });
    const sorted = sortProducts(filtered, sortBy);
    return sorted.filter((p) => matchesProductSearch(p, searchQuery));
  }, [allProducts, priceRange, benefits, packaging, availability, sortBy, searchQuery]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const gridItems = useMemo(() => buildGridItems(visibleProducts), [visibleProducts]);
  const hasMore = visibleCount < filteredProducts.length;

  const syncSearchParam = (value) => {
    const next = new URLSearchParams(searchParams);
    const trimmed = value.trim();
    if (trimmed) next.set("q", trimmed);
    else next.delete("q");
    setSearchParams(next, { replace: true });
  };

  const handleCategoryChange = (id) => {
    setActiveCategory(id);
    setVisibleCount(INITIAL_VISIBLE);
    const q = searchQuery.trim();
    const suffix = q ? `?q=${encodeURIComponent(q)}` : "";
    navigate(id === "all" ? `/products${suffix}` : `/products/${id}${suffix}`);
  };

  const handleFilterChange = (key, value) => {
    setVisibleCount(INITIAL_VISIBLE);
    if (key === "price") {
      setPrice(value);
      setPriceRange(getPriceRangeForPreset(value, priceBounds));
    }
    if (key === "benefits") setBenefits(value);
    if (key === "packaging") setPackaging(value);
    if (key === "availability") setAvailability(value);
  };

  const clearFilters = () => {
    setPrice("all");
    setPriceRange([priceBounds.min, priceBounds.max]);
    setBenefits("all");
    setPackaging("all");
    setAvailability("all");
    setSearchQuery("");
    syncSearchParam("");
    setSortBy("featured");
    setVisibleCount(INITIAL_VISIBLE);
  };

  const hasActiveFilters =
    price !== "all" ||
    priceRange[0] > priceBounds.min ||
    priceRange[1] < priceBounds.max ||
    benefits !== "all" ||
    packaging !== "all" ||
    availability !== "all" ||
    searchQuery.trim().length > 0;

  const filterProps = {
    categoryPills,
    activeCategory,
    onCategoryChange: handleCategoryChange,
    filters: {
      price,
      benefits,
      packaging,
      availability,
      priceOptions: FILTER_OPTIONS.price,
      benefitsOptions: FILTER_OPTIONS.benefits,
      packagingOptions: FILTER_OPTIONS.packaging,
      availabilityOptions: FILTER_OPTIONS.availability,
    },
    onFilterChange: handleFilterChange,
    priceBounds,
    priceRange,
    onPriceRangeChange: (range) => {
      setPriceRange(range);
      setPrice(getPricePresetForRange(range, priceBounds));
      setVisibleCount(INITIAL_VISIBLE);
    },
    sortBy,
    sortOptions: SORT_OPTIONS,
    onSortChange: (v) => {
      setSortBy(v);
      setVisibleCount(INITIAL_VISIBLE);
    },
    searchQuery,
    onSearchChange: (v) => {
      setSearchQuery(v);
      syncSearchParam(v);
      setVisibleCount(INITIAL_VISIBLE);
    },
    productCount: filteredProducts.length,
    onClearFilters: clearFilters,
    hasActiveFilters,
  };

  if (catalogLoading) {
    return (
      <div className="mx-auto max-w-[1480px] px-4 py-28 text-center sm:px-5 md:px-10">
        <p className="font-body text-sm text-emerald-900/55">Loading products…</p>
      </div>
    );
  }

  if (!fromApi) {
    return (
      <div className="mx-auto max-w-[1480px] px-4 py-28 text-center sm:px-5 md:px-10">
        <h1 className="font-display text-2xl font-medium text-emerald-900">Could not load products</h1>
        <p className="mt-3 font-body text-sm text-emerald-900/55">
          Products are loaded from the backend only. Start the API server and refresh this page.
        </p>
        {catalogError ? (
          <p className="mt-2 font-body text-xs text-emerald-900/40">{catalogError}</p>
        ) : null}
        <button
          type="button"
          className="mt-6 font-body text-sm text-emerald-800 underline"
          onClick={() => refreshCatalog({ showLoading: true })}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!categoryMeta && categoryId && categoryId !== "all") {
    return (
      <div className="mx-auto max-w-[1480px] px-4 py-28 sm:px-5 md:px-10">
        <h1 className="font-display text-2xl font-medium text-emerald-900">Category not found</h1>
        <Link to="/" className="mt-4 inline-block font-body text-sm text-emerald-800 underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="relative pb-20 pt-[calc(var(--site-header)+0.5rem)] md:pt-[calc(var(--site-header)+0.75rem)]">
      <div className="plp-atmosphere pointer-events-none absolute inset-0" aria-hidden />
      <div className="plp-texture pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative mx-auto max-w-[1480px] px-4 sm:px-5 md:px-10">
        <ProductListingBreadcrumb label={pageCopy.label} categoryId={categoryId ?? "all"} />

        <ProductListingHero
          label={pageCopy.label}
          description={pageCopy.description}
          categoryId={categoryId ?? "all"}
        />

        <div className="plp-layout mt-6 lg:mt-8">
          <ProductListingSidebar {...filterProps} />

          <div className="plp-main min-w-0">
            <ProductListingMobileFilters {...filterProps} />

            <div className="mb-5 hidden items-center justify-between lg:flex">
              <p className="font-body text-sm text-emerald-900/50">
                Showing{" "}
                <span className="font-semibold text-emerald-900/75">{filteredProducts.length}</span>{" "}
                {filteredProducts.length === 1 ? "product" : "products"}
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="py-14 text-center">
                <p className="font-display text-lg text-emerald-900/65">No products match your filters.</p>
                <button
                  type="button"
                  className="mt-4 font-body text-sm text-emerald-800 underline"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="plp-grid-zone">
                <ul
                  className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-2 lg:gap-5 xl:grid-cols-3"
                  role="list"
                  key={`${activeCategory}-${sortBy}-${price}-${priceRange[0]}-${priceRange[1]}-${benefits}-${packaging}-${searchQuery}`}
                >
                  {gridItems.map((item) =>
                    item.type === "featured" ? (
                      <ProductListingFeatured key="featured-collection" />
                    ) : (
                      <motion.li
                        key={item.product.catalogId}
                        className="flex min-w-0"
                        initial={reduce ? false : { opacity: 0, y: 10 }}
                        animate={reduce ? undefined : { opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.35,
                          delay: Math.min(item.index * 0.04, 0.24),
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <ProductCard
                          product={item.product}
                          index={item.index}
                          variant="listing"
                          showPackSize
                          showTagline
                          detailHref={getProductDetailPath(item.product)}
                          className="w-full"
                        />
                      </motion.li>
                    )
                  )}
                </ul>
              </div>
            )}

            {filteredProducts.length > 0 && hasMore ? (
              <motion.div
                className="mt-10 flex justify-center pb-10 md:mt-12 md:pb-14"
                initial={reduce ? false : { opacity: 0, y: 6 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35 }}
              >
                <button
                  type="button"
                  className="plp-load-more gradient-gold-premium inline-flex min-h-[48px] min-w-[240px] items-center justify-center rounded-full px-12 py-3.5 font-body text-[11px] font-semibold uppercase text-white transition-transform duration-300 hover:-translate-y-0.5"
                  onClick={() => setVisibleCount((c) => c + LOAD_STEP)}
                >
                  Load More Products
                </button>
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
