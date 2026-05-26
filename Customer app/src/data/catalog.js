/**
 * Product names and shop groupings from your master list
 * (Product List.xlsx — Saliah SKUs). Images are placeholders until catalog art is wired.
 */

const img = {
  dates: "https://images.unsplash.com/photo-1596040033229-a9821ebd053d?auto=format&fit=crop&w=800&q=80",
  dates2: "https://images.unsplash.com/photo-1607623488235-d48b4c652a95?auto=format&fit=crop&w=800&q=80",
  jar: "https://images.unsplash.com/photo-1587049352846-4a222e197d12?auto=format&fit=crop&w=800&q=80",
  nuts: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=800&q=80",
  wellness: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80",
};

/** Hero strip — three lanes that match your range (not generic e‑com labels). */
export const heroPromos = [
  {
    title: "Black & seedless dates",
    subtitle: "Black dates · Seedless · Premium Black PC",
    href: "#collections",
    img: img.dates,
  },
  {
    title: "Kimia, Ajwa & Safawi",
    subtitle: "Premium packs — PC & pouch sizes",
    href: "#delicacies",
    img: img.dates2,
  },
  {
    title: "Preserves, honey & syrups",
    subtitle: "Jam · Gulkand · Fig & honey · Date syrup",
    href: "#delicacies",
    img: img.jar,
  },
];

/** Four collection tiles — coverage matches Product List.xlsx groupings. */
export const shopCollections = [
  {
    label: "Black & seedless dates",
    meta: "Black dates pouch · Black seedless · Premium Black · Seedless PC & pouch",
    href: "#delicacies",
    img: img.dates,
  },
  {
    label: "Regional & everyday dates",
    meta: "Desert Royal · Arabian Oasis · Fardh · Zahidi · Golden Zahidi",
    href: "#delicacies",
    img: img.dates2,
  },
  {
    label: "Kimia, Ajwa & Safawi",
    meta: "Kimia PC · Ajwa · Safawi — retail & gift weights",
    href: "#delicacies",
    img: img.dates,
  },
  {
    label: "Preserves, snacks & amla",
    meta: "Jam · Gulkand · Honey delights · Date syrup · Flavoured cashew & almond · Makhana · Amla & juices",
    href: "#delicacies",
    img: img.jar,
  },
];

/** @typedef {{ name: string; tag: string; img: string; priceFrom: string; mrp?: string; badge?: string }} CatalogProduct */

/** @type {CatalogProduct[]} — Saliah delicacies grid (names only from your list). */
export const delicaciesProducts = [
  {
    name: "Premium Black Dates PC 350g",
    tag: "Signature dates",
    img: img.dates,
    priceFrom: "From ₹ —",
  },
  {
    name: "Zahidi Dates PC 500g",
    tag: "Zahidi line",
    img: img.dates2,
    priceFrom: "From ₹ —",
  },
  {
    name: "Golden Zahidi Dates Pouch 200g",
    tag: "Golden Zahidi",
    img: img.dates,
    priceFrom: "From ₹ —",
  },
  {
    name: "Saliah Mixed fruit jam 100g",
    tag: "Preserves",
    img: img.jar,
    priceFrom: "From ₹ —",
  },
  {
    name: "Pure Nuts & Honey delight - 250g",
    tag: "Honey range",
    img: img.jar,
    priceFrom: "From ₹ —",
  },
  {
    name: "Kimia Dates PC 400g",
    tag: "Kimia",
    img: img.dates2,
    priceFrom: "From ₹ —",
  },
  {
    name: "Ajwa Dates 500g",
    tag: "Ajwa",
    img: img.dates,
    priceFrom: "From ₹ —",
  },
  {
    name: "Pepper Cashew 100g",
    tag: "Flavoured cashew",
    img: img.nuts,
    priceFrom: "From ₹ —",
  },
];

/** @type {CatalogProduct[]} — “New arrivals” sample (swap SKUs when you confirm launches). */
export const newArrivalProducts = [
  {
    name: "Date Syrup 250g + 100g Saliah jam",
    tag: "Combo",
    img: img.jar,
    priceFrom: "From ₹ —",
    badge: "New stock",
  },
  {
    name: "Cheese Cashew 100g",
    tag: "Flavoured cashew",
    img: img.nuts,
    priceFrom: "From ₹ —",
    badge: "New stock",
  },
  {
    name: "Jamum Juice 250g",
    tag: "Juice",
    img: img.wellness,
    priceFrom: "From ₹ —",
    badge: "New stock",
  },
  {
    name: "Piri Piri Almond 100g",
    tag: "Flavoured almond",
    img: img.nuts,
    priceFrom: "From ₹ —",
    badge: "New stock",
  },
];
