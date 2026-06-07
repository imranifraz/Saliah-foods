import { withHomeImagery } from "./productImagery";
import { buildPriceFields, formatINR } from "./pricing";

export { formatINR } from "./pricing";

function priced(product, amount, mrpAmount) {
  return { ...product, ...buildPriceFields(amount, mrpAmount) };
}

const img = {
  hero: "/assets/hero-banner.png",
  premiumDatesCategory: "/assets/premium-dates-category.png",
  dateBasedProductsCategory: "/assets/date-based-products-category.png",
  wellnessFoodsCategory: "/assets/wellness-foods-category.png",
  honeyBlendsCategory: "/assets/honey-blends-category.png",
  fruitPreservesCategory: "/assets/fruit-preserves-category.png",
  kimiaDates: "/assets/kimia-dates.png",
  ajwaDates: "/assets/ajwa-dates.png",
  safawiDates: "/assets/safawi-dates.png",
  zahidiDates: "/assets/zahidi-dates.png",
  seedlessDates: "/assets/seedless-dates.png",
  desertRoyalDates: "/assets/desert-royal-dates.png",
  dateSyrup: "/assets/date-syrup.png",
  amlaCandy: "/assets/amla-candy.png",
  roseGulkand: "/assets/rose-gulkand.png",
  dryFruitWithHoney: "/assets/dry-fruit-with-honey.png",
  figHoneyDelight: "/assets/fig-honey-delight.png",
  mixedFruitJam: "/assets/mixed-fruit-jam.png",
  brandLegacy: "/assets/brand-legacy.png",
};

/** Pass through review meta when present on static/home payloads. */
function withReviews(product, reviewCount) {
  const count = product.reviewCount ?? reviewCount ?? 0;
  return withHomeImagery({
    ...product,
    reviewCount: count,
    rating: count > 0 && product.rating != null ? product.rating : null,
  });
}

export const trustStrip = [
  { icon: "box", title: "Freshly Packed", text: "Sealed with care for every order" },
  { icon: "leaf", title: "Natural Ingredients", text: "Thoughtfully selected everyday foods" },
  { icon: "shield", title: "Secure Checkout", text: "Safe and simple online shopping" },
  { icon: "delivery", title: "Delivery Across India", text: "Nationwide dispatch on select ranges" },
];

export const shopCategories = [
  {
    title: "Premium Dates",
    products: "Kimia, Ajwa, Safawi, Zahidi, Seedless Dates",
    cta: "Shop Dates",
    href: "#premium-dates",
    img: img.premiumDatesCategory,
    featured: true,
  },
  {
    title: "Date-Based Products",
    products: "Date Syrup, Ajwa Seed Powder",
    cta: "Explore Date Products",
    href: "#premium-dates",
    img: img.dateBasedProductsCategory,
    featured: true,
  },
  {
    title: "Traditional Wellness Foods",
    products: "Amla Candy, Rose Gulkand, Health Mix",
    cta: "Shop Wellness",
    href: "#wellness-products",
    img: img.wellnessFoodsCategory,
    featured: true,
  },
  {
    title: "Honey & Natural Blends",
    products: "Dry Fruit with Honey, Fig & Honey Delight",
    cta: "View Blends",
    href: "#wellness-products",
    img: img.honeyBlendsCategory,
    featured: true,
  },
  {
    title: "Fruit Preserves",
    products: "Mixed Fruit Jam",
    cta: "Shop Preserves",
    href: "#wellness-products",
    img: img.fruitPreservesCategory,
    featured: true,
  },
];

export const premiumDates = [
  withReviews(priced({ name: "Kimia Dates", tagline: "Soft & Juicy", tag: "Soft", img: img.kimiaDates, packSize: "1kg" }, 1299), 248),
  withReviews(priced({ name: "Ajwa Dates", tagline: "Rich & Premium", tag: "Premium", img: img.ajwaDates, packSize: "1kg" }, 1899), 312),
  withReviews(priced({ name: "Safawi Dates", tagline: "Dark & Chewy", tag: "Premium", img: img.safawiDates, packSize: "1kg" }, 1149), 189),
  withReviews(priced({ name: "Zahidi Dates", tagline: "Mildly Sweet", tag: "Natural Sweetness", img: img.zahidiDates, packSize: "250g" }, 299), 156),
  withReviews(priced({ name: "Seedless Dates", tagline: "Easy Everyday Snacking", tag: "Seedless", img: img.seedlessDates, packSize: "300g" }, 349), 203),
  withReviews(priced({ name: "Desert Royal Dates", tagline: "Naturally Sweet", tag: "Everyday Snack", img: img.desertRoyalDates, packSize: "250g" }, 279), 174),
  withReviews(priced({ name: "Medjool Gift Box", tagline: "Luxury gifting assortment", tag: "Premium", img: img.kimiaDates, packSize: "Gift Box", imageProfile: "box" }, 1699), 94),
  withReviews(priced({ name: "Mabroom Dates", tagline: "Long, chewy & richly sweet", tag: "Premium", img: img.zahidiDates, packSize: "500g" }, 899), 67),
  withReviews(priced({ name: "Khajoor Family Pack", tagline: "Three everyday pouches for sharing", tag: "Natural Sweetness", img: img.seedlessDates, packSize: "3 × 250g" }, 799), 112),
];

