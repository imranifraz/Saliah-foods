import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useCatalog } from "../context/CatalogContext.jsx";
import {
  FILTER_OPTIONS,
  SORT_OPTIONS,
  filterProducts,
  getProductDetailPath,
  sortProducts,
} from "../data/productCatalog";
import { ProductListingFilterBar } from "../components/products/ProductListingFilters";
import { ProductListingFeatured } from "../components/products/ProductListingFeatured";
import {
  ProductListingBreadcrumb,
  ProductListingHero,
} from "../components/products/ProductListingHero";
import { ProductCard } from "../components/ui/ProductCard";

const INITIAL_VISIBLE = 6;
const LOAD_STEP = 6;
const FEATURED_AFTER_INDEX = 2;

function matchesSearch(product, query) {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return (
    product.name.toLowerCase().includes(q) ||
    (product.tagline ?? "").toLowerCase().includes(q) ||
    (product.categoryLabel ?? "").toLowerCase().includes(q)
  );
}

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
  const reduce = useReducedMotion();
  const {
    loading: catalogLoading,
    categoryPills,
    getCategoryById,
    getProductsForCategory,
  } = useCatalog();

  const [activeCategory, setActiveCategory] = useState(categoryId ?? "all");
  const [price, setPrice] = useState("all");
  const [benefits, setBenefits] = useState("all");
  const [packaging, setPackaging] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [filterPinned, setFilterPinned] = useState(false);
  const [filterBarHeight, setFilterBarHeight] = useState(0);

  const heroEndRef = useRef(null);
  const filterBarRef = useRef(null);

  useEffect(() => {
    setActiveCategory(categoryId ?? "all");
    setVisibleCount(INITIAL_VISIBLE);
    setSearchQuery("");
    setFilterPinned(false);
  }, [categoryId]);

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

  const filteredProducts = useMemo(() => {
    const filtered = filterProducts(allProducts, {
      category: "all",
      price,
      benefits,
      packaging,
      availability,
    });
    const sorted = sortProducts(filtered, sortBy);
    return sorted.filter((p) => matchesSearch(p, searchQuery));
  }, [allProducts, price, benefits, packaging, availability, sortBy, searchQuery]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const gridItems = useMemo(() => buildGridItems(visibleProducts), [visibleProducts]);
  const hasMore = visibleCount < filteredProducts.length;

  const hasActiveFilters =
    price !== "all" ||
    benefits !== "all" ||
    packaging !== "all" ||
    searchQuery.trim().length > 0;

  useEffect(() => {
    const measure = () => {
      if (filterBarRef.current) {
        setFilterBarHeight(filterBarRef.current.offsetHeight);
      }
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeCategory, searchQuery, price, benefits, packaging, sortBy]);

  useEffect(() => {
    const target = heroEndRef.current;
    if (!target) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setFilterPinned(!entry.isIntersecting),
      { threshold: 0, rootMargin: "0px 0px 0px 0px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [categoryId]);

  const handleCategoryChange = (id) => {
    setActiveCategory(id);
    setVisibleCount(INITIAL_VISIBLE);
    navigate(id === "all" ? "/products/all" : `/products/${id}`);
  };

  const handleFilterChange = (key, value) => {
    setVisibleCount(INITIAL_VISIBLE);
    if (key === "price") setPrice(value);
    if (key === "benefits") setBenefits(value);
    if (key === "packaging") setPackaging(value);
    if (key === "availability") setAvailability(value);
  };

  const clearFilters = () => {
    setPrice("all");
    setBenefits("all");
    setPackaging("all");
    setAvailability("all");
    setSearchQuery("");
    setSortBy("featured");
    setVisibleCount(INITIAL_VISIBLE);
  };

  if (catalogLoading) {
    return (
      <div className="mx-auto max-w-[1480px] px-4 py-28 text-center sm:px-5 md:px-10">
        <p className="font-body text-sm text-emerald-900/55">Loading products…</p>
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
        <ProductListingBreadcrumb label={pageCopy.label} />

        <ProductListingHero
          label={pageCopy.label}
          description={pageCopy.description}
          categoryId={categoryId ?? "all"}
          endRef={heroEndRef}
        />

        <div className="relative mb-4">
          {filterPinned ? (
            <div style={{ height: filterBarHeight }} className="pointer-events-none" aria-hidden />
          ) : null}
          <ProductListingFilterBar
            categoryPills={categoryPills}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
            filters={{
              price,
              benefits,
              packaging,
              availability,
              priceOptions: FILTER_OPTIONS.price,
              benefitsOptions: FILTER_OPTIONS.benefits,
              packagingOptions: FILTER_OPTIONS.packaging,
              availabilityOptions: FILTER_OPTIONS.availability,
            }}
            onFilterChange={handleFilterChange}
            sortBy={sortBy}
            sortOptions={SORT_OPTIONS}
            onSortChange={(v) => {
              setSortBy(v);
              setVisibleCount(INITIAL_VISIBLE);
            }}
            searchQuery={searchQuery}
            onSearchChange={(v) => {
              setSearchQuery(v);
              setVisibleCount(INITIAL_VISIBLE);
            }}
            productCount={filteredProducts.length}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            isPinned={filterPinned}
            filterRef={filterBarRef}
          />
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
              className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4"
              role="list"
              key={`${activeCategory}-${sortBy}-${price}-${benefits}-${packaging}-${searchQuery}`}
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
  );
}
