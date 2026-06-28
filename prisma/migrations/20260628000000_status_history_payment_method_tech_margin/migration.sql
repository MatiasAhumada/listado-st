-- Step 1: Add new values to existing enum so data migration can reference them
ALTER TYPE "public"."ServiceOrderStatus" ADD VALUE IF NOT EXISTS 'COBRADO_CLIENTE';
ALTER TYPE "public"."ServiceOrderStatus" ADD VALUE IF NOT EXISTS 'ENTREGADO_CLIENTE';
ALTER TYPE "public"."ServiceOrderStatus" ADD VALUE IF NOT EXISTS 'COBRADO_TECNICO';

-- Step 2: Migrate COBRADO rows to COBRADO_CLIENTE (ENTREGADO_A_CLIENTE has 0 rows)
UPDATE "public"."service_orders" SET "status" = 'COBRADO_CLIENTE' WHERE "status" = 'COBRADO';

-- Step 3: Create PaymentMethod enum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('CASH', 'CREDIT');

-- Step 4: Create service_order_status_history before the enum replacement transaction
-- (the AlterEnum block below references this table via USING cast)
CREATE TABLE "public"."service_order_status_history" (
    "id" TEXT NOT NULL,
    "serviceOrderId" TEXT NOT NULL,
    "status" "public"."ServiceOrderStatus" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_order_status_history_pkey" PRIMARY KEY ("id")
);

-- Step 5: Replace enum — removes COBRADO and ENTREGADO_A_CLIENTE
BEGIN;
CREATE TYPE "public"."ServiceOrderStatus_new" AS ENUM ('RECEPCIONADO', 'RETIRADO_POR_TECNICO', 'DEVUELTO_POR_TECNICO', 'COBRADO_CLIENTE', 'ENTREGADO_CLIENTE', 'COBRADO_TECNICO');
ALTER TABLE "public"."service_orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."service_orders" ALTER COLUMN "status" TYPE "public"."ServiceOrderStatus_new" USING ("status"::text::"public"."ServiceOrderStatus_new");
ALTER TABLE "public"."service_order_status_history" ALTER COLUMN "status" TYPE "public"."ServiceOrderStatus_new" USING ("status"::text::"public"."ServiceOrderStatus_new");
ALTER TYPE "public"."ServiceOrderStatus" RENAME TO "ServiceOrderStatus_old";
ALTER TYPE "public"."ServiceOrderStatus_new" RENAME TO "ServiceOrderStatus";
DROP TYPE "public"."ServiceOrderStatus_old";
ALTER TABLE "public"."service_orders" ALTER COLUMN "status" SET DEFAULT 'RECEPCIONADO';
COMMIT;

-- Step 6: Rename legacy primary key constraints left over from table renames
ALTER TABLE "public"."service_order_items" RENAME CONSTRAINT "service_order_products_pkey" TO "service_order_items_pkey";
ALTER TABLE "public"."servicios" RENAME CONSTRAINT "productos_pkey" TO "servicios_pkey";

-- Step 7: Add snapshot margin columns to service_order_items
ALTER TABLE "public"."service_order_items"
    ADD COLUMN "unitTechMargin" DOUBLE PRECISION NOT NULL DEFAULT 0,
    ADD COLUMN "totalTechMargin" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Step 8: Add aggregate and payment columns to service_orders
ALTER TABLE "public"."service_orders"
    ADD COLUMN "paymentMethod" "public"."PaymentMethod",
    ADD COLUMN "totalClientPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    ADD COLUMN "totalCompanyCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    ADD COLUMN "totalTechMargin" DOUBLE PRECISION NOT NULL DEFAULT 0,
    ADD COLUMN "techPaidAt" TIMESTAMP(3);

-- Step 9: Index and FK for service_order_status_history
CREATE INDEX "service_order_status_history_serviceOrderId_idx" ON "public"."service_order_status_history"("serviceOrderId");
ALTER TABLE "public"."service_order_status_history" ADD CONSTRAINT "service_order_status_history_serviceOrderId_fkey" FOREIGN KEY ("serviceOrderId") REFERENCES "public"."service_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
