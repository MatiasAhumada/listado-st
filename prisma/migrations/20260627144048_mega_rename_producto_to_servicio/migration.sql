-- Rename enum ProductType → ServiceType
ALTER TYPE "public"."ProductType" RENAME TO "ServiceType";

-- Rename columns in service_order_products (before table rename)
ALTER TABLE "public"."service_order_products" RENAME COLUMN "productName" TO "serviceName";
ALTER TABLE "public"."service_order_products" RENAME COLUMN "productType" TO "serviceType";

-- Rename table service_order_products → service_order_items
ALTER TABLE "public"."service_order_products" RENAME TO "service_order_items";

-- Rename FK constraint on service_order_items
ALTER TABLE "public"."service_order_items" RENAME CONSTRAINT "service_order_products_serviceOrderId_fkey" TO "service_order_items_serviceOrderId_fkey";

-- Rename table productos → servicios
ALTER TABLE "public"."productos" RENAME TO "servicios";

-- Rename column masterProductId → masterServicioId in servicios
ALTER TABLE "public"."servicios" RENAME COLUMN "masterProductId" TO "masterServicioId";

-- Rename FK constraints on servicios
ALTER TABLE "public"."servicios" RENAME CONSTRAINT "productos_masterProductId_fkey" TO "servicios_masterServicioId_fkey";
ALTER TABLE "public"."servicios" RENAME CONSTRAINT "productos_companyId_fkey" TO "servicios_companyId_fkey";
