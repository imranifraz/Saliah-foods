import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { syncBestSellersFromSales } from "../src/lib/best-sellers.js";
import { stockStatusFromQuantity, syncProductSummary } from "../src/lib/products.js";
import { productUploadUrl, syncSeedProductImages } from "../src/lib/seedProductImages.js";
import { categoryUploadUrl, syncSeedCategoryImages } from "../src/lib/seedCategoryImages.js";

const prisma = new PrismaClient();

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Seed catalog products.
 * - imageFile: packshot in Backend/seed-assets/products (synced to uploads/products on seed)
 * - priceValue: selling price (GST-inclusive)
 * - mrpValue: MRP / cost price (required). When equal to priceValue there is no discount.
 */
const products = [
  {
    name: "Kimia Dates",
    tagline: "Soft & Juicy",
    tag: "Soft",
    imageFile: "kimia-dates.webp",
    packSize: "1kg",
    categoryId: "premium-dates",
    categoryLabel: "Premium Dates",
    priceValue: 1299,
    mrpValue: 1499,
    reviewCount: 248,
  },
  {
    name: "Ajwa Dates",
    tagline: "Rich & Premium",
    tag: "Premium",
    imageFile: "ajwa-dates.webp",
    packSize: "1kg",
    categoryId: "premium-dates",
    categoryLabel: "Premium Dates",
    priceValue: 1899,
    mrpValue: 2199,
    reviewCount: 312,
  },
  {
    name: "Safawi Dates",
    tagline: "Dark & Chewy",
    tag: "Premium",
    imageFile: "safawi-dates.webp",
    packSize: "1kg",
    categoryId: "premium-dates",
    categoryLabel: "Premium Dates",
    priceValue: 1149,
    mrpValue: 1299,
    reviewCount: 189,
  },
  {
    name: "Zahidi Dates",
    tagline: "Mildly Sweet",
    tag: "Natural Sweetness",
    imageFile: "zahidi-dates.webp",
    packSize: "250g",
    categoryId: "dates",
    categoryLabel: "Dates",
    priceValue: 299,
    mrpValue: 299,
    reviewCount: 156,
  },
  {
    name: "Seedless Dates",
    tagline: "Easy Everyday Snacking",
    tag: "Seedless",
    imageFile: "seedless-dates.webp",
    packSize: "300g",
    categoryId: "dates",
    categoryLabel: "Dates",
    priceValue: 349,
    mrpValue: 399,
    reviewCount: 203,
  },
  {
    name: "Desert Royal Dates",
    tagline: "Naturally Sweet",
    tag: "Everyday Snack",
    imageFile: "desert-royal-dates.webp",
    packSize: "250g",
    categoryId: "dates",
    categoryLabel: "Dates",
    priceValue: 279,
    mrpValue: 279,
    reviewCount: 174,
  },
  {
    name: "Medjool Gift Box",
    tagline: "Luxury gifting assortment",
    tag: "Premium",
    imageFile: "kimia-dates.webp",
    packSize: "Gift Box",
    categoryId: "premium-dates",
    categoryLabel: "Premium Dates",
    priceValue: 1699,
    mrpValue: 1999,
    reviewCount: 94,
  },
  {
    name: "Mabroom Dates",
    tagline: "Long, chewy & richly sweet",
    tag: "Premium",
    imageFile: "zahidi-dates.webp",
    packSize: "500g",
    categoryId: "premium-dates",
    categoryLabel: "Premium Dates",
    priceValue: 899,
    mrpValue: 999,
    reviewCount: 67,
  },
  {
    name: "Khajoor Family Pack",
    tagline: "Three everyday pouches for sharing",
    tag: "Natural Sweetness",
    imageFile: "seedless-dates.webp",
    packSize: "3 × 250g",
    categoryId: "dates",
    categoryLabel: "Dates",
    priceValue: 799,
    mrpValue: 849,
    reviewCount: 112,
  },
  {
    name: "Date Syrup",
    tagline: "Natural sweetener for drinks, desserts, and breakfast",
    imageFile: "date-syrup.webp",
    packSize: "400g",
    categoryId: "wellness-traditional",
    categoryLabel: "Wellness & Traditional",
    priceValue: 449,
    mrpValue: 499,
    reviewCount: 142,
  },
  {
    name: "Amla Candy",
    tagline: "Tangy traditional snack for everyday munching",
    imageFile: "amla-candy.webp",
    packSize: "250g",
    categoryId: "wellness-traditional",
    categoryLabel: "Wellness & Traditional",
    priceValue: 199,
    mrpValue: 199,
    reviewCount: 98,
  },
  {
    name: "Rose Gulkand",
    tagline: "Aromatic preserve with a traditional taste",
    imageFile: "rose-gulkand.webp",
    packSize: "250g",
    categoryId: "wellness-traditional",
    categoryLabel: "Wellness & Traditional",
    priceValue: 349,
    mrpValue: 399,
    reviewCount: 121,
  },
  {
    name: "Dry Fruit with Honey",
    tagline: "Rich natural blend for wellness and gifting",
    imageFile: "dry-fruit-with-honey.webp",
    packSize: "250g",
    categoryId: "wellness-traditional",
    categoryLabel: "Wellness & Traditional",
    priceValue: 599,
    mrpValue: 649,
    reviewCount: 87,
  },
  {
    name: "Fig & Honey Delight",
    tagline: "Sweet, rich, and wholesome treat",
    imageFile: "fig-honey-delight.webp",
    packSize: "250g",
    categoryId: "wellness-traditional",
    categoryLabel: "Wellness & Traditional",
    priceValue: 549,
    mrpValue: 549,
    reviewCount: 76,
  },
  {
    name: "Mixed Fruit Jam",
    tagline: "Family-friendly spread for breakfast",
    imageFile: "mixed-fruit-jam.webp",
    packSize: "100g",
    categoryId: "wellness-traditional",
    categoryLabel: "Wellness & Traditional",
    priceValue: 149,
    mrpValue: 149,
    reviewCount: 134,
  },
  {
    name: "Ajwa Seed Powder",
    tagline: "Fine-ground premium ajwa for daily wellness",
    tag: "Premium",
    imageFile: "amla-candy.webp",
    packSize: "200g",
    categoryId: "wellness-traditional",
    categoryLabel: "Wellness & Traditional",
    priceValue: 549,
    mrpValue: 599,
    reviewCount: 58,
    isNew: true,
  },
  {
    name: "Traditional Health Mix",
    tagline: "Wholesome blend for morning nourishment",
    tag: "Organic",
    imageFile: "dry-fruit-with-honey.webp",
    packSize: "400g",
    categoryId: "wellness-traditional",
    categoryLabel: "Wellness & Traditional",
    priceValue: 449,
    mrpValue: 449,
    reviewCount: 73,
  },
  {
    name: "Saffron Infused Dates",
    tagline: "Royal dates with delicate saffron notes",
    tag: "Premium",
    imageFile: "kimia-dates.webp",
    packSize: "Gift Box",
    categoryId: "premium-dates",
    categoryLabel: "Premium Dates",
    priceValue: 999,
    mrpValue: 1199,
    reviewCount: 41,
  },
  {
    name: "Organic Date Bites",
    tagline: "Soft bite-sized dates for kids & travel",
    tag: "No Added Sugar",
    imageFile: "desert-royal-dates.webp",
    packSize: "300g",
    categoryId: "wellness-traditional",
    categoryLabel: "Wellness & Traditional",
    priceValue: 379,
    mrpValue: 429,
    reviewCount: 86,
    isNew: true,
  },
];

