/**
 * Studio packshot mapping + in-frame balance profiles for homepage product grids.
 * Profiles keep pouch / box / jar / bottle / tub shapes at equal visual weight.
 */

export const homepagePackshots = {
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
};

/** Product name → packshot (studio PNG). Update when SKU art is added. */
const PACKSHOT_BY_NAME = {
  "Kimia Dates": homepagePackshots.kimiaDates,
  "Ajwa Dates": homepagePackshots.ajwaDates,
  "Safawi Dates": homepagePackshots.safawiDates,
  "Zahidi Dates": homepagePackshots.zahidiDates,
  "Seedless Dates": homepagePackshots.seedlessDates,
  "Desert Royal Dates": homepagePackshots.desertRoyalDates,
  "Mabroom Dates": homepagePackshots.zahidiDates,
  "Khajoor Family Pack": homepagePackshots.seedlessDates,
  "Medjool Gift Box": homepagePackshots.kimiaDates,
  "Saffron Infused Dates": homepagePackshots.ajwaDates,
  "Organic Date Bites": homepagePackshots.desertRoyalDates,
  "Date Syrup": homepagePackshots.dateSyrup,
  "Amla Candy": homepagePackshots.amlaCandy,
  "Rose Gulkand": homepagePackshots.roseGulkand,
  "Dry Fruit with Honey": homepagePackshots.dryFruitWithHoney,
  "Fig & Honey Delight": homepagePackshots.figHoneyDelight,
  "Mixed Fruit Jam": homepagePackshots.mixedFruitJam,
  "Ajwa Seed Powder": homepagePackshots.amlaCandy,
  "Traditional Health Mix": homepagePackshots.dryFruitWithHoney,
};

/**
 * @typedef {'pouch' | 'box' | 'jar' | 'bottle' | 'tub'} ImageProfile
 */

/** @returns {ImageProfile} */
export function inferImageProfile(product) {
  if (product.imageProfile) return product.imageProfile;

  const name = (product.name ?? "").toLowerCase();
  const pack = (product.packSize ?? "").toLowerCase();

  if (name.includes("syrup")) return "bottle";
  if (name.includes("powder")) return "jar";
  if (pack.includes("gift box") || name.includes("gift box")) return "box";
  if (name.includes("jam") || name.includes("gulkand") || name.includes("candy")) return "jar";
  if (name.includes("delight") || name.includes("health mix")) return "tub";
  if (name.includes("dry fruit") || name.includes("honey blend")) return "tub";
  if (pack.includes("3 ×") || pack.includes("pouch")) return "pouch";
  return "pouch";
}

/** Attach correct packshot + balance profile for homepage grids. */
export function withHomeImagery(product) {
  const img = PACKSHOT_BY_NAME[product.name] ?? product.img;
  const imageProfile = inferImageProfile({ ...product, img });

  return {
    ...product,
    img,
    imageProfile,
  };
}
