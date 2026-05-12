-- AlterTable
ALTER TABLE "public"."service_orders" ADD COLUMN     "sellerId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."service_orders" ADD CONSTRAINT "service_orders_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