function buildCategoryRecord(category) {
  const { imageFile, featuredPromo, ...rest } = category;
  const image = categoryUploadUrl(imageFile);

  let promo = featuredPromo;
  if (promo) {
    const { imageFile: promoImageFile, ...promoRest } = promo;
    promo = {
      ...promoRest,
      image: categoryUploadUrl(promoImageFile ?? imageFile),
    };
  }

  return { ...rest, image, featuredPromo: promo };
}

const blogPosts = [
  {
    id: "kimia-dates-benefits",
    title: "Why Kimia Dates Are Perfect for Everyday Snacking",
    excerpt: "Soft, naturally sweet, and packed with energy — discover how Kimia dates fit into your daily routine and family table.",
    date: "May 8, 2026",
    dateISO: "2026-05-08",
    category: "Wellness",
    readTime: "6 min read",
    author: "Saliah Editorial",
    featured: true,
    img: "/assets/kimia-dates.webp",
    content: [
      { type: "p", text: "Kimia dates are prized for their velvety texture and gentle sweetness — never cloying, always satisfying." },
    ],
  },
  {
    id: "date-syrup-uses",
    title: "5 Simple Ways to Use Date Syrup at Home",
    excerpt: "From morning smoothies to dessert drizzles, date syrup is a natural sweetener your kitchen will love.",
    date: "Apr 22, 2026",
    dateISO: "2026-04-22",
    category: "Recipes",
    readTime: "5 min read",
    author: "Saliah Editorial",
    featured: false,
    img: "/assets/date-syrup.webp",
    content: [{ type: "p", text: "Date syrup — silan — is one of the oldest sweeteners in the world." }],
  },
  {
    id: "traditional-wellness",
    title: "Rose Gulkand & Amla Candy: Traditional Foods for Modern Living",
    excerpt: "Explore timeless wellness foods that bring authentic taste and everyday nourishment to your home.",
    date: "Apr 10, 2026",
    dateISO: "2026-04-10",
    category: "Traditional",
    readTime: "7 min read",
    author: "Saliah Editorial",
    featured: false,
    img: "/assets/rose-gulkand.webp",
    content: [{ type: "p", text: "Some foods endure because they answer a human need with grace." }],
  },
  {
    id: "ajwa-dates-gifting",
    title: "The Art of Gifting Premium Ajwa Dates",
    excerpt: "Why Ajwa remains the crown jewel of date culture — and how to present it with intention for festivals and milestones.",
    date: "Mar 28, 2026",
    dateISO: "2026-03-28",
    category: "Lifestyle",
    readTime: "6 min read",
    author: "Saliah Editorial",
    featured: false,
    img: "/assets/ajwa-dates.webp",
    content: [{ type: "p", text: "Ajwa dates carry centuries of reverence." }],
  },
  {
    id: "desert-date-varieties",
    title: "From Desert to Table: Understanding Date Varieties",
    excerpt: "Safawi, Zahidi, Kimia, Ajwa — learn how origin and cultivar shape flavour, texture, and the perfect occasion.",
    date: "Mar 14, 2026",
    dateISO: "2026-03-14",
    category: "Sourcing",
    readTime: "8 min read",
    author: "Saliah Editorial",
    featured: false,
    img: "/assets/desert-royal-dates.webp",
    content: [{ type: "p", text: "Not all dates are created equal." }],
  },
  {
    id: "honey-date-pairing",
    title: "Honey & Dates: A Pairing Guide for the Conscious Pantry",
    excerpt: "Combine floral honey with premium dates for boards, breakfasts, and rituals that feel both ancient and contemporary.",
    date: "Feb 26, 2026",
    dateISO: "2026-02-26",
    category: "Recipes",
    readTime: "5 min read",
    author: "Saliah Editorial",
    featured: false,
    img: "/assets/dry-fruit-with-honey.webp",
    content: [{ type: "p", text: "Honey and dates share a language of warmth." }],
  },
];

