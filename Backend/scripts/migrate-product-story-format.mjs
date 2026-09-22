import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function serializeProductStory(story = {}) {
  const overview = String(story.overview || "").trim();
  const highlights = (story.highlights || []).map((item) => String(item || "").trim()).filter(Boolean);
  const ingredients = String(story.ingredients || "").trim();
  const nutrition = (story.nutrition || [])
    .map((row) => ({ label: String(row?.label || "").trim(), value: String(row?.value || "").trim() }))
    .filter((row) => row.label && row.value);
  const nutritionNote = String(story.nutritionNote || "").trim();
  const origin = String(story.origin || "").trim();
  const storage = String(story.storage || "").trim();
  const bestBefore = String(story.bestBefore || "").trim();
  const important = String(story.important || "").trim();
  const facts = (story.facts || [])
    .map((row) => ({ label: String(row?.label || "").trim(), value: String(row?.value || "").trim() }))
    .filter((row) => row.label && row.value);

  const parts = [];
  if (overview) parts.push(overview);
  if (highlights.length) parts.push(["Product Highlights", ...highlights].join("\n"));
  if (ingredients) parts.push(`Ingredients\n${ingredients}`);
  if (nutrition.length) {
    const lines = nutrition.map((row) => `${row.label}: ${row.value}`);
    if (nutritionNote) lines.push(nutritionNote);
    parts.push(["Nutrition Information — Per 100g", ...lines].join("\n"));
  }
  if (origin) parts.push(`Country of Origin\n${origin}`);
  if (storage) parts.push(`Storage\n${storage}`);
  if (bestBefore) parts.push(`Best Before\n${bestBefore}`);
  if (important) parts.push(`Important Information\n${important}`);
  if (facts.length) {
    parts.push(["Product Facts", ...facts.map((row) => `${row.label}: ${row.value}`)].join("\n"));
  }
  return parts.join("\n\n").trim();
}

const DATE_NUTRITION = [
  { label: "Energy", value: "280–380 kcal" },
  { label: "Protein", value: "2–3.5g" },
  { label: "Carbohydrates", value: "70–80g" },
  { label: "Total Sugars", value: "55–65g" },
  { label: "Dietary Fibre", value: "5–8g" },
  { label: "Cholesterol", value: "0" },
];

const DEFAULTS = {
  nutritionNote: "Values are approximate as stated on the product packaging.",
  storage: "Keep in a dry and cool area and keep away from direct sunlight.",
  bestBefore: "As stated on the product packaging.",
  important: "Agricultural product. Sorted and packed under hygienic conditions. May contain traces of nuts.",
};

