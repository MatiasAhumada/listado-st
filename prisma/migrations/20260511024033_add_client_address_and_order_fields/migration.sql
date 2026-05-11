-- AlterTable
ALTER TABLE "public"."clients" ADD COLUMN     "address" TEXT;

-- AlterTable
ALTER TABLE "public"."service_orders" ADD COLUMN     "balance" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "deliveryDate" TIMESTAMP(3);