export const wellnessProducts = [
  withReviews(priced({
    name: "Date Syrup",
    tagline: "Natural sweetener for drinks, desserts, and breakfast",
    img: img.dateSyrup,
    packSize: "400g",
  }, 449), 142),
  withReviews(priced({
    name: "Amla Candy",
    tagline: "Tangy traditional snack for everyday munching",
    img: img.amlaCandy,
    packSize: "250g",
  }, 199), 98),
  withReviews(priced({
    name: "Rose Gulkand",
    tagline: "Aromatic preserve with a traditional taste",
    img: img.roseGulkand,
    packSize: "250g",
  }, 349), 121),
  withReviews(priced({
    name: "Dry Fruit with Honey",
    tagline: "Rich natural blend for wellness and gifting",
    img: img.dryFruitWithHoney,
    packSize: "250g",
  }, 599), 87),
  withReviews(priced({
    name: "Fig & Honey Delight",
    tagline: "Sweet, rich, and wholesome treat",
    img: img.figHoneyDelight,
    packSize: "250g",
  }, 549), 76),
  withReviews(priced({
    name: "Mixed Fruit Jam",
    tagline: "Family-friendly spread for breakfast",
    img: img.mixedFruitJam,
    packSize: "100g",
  }, 149), 134),
  withReviews(priced({
    name: "Ajwa Seed Powder",
    tagline: "Fine-ground premium ajwa for daily wellness",
    tag: "Premium",
    img: img.amlaCandy,
    packSize: "200g",
    isNew: true,
  }, 549), 58),
  withReviews(priced({
    name: "Traditional Health Mix",
    tagline: "Wholesome blend for morning nourishment",
    tag: "Organic",
    img: img.dryFruitWithHoney,
    packSize: "400g",
  }, 449), 73),
  withReviews(priced({
    name: "Saffron Infused Dates",
    tagline: "Royal dates with delicate saffron notes",
    tag: "Premium",
    img: img.kimiaDates,
    packSize: "Gift Box",
    imageProfile: "box",
  }, 999), 41),
  withReviews(priced({
    name: "Organic Date Bites",
    tagline: "Soft bite-sized dates for kids & travel",
    tag: "No Added Sugar",
    img: img.desertRoyalDates,
    packSize: "300g",
    isNew: true,
  }, 379), 86),
];

export const customerFavourites = [
  withReviews(priced({ name: "Kimia Dates", tagline: "Soft & Juicy", img: img.kimiaDates, packSize: "1kg" }, 1299), 248),
  withReviews(priced({ name: "Ajwa Dates", tagline: "Rich & Premium", img: img.ajwaDates, packSize: "1kg" }, 1899), 312),
  withReviews(priced({ name: "Seedless Dates", tagline: "Easy Everyday Snacking", img: img.seedlessDates, packSize: "300g" }, 349), 203),
  withReviews(priced({ name: "Date Syrup", tagline: "Natural sweetener for everyday use", img: img.dateSyrup, packSize: "400g" }, 449), 142),
  withReviews(priced({ name: "Amla Candy", tagline: "Tangy traditional snack", img: img.amlaCandy, packSize: "250g" }, 199), 98),
  withReviews(priced({ name: "Rose Gulkand", tagline: "Aromatic traditional preserve", img: img.roseGulkand, packSize: "250g" }, 349), 121),
  withReviews(priced({ name: "Dry Fruit with Honey", tagline: "Rich natural wellness blend", img: img.dryFruitWithHoney, packSize: "250g" }, 599), 87),
  withReviews(priced({ name: "Mixed Fruit Jam", tagline: "Family-friendly breakfast spread", img: img.mixedFruitJam, packSize: "100g" }, 149), 134),
  withReviews(priced({ name: "Medjool Gift Box", tagline: "Perfect for festive gifting", img: img.kimiaDates, packSize: "Gift Box", imageProfile: "box" }, 1699), 94),
  withReviews(priced({ name: "Saffron Infused Dates", tagline: "A royal treat for special moments", img: img.kimiaDates, packSize: "Gift Box", imageProfile: "box" }, 999), 41),
];

export const shopByNeed = [
  { need: "Daily Healthy Snacking", products: "Kimia Dates / Seedless Dates", href: "#premium-dates" },
  { need: "Premium Date Choice", products: "Ajwa Dates / Safawi Dates", href: "#premium-dates" },
  { need: "Natural Sweetener", products: "Date Syrup", href: "#wellness-products" },
  { need: "Traditional Taste", products: "Amla Candy / Rose Gulkand", href: "#wellness-products" },
  { need: "Breakfast Add-on", products: "Mixed Fruit Jam", href: "#wellness-products" },
  { need: "Rich Natural Blend", products: "Dry Fruit with Honey / Fig & Honey Delight", href: "#wellness-products" },
];

export { img as homepageImages };