const CATALOG = {
  "ajwa-dates": {
    tagline: "Rich & premium Prophetic dates",
    overview:
      "Saliah Ajwa Dates are a prized variety known for their deep colour, soft bite, and naturally rich sweetness.\n\nCarefully selected and packed for everyday snacking, gifting, and traditional occasions.",
    highlights: ["Premium Ajwa variety", "Naturally sweet", "Soft texture", "No added sugar", "Hygienically packed"],
    ingredients: "Dates",
    origin: "Saudi Arabia",
  },
  "kimia-dates": {
    tagline: "Soft & juicy everyday dates",
    overview:
      "Saliah Kimia Dates offer a soft, juicy bite with balanced natural sweetness — ideal for daily snacking and family sharing.\n\nSorted and packed under hygienic conditions to protect freshness from our facility to your home.",
    highlights: ["Soft & juicy", "Naturally sweet", "Everyday snacking", "No added sugar", "Freshly packed"],
    ingredients: "Dates",
    origin: "Middle East",
  },
  "safawi-dates": {
    tagline: "Dark & chewy premium dates",
    overview:
      "Saliah Safawi Dates are dark, chewy, and richly flavoured — a classic choice for tea-time and wholesome snacking.\n\nEach pack is carefully sorted for size, moisture, and appearance.",
    highlights: ["Dark & chewy", "Rich flavour", "No added sugar", "Premium selection", "Hygienically packed"],
    ingredients: "Dates",
    origin: "Middle East",
  },
  zahidi: null, // keep existing structured content
  "mabroom-dates": {
    tagline: "Long, chewy & richly sweet",
    overview:
      "Saliah Mabroom Dates are long and chewy with a deep natural sweetness — perfect for gifting and festive platters.\n\nPacked fresh to preserve texture and flavour.",
    highlights: ["Long & chewy", "Richly sweet", "Premium dates", "No added sugar", "Gift-ready packing"],
    ingredients: "Dates",
    origin: "Middle East",
  },
  "seedless-dates": {
    tagline: "Easy everyday snacking",
    overview:
      "Saliah Seedless Dates make wholesome snacking effortless — soft, naturally sweet, and ready to enjoy without fuss.\n\nIdeal for kids, travel, and quick energy between meals.",
    highlights: ["Seedless convenience", "Naturally sweet", "Family friendly", "No added sugar", "Ready to eat"],
    ingredients: "Dates",
    origin: "Middle East",
  },
  "desert-royal-dates": {
    tagline: "Naturally sweet everyday dates",
    overview:
      "Saliah Desert Royal Dates bring dependable natural sweetness for daily rituals — breakfast bowls, snacks, and simple desserts.\n\nSelected for consistent taste and texture in every pack.",
    highlights: ["Naturally sweet", "Everyday quality", "No added sugar", "Versatile use", "Carefully packed"],
    ingredients: "Dates",
    origin: "Middle East",
  },
  "medjool-gift-box": {
    tagline: "Luxury gifting assortment",
    overview:
      "The Saliah Medjool Gift Box presents large, luscious Medjool dates in a gifting-ready format.\n\nA refined choice for celebrations, corporate gestures, and festive sharing.",
    highlights: ["Premium Medjool", "Gift-ready presentation", "Naturally sweet", "Soft & luscious", "Celebration favourite"],
    ingredients: "Dates",
    origin: "Middle East",
  },
  "khajoor-family-pack": {
    tagline: "Three everyday pouches for sharing",
    overview:
      "Saliah Khajoor Family Pack brings together everyday date pouches for homes that snack together.\n\nConvenient multi-pack value without compromising on freshness or taste.",
    highlights: ["Family sharing pack", "Everyday dates", "Naturally sweet", "Value packing", "No added sugar"],
    ingredients: "Dates",
    origin: "Middle East",
  },
  "organic-date-bites": {
    tagline: "Soft bite-sized dates for kids & travel",
    overview:
      "Saliah Organic Date Bites are soft, portion-friendly pieces made for little hands and on-the-go moments.\n\nNaturally sweet fuel without refined sugar.",
    highlights: ["Bite-sized", "Travel friendly", "Naturally sweet", "Kid friendly", "No added sugar"],
    ingredients: "Dates",
    origin: "Middle East",
  },
  "saffron-infused-dates": {
    tagline: "Fragrant dates with a saffron finish",
    overview:
      "Saliah Saffron Infused Dates pair premium dates with a delicate saffron aroma for an elevated snacking experience.\n\nCrafted for festive tables and thoughtful gifting.",
    highlights: ["Saffron aroma", "Premium dates", "Festive favourite", "Naturally sweet", "Gift-ready"],
    ingredients: "Dates, saffron",
    origin: "Middle East",
  },
  "date-syrup": {
    tagline: "Natural sweetener for drinks & desserts",
    overview:
      "Saliah Date Syrup is a smooth, naturally sweet pourable syrup made for drinks, breakfasts, and desserts.\n\nA pantry essential when you want sweetness without refined sugar.",
    highlights: ["Natural sweetener", "Pourable consistency", "No refined sugar", "Breakfast & dessert ready", "Pantry staple"],
    ingredients: "Dates",
    origin: "India",
    nutrition: [
      { label: "Energy", value: "300 kcal" },
      { label: "Carbohydrates", value: "75g" },
      { label: "Total Sugars", value: "70g" },
      { label: "Protein", value: "1g" },
    ],
  },
  "amla-candy": {
    tagline: "Tangy traditional snack",
    overview:
      "Saliah Amla Candy captures the classic tangy-sweet bite of traditional amla treats.\n\nA lively everyday munch with a familiar heritage taste.",
    highlights: ["Tangy & sweet", "Traditional recipe", "Everyday snack", "No artificial colours", "Freshly packed"],
    ingredients: "Amla, sugar",
    origin: "India",
  },
  "rose-gulkand": {
    tagline: "Aromatic rose preserve",
    overview:
      "Saliah Rose Gulkand is a fragrant traditional preserve made for paan, desserts, and cooling summer rituals.\n\nRich aroma with a soft, spoonable texture.",
    highlights: ["Rose aroma", "Traditional preserve", "Dessert ready", "Festive favourite", "Carefully prepared"],
    ingredients: "Rose petals, sugar",
    origin: "India",
  },
  "mixed-fruit-jam": {
    tagline: "Family-friendly breakfast spread",
    overview:
      "Saliah Mixed Fruit Jam brings a bright fruit spread for toast, parathas, and family breakfasts.\n\nBalanced sweetness with a familiar homemade character.",
    highlights: ["Mixed fruit flavour", "Breakfast favourite", "Family friendly", "Smooth spread", "Everyday pantry"],
    ingredients: "Mixed fruits, sugar",
    origin: "India",
  },
  "fig-honey-delight": {
    tagline: "Sweet, rich & wholesome",
    overview:
      "Saliah Fig & Honey Delight combines soft figs with natural honey for a rich, wholesome treat.\n\nEnjoy as a snack, dessert topper, or mindful indulgence.",
    highlights: ["Figs & honey", "Wholesome treat", "Naturally rich", "Snack or dessert", "Carefully packed"],
    ingredients: "Figs, honey",
    origin: "India",
  },
  "dry-fruit-with-honey": {
    tagline: "Rich blend for wellness & gifting",
    overview:
      "Saliah Dry Fruit with Honey is a nourishing mix of dry fruits bound with natural honey.\n\nA thoughtful choice for wellness routines and premium gifting.",
    highlights: ["Dry fruit blend", "Natural honey", "Wellness snack", "Gift-ready", "Wholesome energy"],
    ingredients: "Dry fruits, honey",
    origin: "India",
  },
  "traditional-health-mix": {
    tagline: "Wholesome morning nourishment",
    overview:
      "Saliah Traditional Health Mix brings a heritage-inspired blend for morning bowls and warm milk rituals.\n\nCrafted for everyday nourishment with a familiar traditional character.",
    highlights: ["Traditional blend", "Morning ritual", "Wholesome nourishment", "Pantry essential", "Carefully packed"],
    ingredients: "Selected grains and traditional ingredients",
    origin: "India",
  },
  "arabian-oasis": {
    tagline: "Premium Arabian dates selection",
    overview:
      "Saliah Arabian Oasis is a premium dates selection made for everyday luxury snacking.\n\nNaturally sweet with a rich texture — ready for sharing plates and quiet moments alike.",
    highlights: ["Premium selection", "Naturally sweet", "Rich texture", "No added sugar", "Hygienically packed"],
    ingredients: "Dates",
    origin: "Middle East",
  },
};

