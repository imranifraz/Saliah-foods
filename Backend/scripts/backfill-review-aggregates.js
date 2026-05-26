import { prisma } from "../src/lib/prisma.js";
import { syncProductReviewAggregates } from "../src/lib/reviews.js";

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  for (const product of products) {
    await syncProductReviewAggregates(prisma, product.id);
    console.log(`synced review aggregate: ${product.name}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
