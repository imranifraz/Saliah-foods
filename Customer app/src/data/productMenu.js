import {
  premiumDates,
  wellnessProducts,
  customerFavourites,
} from "./homepage";

function withId(products, prefix) {
  return products.map((p) => ({
    ...p,
    id: `${prefix}-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  }));
}

/** Everyday & pouch date varieties */
const datesProducts = withId(
  premiumDates.filter((p) =>
    ["Zahidi Dates", "Seedless Dates", "Desert Royal Dates", "Khajoor Family Pack"].includes(p.name)
  ),
  "dates"
);

/** Premium boxed dates */
const premiumDatesProducts = withId(
  premiumDates.filter((p) =>
    ["Kimia Dates", "Ajwa Dates", "Safawi Dates", "Medjool Gift Box", "Mabroom Dates"].includes(p.name)
  ),
  "premium"
);

export const productMenuCategories = [
  {
    id: "dates",
    label: "Dates",
    description: "Everyday snacking and family favourites",
    viewAllHref: "/products/dates",
    products: datesProducts,
    featuredPromo: {
      title: "Everyday Date Collection",
      subtitle: "Naturally Sweet • Family Packs",
      cta: "Explore Collection",
      image: "/assets/premium-dates-category.png",
    },
  },
  {
    id: "premium-dates",
    label: "Premium Dates",
    description: "Soft, rich, and gift-worthy varieties",
    viewAllHref: "/products/premium-dates",
    products: premiumDatesProducts,
    featuredPromo: {
      title: "Premium Medjool Collection",
      subtitle: "Naturally Sweet • Imported",
      cta: "Explore Collection",
      image: "/assets/kimia-dates.png",
    },
  },
  {
    id: "wellness-traditional",
    label: "Wellness & Traditional",
    description: "Natural foods for daily wellness",
    viewAllHref: "/products/wellness-traditional",
    products: withId(wellnessProducts, "wellness"),
    featuredPromo: {
      title: "Wellness Essentials",
      subtitle: "No Added Sugar • Pure Ingredients",
      cta: "Shop Wellness",
      image: "/assets/wellness-foods-category.png",
    },
  },
  {
    id: "best-sellers",
    label: "Best Sellers",
    description: "Customer favourites across our range",
    viewAllHref: "/products/best-sellers",
    products: withId(customerFavourites, "bestseller"),
    featuredPromo: {
      title: "Customer Favourites",
      subtitle: "Bestseller • Premium Quality",
      cta: "View Best Sellers",
      image: "/assets/ajwa-dates.png",
    },
  },
];

export function getCategoryById(categoryId) {
  if (categoryId === "all") {
    return {
      id: "all",
      label: "All Products",
      description: "Discover our complete range of premium dates, wellness foods, and customer favourites.",
      viewAllHref: "/products",
      products: [],
    };
  }
  return productMenuCategories.find((c) => c.id === categoryId) ?? null;
}
