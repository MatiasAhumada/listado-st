-- AlterTable
ALTER TABLE "public"."service_order_products" ADD COLUMN     "cashPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "creditPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Backfill existing rows so historical orders show the unitPrice for both cash and credit
UPDATE "public"."service_order_products" SET "cashPrice" = "unitPrice", "creditPrice" = "unitPrice";