async function main() {
  console.log("Seeding database...");

  const imageSync = syncSeedProductImages();
  console.log(
    `Product images synced (${imageSync.copied} copied, ${imageSync.skipped} unchanged) from ${imageSync.sourceDir}`
  );
  if (imageSync.missing > 0) {
    throw new Error(
      `${imageSync.missing} seed product image(s) missing. Run: npm run db:sync-seed-images after copying packshots to Backend/seed-assets/products/`
    );
  }

  const categoryImageSync = syncSeedCategoryImages();
  console.log(
    `Category images synced (${categoryImageSync.copied} copied, ${categoryImageSync.skipped} unchanged) from ${categoryImageSync.sourceDir}`
  );
  if (categoryImageSync.missing > 0) {
    throw new Error(
      `${categoryImageSync.missing} seed category image(s) missing. Run: npm run db:sync-seed-images after copying art to Backend/seed-assets/categories/`
    );
  }

  const categories = [
    {
      id: "dates",
      label: "Dates",
      description: "Everyday snacking and family favourites",
      imageFile: "premium-dates-category.webp",
      sortOrder: 1,
      featuredPromo: {
        title: "Everyday Date Collection",
        subtitle: "Naturally Sweet • Family Packs",
        cta: "Explore Collection",
        imageFile: "premium-dates-category.webp",
      },
    },
    {
      id: "premium-dates",
      label: "Premium Dates",
      description: "Soft, rich, and gift-worthy varieties",
      imageFile: "kimia-dates.webp",
      sortOrder: 2,
      featuredPromo: {
        title: "Premium Medjool Collection",
        subtitle: "Naturally Sweet • Imported",
        cta: "Explore Collection",
        imageFile: "kimia-dates.webp",
      },
    },
    {
      id: "wellness-traditional",
      label: "Wellness & Traditional",
      description: "Natural foods for daily wellness",
      imageFile: "wellness-foods-category.webp",
      sortOrder: 3,
    },
    {
      id: "best-sellers",
      label: "Best Sellers",
      description: "Top products by units sold — updated automatically from orders",
      imageFile: "ajwa-dates.webp",
      sortOrder: 4,
    },
  ];

  for (const cat of categories) {
    const record = buildCategoryRecord(cat);
    await prisma.category.upsert({
      where: { id: record.id },
      create: record,
      update: record,
    });
  }

  for (const [index, p] of products.entries()) {
    const slug = slugify(p.name);
    const catalogId = `${p.categoryId}-${slug}`;
    const img = productUploadUrl(p.imageFile);
    const mrpValue = p.mrpValue;
    const priceValue = p.priceValue;

    if (!mrpValue || mrpValue <= 0) {
      throw new Error(`${p.name}: mrpValue is required`);
    }
    if (priceValue > mrpValue) {
      throw new Error(`${p.name}: selling price cannot exceed MRP`);
    }

    const product = await prisma.product.upsert({
      where: { catalogId },
      create: {
        catalogId,
        slug,
        name: p.name,
        productType: "simple",
        status: "active",
        tagline: p.tagline,
        fullDescription: "",
        tag: p.tag ?? null,
        img,
        images: [img],
        packSize: p.packSize ?? null,
        categoryId: p.categoryId,
        categoryLabel: p.categoryLabel,
        priceValue,
        mrpValue,
        rating: 4.7 + (index % 3) * 0.1,
        reviewCount: p.reviewCount ?? 0,
        packaging: p.packSize?.includes("Gift Box") ? "Gift Box" : "Pouch",
        benefits: ["Natural Energy"],
        featured: index < 2,
        isNew: p.isNew ?? false,
      },
      update: {
        name: p.name,
        productType: "simple",
        status: "active",
        tagline: p.tagline,
        fullDescription: "",
        tag: p.tag ?? null,
        img,
        images: [img],
        packSize: p.packSize ?? null,
        categoryId: p.categoryId,
        categoryLabel: p.categoryLabel,
        priceValue,
        mrpValue,
        reviewCount: p.reviewCount ?? 0,
        packaging: p.packSize?.includes("Gift Box") ? "Gift Box" : "Pouch",
        benefits: ["Natural Energy"],
        featured: index < 2,
        isNew: p.isNew ?? false,
      },
    });

    const stockQuantity = 10;
    await prisma.productVariant.upsert({
      where: {
        productId_weight: {
          productId: product.id,
          weight: p.packSize ?? "Default",
        },
      },
      create: {
        productId: product.id,
        sku: catalogId,
        weight: p.packSize ?? "Default",
        priceValue,
        mrpValue,
        stockQuantity,
        stockStatus: stockStatusFromQuantity(stockQuantity),
        img,
        packaging: p.packSize?.includes("Gift Box") ? "Gift Box" : "Pouch",
        isDefault: true,
        sortOrder: 0,
      },
      update: {
        sku: catalogId,
        priceValue,
        mrpValue,
        stockQuantity,
        stockStatus: stockStatusFromQuantity(stockQuantity),
        img,
        packaging: p.packSize?.includes("Gift Box") ? "Gift Box" : "Pouch",
        isDefault: true,
        sortOrder: 0,
      },
    });

    await prisma.productVariant.updateMany({
      where: {
        productId: product.id,
        NOT: { weight: p.packSize ?? "Default" },
      },
      data: {
        isDefault: false,
      },
    });

    await syncProductSummary(prisma, product.id);
  }

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { id: post.id },
      create: post,
      update: post,
    });
  }

  const cmsPages = [
    {
      slug: "homepage",
      title: "Homepage",
      subtitle: "Logo, hero banners, our story & testimonials",
      pageType: "homepage",
      body: {
        siteLogo: "/assets/application-logo.webp",
        hero: {
          title: "Premium Dates & Natural Wellness Foods",
          subtitle:
            "Discover carefully selected dates, date-based products, traditional wellness foods, and naturally sweet everyday essentials from Saliah Foods.",
          primaryCta: { label: "Shop Premium Dates", href: "#premium-dates" },
          secondaryCta: { label: "Explore Wellness Foods", href: "#wellness-products" },
          trustLine: ["Freshly Packed", "Natural Ingredients", "Secure Checkout"],
          banners: [
            {
              id: "hero-1",
              image: "/assets/hero-banner.webp",
              alt: "Saliah Foods premium dates with nuts, figs, and grapes on marble",
            },
          ],
        },
        story: {
          eyebrow: "Our story",
          title: "Rooted in Dates. Built on Natural Goodness.",
          body:
            "Saliah Foods brings together premium dates, natural sweeteners, and traditional wellness foods selected for freshness, taste, and everyday nourishment. Our journey is built around quality sourcing, careful selection, and a commitment to bringing naturally good food to every home.",
          image: "/assets/brand-legacy.webp",
          imageAlt: "Saliah Foods premium dates, honey blends, and wellness products",
          ctaLabel: "Read Our Story",
          ctaHref: "/our-legacy",
        },
        testimonials: {
          eyebrow: "Testimonials",
          title: "Loved by Families Across India",
          subtitle:
            "What our customers say about Saliah dates, wellness foods, and natural everyday essentials.",
          items: [
            {
              id: "t1",
              quote:
                "The Kimia dates are incredibly soft and fresh. Packaging feels premium — perfect for gifting and everyday snacking at home.",
              name: "Ananya R.",
              role: "Mumbai",
            },
            {
              id: "t2",
              quote:
                "We use Saliah date syrup daily in our kitchen. Natural sweetness without compromise — our whole family loves it.",
              name: "Karthik M.",
              role: "Bengaluru",
            },
            {
              id: "t3",
              quote:
                "Rose gulkand and amla candy remind me of home. Quality is consistent and delivery was neatly packed every time.",
              name: "Priya S.",
              role: "Hyderabad",
            },
          ],
        },
      },
    },
    {
      slug: "about-us",
      title: "About Us",
      subtitle: "Rooted in dates. Built on natural goodness.",
      pageType: "about",
      body: {
        story: [
          "Saliah Foods was founded on a simple belief: naturally good food should be accessible, honest, and enjoyable every day.",
          "We serve families who value quality ingredients — whether for daily snacking, natural sweetness, or traditional wellness foods.",
        ],
        values: [
          { title: "Quality First", text: "We never compromise on sourcing, freshness, or presentation." },
          { title: "Natural Goodness", text: "Thoughtfully selected ingredients without unnecessary additives." },
        ],
        stats: [
          { value: "15+", label: "Premium & everyday varieties" },
          { value: "Pan-India", label: "Delivery on select ranges" },
        ],
      },
    },
    {
      slug: "faq",
      title: "FAQ",
      subtitle: "Common questions about orders, products & support",
      pageType: "faq",
      body: {
        faqItems: [
          {
            category: "Orders & Delivery",
            questions: [
              {
                q: "How do I place an order?",
                a: "Browse our products, add items to your cart, and complete checkout with your delivery address.",
              },
              {
                q: "Do you deliver across India?",
                a: "Yes — we dispatch to most pin codes across India.",
              },
            ],
          },
        ],
      },
    },
    {
      slug: "sourcing-quality",
      title: "Sourcing & Quality",
      subtitle: "From trusted growers to your table",
      pageType: "content",
      body: {
        intro:
          "At Saliah Foods, quality begins at the source. We work with established growers and trusted suppliers.",
        pillars: [
          { title: "Trusted Origins", text: "Premium date varieties from regions known for flavour and texture." },
          { title: "Careful Selection", text: "Each lot is inspected for freshness, size, and moisture." },
        ],
      },
    },
    {
      slug: "contact",
      title: "Contact Us",
      subtitle: "Orders, partnerships, or general enquiries",
      pageType: "contact",
      body: {
        email: "support@saliahfoods.com",
        phone: "094423 37717",
        phoneTel: "+919442337717",
        address:
          "76A2C, Ariyakulam Village, Krishnapuram (P.O.), Dharmapuri (Taluk), Dharmapuri, Tamil Nadu 635202, India",
        hours: "Open 9:00 AM – 4:00 PM IST, all days",
        subjects: ["General enquiry", "Order support", "Wholesale / B2B", "Product feedback", "Other"],
      },
    },
  ];

  for (const page of cmsPages) {
    await prisma.cmsPage.upsert({
      where: { slug: page.slug },
      create: page,
      update: { title: page.title, subtitle: page.subtitle, pageType: page.pageType, body: page.body },
    });
  }

  const paymentMethods = [
    { id: "cod", label: "Cash on Delivery", description: "Pay when your order arrives", enabled: true, sortOrder: 1 },
    { id: "upi", label: "UPI", description: "Pay via UPI at order confirmation", enabled: true, sortOrder: 2 },
  ];

  for (const m of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { id: m.id },
      create: m,
      update: m,
    });
  }

  await prisma.storeSetting.upsert({
    where: { key: "shipping" },
    create: { key: "shipping", value: { freeShippingThreshold: 999, shippingFee: 99 } },
    update: { value: { freeShippingThreshold: 999, shippingFee: 99 } },
  });

  await prisma.storeSetting.upsert({
    where: { key: "checkout" },
    create: { key: "checkout", value: { codEnabled: true } },
    update: { value: { codEnabled: true } },
  });

  const adminEmail = "admin@saliahfoods.com";
  const adminPassword = "admin123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.admin.upsert({
    where: { email: adminEmail },
    create: {
      fullName: "Saliah Admin",
      email: adminEmail,
      phone: "9999999999",
      passwordHash,
    },
    update: { passwordHash },
  });

  const bestSellerSync = await syncBestSellersFromSales(prisma);
  console.log(`Best sellers synced from sales: ${bestSellerSync.count} product(s).`);

  console.log(
    `Seeded ${products.length} products, ${blogPosts.length} posts, ${categories.length} categories, ${cmsPages.length} CMS pages.`
  );
  console.log(`Admin user: ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
