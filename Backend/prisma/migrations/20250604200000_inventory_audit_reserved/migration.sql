-- Reserved stock + stock adjustment audit log
ALTER TABLE "ProductVariant" ADD COLUMN "reservedQuantity" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "StockAdjustment" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "previousStock" INTEGER NOT NULL,
    "newStock" INTEGER NOT NULL,
    "previousReserved" INTEGER NOT NULL,
    "newReserved" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "adminId" TEXT,
    "adminName" TEXT,
    "adminEmail" TEXT,
    "orderId" TEXT,
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockAdjustment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StockAdjustment_variantId_createdAt_idx" ON "StockAdjustment"("variantId", "createdAt");
CREATE INDEX "StockAdjustment_createdAt_idx" ON "StockAdjustment"("createdAt");

ALTER TABLE "StockAdjustment" ADD CONSTRAINT "StockAdjustment_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Move open-order commitments from on-hand into reserved (legacy orders decremented stock at placement)
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
WHERE pv.id = open_reserved."variantId";
