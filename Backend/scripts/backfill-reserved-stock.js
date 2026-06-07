import { prisma } from "../src/lib/prisma.js";

async function main() {
  await prisma.$executeRawUnsafe(`
    WITH open_reserved AS (
      SELECT oi."variantId", SUM(oi.quantity)::INTEGER AS qty
      FROM "OrderItem" oi
      INNER JOIN "Order" o ON o.id = oi."orderId"
      WHERE oi."variantId" IS NOT NULL
        AND o.status IN ('placed', 'confirmed', 'packed')
      GROUP BY oi."variantId"
    )
    UPDATE "ProductVariant" pv
    SET
      "reservedQuantity" = open_reserved.qty,
      "stockQuantity" = pv."stockQuantity" + open_reserved.qty
    FROM open_reserved
    WHERE pv.id = open_reserved."variantId"
  `);
  console.log("Reserved stock backfill complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