function buildStoryForProduct(product) {
  const preset = CATALOG[product.slug];
  if (preset === null) {
    // Keep existing Zahidi (or any marked) content if already structured.
    const alreadyStructured = /Product Highlights|Nutrition Information|Product Facts/i.test(
      product.fullDescription || ""
    );
    if (alreadyStructured) {
      return {
        skip: true,
        benefits: Array.isArray(product.benefits) ? product.benefits : [],
        fullDescription: product.fullDescription,
        tagline: product.tagline,
      };
    }
  }

  const base = preset || {
    tagline: product.tagline || `Premium ${product.name}`,
    overview: `${product.name} from Saliah Foods — carefully sourced and packed for families who value quality and tradition.\n\nEnjoy as a wholesome snack or as part of your everyday kitchen rituals.`,
    highlights:
      Array.isArray(product.benefits) && product.benefits.length && product.benefits[0] !== "Natural Energy"
        ? product.benefits
        : ["Natural ingredients", "Carefully packed", "Pan-India delivery ready"],
    ingredients: /date/i.test(product.name) ? "Dates" : "See pack label",
    origin: /date/i.test(product.name) ? "Middle East" : "India",
  };

  const packSize = product.packSize || product.variants?.[0]?.weight || "";
  const isDates = /date|khajoor|kimia|ajwa|safawi|zahidi|medjool|mabroom/i.test(
    `${product.name} ${product.slug} ${product.categoryId}`
  );

  const story = {
    overview: base.overview,
    highlights: base.highlights,
    ingredients: base.ingredients,
    nutrition: base.nutrition || (isDates ? DATE_NUTRITION : []),
    nutritionNote: DEFAULTS.nutritionNote,
    origin: base.origin,
    storage: DEFAULTS.storage,
    bestBefore: DEFAULTS.bestBefore,
    important: DEFAULTS.important,
    facts: [
      { label: "Brand", value: "Saliah Foods" },
      { label: "Product", value: product.name },
      ...(packSize ? [{ label: "Net Weight", value: packSize }] : []),
      { label: "Ingredient", value: base.ingredients },
      { label: "Country of Origin", value: base.origin },
    ],
  };

  return {
    skip: false,
    tagline: base.tagline || product.tagline || "",
    benefits: story.highlights,
    fullDescription: serializeProductStory(story),
  };
}

const products = await prisma.product.findMany({
  include: { variants: { orderBy: [{ isDefault: "desc" }, { sortOrder: "asc" }] } },
  orderBy: { name: "asc" },
});

let updated = 0;
let skipped = 0;

for (const product of products) {
  const next = buildStoryForProduct(product);
  if (next.skip) {
    skipped += 1;
    console.log(`skip  ${product.slug}`);
    continue;
  }

  await prisma.product.update({
    where: { id: product.id },
    data: {
      tagline: next.tagline,
      fullDescription: next.fullDescription,
      benefits: next.benefits,
    },
  });
  updated += 1;
  console.log(`ok    ${product.slug} (${next.fullDescription.length} chars, ${next.benefits.length} highlights)`);
}

console.log(JSON.stringify({ total: products.length, updated, skipped }, null, 2));
await prisma.$disconnect();
