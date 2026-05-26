import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import {
  parseImages,
  stockStatusFromQuantity,
  syncProductSummary,
} from "../src/lib/products.js";

const prisma = new PrismaClient();

function getLegacyStockQuantity(product) {
  return product.inStock ? 10 : 0;
}

async function main() {
  const products = await prisma.product.findMany({
    include: { variants: true },
    orderBy: { createdAt: "asc" },
  });

  let createdVariants = 0;
  let updatedProducts = 0;

  for (const product of products) {
    const images = parseImages(product.images);
    const nextImages = images.length ? images : product.img ? [product.img] : [];

    if (nextImages.length && JSON.stringify(images) !== JSON.stringify(nextImages)) {
      await prisma.product.update({
        where: { id: product.id },
        data: { images: nextImages },
      });
      updatedProducts += 1;
    }

    if (product.variants.length === 0) {
      const stockQuantity = getLegacyStockQuantity(product);
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: product.catalogId,
          weight: product.packSize || "Default",
          priceValue: product.priceValue,
          mrpValue: product.mrpValue ?? null,
          stockQuantity,
          stockStatus: stockStatusFromQuantity(stockQuantity),
          img: product.img,
          packaging: product.packaging ?? null,
          isDefault: true,
          sortOrder: 0,
        },
      });
      createdVariants += 1;
    }

    await syncProductSummary(prisma, product.id);
  }

  console.log(`Backfilled product variants for ${createdVariants} product(s).`);
  console.log(`Updated image arrays for ${updatedProducts} product(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
