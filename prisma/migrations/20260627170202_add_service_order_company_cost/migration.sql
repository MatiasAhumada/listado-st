-- AlterTable
ALTER TABLE "public"."service_order_products" ADD COLUMN     "totalCostCompany" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "unitCostCompany" DOUBLE PRECISION NOT NULL DEFAULT 0;
